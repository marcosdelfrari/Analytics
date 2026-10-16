import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Geist_Mono,
  Roboto_Flex,
  Saira_Condensed,
  Sora,
} from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-barlow-condensed",
  preload: false,
});

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "XOPQ", "XTRA", "YOPQ", "YTDE", "YTFI", "YTLC", "YTUC"],
  variable: "--font-roboto-flex",
  preload: false,
});

const sairaCondensed = Saira_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-saira-condensed",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lótus — Analytics de mídia paga",
  description:
    "Lótus centraliza Google Ads e Meta Ads em um portal claro para clientes e equipes. Uma tecnologia marcosdelfrari.com.",
  icons: { icon: "/lotuslogo.webp" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${barlowCondensed.variable} ${robotoFlex.variable} ${sairaCondensed.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
