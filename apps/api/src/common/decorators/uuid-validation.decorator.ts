import { ParseUUIDPipe, BadRequestException } from "@nestjs/common";

/**
 * Pre-configured ParseUUIDPipe enforcing UUID v4.
 * Emits a structured BadRequestException on validation failure.
 *
 * Usage:
 *   @Get(':id')
 *   findOne(@Param('id', UUIDValidationPipe) id: string)
 */
export const UUIDValidationPipe = new ParseUUIDPipe({
  version: "4",
  exceptionFactory: (_errors) => {
    return new BadRequestException(
      "Validation failed: Parameter must be a valid UUID v4",
    );
  },
});
