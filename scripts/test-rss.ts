import { parseLocationsFromVideo } from "../src/lib/locations/location-aliases";
import { fetchVideosFromRss } from "../src/lib/youtube/rss";

async function main() {
  const videos = await fetchVideosFromRss("UCfIOM2FhhCPc8ap9T_NoMjQ");
  console.log("RSS videos:", videos.length);
  console.log("Latest:", videos[0]?.title);
  console.log("Parsed:", parseLocationsFromVideo(videos[0]?.title ?? "", videos[0]?.description ?? ""));
}

main().catch(console.error);
