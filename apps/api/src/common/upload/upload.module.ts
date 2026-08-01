import { Module } from "@nestjs/common";
import { LocalStorageService } from "./services/local-storage.service";
import { IStorageServiceToken } from "./interfaces/storage.interface";

@Module({
  providers: [
    {
      provide: IStorageServiceToken,
      useClass: LocalStorageService,
    },
  ],
  exports: [IStorageServiceToken],
})
export class UploadModule {}
