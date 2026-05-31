import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Burak Durgun — Seyahat Haritası",
  description: "Burak Durgun'un gezdiği ülkeler ve şehirler — YouTube videolarından otomatik",
};

export default function HomePage() {
  return <HomeClient />;
}
