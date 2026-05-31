import type { MetadataRoute } from "next";

const APP_ICON = "/burak-durgun-youtube.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Burak Durgun — Seyahat Haritası",
    short_name: "Burak Durgun",
    description: "Burak Durgun'un gezdiği ülkeler ve şehirler — interaktif 3D harita",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "any",
    lang: "tr",
    categories: ["travel", "entertainment"],
    icons: [
      {
        src: APP_ICON,
        sizes: "160x160",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APP_ICON,
        sizes: "160x160",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
