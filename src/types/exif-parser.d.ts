declare module "exif-parser" {
  import { ExifData } from "@/src/types/exif-data";
  export function create(buffer: Buffer): ExifData;
}
