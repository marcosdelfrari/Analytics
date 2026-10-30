import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  compact = false,
  fractalOnly = false,
  href,
  priority = false,
}: {
  compact?: boolean;
  stacked?: boolean;
  fractalOnly?: boolean;
  showText?: boolean;
  href?: string;
  priority?: boolean;
}) {
  const size = compact ? 24 : 28;
  const onlyFractal = compact || fractalOnly;

  const content = (
    <span className="inline-flex shrink-0 items-center gap-2">
      <Image
        src="/fractalbranco.webp"
        alt="Fractal"
        width={size}
        height={size}
        priority={priority}
        className={`shrink-0 ${compact ? "h-6 w-6" : "h-7 w-7"}`}
      />
      {!onlyFractal && (
        <>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground md:block"
          >
            <path
              d="M8 3.5V12.5M3.5 8H12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <Image
            src="/lotuslogo.webp"
            alt="Lótus"
            width={size}
            height={size}
            priority={priority}
            className="hidden h-7 w-7 shrink-0 rounded-full md:block"
          />
        </>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 cursor-pointer items-center"
        aria-label={onlyFractal ? "Fractal" : "Fractal + Lótus"}
      >
        {content}
      </Link>
    );
  }

  return content;
}
