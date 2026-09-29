import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3777";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Select Experience 2026 · Programação interativa + 20% OFF",
  description:
    "14 de novembro, São Paulo. 30+ sessões talkless com 40 devs sênior, staff e CTOs. Busque a programação, monte sua jornada e use o cupom PALESTRANTE20 pra 20% de desconto.",
  openGraph: {
    title: "Select Experience 2026 · 20% OFF com PALESTRANTE20",
    description:
      "O encontro anual dos devs que chegaram longe e não têm intenção de parar. 14/11 · São Paulo · 300 vagas.",
    siteName: "Select Experience 2026",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Select Experience 2026 · 20% OFF com PALESTRANTE20",
    description: "14/11 · São Paulo · 300 vagas. 30 sessões talkless com 40 devs sênior, staff e CTOs.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050707",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${spaceMono.variable} antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
