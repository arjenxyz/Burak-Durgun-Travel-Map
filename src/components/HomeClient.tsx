"use client";

import dynamic from "next/dynamic";

const TravelGlobe = dynamic(() => import("@/components/TravelGlobe"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
      3D harita yükleniyor...
    </div>
  ),
});

export default function HomeClient() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-zinc-950">
      <TravelGlobe />
    </main>
  );
}
