import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RECOMMENDATIONS } from "@/lib/recommendations";
import { Card, CardContent } from "@/components/ui/card";
import type { CartItemWithProduct } from "@/hooks/useCart";

interface Product {
  productid: number;
  name: string;
  price: number;
  imagepath: string | null;
}

interface RecommendationsProps {
  cartItems: CartItemWithProduct[];
}

export function Recommendations({ cartItems }: RecommendationsProps) {
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setRecommended([]);
      return;
    }

    const cartProductNames = new Set(cartItems.map((i) => i.name));
    const recNames = new Set<string>();

    cartItems.forEach((item) => {
      const recs = RECOMMENDATIONS[item.name];
      if (recs) {
        recs.forEach((name) => {
          if (!cartProductNames.has(name)) recNames.add(name);
        });
      }
    });

    if (recNames.size === 0) {
      setRecommended([]);
      return;
    }

    supabase
      .from("product")
      .select("productid, name, price, imagepath")
      .in("name", Array.from(recNames))
      .then(({ data }) => {
        setRecommended(data ?? []);
      });
  }, [cartItems]);

  if (recommended.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-foreground">
        You might also like
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {recommended.map((product) => (
          <Card
            key={product.productid}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="flex h-24 items-center justify-center bg-muted p-2">
              {product.imagepath ? (
                <img
                  src={product.imagepath}
                  alt={product.name}
                  className="h-full object-contain"
                />
              ) : (
                <span className="text-xs text-muted-foreground">No image</span>
              )}
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium text-foreground truncate">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                EGP {product.price.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
