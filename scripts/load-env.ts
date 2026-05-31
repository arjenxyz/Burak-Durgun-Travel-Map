import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ENV_FILES = [".env.local", ".env"];

export function loadEnvFiles(): string | null {
  for (const file of ENV_FILES) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;

    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) process.env[key] = value;
    }

    return file;
  }

  return null;
}

export function requireEnv(keys: string[]): void {
  const missing = keys.filter((key) => !process.env[key]?.trim());
  if (missing.length === 0) return;

  console.error("\n❌ Eksik ortam değişkenleri:\n");
  for (const key of missing) console.error(`   - ${key}`);
  console.error("\n   .env.example dosyasını .env.local olarak kopyalayıp doldurun.\n");
  process.exit(1);
}

export function printEnvHelp(): void {
  console.error("\n❌ .env.local veya .env bulunamadı.\n");
  console.error("   Windows PowerShell:");
  console.error("   Copy-Item .env.example .env.local\n");
  console.error("   Sonra Supabase + YouTube API key değerlerini girin.");
  console.error("   (Vercel'deki env değerlerini aynen kopyalayabilirsiniz.)\n");
}
