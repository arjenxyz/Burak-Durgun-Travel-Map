import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, type CountryVideo } from "@/lib/supabase/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const city = request.nextUrl.searchParams.get("city");

  try {
    const supabase = createServiceClient();

    let locationQuery = supabase
      .from("video_locations")
      .select(
        `
        city,
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

    if (city) {
      locationQuery = locationQuery.eq("city", city);
    }

    const { data, error } = await locationQuery;
    if (error) throw error;

    const byVideoId = new Map<string, CountryVideo>();

    for (const row of data ?? []) {
      const video = row.videos as CountryVideo | CountryVideo[] | null;
      const videoRow = Array.isArray(video) ? video[0] : video;
      if (!videoRow?.id) continue;

      const existing = byVideoId.get(videoRow.id);
      if (existing) {
        if (row.city && !existing.cities.includes(row.city)) {
          existing.cities.push(row.city);
        }
        continue;
      }

      byVideoId.set(videoRow.id, {
        ...videoRow,
        cities: row.city ? [row.city] : [],
      });
    }

    const videos = [...byVideoId.values()].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );

    return NextResponse.json({
      countryCode: code.toUpperCase(),
      city,
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
