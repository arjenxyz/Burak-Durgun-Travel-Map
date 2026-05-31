import { XMLParser } from "fast-xml-parser";
import type { YouTubeVideoItem } from "./types";

type RssFeed = {
  feed?: {
    entry?: RssEntry | RssEntry[];
  };
};

type RssEntry = {
  title?: string;
  published?: string;
  "yt:videoId"?: string;
  link?: { "@_href"?: string } | Array<{ "@_href"?: string }>;
  "media:group"?: {
    "media:description"?: string;
    "media:thumbnail"?: { "@_url"?: string };
  };
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function fetchVideosFromRss(channelId: string): Promise<YouTubeVideoItem[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

  const xml = await res.text();
  const parsed = parser.parse(xml) as RssFeed;
  const entries = parsed.feed?.entry;
  if (!entries) return [];

  const list = Array.isArray(entries) ? entries : [entries];

  return list.map((entry) => {
    const link = Array.isArray(entry.link) ? entry.link[0] : entry.link;
    const videoId = entry["yt:videoId"] ?? "";
    return {
      youtubeId: videoId,
      title: entry.title ?? "",
      description: entry["media:group"]?.["media:description"] ?? "",
      thumbnailUrl:
        entry["media:group"]?.["media:thumbnail"]?.["@_url"] ??
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: entry.published ?? new Date().toISOString(),
      videoUrl: link?.["@_href"] ?? `https://www.youtube.com/watch?v=${videoId}`,
    };
  });
}
