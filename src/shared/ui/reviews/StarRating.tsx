import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClass = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

export function StarRating({ value, max = 5, size = 'md', className }: StarRatingProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={t('company.reviewsUi.starsAria', { value, max })}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= Math.round(value);
        return (
          <Star
            key={starValue}
            className={cn(sizeClass[size], filled ? 'fill-amber-400 text-amber-400' : 'text-gray-200')}
          />
        );
      })}
    </div>
  );
}

type InteractiveStarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function InteractiveStarRating({ value, onChange, disabled }: InteractiveStarRatingProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="rounded-lg p-1 transition hover:scale-110 disabled:opacity-50"
            aria-label={t('company.reviewsUi.starButtonAria', { count: star })}
          >
            <Star
              className={cn(
                'h-8 w-8 transition',
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300',
              )}
            />
          </button>
        ))}
      </div>
      <p className="text-xs font-semibold text-gray-500 min-h-[1rem]">
        {value > 0
          ? t(`company.reviewsUi.ratingLabels.${value}`)
          : t('company.reviewsUi.selectStars')}
      </p>
    </div>
  );
}
