import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Inject,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  IStorageService,
  IStorageServiceToken,
} from "../interfaces/storage.interface";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";

@ApiTags("Uploads")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("upload")
export class UploadController {
  constructor(
    @Inject(IStorageServiceToken)
    private readonly storageService: IStorageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload a single file to local storage" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: "File uploaded successfully",
    schema: {
      type: "object",
      properties: {
        url: { type: "string" },
        fileKey: { type: "string" },
      },
    },
  })
  async uploadFile(@UploadedFile() file: any) {
    const fileKey = await this.storageService.save(file);
    const url = this.storageService.getUrl(fileKey);
    return { url, fileKey };
  }
}
