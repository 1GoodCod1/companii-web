/**
 * Saved hero backdrop variant — the earlier "cold" clean architecture photo.
 * Kept for later; not active by default. Enable it in LandingPage by swapping
 * which Hero*Backdrop is rendered.
 */
const HERO_IMAGE = '/marketing/hero-architecture-cold.webp';

export function HeroArchitectureColdBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Photo layer — desaturated cool architecture */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.5] [filter:saturate(0.6)_contrast(1.03)]"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      {/* Left→right white wash: keeps the headline column clean, lets the photo show on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/45 to-white/10" />
      {/* Top→bottom fade: pure white at the bottom so the mock card has a crisp base */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-transparent to-white" />
    </div>
  );
}
