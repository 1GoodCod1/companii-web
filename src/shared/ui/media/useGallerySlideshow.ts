import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaThumbItem } from './MediaThumb';
import { isVideoUrl } from '@/shared/utils/validateFile';

interface UseGallerySlideshowOptions {
  items: MediaThumbItem[];
  filter?: 'all' | 'photo' | 'video';
}

export function useGallerySlideshow({ items, filter = 'all' }: UseGallerySlideshowOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxPlaying, setLightboxPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  const filteredItems =
    filter === 'all'
      ? items
      : filter === 'video'
        ? items.filter((img) => isVideoUrl(img.url))
        : items.filter((img) => !isVideoUrl(img.url));

  const hasMultiple = filteredItems.length > 1;
  const active = filteredItems[activeIndex] ?? filteredItems[0];
  const lightboxActive = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const selectSlide = useCallback((index: number) => {
    videoRef.current?.pause();
    setIsPlaying(false);
    setActiveIndex(index);
  }, []);

  const openLightbox = useCallback((index: number | null) => {
    lightboxVideoRef.current?.pause();
    setLightboxPlaying(false);
    setLightboxIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    selectSlide(activeIndex === 0 ? filteredItems.length - 1 : activeIndex - 1);
  }, [activeIndex, filteredItems.length, selectSlide]);

  const goNext = useCallback(() => {
    selectSlide(activeIndex === filteredItems.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, filteredItems.length, selectSlide]);

  const lightboxPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    openLightbox(lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1);
  }, [lightboxIndex, filteredItems.length, openLightbox]);

  const lightboxNext = useCallback(() => {
    if (lightboxIndex === null) return;
    openLightbox(lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1);
  }, [lightboxIndex, filteredItems.length, openLightbox]);

  const closeLightbox = useCallback(() => {
    openLightbox(null);
  }, [openLightbox]);

  const handlePlayToggle = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleLightboxPlayToggle = useCallback(() => {
    if (!lightboxVideoRef.current) return;
    if (lightboxPlaying) {
      lightboxVideoRef.current.pause();
      setLightboxPlaying(false);
    } else {
      lightboxVideoRef.current.play();
      setLightboxPlaying(true);
    }
  }, [lightboxPlaying]);

  const resetKey = `${filter}:${items.length}`;
  const [trackedResetKey, setTrackedResetKey] = useState(resetKey);

  if (trackedResetKey !== resetKey) {
    setTrackedResetKey(resetKey);
    setActiveIndex(0);
    setLightboxIndex(null);
    setIsPlaying(false);
    setLightboxPlaying(false);
  }

  useEffect(() => {
    videoRef.current?.pause();
    lightboxVideoRef.current?.pause();
  }, [resetKey]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, lightboxPrev, lightboxNext]);

  return {
    filteredItems,
    hasMultiple,
    active,
    activeIndex,
    lightboxActive,
    lightboxIndex,
    isPlaying,
    lightboxPlaying,
    videoRef,
    lightboxVideoRef,
    selectSlide,
    openLightbox,
    goPrev,
    goNext,
    lightboxPrev,
    lightboxNext,
    closeLightbox,
    handlePlayToggle,
    handleLightboxPlayToggle,
  };
}
