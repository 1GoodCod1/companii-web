export function DecorBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* circles (outline) */}
      <span className="absolute left-[6%] top-16 size-5 rounded-full border-2 border-gray-300" />
      <span className="absolute right-[10%] top-64 size-7 rounded-full border-2 border-violet-300/80" />
      <span className="absolute left-[18%] bottom-40 size-4 rounded-full border-2 border-gray-300/90" />
      <span className="absolute right-[28%] bottom-16 size-6 rounded-full border-2 border-gray-300/80" />

      {/* crosses */}
      <span className="absolute left-[42%] top-10 text-2xl font-black leading-none text-gray-300">+</span>
      <span className="absolute right-[5%] top-1/2 text-3xl font-black leading-none text-violet-300/90">+</span>
      <span className="absolute left-[9%] top-1/2 text-xl font-black leading-none text-gray-300">+</span>
      <span className="absolute right-[38%] bottom-32 text-2xl font-black leading-none text-gray-300/90">+</span>

      {/* squares (rotated) */}
      <span className="absolute left-[64%] top-28 size-4 rotate-45 border-2 border-gray-300/90" />
      <span className="absolute right-[18%] bottom-52 size-5 rotate-12 border-2 border-amber-300/80" />
      <span className="absolute left-[30%] bottom-10 size-4 -rotate-12 border-2 border-gray-300/80" />

      {/* dots (filled) */}
      <span className="absolute left-[52%] top-52 size-2 rounded-full bg-violet-400/60" />
      <span className="absolute right-[24%] top-20 size-2.5 rounded-full bg-gray-400/60" />
      <span className="absolute left-[14%] bottom-24 size-2 rounded-full bg-amber-400/60" />
      <span className="absolute right-[8%] bottom-10 size-2.5 rounded-full bg-gray-400/50" />
      <span className="absolute left-[76%] bottom-36 size-2 rounded-full bg-gray-400/60" />

      {/* tiny rings */}
      <span className="absolute left-[84%] top-12 size-3.5 rounded-full border-2 border-gray-400/60" />
      <span className="absolute left-[38%] top-72 size-3.5 rounded-full border-2 border-violet-400/60" />
    </div>
  );
}
