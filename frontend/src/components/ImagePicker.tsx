'use client';

import { useRef } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  value: string;
  onChange: (base64: string) => void;
  aspectRatio?: '4/5' | '1/1' | '16/9';
  className?: string;
  testID?: string;
}

/**
 * Web image picker that reads a file via FileReader -> base64 data URL.
 * Compresses (down-scales) large images client-side using a canvas to keep base64
 * payload reasonable.
 */
export function ImagePicker({ value, onChange, aspectRatio = '4/5', className, testID }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande (máx 8MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const scale = Math.min(MAX / width, MAX / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onChange(src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        onChange(compressed);
      };
      img.onerror = () => onChange(src);
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const aspectClass =
    aspectRatio === '4/5' ? 'aspect-[4/5]' : aspectRatio === '1/1' ? 'aspect-square' : 'aspect-video';

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
        data-testid={testID || 'image-input'}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group relative w-full overflow-hidden rounded-2xl',
          aspectClass,
          !value && 'border-2 border-dashed border-brand-navy bg-blue-50',
          className
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-brand-navy/85 px-3 py-1.5 text-xs font-bold text-white">
              <RefreshCw size={14} />
              Cambiar
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-brand-navy">
            <Camera size={42} />
            <span className="text-sm font-semibold">Toca para subir imagen</span>
          </div>
        )}
      </button>
    </>
  );
}
