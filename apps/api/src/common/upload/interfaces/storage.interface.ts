export interface StorageFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface IStorageService {
  /**
   * Saves a file to the storage provider.
   *
   * @param file Express/Multer file representation
   * @param folder Target subdirectory namespace
   * @returns Reference/path key of the saved file
   */
  save(file: StorageFile, folder?: string): Promise<string>;

  /**
   * Deletes a file from the storage provider.
   *
   * @param fileKey Key/path referencing the file
   */
  delete(fileKey: string): Promise<void>;

  /**
   * Retrieves a public/private URI to access the stored file.
   *
   * @param fileKey Key/path referencing the file
   */
  getUrl(fileKey: string): string;
}
export const IStorageServiceToken = Symbol("IStorageService");
