"use client";

import { scrapeExifData } from "@/lib/exif";
import { useState } from "react";

interface ExifData {
  [key: string]: any;
}

export const ExifReader = () => {
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setExifData(null);
      setError("No file selected.");
      return;
    }

    setError(null);
    setExifData(null);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const buffer = e.target.result as ArrayBuffer;
            const data = await scrapeExifData(buffer);
            if (data) {
              setExifData(data);
            } else {
              setError(
                "Could not read EXIF data from the image. The image might not contain EXIF data or it might be in an unsupported format."
              );
            }
          } catch (err) {
            console.error("Error processing file:", err);
            setError(
              err instanceof Error
                ? err.message
                : "An unknown error occurred while processing the file."
            );
          } finally {
            setIsLoading(false);
          }
        } else {
          setError("Failed to read file.");
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file.");
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error setting up file reader:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/tiff"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {isLoading && <p>Loading EXIF data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {exifData && (
        <div>
          <h3>EXIF Data:</h3>
          <pre>{JSON.stringify(exifData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
