import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const manifest = (): MetadataRoute.Manifest => ({
  id: "/",
  name: "İTF Randevu Takip",
  short_name: "İTF Randevu",
  description: "İstanbul Tıp Fakültesi (Çapa) randevularını 20:00'da otomatik takip edip alan asistan.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#0a0e17",
  theme_color: "#0a0e17",
  lang: "tr",
});

export default manifest;
