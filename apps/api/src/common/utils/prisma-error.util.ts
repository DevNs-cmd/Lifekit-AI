import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

export function handlePrismaError(error: any): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const targets = (error.meta?.target as string[]) || [];
        throw new ConflictException(
          `Unique constraint failed on field(s): ${targets.join(", ")}`,
        );
      }
      case "P2025":
        throw new NotFoundException(
          (error.meta?.cause as string) || "Record not found",
        );
      case "P2003":
        throw new BadRequestException(
          `Foreign key constraint failed on field: ${
            (error.meta?.field_name as string) || "unknown"
          }`,
        );
      default:
        throw new InternalServerErrorException(
          `Database error code ${error.code}: ${error.message}`,
        );
    }
  }
  if (error instanceof Error) {
    throw new InternalServerErrorException(error.message);
  }
  throw new InternalServerErrorException("An unknown database error occurred");
}
