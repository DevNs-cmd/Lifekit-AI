import {
  BadRequestException,
  ValidationPipe,
  ValidationError,
} from "@nestjs/common";

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const messages = this.formatErrors(validationErrors);
        return new BadRequestException(messages);
      },
    });
  }

  private formatErrors(
    errors: ValidationError[],
    parentProperty = "",
  ): string[] {
    let formatted: string[] = [];

    for (const error of errors) {
      const propertyPath = parentProperty
        ? `${parentProperty}.${error.property}`
        : error.property;

      if (error.constraints) {
        const constraints = Object.values(error.constraints).join(", ");
        formatted.push(`${propertyPath}: ${constraints}`);
      }

      if (error.children && error.children.length > 0) {
        formatted = formatted.concat(
          this.formatErrors(error.children, propertyPath),
        );
      }
    }

    return formatted;
  }
}
