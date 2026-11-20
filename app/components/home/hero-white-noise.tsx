import { useId } from "react";

type HeroWhiteNoiseProps = {
  /** Intensidade geral do efeito noise branco (padrão calibrado para a hero) */
  intensity?: "default" | "subtle";
  className?: string;
};

/**
 * Efeito de noise/granulação branca orgânica de alta frequência.
 * Usa matriz de cor que força RGB = (255, 255, 255) puro com recorte de alfa,
 * preservando a saturação do céu e o contraste da pintura sem névoa leitosa.
 */
export function HeroWhiteNoise({
  intensity = "default",
  className = "",
}: HeroWhiteNoiseProps) {
  const rawId = useId().replace(/:/g, "");
  const whiteGrainId = `fractal-white-noise-${rawId}`;
  const fineGrainId = `fractal-fine-noise-${rawId}`;

  const primaryOpacity = intensity === "default" ? "opacity-30" : "opacity-15";
  const secondaryOpacity = intensity === "default" ? "opacity-10" : "opacity-5";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
    >
      {/* Camada principal: partículas de ruído branco puro (#FFFFFF) */}
      <svg
        className={`absolute inset-0 h-full w-full ${primaryOpacity}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={whiteGrainId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.88"
              numOctaves="4"
              seed="11"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              in="noise"
              values="
                0 0 0 0 1
                0 0 0 0 1
                0 0 0 0 1
                1.2 0 0 0 -0.4
              "
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${whiteGrainId})`} />
      </svg>

      {/* Camada complementar: textura fílmica sutil sobre as nuvens claras */}
      <svg
        className={`absolute inset-0 h-full w-full mix-blend-overlay ${secondaryOpacity}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={fineGrainId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.15"
              numOctaves="3"
              seed="29"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${fineGrainId})`} />
      </svg>
    </div>
  );
}
