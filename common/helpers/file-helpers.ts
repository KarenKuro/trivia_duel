export class FileHelpers {
  static generatePath(path: string) {
    const host = process.env.MEDIA_HOST;
    return path ? `${host}/${path}` : path;
  }
}
