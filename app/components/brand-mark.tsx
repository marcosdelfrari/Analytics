import Image from "next/image";

export function BrandMark() {
  return (
    <Image
      src="/lotuslogo.webp"
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0"
    />
  );
}
