import Image from "next/image";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 28 : 36;
  return (
    <Image
      src="/fractalbranco.webp"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${compact ? "h-7 w-7" : "h-9 w-9"}`}
    />
  );
}
