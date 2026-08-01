import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { CacheService } from "../cache/cache.service";
import { QueueService } from "../queue/queue.service";
import { AppConfigService } from "../../config/app-config.service";

export const createPrismaMock = () => ({
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn().mockImplementation((args) => Promise.all(args)),
  $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  lifeMission: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  plan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
});

export const createCacheServiceMock = () => ({
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  ping: jest.fn().mockResolvedValue("PONG"),
});

export const createQueueServiceMock = () => ({
  getQueue: jest.fn().mockReturnValue({
    add: jest.fn().mockResolvedValue({ id: "mock-job-id" }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
  addJob: jest.fn().mockResolvedValue({ id: "mock-job-id" }),
  onApplicationShutdown: jest.fn(),
});

export const createConfigServiceMock = (
  customEnv: Record<string, any> = {},
) => {
  const envDefaults: Record<string, any> = {
    PORT: 4000,
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://mock:mock@localhost:5432/mock",
    REDIS_URL: "redis://localhost:6379",
    JWT_SECRET: "mock-secret",
    JWT_REFRESH_SECRET: "mock-refresh-secret",
    AI_SERVICE_URL: "http://localhost:8000",
    CORS_ORIGIN: "http://localhost:3000",
    THROTTLER_TTL: 60,
    THROTTLER_LIMIT: 100,
    UPLOAD_DIR: "./uploads",
    MAX_FILE_SIZE: 10485760,
    ...customEnv,
  };

  return {
    get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
      return envDefaults[key] !== undefined ? envDefaults[key] : defaultValue;
    }),
  };
};

export const createMockProviders = (
  customEnv: Record<string, any> = {},
): Provider[] => [
  {
    provide: PrismaService,
    useValue: createPrismaMock(),
  },
  {
    provide: CacheService,
    useValue: createCacheServiceMock(),
  },
  {
    provide: QueueService,
    useValue: createQueueServiceMock(),
  },
  {
    provide: ConfigService,
    useValue: createConfigServiceMock(customEnv),
  },
  {
    provide: AppConfigService,
    useFactory: (config: ConfigService) => new AppConfigService(config),
    inject: [ConfigService],
  },
];
