import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";

import { API_BASE, SITE_URL } from "@/lib/kf.ts";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "İTF Randevu Takip",
  description: "İstanbul Tıp Fakültesi (Çapa) randevu takip ve otomatik alma paneli.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "İTF Randevu", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e17" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  preconnect(API_BASE, { crossOrigin: "anonymous" });
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;
