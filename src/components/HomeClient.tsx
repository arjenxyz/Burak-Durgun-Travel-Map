"use client";

import dynamic from "next/dynamic";

const TravelGlobe = dynamic(() => import("@/components/TravelGlobe"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
      3D harita yükleniyor...
    </div>
  ),
});

export default function HomeClient() {
  return (
    <main className="fixed inset-0 h-dvh w-full overflow-hidden bg-zinc-950 safe-top">
      <TravelGlobe />
    </main>
  );
}
