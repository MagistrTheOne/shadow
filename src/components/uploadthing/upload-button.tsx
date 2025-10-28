"use client";

import { UploadButton as UploadThingButton } from "@uploadthing/react";
import { ourFileRouter } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useState } from "react";

interface UploadButtonProps {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  type: "avatar" | "banner";
  currentUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function UploadButton({
  onUploadComplete,
  onUploadError,
  type,
  currentUrl,
  className,
  children,
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <UploadThingButton
      endpoint={type === "avatar" ? "avatarUploader" : "bannerUploader"}
      onClientUploadComplete={(res) => {
        if (res?.[0]?.url) {
          onUploadComplete?.(res[0].url);
        }
        setIsUploading(false);
      }}
      onUploadError={(error: Error) => {
        onUploadError?.(error);
        setIsUploading(false);
      }}
      onUploadBegin={() => {
        setIsUploading(true);
      }}
      content={{
        button: children || (
          <Button
            type="button"
            variant="outline"
            className={`w-full ${className}`}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {currentUrl ? "Change" : "Upload"} {type === "avatar" ? "Avatar" : "Banner"}
              </>
            )}
          </Button>
        ),
        allowedContent: "Image (PNG, JPG, GIF) up to 4MB",
      }}
    />
  );
}
