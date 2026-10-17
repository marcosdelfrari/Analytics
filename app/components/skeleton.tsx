export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-border ${className}`}
    />
  );
}

export function SkeletonScreenReader({ label }: { label: string }) {
  return <span className="sr-only">{label}</span>;
}
