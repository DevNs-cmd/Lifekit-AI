import { Opportunity } from "../entities/opportunity.entity";
import { CreateOpportunityDto } from "../dto/create-opportunity.dto";
import { UpdateOpportunityDto } from "../dto/update-opportunity.dto";
import { OpportunityQueryDto } from "../dto/opportunity-query.dto";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface IOpportunitiesRepository {
  create(userId: number, data: CreateOpportunityDto): Promise<Opportunity>;
  findById(id: number, userId: number): Promise<Opportunity | null>;
  findAll(
    userId: number,
    filters: OpportunityQueryDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Opportunity>>;
  update(
    id: number,
    userId: number,
    data: UpdateOpportunityDto,
  ): Promise<Opportunity>;
  delete(id: number, userId: number): Promise<Opportunity>;
}
