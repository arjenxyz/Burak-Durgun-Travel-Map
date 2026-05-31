import { NextResponse } from "next/server";
import { createServiceClient, type MapCountry } from "@/lib/supabase/client";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [countriesRes, videosRes, syncRes] = await Promise.all([
      supabase.from("map_countries").select("*").order("video_count", { ascending: false }),
      supabase.from("videos").select("id", { count: "exact", head: true }),
      supabase
        .from("sync_runs")
        .select("finished_at, status")
        .eq("status", "success")
        .order("finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (countriesRes.error) throw countriesRes.error;

    const countries = (countriesRes.data ?? []) as MapCountry[];

    return NextResponse.json({
      stats: {
        totalCountries: countries.length,
        totalVideos: videosRes.count ?? 0,
        lastSync: syncRes.data?.finished_at ?? null,
      },
      countries,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load map data" },
      { status: 500 },
    );
  }
}

export const revalidate = 60;
