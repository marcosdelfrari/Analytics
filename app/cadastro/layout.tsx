import type { ReactNode } from "react";
import { NOINDEX_METADATA } from "@/lib/seo";

export const metadata = NOINDEX_METADATA;

export default function CadastroLayout({ children }: { children: ReactNode }) {
  return children;
}
