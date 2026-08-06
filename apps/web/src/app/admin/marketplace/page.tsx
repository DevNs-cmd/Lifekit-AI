"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RatingDisplay } from "@/components/shared/rating-display";
import { marketplaceApi } from "@/lib/api";
import { toast } from "sonner";
import type { MarketplaceListing } from "@/types/marketplace";

export default function AdminMarketplacePage() {
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await marketplaceApi.getMarketplaceListings();
        setListings(data);
      } catch {
        toast.error("Failed to load marketplace listings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function removeListing(id: string) {
    try {
      await marketplaceApi.deleteMarketplaceListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success("Listing removed.");
    } catch {
      toast.error("Failed to delete listing.");
    }
  }

  const filtered = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Marketplace Listings</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Manage provider listings and moderation</p>
        </div>
        <Button size="sm" onClick={() => toast("Export coming soon!")}>Export</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" className="pl-9" />
      </div>

      {loading ? (
        <div className="p-6 text-center text-sm text-[hsl(var(--text-secondary))]">Loading listings...</div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {["Listing", "Provider", "Category", "Rating", "Price", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-[hsl(var(--background-subtle))] transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-[hsl(var(--text-primary))] truncate">{l.title}</p>
                      <Badge variant="outline" className="text-[10px] capitalize mt-0.5">{l.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--text-secondary))]">{l.provider.name}</td>
                    <td className="px-4 py-3 capitalize text-[hsl(var(--text-secondary))]">{l.category}</td>
                    <td className="px-4 py-3">
                      <RatingDisplay rating={l.rating} reviewCount={l.reviewCount} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-medium text-[hsl(var(--text-primary))] whitespace-nowrap">
                      {l.basePrice != null ? `₹${l.basePrice.toLocaleString("en-IN")}` : "Free"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={l.isFeatured ? "success" : "outline"}>
                        {l.isFeatured ? "Featured" : "Standard"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast("View listing coming soon!")}>View listing</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Listing featured!")}>Feature listing</DropdownMenuItem>
                          <DropdownMenuItem destructive onClick={() => removeListing(l.id)}>Remove listing</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
