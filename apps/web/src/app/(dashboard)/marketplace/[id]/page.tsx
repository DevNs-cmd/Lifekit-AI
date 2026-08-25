"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, Star, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/shared/rating-display";
import { CategoryBadge } from "@/components/shared/category-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { marketplaceApi } from "@/lib/api";
import { post } from "@/lib/api/client";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/types/marketplace";

export default function MarketplaceListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxData, setSandboxData] = useState<{ orderId: string; amount: number } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await marketplaceApi.getMarketplaceListing(id);
        setListing(data);
      } catch {
        toast.error("Failed to load listing details.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  async function handlePurchase() {
    if (!listing) return;
    if (!listing.basePrice || listing.basePrice === 0) {
      toast.success(`Enrolled in "${listing.title}"!`);
      return;
    }

    setPurchasing(true);
    const toastId = toast.loading(`Preparing checkout for ${listing.title}...`);

    try {
      const order: any = await post("/billing/marketplace/create-order", {
        listingId: listing.id,
        amount: listing.basePrice,
      });
      toast.dismiss(toastId);

      if (order.isMock) {
        setSandboxData({
          orderId: order.orderId,
          amount: order.amount,
        });
        setSandboxOpen(true);
      } else {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Failed to load payment gateway checkout script.");
          return;
        }

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "LifeKit Marketplace",
          description: listing.title,
          order_id: order.orderId,
          handler: async function (response: any) {
            const verifyId = toast.loading("Verifying purchase...");
            try {
              await post("/billing/marketplace/verify", {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                listingId: listing.id,
                isMock: false,
              });
              toast.dismiss(verifyId);
              toast.success(`Successfully purchased ${listing.title}!`);
            } catch {
              toast.dismiss(verifyId);
              toast.error("Payment verification failed.");
            }
          },
          theme: {
            color: "#8B5CF6",
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(`Checkout failed: ${err.message || "Please try again."}`);
    } finally {
      setPurchasing(false);
    }
  }

  async function handleSandboxSuccess() {
    if (!sandboxData || !listing) return;
    setSandboxOpen(false);
    const toastId = toast.loading("Simulating sandbox payment verification...");
    try {
      const randomHex = Math.random().toString(36).substring(2, 14);
      const mockPaymentId = `pay_mkt_mock_${randomHex}`;

      await post("/billing/marketplace/verify", {
        orderId: sandboxData.orderId,
        paymentId: mockPaymentId,
        listingId: listing.id,
        isMock: true,
      });
      toast.dismiss(toastId);
      toast.success(`Successfully purchased "${listing.title}" (Sandbox)!`);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(`Verification failed: ${err.message || "Please try again."}`);
    } finally {
      setSandboxData(null);
    }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  if (loading) {
    return <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">Loading listing details...</div>;
  }

  if (!listing) {
    return (
      <div className="p-6">
        <EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="Listing not found"
          action={{ label: "Back to Marketplace", onClick: () => router.push(ROUTES.MARKETPLACE_APP) }} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => router.push(ROUTES.MARKETPLACE_APP)}>
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image */}
          <div className="h-48 rounded-xl bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--muted))] flex items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-[hsl(var(--primary))]/30" />
          </div>

          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <CategoryBadge category={listing.category} />
              <Badge variant="outline" className="capitalize">{listing.type}</Badge>
              {listing.isFeatured && <Badge variant="purple">Featured</Badge>}
            </div>
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">{listing.title}</h1>
            <p className="text-[hsl(var(--text-secondary))] mt-1">{listing.provider.name}</p>
            <div className="mt-2">
              <RatingDisplay rating={listing.rating} reviewCount={listing.reviewCount} />
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">About this listing</h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{listing.description}</p>
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          {listing.pricingTiers && listing.pricingTiers.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Pricing Tiers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {listing.pricingTiers.map(tier => (
                    <div key={tier.id} className="border border-[hsl(var(--border))] rounded-lg p-4 space-y-2 bg-[hsl(var(--card))]">
                      <p className="font-semibold text-sm text-[hsl(var(--text-primary))]">{tier.name}</p>
                      <p className="text-xl font-bold text-[hsl(var(--primary))]">₹{tier.price.toLocaleString("en-IN")}</p>
                      <ul className="space-y-1 mt-3">
                        {tier.features.map(f => (
                          <li key={f} className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3 text-[hsl(var(--success))] shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Buy card */}
          <Card className="border-[hsl(var(--primary))]/30">
            <CardContent className="p-5 space-y-4">
              <div>
                {listing.basePrice !== undefined ? (
                  <p className="text-3xl font-black text-[hsl(var(--text-primary))]">
                    ₹{listing.basePrice.toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-[hsl(var(--text-secondary))]"> starting</span>
                  </p>
                ) : (
                  <p className="text-2xl font-black text-green-600">Free</p>
                )}
              </div>
              <div className="space-y-2">
                <Button className="w-full" disabled={purchasing} onClick={handlePurchase}>
                  {purchasing ? "Processing..." : listing.basePrice ? "Purchase" : "Enrol free"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast("Added to mission!")}>
                  Add to Mission
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => toast("Saved!")}>
                  Save for Later
                </Button>
              </div>
              <p className="text-xs text-center text-[hsl(var(--text-secondary))]">
                Secure payment powered by Razorpay &amp; Stripe
              </p>
            </CardContent>
          </Card>

          {/* Provider */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-3">Provider</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--primary))] font-bold">
                  {listing.provider.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{listing.provider.name}</p>
                  <RatingDisplay rating={listing.provider.rating} reviewCount={listing.provider.reviewCount} size="sm" />
                </div>
              </div>
              {listing.provider.verified && (
                <Badge variant="success" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />Verified Provider</Badge>
              )}
              {listing.provider.responseTime && (
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-2">Response time: {listing.provider.responseTime}</p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-3" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                onClick={() => toast("Provider contact coming soon!")}>
                Contact Provider
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              {[
                { label: "Type", value: listing.type },
                { label: "Delivery", value: listing.deliveryMode },
                ...(listing.duration ? [{ label: "Duration", value: listing.duration }] : []),
                ...(listing.location ? [{ label: "Location", value: listing.location }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[hsl(var(--text-secondary))]">{label}</span>
                  <span className="font-medium text-[hsl(var(--text-primary))] capitalize text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Razorpay Sandbox Simulation Modal */}
      <Dialog open={sandboxOpen} onOpenChange={setSandboxOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Razorpay Sandbox (Simulation)
            </DialogTitle>
            <DialogDescription className="text-xs text-[hsl(var(--text-secondary))] mt-1.5">
              Live Razorpay API keys are not configured in your <code className="bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded text-xs">.env</code>. You can simulate the payment status below.
            </DialogDescription>
          </DialogHeader>

          {sandboxData && (
            <div className="space-y-4 py-2">
              <div className="bg-[hsl(var(--secondary))]/40 p-3 rounded-lg border border-[hsl(var(--border))] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-secondary))]">Item:</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{listing?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-secondary))]">Amount:</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">₹{(sandboxData.amount / 100).toLocaleString("en-IN")} INR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-secondary))]">Mock Order ID:</span>
                  <span className="font-mono text-[10px] text-[hsl(var(--primary))]">{sandboxData.orderId}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSandboxSuccess}>
                  Simulate Successful Payment
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setSandboxOpen(false)}>
                  Cancel Simulation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
