import type { YouTubeVideoItem } from "./types";

type PlaylistResponse = {
  items?: Array<{
    snippet?: {
      resourceId?: { videoId?: string };
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
    };
  }>;
  nextPageToken?: string;
};

async function getUploadsPlaylistId(apiKey: string, channelId: string): Promise<string> {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube channels.list failed: ${res.status}`);
  const data = (await res.json()) as {
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
  };
  const playlistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) throw new Error("Uploads playlist not found");
  return playlistId;
}

export async function fetchAllVideosFromApi(
  apiKey: string,
  channelId: string,
): Promise<YouTubeVideoItem[]> {
  const playlistId = await getUploadsPlaylistId(apiKey, channelId);
  const videos: YouTubeVideoItem[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`YouTube playlistItems.list failed: ${res.status}`);
    const data = (await res.json()) as PlaylistResponse;

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!videoId || !snippet?.title || snippet.title === "Private video") continue;

      videos.push({
        youtubeId: videoId,
        title: snippet.title,
        description: snippet.description ?? "",
        thumbnailUrl:
          snippet.thumbnails?.high?.url ??
          snippet.thumbnails?.medium?.url ??
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: snippet.publishedAt ?? new Date().toISOString(),
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos;
}
