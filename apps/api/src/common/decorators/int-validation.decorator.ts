import { ParseIntPipe, BadRequestException } from "@nestjs/common";

/**
 * Pre-configured ParseIntPipe enforcing numeric integer validation.
 * Emits a structured BadRequestException on validation failure.
 *
 * Usage:
 *   @Get(':id')
 *   findOne(@Param('id', IntValidationPipe) id: number)
 */
export const IntValidationPipe = new ParseIntPipe({
  exceptionFactory: () => {
    return new BadRequestException(
      "Validation failed: Parameter must be a valid integer ID",
    );
  },
});
