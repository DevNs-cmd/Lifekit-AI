"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Star, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/shared/rating-display";
import { CategoryBadge } from "@/components/shared/category-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_MARKETPLACE_LISTINGS } from "@/constants/mock-data";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MarketplaceListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const listing = MOCK_MARKETPLACE_LISTINGS.find(l => l.id === id) ?? MOCK_MARKETPLACE_LISTINGS[0];

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

          {/* Features */}
          {listing.features.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">What's included</h2>
                <ul className="space-y-2">
                  {listing.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={cn("h-4 w-4 shrink-0", f.included ? "text-[hsl(var(--success))]" : "text-[hsl(var(--border))]")} />
                      <span className={f.included ? "text-[hsl(var(--text-primary))]" : "text-[hsl(var(--text-secondary))] line-through"}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Pricing tiers */}
          {listing.pricingTiers.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4">Choose a plan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.pricingTiers.map(tier => (
                    <div key={tier.id} className={cn(
                      "relative rounded-lg border-2 p-4 cursor-pointer transition-colors",
                      tier.isPopular ? "border-[hsl(var(--primary))]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50"
                    )} onClick={() => toast.success(`Selected ${tier.name} plan!`)}>
                      {tier.isPopular && (
                        <div className="absolute -top-2.5 left-3">
                          <Badge className="text-[10px]">Popular</Badge>
                        </div>
                      )}
                      <p className="font-semibold text-sm text-[hsl(var(--text-primary))]">{tier.name}</p>
                      <p className="text-2xl font-black text-[hsl(var(--text-primary))] my-1">
                        ₹{tier.price.toLocaleString("en-IN")}
                        <span className="text-sm font-normal text-[hsl(var(--text-secondary))]">
                          {tier.billingCycle === "one-time" ? " one-time" : `/${tier.billingCycle?.replace("ly", "")}`}
                        </span>
                      </p>
                      <ul className="space-y-1 mt-2">
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
                <Button className="w-full" onClick={() => toast.success("Proceeding to checkout!")}>
                  {listing.basePrice ? "Purchase" : "Enrol free"}
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
    </div>
  );
}
