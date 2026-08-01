import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { IStorageService, StorageFile } from "../interfaces/storage.interface";
import { AppConfigService } from "../../../config/app-config.service";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

@Injectable()
export class LocalStorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(LocalStorageService.name);
  private uploadRoot!: string;

  constructor(private readonly config: AppConfigService) {}

  async onModuleInit() {
    this.uploadRoot = path.resolve(this.config.uploadDir);
    this.logger.log(`Initializing Local Storage Root at: ${this.uploadRoot}`);
    try {
      await fs.promises.mkdir(this.uploadRoot, { recursive: true });
    } catch (err: any) {
      this.logger.error(
        `Failed to create Local Storage Directory: ${err.message}`,
      );
    }
  }

  async save(file: StorageFile, folder = ""): Promise<string> {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    const targetFolder = path.join(this.uploadRoot, folder);

    // Ensure nested folder structure exists
    await fs.promises.mkdir(targetFolder, { recursive: true });

    const targetPath = path.join(targetFolder, uniqueName);
    await fs.promises.writeFile(targetPath, file.buffer);

    // Return relative unix-like path for keying
    return path.join(folder, uniqueName).replace(/\\/g, "/");
  }

  async delete(fileKey: string): Promise<void> {
    const targetPath = path.join(this.uploadRoot, fileKey);
    try {
      await fs.promises.unlink(targetPath);
      this.logger.log(`Deleted local file: ${targetPath}`);
    } catch (err: any) {
      this.logger.error(
        `Failed to delete local file ${targetPath}: ${err.message}`,
      );
    }
  }

  getUrl(fileKey: string): string {
    return `/api/uploads/${fileKey}`;
  }
}
