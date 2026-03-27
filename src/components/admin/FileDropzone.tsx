"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  accept: Record<string, string[]>;
  label: string;
  description: string;
  multiple?: boolean;
  files: File[];
  previews?: string[];
}

export default function FileDropzone({
  onDrop,
  accept,
  label,
  description,
  multiple = true,
  files,
  previews = [],
}: FileDropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept,
    multiple,
  });

  return (
    <div>
      <label className="block text-sm font-medium text-luxury-charcoal mb-2">
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-luxury-gold bg-luxury-champagne/20"
            : "border-primary-200 hover:border-luxury-gold/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-luxury-gold text-3xl mb-3">+</div>
        <p className="text-luxury-slate text-sm">{description}</p>
        {isDragActive && (
          <p className="text-luxury-gold text-sm mt-2">Déposez les fichiers ici</p>
        )}
      </div>

      {/* Previews */}
      {(previews.length > 0 || files.length > 0) && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {previews.map((preview, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden bg-primary-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {files
            .filter((f) => !f.type.startsWith("image/"))
            .map((file, i) => (
              <div
                key={`file-${i}`}
                className="aspect-square rounded-lg bg-primary-50 flex items-center justify-center p-2"
              >
                <p className="text-xs text-luxury-slate text-center truncate">
                  {file.name}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
