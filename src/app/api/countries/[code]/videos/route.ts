import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, type CountryVideo } from "@/lib/supabase/client";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;

  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("video_locations")
      .select(
        `
        videos (
          id,
          youtube_id,
          title,
          thumbnail_url,
          published_at,
          video_url
        )
      `,
      )
      .eq("country_code", code.toUpperCase());

    if (error) throw error;

    const byVideoId = new Map<string, CountryVideo>();

    for (const row of data ?? []) {
      const video = row.videos as CountryVideo | CountryVideo[] | null;
      const videoRow = Array.isArray(video) ? video[0] : video;
      if (!videoRow?.id || byVideoId.has(videoRow.id)) continue;
      byVideoId.set(videoRow.id, videoRow);
    }

    const videos = [...byVideoId.values()].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );

    return NextResponse.json({
      countryCode: code.toUpperCase(),
      count: videos.length,
      videos,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load videos" },
      { status: 500 },
    );
  }
}

export const revalidate = 60;
