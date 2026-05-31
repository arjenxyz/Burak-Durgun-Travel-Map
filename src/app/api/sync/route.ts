import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/sync/run-sync";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const cronHeader = request.headers.get("x-cron-secret");
  if (cronHeader === secret) return true;

  const querySecret = request.nextUrl.searchParams.get("secret");
  return querySecret === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSync({ mode: "cron" });
    return NextResponse.json({
      ok: true,
      mode: "cron",
      ...result,
      hint:
        result.videosPendingParse > 0
          ? `${result.videosPendingParse} video parse bekliyor — cron tekrar çalıştıkça tamamlanır veya npm run sync kullanın`
          : "Tüm videolar işlendi",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    console.error("[sync]", message, error);

    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: "Check GET /api/health — common fixes: run Supabase migration SQL, set service_role key (not anon), redeploy Vercel env",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

export const maxDuration = 300;
