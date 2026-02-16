import { ShoppingCart, Map } from "lucide-react";
import { lazy, Suspense } from "react";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import logo from "@/assets/logo2.png";

const IndoorMap = lazy(() => import("@/components/indoor-map/IndoorMap"));

const Index = () => {
  const { items, loading, totalItems, totalPrice } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <Skeleton className="h-12 w-48" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <img src={logo} alt="BAR Logo" className="h-10 w-auto [filter:brightness(0)_invert(18%)_sepia(100%)_saturate(5000%)_hue-rotate(210deg)] dark:[filter:none]" />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <Tabs defaultValue="cart" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cart" className="gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              Shopping Cart
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5">
              <Map className="h-4 w-4" />
              Indoor Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">
                  Your cart is empty
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Add some products to get started!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3 md:col-span-2">
                  <h2 className="mb-2 text-lg font-semibold text-foreground">
                    Cart Items ({totalItems})
                  </h2>
                  {items.map((item) => (
                    <CartItem key={item.cartproductid} item={item} />
                  ))}
                </div>
                <div className="mt-10">
                  <CartSummary
                    items={items}
                    totalItems={totalItems}
                    totalPrice={totalPrice}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <Suspense
              fallback={
                <div className="flex h-64 items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              }
            >
              <IndoorMap />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
