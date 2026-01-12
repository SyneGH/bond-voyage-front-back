import { useState } from "react";
import { Upload, Link as LinkIcon, X, ImageIcon } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export function ImageUploadField({ value, onChange, label = "Cover Image", required = false }: ImageUploadFieldProps) {
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [tempUrl, setTempUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        // You can use a toast notification here if available
        console.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        console.error("Please upload an image file");
        return;
      }

      // Convert file to base64 data URI
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.onerror = () => {
        console.error("Failed to read file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (tempUrl) {
      onChange(tempUrl);
      setTempUrl("");
    }
  };

  const handleRemove = () => {
    onChange("");
    setTempUrl("");
  };

  return (
    <div className="space-y-3">
      <Label className="text-[#1A2B4F] block">
        {label} {required && <span className="text-[#FF6B6B]">*</span>}
      </Label>

      {/* Upload Mode Selector */}
      {!value && (
        <div className="flex items-center gap-2 p-1 bg-[#F8FAFB] rounded-xl border border-[#E5E7EB] w-fit">
          <button
            type="button"
            onClick={() => setUploadMode("url")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadMode === "url"
                ? "bg-white text-[#0A7AFF] shadow-sm"
                : "text-[#64748B] hover:text-[#0A7AFF]"
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadMode === "file"
                ? "bg-white text-[#0A7AFF] shadow-sm"
                : "text-[#64748B] hover:text-[#0A7AFF]"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div>
          {uploadMode === "url" ? (
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
                className="h-12 rounded-xl border-2 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[rgba(10,122,255,0.1)] transition-all"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!tempUrl}
                className="h-12 px-5 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] text-white font-medium shadow-lg shadow-[#0A7AFF]/20 hover:shadow-xl hover:shadow-[#0A7AFF]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          ) : (
            <label className="relative block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="h-32 rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#0A7AFF] bg-[#F8FAFB] hover:bg-[rgba(10,122,255,0.02)] transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#E5E7EB] group-hover:border-[#0A7AFF] flex items-center justify-center transition-all">
                    <ImageIcon className="w-6 h-6 text-[#64748B] group-hover:text-[#0A7AFF] transition-colors" />
                  </div>
                  <p className="text-sm text-[#64748B] group-hover:text-[#0A7AFF] transition-colors">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[#94A3B8]">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border-2 border-[#E5E7EB] shadow-md">
          <ImageWithFallback
            src={value}
            alt="Preview"
            className="w-full h-56 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-[#E5E7EB] hover:bg-[#FF6B6B] hover:border-[#FF6B6B] flex items-center justify-center transition-all group shadow-lg"
          >
            <X className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
}
