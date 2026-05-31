import { loadEnvFiles, printEnvHelp, requireEnv } from "./load-env";
import { runSync } from "../src/lib/sync/run-sync";

const loaded = loadEnvFiles();
if (!loaded) {
  printEnvHelp();
  process.exit(1);
}

requireEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

console.log(`📁 Env: ${loaded} | Mod: RSS (son 15 video)\n`);

runSync({ mode: "cron" })
  .then((result) => {
    console.log("✅ Sync complete:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Sync failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
