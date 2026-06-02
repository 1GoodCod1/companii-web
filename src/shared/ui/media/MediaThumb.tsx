import { Film } from 'lucide-react';
import { MediaImage } from '@/shared/ui/MediaImage';
import { isVideoUrl } from '@/shared/utils/validateFile';

export interface MediaThumbItem {
  id: string;
  url: string;
  caption?: string | null;
  kind?: 'video' | 'image';
}

export function isMediaItemVideo(item: MediaThumbItem): boolean {
  return item.kind === 'video' || isVideoUrl(item.url);
}

interface MediaThumbProps {
  item: MediaThumbItem;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export function MediaThumb({ item, isActive, onClick, index }: MediaThumbProps) {
  const isVideo = isMediaItemVideo(item);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Media ${index + 1}`}
      className={`relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 shrink-0 cursor-pointer ${
        isActive
          ? 'border-violet-500 ring-2 ring-violet-500/20 scale-[1.02] shadow-lg shadow-violet-500/10'
          : 'border-transparent hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {isVideo ? (
        <div className="relative h-full w-full bg-gradient-to-br from-slate-700 to-slate-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Film className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <MediaImage
          src={item.url}
          alt={item.caption ?? `Foto ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
          fallbackClassName="h-full w-full bg-slate-200"
        />
      )}
    </button>
  );
}
