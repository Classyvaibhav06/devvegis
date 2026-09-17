'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/upload';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/utils';

interface S3ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  required?: boolean;
}

export default function S3ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  label = 'Image',
  required = false,
}: S3ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5 MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToStorage(file, folder);
      onChange(url);
      toast.success('Image uploaded to Neon S3 successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(resolveImageUrl(e.target.value))}
          placeholder="https://... (or click upload)"
          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          required={required}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors disabled:opacity-50 shrink-0"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload to S3</span>
            </>
          )}
        </button>
      </div>

      {value && (
        <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 max-h-36 w-full flex items-center justify-center">
          <img
            src={resolveImageUrl(value)}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
