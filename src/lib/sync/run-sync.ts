import { geocodePlaces } from "@/lib/locations/geocode";
import { parseLocationsFromVideo } from "@/lib/locations/location-aliases";
import { createServiceClient } from "@/lib/supabase/client";
import { fetchAllVideosFromApi } from "@/lib/youtube/api";
import { fetchVideosFromRss } from "@/lib/youtube/rss";
import type { YouTubeVideoItem } from "@/lib/youtube/types";

export type SyncResult = {
  videosFetched: number;
  videosNew: number;
  videosParsed: number;
  videosPendingParse: number;
  locationsAdded: number;
  locationsSkipped: number;
  source: "api" | "rss";
  youtubeApiKeyConfigured: boolean;
  sourceReason?: string;
};

export type SyncOptions = {
  mode?: "cron" | "full";
  parseLimit?: number;
};

const UPSERT_CHUNK = 100;

async function fetchAllVideos(channelId: string): Promise<{
  videos: YouTubeVideoItem[];
  source: "api" | "rss";
  youtubeApiKeyConfigured: boolean;
  sourceReason?: string;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (apiKey) {
    try {
      return {
        videos: await fetchAllVideosFromApi(apiKey, channelId),
        source: "api",
        youtubeApiKeyConfigured: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("[sync] YouTube API failed, falling back to RSS:", message);
      return {
        videos: await fetchVideosFromRss(channelId),
        source: "rss",
        youtubeApiKeyConfigured: true,
        sourceReason: `YouTube API hatası — RSS kullanıldı: ${message}`,
      };
    }
  }

  return {
    videos: await fetchVideosFromRss(channelId),
    source: "rss",
    youtubeApiKeyConfigured: false,
    sourceReason:
      "YOUTUBE_API_KEY Vercel env'de tanımlı değil — yalnızca son 15 video (RSS) çekildi",
  };
}

function formatSupabaseError(error: { message?: string; code?: string; details?: string }): string {
  return [error.message, error.code, error.details].filter(Boolean).join(" — ");
}

function getParseLimit(mode: "cron" | "full", override?: number): number {
  if (override !== undefined) return override;
  if (mode === "full") return Number.POSITIVE_INFINITY;
  const fromEnv = Number(process.env.SYNC_PARSE_BATCH_SIZE ?? 50);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 50;
}

async function upsertVideoBatch(
  supabase: ReturnType<typeof createServiceClient>,
  videos: YouTubeVideoItem[],
  existingIds: Set<string>,
): Promise<number> {
  let videosNew = 0;

  for (let i = 0; i < videos.length; i += UPSERT_CHUNK) {
    const chunk = videos.slice(i, i + UPSERT_CHUNK);
    const rows = chunk.map((video) => ({
      youtube_id: video.youtubeId,
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnailUrl,
      published_at: video.publishedAt,
      video_url: video.videoUrl,
      updated_at: new Date().toISOString(),
    }));

    for (const video of chunk) {
      if (!existingIds.has(video.youtubeId)) videosNew += 1;
    }

    const { error } = await supabase.from("videos").upsert(rows, { onConflict: "youtube_id" });
    if (error) throw new Error(`Video upsert failed: ${formatSupabaseError(error)}`);
  }

  return videosNew;
}

async function parseVideo(
  supabase: ReturnType<typeof createServiceClient>,
  video: { id: string; title: string; description: string | null },
): Promise<{ added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;

  const places = parseLocationsFromVideo(video.title, video.description ?? "");
  if (places.length === 0) {
    await supabase.from("videos").update({ parsed_at: new Date().toISOString() }).eq("id", video.id);
    return { added, skipped };
  }

  const geocoded = await geocodePlaces(places);

  for (const place of geocoded) {
    const { error: locError } = await supabase.from("video_locations").upsert(
      {
        video_id: video.id,
        country_code: place.countryCode,
        country_name: place.countryName,
        city: place.city ?? null,
        lat: place.lat,
        lng: place.lng,
        confidence: place.confidence,
        source: "parser",
      },
      { onConflict: "video_id,country_code,city", ignoreDuplicates: false },
    );

    if (!locError) added += 1;
    else skipped += 1;
  }

  await supabase.from("videos").update({ parsed_at: new Date().toISOString() }).eq("id", video.id);
  return { added, skipped };
}

export async function runSync(options: SyncOptions = {}): Promise<SyncResult> {
  const mode = options.mode ?? (process.env.SYNC_MODE === "full" ? "full" : "cron");
  const parseLimit = getParseLimit(mode, options.parseLimit);
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCfIOM2FhhCPc8ap9T_NoMjQ";
  const supabase = createServiceClient();

  const { data: syncRun, error: syncRunError } = await supabase
    .from("sync_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (syncRunError) {
    throw new Error(`Supabase sync_runs insert failed: ${formatSupabaseError(syncRunError)}`);
  }

  let videosFetched = 0;
  let videosNew = 0;
  let videosParsed = 0;
  let videosPendingParse = 0;
  let locationsAdded = 0;
  let locationsSkipped = 0;
  let source: "api" | "rss" = "rss";
  let youtubeApiKeyConfigured = false;
  let sourceReason: string | undefined;

  try {
    const fetched = await fetchAllVideos(channelId);
    source = fetched.source;
    youtubeApiKeyConfigured = fetched.youtubeApiKeyConfigured;
    sourceReason = fetched.sourceReason;
    videosFetched = fetched.videos.length;

    const { data: existingVideos, error: existingError } = await supabase
      .from("videos")
      .select("youtube_id");

    if (existingError) throw new Error(formatSupabaseError(existingError));

    const existingIds = new Set((existingVideos ?? []).map((v) => v.youtube_id));
    videosNew = await upsertVideoBatch(supabase, fetched.videos, existingIds);

    let unparsedQuery = supabase
      .from("videos")
      .select("id, title, description")
      .is("parsed_at", null)
      .order("published_at", { ascending: false });

    if (Number.isFinite(parseLimit)) {
      unparsedQuery = unparsedQuery.limit(parseLimit);
    }

    const { data: toParse, error: parseQueryError } = await unparsedQuery;
    if (parseQueryError) throw new Error(formatSupabaseError(parseQueryError));

    for (const video of toParse ?? []) {
      const result = await parseVideo(supabase, video);
      locationsAdded += result.added;
      locationsSkipped += result.skipped;
      videosParsed += 1;
    }

    const { count: pendingCount } = await supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .is("parsed_at", null);

    videosPendingParse = pendingCount ?? 0;

    await supabase
      .from("sync_runs")
      .update({
        finished_at: new Date().toISOString(),
        videos_fetched: videosFetched,
        videos_new: videosNew,
        locations_added: locationsAdded,
        status: "success",
      })
      .eq("id", syncRun.id);

    return {
      videosFetched,
      videosNew,
      videosParsed,
      videosPendingParse,
      locationsAdded,
      locationsSkipped,
      source,
      youtubeApiKeyConfigured,
      sourceReason,
    };
  } catch (error) {
    await supabase
      .from("sync_runs")
      .update({
        finished_at: new Date().toISOString(),
        videos_fetched: videosFetched,
        videos_new: videosNew,
        locations_added: locationsAdded,
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", syncRun.id);
    throw error;
  }
}
