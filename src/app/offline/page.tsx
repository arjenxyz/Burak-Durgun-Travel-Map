import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center">
      <p className="text-5xl">🌍</p>
      <h1 className="text-xl font-semibold text-white">Çevrimdışı</h1>
      <p className="max-w-sm text-sm text-zinc-400">
        İnternet bağlantın yok. Haritayı görmek için tekrar bağlan ve uygulamayı yenile.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white"
      >
        Yeniden dene
      </Link>
    </main>
  );
}
