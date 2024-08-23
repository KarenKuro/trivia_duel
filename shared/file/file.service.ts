import { Folder } from '@common/enums';
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly uploadPath = './uploads';

  constructor() {
    this.ensureFolderExists(this.uploadPath);
    for (const folderName of Object.values(Folder)) {
      this.ensureFolderExists(`${this.uploadPath}/${folderName}`);
    }
  }

  private async ensureFolderExists(name: string) {
    try {
      await fs.access(name);
    } catch {
      await fs.mkdir(name, { recursive: true });
    }
  }

  private getExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }

  async saveFile(file: Express.Multer.File, folder: Folder): Promise<string> {
    try {
      const filename = `${uuidv4()}${this.getExtension(file.originalname)}`;
      const filePath = join(`${this.uploadPath}/${folder}`, filename);

      await fs.writeFile(filePath, file.buffer);
      return filePath;
    } catch (err) {
      console.error(err);
    }
  }

  async removeFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error(err);
    }
  }
}
