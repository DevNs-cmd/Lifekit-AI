"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, SlidersHorizontal, X, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "@/components/shared/category-badge";
import { RatingDisplay } from "@/components/shared/rating-display";
import { EmptyState } from "@/components/shared/empty-state";
import { CATEGORIES } from "@/constants/categories";
import { ROUTES } from "@/constants/routes";
import { marketplaceApi } from "@/lib/api";
import { useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/common";
import type { MarketplaceListing, MarketplaceListingType } from "@/types/marketplace";

type SortOption = "recommended" | "highest-rated" | "lowest-price" | "most-popular" | "newest";

const TYPE_LABELS: Record<string, string> = {
  course: "Course", service: "Service", expert: "Expert",
  product: "Product", tool: "Tool", book: "Book",
};

export default function MarketplacePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [typeFilter, setTypeFilter] = useState<MarketplaceListingType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await marketplaceApi.getMarketplaceListings();
        setListings(data);
      } catch {
        toast.error("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeFiltersCount = [
    maxPrice < 50000 ? 1 : 0,
    minRating > 0 ? 1 : 0,
    typeFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function clearFilters() {
    setMaxPrice(50000);
    setMinRating(0);
    setTypeFilter("all");
    setSortBy("recommended");
    setActiveCategory("all");
    setSearch("");
  }

  const filtered = listings
    .filter(l => {
      const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.provider.name.toLowerCase().includes(search.toLowerCase());
      const matchCat  = activeCategory === "all" || l.category === activeCategory;
      const matchType = typeFilter === "all" || l.type === typeFilter;
      const matchPrice = l.basePrice === undefined || l.basePrice <= maxPrice;
      const matchRating = l.rating >= minRating;
      return matchSearch && matchCat && matchType && matchPrice && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === "highest-rated")  return b.rating - a.rating;
      if (sortBy === "lowest-price")   return (a.basePrice ?? 0) - (b.basePrice ?? 0);
      if (sortBy === "most-popular")   return b.reviewCount - a.reviewCount;
      return 0; // recommended / newest — keep insertion order
    });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-[hsl(var(--primary))]" /> Marketplace
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Curated courses, experts, services and products for your missions.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search services, courses, experts…" className="pl-9" />
        </div>
        <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="highest-rated">Highest rated</SelectItem>
            <SelectItem value="lowest-price">Lowest price</SelectItem>
            <SelectItem value="most-popular">Most popular</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={filterOpen ? "default" : "outline"}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={() => setFilterOpen(v => !v)}
          className="relative"
        >
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[hsl(var(--primary))] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <Card className="border-[hsl(var(--primary))]/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Filters</p>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="xs" onClick={clearFilters} leftIcon={<X className="h-3 w-3" />}>
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => setFilterOpen(false)} aria-label="Close filters">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Type */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--text-secondary))]">Type</Label>
                <Select value={typeFilter} onValueChange={v => setTypeFilter(v as MarketplaceListingType | "all")}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max price */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                  Max price: {maxPrice === 50000 ? "Any" : `₹${maxPrice.toLocaleString("en-IN")}`}
                </Label>
                <Slider
                  min={0} max={50000} step={500}
                  value={[maxPrice]}
                  onValueChange={([v]) => setMaxPrice(v)}
                />
                <div className="flex justify-between text-[10px] text-[hsl(var(--text-secondary))]">
                  <span>Free</span><span>₹50,000</span>
                </div>
              </div>

              {/* Min rating */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                  Min rating: {minRating === 0 ? "Any" : `${minRating}★ & above`}
                </Label>
                <div className="flex gap-2">
                  {[0, 3, 3.5, 4, 4.5].map(r => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        minRating === r
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))]/50"
                      )}
                    >
                      {r === 0 ? "Any" : <><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{r}+</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory("all")}
          className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
              : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))]/50"
          )}>
          All
        </button>
        {CATEGORIES.slice(0, 6).map(cat => (
          <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
            className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              activeCategory === cat.value
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))]/50"
            )}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="ml-2 text-[hsl(var(--primary))] hover:underline text-xs">
              Clear filters
            </button>
          )}
        </p>
      </div>

      {loading ? (
        <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">Loading listings...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="No listings match your filters"
          description="Try adjusting your search, category or filter settings."
          action={{ label: "Clear all filters", onClick: clearFilters }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(listing => (
            <Card
              key={listing.id}
              className="hover:border-[hsl(var(--primary))]/30 hover:shadow-md transition-all group cursor-pointer"
              onClick={() => router.push(ROUTES.MARKETPLACE_LISTING(listing.id))}
            >
              <div className="h-40 rounded-t-xl bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--muted))] flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-[hsl(var(--primary))]/40" />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <CategoryBadge category={listing.category} size="sm" />
                  {listing.isFeatured && <Badge variant="purple" className="text-[10px]">Featured</Badge>}
                </div>
                <h3 className="font-semibold text-sm text-[hsl(var(--text-primary))] leading-tight line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{listing.provider.name}</p>
                <RatingDisplay rating={listing.rating} reviewCount={listing.reviewCount} size="sm" />
                <div className="flex items-center justify-between pt-1">
                  {listing.basePrice !== undefined ? (
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">
                      ₹{listing.basePrice.toLocaleString("en-IN")}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-green-600">Free</p>
                  )}
                  <Button size="xs" onClick={e => { e.stopPropagation(); toast.success("Added to mission!"); }}>
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
