import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { MarketplaceRepository } from "../repositories/marketplace.repository";
import { CreateListingDto } from "../dto/create-listing.dto";
import { SearchListingDto } from "../dto/search-listing.dto";
import { UpdateListingDto } from "../dto/update-listing.dto";
import { MarketplaceListing } from "../entities/marketplace-listing.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

@Injectable()
export class MarketplaceService {
  constructor(private readonly marketplaceRepository: MarketplaceRepository) {}

  async create(
    userId: number,
    dto: CreateListingDto,
  ): Promise<MarketplaceListing> {
    return this.marketplaceRepository.createListing(userId, dto);
  }

  async findAll(
    filters: SearchListingDto & { isAvailable?: boolean },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplaceListing>> {
    return this.marketplaceRepository.searchListings(filters, pagination);
  }

  async findOne(id: number): Promise<MarketplaceListing> {
    const listing = await this.marketplaceRepository.findListingById(id);
    if (!listing) {
      throw new NotFoundException("Marketplace listing not found");
    }
    return listing;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateListingDto,
  ): Promise<MarketplaceListing> {
    const listing = await this.findOne(id);
    if (listing.userId && Number(listing.userId) !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this listing",
      );
    }
    return this.marketplaceRepository.updateListing(id, dto);
  }

  async remove(id: number, userId: number): Promise<MarketplaceListing> {
    const listing = await this.findOne(id);
    if (listing.userId && Number(listing.userId) !== userId) {
      throw new ForbiddenException(
        "You do not have permission to delete this listing",
      );
    }
    return this.marketplaceRepository.deleteListing(id);
  }
}
