import type { Metadata } from "next";
import { Lato, Roboto, Roboto_Slab, Rufina } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { SITE_URL } from "@/lib/seo";

// Mismas familias tipográficas que cargaba Elementor (self-hosted por Next.js).
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
  display: "swap",
});
const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"], variable: "--font-lato", display: "swap" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-roboto-slab", display: "swap" });
const rufina = Rufina({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-rufina", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: { google: "YfCVGbFRDBlhrCiUnjF-HyGcjOfgEGrIj-CC30v-qvY" },
  icons: {
    icon: [
      { url: "/wp-content/uploads/2024/06/favicon-150x150.png", sizes: "32x32" },
      { url: "/wp-content/uploads/2024/06/favicon.png", sizes: "192x192" },
    ],
    apple: "/wp-content/uploads/2024/06/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${roboto.variable} ${lato.variable} ${robotoSlab.variable} ${rufina.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
