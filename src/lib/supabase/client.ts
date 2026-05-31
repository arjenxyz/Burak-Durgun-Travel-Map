import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, key);
}

export type Video = {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string;
  video_url: string;
};

export type VideoLocation = {
  id: string;
  video_id: string;
  country_code: string;
  country_name: string;
  city: string | null;
  lat: number;
  lng: number;
  confidence: number;
  source: string;
};

export type MapCountry = {
  country_code: string;
  country_name: string;
  lat: number;
  lng: number;
  video_count: number;
  city_count: number;
};

export type MapCity = {
  country_code: string;
  country_name: string;
  city: string;
  lat: number;
  lng: number;
  video_count: number;
  last_visit: string;
};

export type MapStats = {
  totalCountries: number;
  totalCities: number;
  totalVideos: number;
  lastSync: string | null;
};
