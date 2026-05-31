import { loadEnvFiles, printEnvHelp, requireEnv } from "./load-env";
import { runSync } from "../src/lib/sync/run-sync";

const loaded = loadEnvFiles();
if (!loaded) {
  printEnvHelp();
  process.exit(1);
}

console.log(`📁 Env yüklendi: ${loaded}`);

requireEnv([
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "YOUTUBE_CHANNEL_ID",
]);

const hasApiKey = Boolean(process.env.YOUTUBE_API_KEY?.trim());
console.log(
  hasApiKey
    ? "🎬 Mod: full (YouTube API — tüm videolar, birkaç dakika sürebilir)"
    : "🎬 Mod: full → RSS fallback (YOUTUBE_API_KEY yok, son 15 video)",
);
console.log("⏳ Sync başlıyor...\n");

runSync({ mode: "full", reparseAll: process.env.REPARSE === "1" })
  .then((result) => {
    console.log("\n✅ Sync complete:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Sync failed:");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.message.includes("YouTube")) {
        console.error("\n💡 YouTube API ipuçları:");
        console.error("   - Google Cloud'da YouTube Data API v3 etkin mi?");
        console.error("   - API key kısıtlaması IP/referrer engelliyor olabilir");
        console.error("   - Geçici çözüm: .env.local içinde YOUTUBE_API_KEY satırını sil → RSS kullanır\n");
      }
      if (error.message.includes("Supabase")) {
        console.error("\n💡 Supabase ipuçları:");
        console.error("   - SUPABASE_SERVICE_ROLE_KEY = service_role (anon değil!)");
        console.error("   - supabase/migrations/001_initial.sql çalıştırıldı mı?\n");
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  });
