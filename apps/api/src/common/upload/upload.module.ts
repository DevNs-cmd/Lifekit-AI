import { Module } from "@nestjs/common";
import { LocalStorageService } from "./services/local-storage.service";
import { IStorageServiceToken } from "./interfaces/storage.interface";
import { UploadController } from "./controllers/upload.controller";

@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: IStorageServiceToken,
      useClass: LocalStorageService,
    },
  ],
  exports: [IStorageServiceToken],
})
export class UploadModule {}
