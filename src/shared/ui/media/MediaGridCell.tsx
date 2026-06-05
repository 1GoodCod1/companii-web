import { FilmStripIcon } from '@phosphor-icons/react';
import { MediaImage } from '@/shared/ui/MediaImage';
import { isVideoUrl } from '@/shared/utils/validateFile';
import type { MediaThumbItem } from './MediaThumb';

interface MediaGridCellProps {
  item: MediaThumbItem;
  index: number;
  onClick: () => void;
  photoAlt: string;
}

export function MediaGridCell({ item, index, onClick, photoAlt }: MediaGridCellProps) {
  const isVideo = isVideoUrl(item.url);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${photoAlt} ${index + 1}`}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 hover:border-violet-200/80 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.04)] hover:shadow-[0_8px_30px_-6px_rgba(99,102,241,0.12)] transition-all cursor-pointer"
    >
      {isVideo ? (
        <div className="relative size-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.35)_0%,transparent_55%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-12 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
              <FilmStripIcon className="size-5 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <MediaImage
          src={item.url}
          alt={item.caption ?? photoAlt}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          fallbackClassName="size-full bg-slate-200"
        />
      )}

      {item.caption ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pb-3 pt-8 pointer-events-none">
          <p className="text-[11px] font-medium text-white/90 line-clamp-2 leading-relaxed">
            {item.caption}
          </p>
        </div>
      ) : null}
    </button>
  );
}
