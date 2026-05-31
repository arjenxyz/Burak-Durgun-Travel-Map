import { geocodePlaces } from "@/lib/locations/geocode";
import type { PlaceEntry } from "@/lib/locations/location-aliases";
import { createServiceClient } from "@/lib/supabase/client";
import type { PlaylistCountry } from "@/lib/youtube/playlists";

const CHUNK = 100;

export async function applyPlaylistCountryLocations(
  supabase: ReturnType<typeof createServiceClient>,
  videoCountryMap: Map<string, PlaylistCountry[]>,
): Promise<{ added: number; skipped: number; videosUpdated: number }> {
  let added = 0;
  let skipped = 0;
  let videosUpdated = 0;

  const youtubeIds = [...videoCountryMap.keys()];
  if (youtubeIds.length === 0) return { added, skipped, videosUpdated };

  for (let i = 0; i < youtubeIds.length; i += CHUNK) {
    const idChunk = youtubeIds.slice(i, i + CHUNK);

    const { data: videos, error } = await supabase
      .from("videos")
      .select("id, youtube_id")
      .in("youtube_id", idChunk);

    if (error) throw error;

    for (const video of videos ?? []) {
      const countries = videoCountryMap.get(video.youtube_id);
      if (!countries?.length) continue;

      await supabase.from("video_locations").delete().eq("video_id", video.id);

      const places: PlaceEntry[] = countries.map((country) => ({
        type: "country" as const,
        countryCode: country.code,
        countryName: country.name,
        geocodeQuery: country.name,
        confidence: 0.97,
        source: "playlist" as const,
      }));

      const geocoded = await geocodePlaces(places);
      if (geocoded.length === 0) {
        skipped += countries.length;
        continue;
      }

      videosUpdated += 1;

      for (const place of geocoded) {
        const { error: locError } = await supabase.from("video_locations").upsert(
          {
            video_id: video.id,
            country_code: place.countryCode,
            country_name: place.countryName,
            city: null,
            lat: place.lat,
            lng: place.lng,
            confidence: place.confidence,
            source: "playlist",
          },
          { onConflict: "video_id,country_code,city", ignoreDuplicates: false },
        );

        if (!locError) added += 1;
        else skipped += 1;
      }

      await supabase
        .from("videos")
        .update({ parsed_at: new Date().toISOString() })
        .eq("id", video.id);
    }
  }

  return { added, skipped, videosUpdated };
}
