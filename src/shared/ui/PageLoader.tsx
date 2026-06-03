export function PageLoader() {
  return (
    <div
      className="flex min-h-[40vh] w-full flex-1 items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <svg
        className="size-8 animate-spin text-violet-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
