"use client";

import { scrapeExifData } from "@/lib/exif";
import { useState } from "react";
import type { ExifData } from "@/types/exif-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
      setError("📂 No file selected. Please upload an image.");
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
                "😕 Couldn’t find any EXIF data. This image might not contain metadata or uses an unsupported format."
              );
            }
          } catch (err) {
            console.error("Error processing file:", err);
            setError("💥 Something went wrong while reading the image.");
          } finally {
            setIsLoading(false);
          }
        } else {
          setError("⚠️ File read failed.");
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("❌ Error reading file.");
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error setting up file reader:", err);
      setError("🚨 Unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <div className="space-y-2">
        <label className="block font-medium text-lg">Upload an image</label>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/tiff"
          onChange={handleFileChange}
          disabled={isLoading}
          className="file:bg-primary file:text-white file:font-medium file:px-4 file:py-2 file:rounded-md file:cursor-pointer"
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-4 h-4" />
          <span>Extracting EXIF data...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 text-sm p-3 rounded-md border border-red-300">
          {error}
        </div>
      )}

      {exifData && (
        <Card>
          <CardHeader>
            <CardTitle>
              {(exifData.image as { FileName?: string })?.FileName ??
                "📸 Image"}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {[
                (exifData.image as { Make?: string })?.Make,
                (exifData.image as { Model?: string })?.Model,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  View Raw EXIF JSON
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-h-[400px] overflow-auto w-[90vw] max-w-2xl">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  {JSON.stringify(exifData, null, 2)}
                </pre>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
