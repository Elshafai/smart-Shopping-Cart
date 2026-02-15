import { useCartProducts } from "@/hooks/useCartProducts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Package } from "lucide-react";
import barqLogo from "@/assets/barq-logo.jpg";

const Index = () => {
  const { items, loading, totalItems, totalPrice } = useCartProducts(1);

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, hsl(220, 60%, 12%), hsl(220, 70%, 8%))" }}>
      {/* Left - Product List */}
      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="h-6 w-6" style={{ color: "hsl(210, 80%, 70%)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "hsl(0, 0%, 95%)" }}>
            Cart Items
          </h1>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "hsl(210, 80%, 70%)" }} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Package className="h-16 w-16" style={{ color: "hsl(220, 30%, 40%)" }} />
              <p className="text-lg" style={{ color: "hsl(220, 20%, 60%)" }}>
                No items in cart
              </p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {items.map((item) => (
                <div
                  key={item.cartproductid}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{ background: "hsl(220, 50%, 15%)", border: "1px solid hsl(220, 40%, 22%)" }}
                >
                  {item.product?.imagepath ? (
                    <img
                      src={item.product.imagepath}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                      style={{ border: "1px solid hsl(220, 40%, 25%)" }}
                    />
                  ) : (
                    <div
                      className="h-16 w-16 rounded-lg flex items-center justify-center"
                      style={{ background: "hsl(220, 40%, 20%)" }}
                    >
                      <Package className="h-8 w-8" style={{ color: "hsl(220, 30%, 45%)" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: "hsl(0, 0%, 93%)" }}>
                      {item.product?.name}
                    </p>
                    <p className="text-sm" style={{ color: "hsl(210, 80%, 70%)" }}>
                      EGP {item.product?.price?.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ background: "hsl(210, 80%, 70%, 0.15)", color: "hsl(210, 80%, 70%)" }}
                  >
                    x{item.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Divider */}
      <div className="w-px" style={{ background: "hsl(220, 40%, 20%)" }} />

      {/* Right - Cart Summary */}
      <div className="w-[380px] p-8 flex flex-col items-center" style={{ background: "hsl(220, 55%, 10%)" }}>
        <img
          src={barqLogo}
          alt="BARQ"
          className="w-32 h-32 object-contain rounded-2xl mb-10"
        />

        <div className="w-full space-y-6">
          <h2 className="text-xl font-bold text-center" style={{ color: "hsl(0, 0%, 95%)" }}>
            Cart Summary
          </h2>

          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: "hsl(220, 50%, 15%)", border: "1px solid hsl(220, 40%, 22%)" }}
          >
            <div className="flex justify-between items-center">
              <span style={{ color: "hsl(220, 20%, 65%)" }}>Total Items</span>
              <span className="text-lg font-bold" style={{ color: "hsl(0, 0%, 95%)" }}>
                {totalItems}
              </span>
            </div>
            <div className="h-px" style={{ background: "hsl(220, 40%, 22%)" }} />
            <div className="flex justify-between items-center">
              <span style={{ color: "hsl(220, 20%, 65%)" }}>Total Price</span>
              <span className="text-xl font-bold" style={{ color: "hsl(210, 80%, 70%)" }}>
                EGP {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
