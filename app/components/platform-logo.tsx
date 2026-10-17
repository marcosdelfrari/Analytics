import Image from "next/image";
import type { Platform } from "@/lib/types";
import { platformLabel } from "@/lib/types";

const sources: Record<Platform, string> = {
  google: "/google-ads-icon.webp",
  meta: "/META.webp",
};

export function PlatformLogo({
  platform,
  size = 18,
  className = "",
}: {
  platform: Platform;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={sources[platform]}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-sm object-contain ${className}`}
      aria-hidden
    />
  );
}

export function PlatformLogoLabel({
  platform,
  size = 18,
  className = "",
}: {
  platform: Platform;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <PlatformLogo platform={platform} size={size} />
      <span>{platformLabel(platform)}</span>
    </span>
  );
}
