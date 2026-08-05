import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { MarketplaceService } from "../services/marketplace.service";
import { CreateListingDto } from "../dto/create-listing.dto";
import { UpdateListingDto } from "../dto/update-listing.dto";
import { MarketplaceQueryDto } from "../dto/marketplace-query.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IntValidationPipe } from "../../common/decorators/int-validation.decorator";
import { MarketplaceListing } from "../entities/marketplace-listing.entity";

@ApiTags("Marketplace")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("marketplace")
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new marketplace listing" })
  @ApiBody({ type: CreateListingDto })
  @ApiCreatedResponse({
    description: "Listing created successfully",
    type: MarketplaceListing,
  })
  @ApiBadRequestResponse({ description: "Invalid listing payload" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async create(
    @CurrentUser("user_id") userId: number,
    @Body() createDto: CreateListingDto,
  ) {
    return this.marketplaceService.create(userId, createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Search and filter marketplace listings" })
  @ApiOkResponse({
    description: "Listings retrieved successfully",
    type: MarketplaceListing,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findAll(@Query() query: MarketplaceQueryDto) {
    const { page, limit, ...filters } = query;
    const pagination = { page, limit };
    return this.marketplaceService.findAll(filters, pagination);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get details of a specific listing" })
  @ApiOkResponse({
    description: "Listing retrieved successfully",
    type: MarketplaceListing,
  })
  @ApiNotFoundResponse({ description: "Marketplace listing not found" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async findOne(@Param("id", IntValidationPipe) id: number) {
    return this.marketplaceService.findOne(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a marketplace listing" })
  @ApiBody({ type: UpdateListingDto })
  @ApiOkResponse({
    description: "Listing updated successfully",
    type: MarketplaceListing,
  })
  @ApiBadRequestResponse({ description: "Invalid listing payload" })
  @ApiNotFoundResponse({ description: "Marketplace listing not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to update this listing",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async update(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
    @Body() updateDto: UpdateListingDto,
  ) {
    return this.marketplaceService.update(id, userId, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a marketplace listing" })
  @ApiOkResponse({
    description: "Listing deleted successfully",
    type: MarketplaceListing,
  })
  @ApiNotFoundResponse({ description: "Marketplace listing not found" })
  @ApiForbiddenResponse({
    description: "You do not have permission to delete this listing",
  })
  @ApiUnauthorizedResponse({ description: "Invalid or expired access token" })
  async remove(
    @CurrentUser("user_id") userId: number,
    @Param("id", IntValidationPipe) id: number,
  ) {
    return this.marketplaceService.remove(id, userId);
  }
}
