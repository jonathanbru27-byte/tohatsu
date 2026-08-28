'use client';

import { useRef, useState } from 'react';
import { Camera, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: '4/5' | '1/1' | '16/9';
  className?: string;
  testID?: string;
}

/**
 * Image picker that compresses client-side, uploads to ImgBB via backend,
 * and stores only the hosted URL.
 */
export function ImagePicker({ value, onChange, aspectRatio = '4/5', className, testID }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande (máx 8MB)');
      return;
    }

    // 1. Leer archivo como base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const src = reader.result as string;

      // 2. Comprimir con canvas
      const img = new Image();
      img.onload = async () => {
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
          toast.error('Error procesando imagen');
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.72);

        // 3. Subir a ImgBB vía backend
        setUploading(true);
        try {
          const url = await uploadImage(compressed);
          onChange(url);
          toast.success('Imagen subida correctamente');
        } catch (err: any) {
          toast.error(err?.response?.data?.detail || 'Error subiendo imagen');
        } finally {
          setUploading(false);
        }
      };
      img.onerror = () => toast.error('Error leyendo imagen');
      img.src = src;
    };
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
        disabled={uploading}
        className={cn(
          'group relative w-full overflow-hidden rounded-2xl',
          aspectClass,
          !value && 'border-2 border-dashed border-brand-navy bg-blue-50',
          uploading && 'opacity-70 cursor-wait',
          className
        )}
      >
        {uploading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-brand-navy">
            <Loader2 size={42} className="animate-spin" />
            <span className="text-sm font-semibold">Subiendo...</span>
          </div>
        ) : value ? (
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
