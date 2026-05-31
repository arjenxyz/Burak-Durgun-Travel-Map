import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { fetchVideosFromRss } from "@/lib/youtube/rss";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  checks.cron_secret = {
    ok: Boolean(process.env.CRON_SECRET?.trim()),
    detail: process.env.CRON_SECRET ? "set" : "missing — /api/sync returns 401",
  };

  checks.supabase_url = {
    ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
  };

  checks.supabase_service_role = {
    ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
  };

  checks.youtube_channel = {
    ok: Boolean(process.env.YOUTUBE_CHANNEL_ID?.trim()),
    detail: process.env.YOUTUBE_CHANNEL_ID ?? "UCfIOM2FhhCPc8ap9T_NoMjQ (default)",
  };

  checks.youtube_api_key = {
    ok: true,
    detail: process.env.YOUTUBE_API_KEY?.trim()
      ? "set — tüm kanal geçmişi sync edilir (parse batch halinde)"
      : "not set — yalnızca RSS (son 15 video)",
  };

  let supabaseOk = false;
  let supabaseDetail = "not tested";

  if (checks.supabase_url.ok && checks.supabase_service_role.ok) {
    try {
      const supabase = createServiceClient();
      const { error } = await supabase.from("sync_runs").select("id").limit(1);
      if (error) {
        supabaseDetail = error.message;
      } else {
        supabaseOk = true;
        supabaseDetail = "connected — sync_runs table reachable";
      }
    } catch (error) {
      supabaseDetail = error instanceof Error ? error.message : "connection failed";
    }
  } else {
    supabaseDetail = "skipped — missing Supabase env";
  }

  checks.supabase = { ok: supabaseOk, detail: supabaseDetail };

  let rssOk = false;
  let rssDetail = "not tested";

  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCfIOM2FhhCPc8ap9T_NoMjQ";
    const videos = await fetchVideosFromRss(channelId);
    rssOk = videos.length > 0;
    rssDetail = rssOk ? `${videos.length} videos from RSS` : "RSS returned no videos";
  } catch (error) {
    rssDetail = error instanceof Error ? error.message : "RSS fetch failed";
  }

  checks.youtube_rss = { ok: rssOk, detail: rssDetail };

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      ok: allOk,
      checks,
      hint: allOk
        ? "Ready for cron-job.org → GET /api/sync?secret=CRON_SECRET"
        : "Fix failing checks above, redeploy Vercel, then retry cron test",
    },
    { status: allOk ? 200 : 503 },
  );
}
