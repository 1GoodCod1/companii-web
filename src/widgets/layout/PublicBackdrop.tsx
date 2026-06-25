/**
 * Subtle, gradient-free backdrop for public pages. A faint SVG dot grid fills
 * the empty space (most visible in the wide margins of catalog / company pages)
 * plus a few light geometric accents in the brand style. Fixed and behind the
 * content; landing sections paint over it, so it mainly shows on inner pages.
 */
export function PublicBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 select-none bg-[#f9fafb]">
      <svg className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <pattern id="public-dots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#cbd5e1" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#public-dots)" />
      </svg>

      {/* Geometric accents in the side margins (large screens only) */}
      <div className="hidden lg:block">
        <span className="absolute left-[4%] top-44 size-16 rounded-full border border-gray-200/80" />
        <span className="absolute left-[7%] top-1/3 text-3xl font-black leading-none text-gray-200">+</span>
        <span className="absolute left-[5%] bottom-44 size-5 rotate-45 border-2 border-gray-200/80" />
        <span className="absolute left-[9%] bottom-24 size-2.5 rounded-full bg-amber-300/40" />
        <span className="absolute right-[5%] top-52 size-6 rotate-12 border-2 border-amber-300/40" />
        <span className="absolute right-[8%] top-2/3 size-2.5 rounded-full bg-violet-300/50" />
        <span className="absolute right-[4%] bottom-48 text-2xl font-black leading-none text-gray-200">+</span>
        <span className="absolute right-[9%] bottom-24 size-10 rounded-full border border-gray-200/70" />
      </div>
    </div>
  );
}
