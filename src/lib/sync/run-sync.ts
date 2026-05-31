import { geocodePlaces } from "@/lib/locations/geocode";
import { parseLocationsFromVideo } from "@/lib/locations/location-aliases";
import { createServiceClient } from "@/lib/supabase/client";
import { fetchAllVideosFromApi } from "@/lib/youtube/api";
import { fetchVideosFromRss } from "@/lib/youtube/rss";
import type { YouTubeVideoItem } from "@/lib/youtube/types";

export type SyncResult = {
  videosFetched: number;
  videosNew: number;
  locationsAdded: number;
  source: "api" | "rss";
};

async function fetchVideos(channelId: string): Promise<{ videos: YouTubeVideoItem[]; source: "api" | "rss" }> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    return { videos: await fetchAllVideosFromApi(apiKey, channelId), source: "api" };
  }
  return { videos: await fetchVideosFromRss(channelId), source: "rss" };
}

export async function runSync(): Promise<SyncResult> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCfIOM2FhhCPc8ap9T_NoMjQ";
  const supabase = createServiceClient();

  const { data: syncRun, error: syncRunError } = await supabase
    .from("sync_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (syncRunError) throw syncRunError;

  let videosFetched = 0;
  let videosNew = 0;
  let locationsAdded = 0;
  let source: "api" | "rss" = "rss";

  try {
    const fetched = await fetchVideos(channelId);
    source = fetched.source;
    videosFetched = fetched.videos.length;

    const { data: existingVideos } = await supabase.from("videos").select("youtube_id, parsed_at");
    const existingMap = new Map((existingVideos ?? []).map((v) => [v.youtube_id, v.parsed_at]));

    for (const video of fetched.videos) {
      const isNew = !existingMap.has(video.youtubeId);

      const { data: upserted, error: videoError } = await supabase
        .from("videos")
        .upsert(
          {
            youtube_id: video.youtubeId,
            title: video.title,
            description: video.description,
            thumbnail_url: video.thumbnailUrl,
            published_at: video.publishedAt,
            video_url: video.videoUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "youtube_id" },
        )
        .select("id, youtube_id, parsed_at")
        .single();

      if (videoError || !upserted) continue;
      if (isNew) videosNew += 1;

      const needsParse = isNew || !upserted.parsed_at;
      if (!needsParse) continue;

      const places = parseLocationsFromVideo(video.title, video.description);
      if (places.length === 0) {
        await supabase
          .from("videos")
          .update({ parsed_at: new Date().toISOString() })
          .eq("id", upserted.id);
        continue;
      }

      const geocoded = await geocodePlaces(places);

      for (const place of geocoded) {
        const { error: locError } = await supabase.from("video_locations").upsert(
          {
            video_id: upserted.id,
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

        if (!locError) locationsAdded += 1;
      }

      await supabase
        .from("videos")
        .update({ parsed_at: new Date().toISOString() })
        .eq("id", upserted.id);
    }

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

    return { videosFetched, videosNew, locationsAdded, source };
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
