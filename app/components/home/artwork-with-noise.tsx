import type { ReactNode } from "react";
import { HeroWhiteNoise } from "@/app/components/home/hero-white-noise";

type ArtworkWithNoiseProps = {
  children: ReactNode;
  className?: string;
  /** default na hero principal; subtle em blocos menores */
  intensity?: "default" | "subtle";
  /** classes extras na camada de noise (ex.: z-index, opacidade no mobile) */
  noiseClassName?: string;
  /** substitui a camada padrão (ex.: intensidade diferente mobile/desktop) */
  noiseSlot?: ReactNode;
};

/**
 * Enquadra arte (picture/img ou fill) com o mesmo grain branco da hero.
 */
export function ArtworkWithNoise({
  children,
  className = "",
  intensity = "subtle",
  noiseClassName = "z-20",
  noiseSlot,
}: ArtworkWithNoiseProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {noiseSlot ?? (
        <HeroWhiteNoise intensity={intensity} className={noiseClassName} />
      )}
    </div>
  );
}