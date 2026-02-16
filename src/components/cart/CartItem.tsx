import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RECOMMENDATIONS } from "@/lib/recommendations";
import type { CartItemWithProduct } from "@/hooks/useCart";

interface Product {
  productid: number;
  name: string;
  price: number;
  imagepath: string | null;
}

interface CartItemProps {
  item: CartItemWithProduct;
}

export function CartItem({ item }: CartItemProps) {
  const [recs, setRecs] = useState<Product[]>([]);

  useEffect(() => {
    const recNames = RECOMMENDATIONS[item.name];
    if (!recNames || recNames.length === 0) {
      setRecs([]);
      return;
    }
    supabase
      .from("product")
      .select("productid, name, price, imagepath")
      .in("name", recNames)
      .then(({ data }) => setRecs(data ?? []));
  }, [item.name]);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          {item.imagepath ? (
            <img
              src={item.imagepath}
              alt={item.name}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          <p className="text-xs text-muted-foreground">{item.categoryname}</p>
          <p className="text-sm font-medium text-foreground">
            EGP {item.price.toFixed(2)}
          </p>
        </div>

        <div className="text-center">
          <span className="text-sm text-muted-foreground">Qty</span>
          <p className="font-medium text-foreground">{item.quantity}</p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-foreground">
            EGP {(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Inline recommendations */}
      {recs.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            You might also like
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recs.map((r) => (
              <div
                key={r.productid}
                className="flex flex-shrink-0 items-center gap-2 rounded-md border bg-muted/50 px-2 py-1.5"
              >
                {r.imagepath ? (
                  <img
                    src={r.imagepath}
                    alt={r.name}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted" />
                )}
                <div>
                  <p className="text-xs font-medium text-foreground truncate max-w-[80px]">
                    {r.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    EGP {r.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
