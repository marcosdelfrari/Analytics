import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  compact = false,
  href,
  priority = false,
}: {
  compact?: boolean;
  href?: string;
  priority?: boolean;
}) {
  const size = compact ? 28 : 36;
  const image = (
    <Image
      src="/fractalbranco.webp"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 ${compact ? "h-7 w-7" : "h-9 w-9"}`}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 cursor-pointer items-center gap-2"
        aria-label="Fractal"
      >
        {image}
        {!compact && (
          <span className="text-base font-thin tracking-wide text-white">
            Fractal
          </span>
        )}
      </Link>
    );
  }

  return image;
}
