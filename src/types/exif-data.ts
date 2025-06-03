export type ExifData = {
  [key: string]: string | number | boolean | null | ExifData | ExifData[];
};
