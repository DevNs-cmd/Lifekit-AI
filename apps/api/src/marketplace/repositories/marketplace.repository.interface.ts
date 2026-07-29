import { CreateListingDto } from '../dto/create-listing.dto';
import { SearchListingDto } from '../dto/search-listing.dto';
import { UpdateListingDto } from '../dto/update-listing.dto';
import { MarketplaceListing } from '../entities/marketplace-listing.entity';
import { PaginationParams, PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface IMarketplaceRepository {
  createListing(userId: string, data: CreateListingDto): Promise<MarketplaceListing>;
  findListingById(id: string): Promise<MarketplaceListing | null>;
  searchListings(
    filters: SearchListingDto & { isAvailable?: boolean },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplaceListing>>;
  updateListing(id: string, data: UpdateListingDto): Promise<MarketplaceListing>;
  deleteListing(id: string): Promise<MarketplaceListing>;
}
