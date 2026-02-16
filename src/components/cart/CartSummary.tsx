import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo1.png";
import type { CartItemWithProduct } from "@/hooks/useCart";

interface CartSummaryProps {
  items: CartItemWithProduct[];
  totalItems: number;
  totalPrice: number;
}

export function CartSummary({ items, totalItems, totalPrice }: CartSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <img src={logo} alt="BAR Logo" className="h-10 w-auto [filter:brightness(0)_invert(18%)_sepia(100%)_saturate(5000%)_hue-rotate(210deg)] dark:[filter:none]" />
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Items</span>
          <span className="font-semibold text-foreground">{totalItems}</span>
        </div>

        <Separator />

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.cartproductid}
              className="flex justify-between text-sm"
            >
              <span className="text-muted-foreground truncate max-w-[60%]">
                {item.name} × {item.quantity}
              </span>
              <span className="text-foreground">
                EGP {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">EGP {totalPrice.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
