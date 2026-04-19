export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-[rgba(99,102,241,0.15)]" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-t-[#818cf8] animate-spin" />
      </div>
      <div className="space-y-2 text-center">
        <div className="shimmer h-3 w-28 rounded-full mx-auto" />
        <div className="shimmer h-2.5 w-20 rounded-full mx-auto opacity-60" />
      </div>
    </div>
  );
}
