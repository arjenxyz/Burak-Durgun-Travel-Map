import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#09090b" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "Burak Durgun — Seyahat Haritası",
  description: "Burak Durgun'un gezdiği ülkeler — interaktif 3D harita",
  applicationName: "Burak Durgun",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/burak-durgun-youtube.png", type: "image/png", sizes: "160x160" }],
    apple: [{ url: "/burak-durgun-youtube.png", type: "image/png", sizes: "160x160" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Burak Durgun",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-zinc-950 antialiased touch-manipulation`}
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
