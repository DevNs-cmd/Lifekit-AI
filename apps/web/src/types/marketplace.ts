import type { Category, ID } from "./common";

export type MarketplaceListingType =
  | "service"
  | "product"
  | "course"
  | "expert"
  | "tool"
  | "software"
  | "book"
  | "insurance"
  | "financial-product";

export type DeliveryMode = "online" | "in-person" | "hybrid" | "self-paced" | "live";

export interface ProviderInfo {
  id: ID;
  name: string;
  avatarUrl?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  badges: string[];
  location?: string;
  responseTime?: string;
}

export interface ListingReview {
  id: ID;
  userId: ID;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface ListingFeature {
  label: string;
  included: boolean;
}

export interface PricingTier {
  id: ID;
  name: string;
  price: number;
  currency: string;
  billingCycle?: "one-time" | "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
}

export interface MarketplaceListing {
  id: ID;
  title: string;
  slug: string;
  type: MarketplaceListingType;
  category: Category;
  provider: ProviderInfo;
  description: string;
  shortDescription: string;
  images: string[];
  features: ListingFeature[];
  pricingTiers: PricingTier[];
  basePrice?: number;
  currency?: string;
  rating: number;
  reviewCount: number;
  reviews: ListingReview[];
  deliveryMode: DeliveryMode;
  duration?: string;
  availability?: string;
  location?: string;
  tags: string[];
  relatedMissionCategories: Category[];
  isFeatured: boolean;
  isPopular: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceSearchFilters {
  category?: Category;
  type?: MarketplaceListingType;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  deliveryMode?: DeliveryMode;
  location?: string;
  relatedMissionId?: ID;
  sortBy?: "recommended" | "highest-rated" | "lowest-price" | "most-popular" | "newest";
}

export interface CartItem {
  listingId: ID;
  listingTitle: string;
  pricingTierId: ID;
  quantity: number;
  price: number;
  currency: string;
}

export interface Order {
  id: ID;
  userId: ID;
  items: CartItem[];
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  total: number;
  currency: string;
  relatedMissionId?: ID;
  paymentMethod?: string;
  paymentIntentId?: string;
  couponCode?: string;
  discountAmount?: number;
  createdAt: string;
  completedAt?: string;
}
