/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch, del } from "./client";
import type { MarketplaceListing } from "@/types/marketplace";

function mapBackendListingToFrontend(l: any): MarketplaceListing {
  return {
    id: String(l.service_id || l.id),
    title: l.service_name || l.title || "",
    slug: l.slug || "listing-slug",
    type: (l.type || "course").toLowerCase() as any,
    category: (l.category || "lifestyle").toLowerCase() as any,
    provider: {
      id: "prov-1",
      name: l.provider_name || "LifeKit Experts",
      rating: 4.8,
      reviewCount: 15,
      verified: true,
      badges: ["expert"],
    },
    description: l.description || "",
    shortDescription: l.description ? l.description.slice(0, 100) : "",
    images: l.image_url ? [l.image_url] : ["/images/placeholder.jpg"],
    features: [],
    pricingTiers: [
      {
        id: "tier-1",
        name: "Standard",
        price: l.price || 0,
        currency: "INR",
        features: ["Access to all modules"],
      },
    ],
    basePrice: l.price || 0,
    currency: "INR",
    rating: l.rating || 4.5,
    reviewCount: 10,
    reviews: [],
    deliveryMode: "online",
    tags: l.tags || [],
    relatedMissionCategories: [],
    isFeatured: true,
    isPopular: false,
    isSaved: false,
    createdAt: l.created_at || l.createdAt || new Date().toISOString(),
    updatedAt: l.updated_at || l.updatedAt || new Date().toISOString(),
  };
}

export async function getMarketplaceListings(filters?: any): Promise<MarketplaceListing[]> {
  const res = await get<{ data: any[] }>("/marketplace", { params: filters });
  const list = res?.data || [];
  return list.map(mapBackendListingToFrontend);
}

export async function getMarketplaceListing(id: string | number): Promise<MarketplaceListing> {
  const data = await get<any>(`/marketplace/${id}`);
  return mapBackendListingToFrontend(data);
}

export async function createMarketplaceListing(payload: {
  title: string;
  providerName: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
}): Promise<MarketplaceListing> {
  const data = await post<any>("/marketplace", {
    serviceName: payload.title,
    providerName: payload.providerName,
    category: payload.category,
    description: payload.description,
    price: Number(payload.price),
    imageUrl: payload.imageUrl || "",
  });
  return mapBackendListingToFrontend(data);
}

export async function updateMarketplaceListing(
  id: string | number,
  patchData: Partial<MarketplaceListing>
): Promise<MarketplaceListing> {
  const payload: any = {};
  if (patchData.title !== undefined) payload.serviceName = patchData.title;
  if (patchData.description !== undefined) payload.description = patchData.description;
  if (patchData.basePrice !== undefined) payload.price = Number(patchData.basePrice);

  const data = await patch<any>(`/marketplace/${id}`, payload);
  return mapBackendListingToFrontend(data);
}

export async function deleteMarketplaceListing(id: string | number): Promise<void> {
  await del<void>(`/marketplace/${id}`);
}
