import Image from 'next/image';
import { LOGO_URL } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  size?: number;
  color?: 'navy' | 'white';
  className?: string;
  showText?: boolean;
}

export function TohatsuLogo({ size = 32, color = 'navy', className, showText = true }: Props) {
  const textColor = color === 'navy' ? 'text-brand-navy' : 'text-white';
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_URL}
        alt="Tohatsu"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
      {showText && (
        <span
          className={cn('font-black tracking-widest', textColor)}
          style={{ fontSize: size * 0.55 }}
        >
          TOHATSU
        </span>
      )}
    </div>
  );
}
