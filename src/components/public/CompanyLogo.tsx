import { useState } from 'react';
import { cn } from '@/lib/utils';
import { companyInitials } from '@/features/companies/types';
import { MediaImage } from '@/components/ui/MediaImage';

export function CompanyLogo({
  name,
  logoUrl,
  size = 'md',
  className,
}: {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizes = {
    sm: 'h-10 w-10 text-xs rounded-xl',
    md: 'h-14 w-14 text-sm rounded-2xl',
    lg: 'h-20 w-20 text-lg rounded-2xl',
    xl: 'h-28 w-28 text-2xl rounded-3xl',
  };

  if (logoUrl && !imageFailed) {
    return (
      <MediaImage
        src={logoUrl}
        alt={`Logo ${name}`}
        className={cn(sizes[size], 'object-cover border-2 border-white shadow-md bg-white', className)}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={cn(
        sizes[size],
        'inline-flex items-center justify-center font-black text-white bg-gradient-to-br from-violet-600 to-indigo-600 border-2 border-white shadow-md',
        className,
      )}
    >
      {companyInitials(name)}
    </span>
  );
}
