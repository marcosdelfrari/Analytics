import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Geist_Mono,
  Roboto_Flex,
  Saira_Condensed,
  Sora,
} from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { WebMcpTools } from "@/app/components/webmcp";

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
    "Acompanhe os resultados do marketing e da mídia paga do seu negócio em um painel claro. Cadastro gratuito; recursos mediante plano. Uma tecnologia marcosdelfrari.com.",
  icons: { icon: "/lotuslogo.webp" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${barlowCondensed.variable} ${robotoFlex.variable} ${sairaCondensed.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RCZZNB8EZZ"
          strategy="beforeInteractive"
        />
        <Script id="google-tag" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RCZZNB8EZZ');
          `}
        </Script>
        <link rel="ai-catalog" type="application/json" href="/.well-known/ai-catalog.json" />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <WebMcpTools />
        {children}
      </body>
    </html>
  );
}
