import { parseCountriesFromText } from "@/lib/locations/location-aliases";

type PlaylistListResponse = {
  items?: Array<{
    id?: string;
    snippet?: { title?: string };
  }>;
  nextPageToken?: string;
};

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: { resourceId?: { videoId?: string } };
  }>;
  nextPageToken?: string;
};

export type PlaylistCountry = {
  code: string;
  name: string;
};

export type PlaylistSyncStats = {
  playlistsScanned: number;
  playlistsWithCountry: number;
  videosMapped: number;
};

async function youtubeError(label: string, res: Response): Promise<never> {
  let detail = "";
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    detail = body.error?.message ?? JSON.stringify(body);
  } catch {
    detail = await res.text().catch(() => "");
  }
  throw new Error(`${label} failed: HTTP ${res.status}${detail ? ` — ${detail}` : ""}`);
}

async function fetchAllPlaylistVideoIds(apiKey: string, playlistId: string): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) await youtubeError("YouTube playlistItems.list", res);
    const data = (await res.json()) as PlaylistItemsResponse;

    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (videoId) videoIds.push(videoId);
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videoIds;
}

/**
 * Kanal oynatma listelerinin başlıklarından ülke çıkarır;
 * listedeki her videoyu o ülkeye eşler.
 */
export async function buildVideoCountryMapFromPlaylists(
  apiKey: string,
  channelId: string,
): Promise<{ map: Map<string, PlaylistCountry[]>; stats: PlaylistSyncStats }> {
  const map = new Map<string, PlaylistCountry[]>();
  const stats: PlaylistSyncStats = {
    playlistsScanned: 0,
    playlistsWithCountry: 0,
    videosMapped: 0,
  };

  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) await youtubeError("YouTube playlists.list", res);
    const data = (await res.json()) as PlaylistListResponse;

    for (const item of data.items ?? []) {
      const playlistId = item.id;
      const title = item.snippet?.title;
      if (!playlistId || !title) continue;

      stats.playlistsScanned += 1;

      const countries = parseCountriesFromText(title);
      if (countries.length === 0) continue;

      stats.playlistsWithCountry += 1;
      const videoIds = await fetchAllPlaylistVideoIds(apiKey, playlistId);

      for (const videoId of videoIds) {
        const existing = map.get(videoId) ?? [];
        for (const country of countries) {
          if (!existing.some((entry) => entry.code === country.code)) {
            existing.push({ code: country.code, name: country.name });
          }
        }
        map.set(videoId, existing);
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  stats.videosMapped = map.size;
  return { map, stats };
}
