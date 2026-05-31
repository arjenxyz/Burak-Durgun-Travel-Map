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
    ok: Boolean(process.env.YOUTUBE_API_KEY?.trim()),
    detail: process.env.YOUTUBE_API_KEY?.trim()
      ? "set"
      : "eksik — yalnızca RSS (15 video). Vercel env'e YOUTUBE_API_KEY ekleyin",
  };

  if (process.env.YOUTUBE_API_KEY?.trim()) {
    try {
      const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCfIOM2FhhCPc8ap9T_NoMjQ";
      const url = new URL("https://www.googleapis.com/youtube/v3/channels");
      url.searchParams.set("part", "id");
      url.searchParams.set("id", channelId);
      url.searchParams.set("key", process.env.YOUTUBE_API_KEY.trim());
      const res = await fetch(url.toString());
      if (res.ok) {
        checks.youtube_api_test = { ok: true, detail: "YouTube API çalışıyor" };
      } else {
        const body = await res.text();
        checks.youtube_api_test = {
          ok: false,
          detail: `HTTP ${res.status} — ${body.slice(0, 120)}`,
        };
      }
    } catch (error) {
      checks.youtube_api_test = {
        ok: false,
        detail: error instanceof Error ? error.message : "API test failed",
      };
    }
  }

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
