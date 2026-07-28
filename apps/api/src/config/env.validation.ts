import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

export class EnvironmentVariables {
  @IsEnum(Environment, {
    message: 'NODE_ENV must be one of: development, production, test, staging',
  })
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  DATABASE_URL !: string;

  @IsString()
  REDIS_URL !: string;

  @IsString()
  JWT_SECRET !: string;

  @IsString()
  JWT_REFRESH_SECRET !: string;

  @IsString()
  @IsUrl({ require_tld: false }, { message: 'AI_SERVICE_URL must be a valid URL' })
  AI_SERVICE_URL !: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:3000';
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints ? Object.values(error.constraints).join(', ') : '';
        return `[${error.property}]: ${constraints}`;
      })
      .join('\n');
    throw new Error(`Config validation error:\n${errorMessages}`);
  }
  return validatedConfig;
}
