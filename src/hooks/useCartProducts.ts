import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CartProduct {
  cartproductid: number;
  quantity: number;
  product: {
    productid: number;
    name: string;
    price: number;
    imagepath: string | null;
  };
}

export function useCartProducts(cartId: number) {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("cartproduct")
      .select("cartproductid, quantity, product(productid, name, price, imagepath)")
      .eq("cartid", cartId);

    if (!error && data) {
      setItems(
        data.map((item: any) => ({
          cartproductid: item.cartproductid,
          quantity: item.quantity ?? 1,
          product: item.product,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel("cart-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cartproduct",
          filter: `cartid=eq.${cartId}`,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cartId]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * (i.product?.price ?? 0), 0);

  return { items, loading, totalItems, totalPrice };
}
