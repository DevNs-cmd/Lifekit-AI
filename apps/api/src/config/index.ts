import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';

export const configLoads = [appConfig, databaseConfig, redisConfig, jwtConfig];

export * from './env.validation';
export { appConfig, databaseConfig, jwtConfig, redisConfig };
