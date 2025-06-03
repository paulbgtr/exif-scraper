"use server";

import exifParser from "exif-parser";

interface ExifData {
  [key: string]: any;
}

export async function scrapeExifData(
  imageBuffer: ArrayBuffer
): Promise<ExifData | null> {
  try {
    const nodeBuffer = Buffer.from(imageBuffer);
    const parser = exifParser.create(nodeBuffer);
    const result = parser.parse();
    if (result && result.tags) {
      return result.tags;
    }
    return null;
  } catch (error) {
    console.error("Error reading EXIF data:", error);
    return null;
  }
}
