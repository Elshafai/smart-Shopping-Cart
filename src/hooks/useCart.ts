import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const CART_ID = 1;

export interface CartItemWithProduct {
  cartproductid: number;
  quantity: number;
  productid: number;
  name: string;
  price: number;
  imagepath: string | null;
  categoryname: string;
}

export function useCart() {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = useCallback(async () => {
    const { data: cartProducts } = await supabase
      .from("cartproduct")
      .select("cartproductid, quantity, productid")
      .eq("cartid", CART_ID);

    if (!cartProducts || cartProducts.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const productIds = cartProducts
      .map((cp) => cp.productid)
      .filter((id): id is number => id !== null);

    const { data: products } = await supabase
      .from("product")
      .select("productid, name, price, imagepath, categoryid")
      .in("productid", productIds);

    const { data: categories } = await supabase
      .from("category")
      .select("categoryid, categoryname");

    const categoryMap = new Map(
      categories?.map((c) => [c.categoryid, c.categoryname]) ?? []
    );

    const merged: CartItemWithProduct[] = cartProducts
      .map((cp) => {
        const product = products?.find((p) => p.productid === cp.productid);
        if (!product) return null;
        return {
          cartproductid: cp.cartproductid,
          quantity: cp.quantity ?? 1,
          productid: product.productid,
          name: product.name,
          price: product.price,
          imagepath: product.imagepath,
          categoryname: categoryMap.get(product.categoryid ?? 0) ?? "",
        };
      })
      .filter((item): item is CartItemWithProduct => item !== null);

    setItems(merged);
    setLoading(false);
  }, []);

  const updateQuantity = async (cartproductid: number, newQty: number) => {
    if (newQty < 1) {
      await supabase
        .from("cartproduct")
        .delete()
        .eq("cartproductid", cartproductid);
    } else {
      await supabase
        .from("cartproduct")
        .update({ quantity: newQty })
        .eq("cartproductid", cartproductid);
    }
  };

  const removeItem = async (cartproductid: number) => {
    await supabase
      .from("cartproduct")
      .delete()
      .eq("cartproductid", cartproductid);
  };

  useEffect(() => {
    fetchCartItems();

    const channel = supabase
      .channel("cart-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cartproduct",
          filter: `cartid=eq.${CART_ID}`,
        },
        () => {
          fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCartItems]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return { items, loading, totalItems, totalPrice, updateQuantity, removeItem };
}
