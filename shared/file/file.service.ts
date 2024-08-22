import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly uploadPath = './uploads';

  constructor() {
    this.ensureUploadsFolderExists();
  }

  private async ensureUploadsFolderExists() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = `${uuidv4()}${this.getExtension(file.originalname)}`;
    const filePath = join(this.uploadPath, filename);
    console.log(filePath);

    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }

  private getExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }

  // private getImagePath(fileName: string): string {}
}
