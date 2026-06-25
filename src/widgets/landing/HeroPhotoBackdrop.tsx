/**
 * Photo backdrop for the landing hero — a distant, professional city skyline in
 * muted tones with a subtle warm haze. A light sepia keeps it on-brand without
 * looking gaudy; white gradients keep the copy readable and give the dashboard
 * mock a clean base. Swap by replacing the file below (optimised WebP).
 */
const HERO_IMAGE = '/marketing/hero-bg.webp';

export function HeroPhotoBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Photo layer — muted, professional, clearly visible behind the copy */}
      <div
        className="absolute inset-0 bg-cover bg-[position:center_90%] bg-no-repeat opacity-[0.45] [filter:sepia(0.12)_saturate(1)_contrast(1.04)]"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      {/* Left→right white wash: keeps the headline column clean, lets the photo show on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-white/30" />
      {/* Top→bottom fade: pure white at the bottom so the mock card has a crisp base */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-transparent to-white" />
    </div>
  );
}
