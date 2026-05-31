# Burak Durgun — YouTube Seyahat Haritası

Burak Durgun'un ([@BurakDurgun](https://www.youtube.com/@BurakDurgun)) YouTube video başlıklarından otomatik ülke/şehir çıkaran ve 3D dünya haritasında gösteren web uygulaması.

**Stack:** Next.js (Vercel) · Supabase · cron-job.org · globe.gl

## Özellikler

- YouTube RSS veya Data API ile video senkronizasyonu
- Başlık + hashtag + açıklama parser (ör. `FAS'A GELDİM`, `#marakesh`, `#fas`)
- Supabase'de video ve konum veritabanı
- 3D interaktif küre haritası
- cron-job.org ile otomatik güncelleme

## Kurulum

### 1. Supabase

1. [supabase.com](https://supabase.com) üzerinde yeni proje oluşturun
2. SQL Editor'de `supabase/migrations/001_initial.sql` dosyasını çalıştırın
3. Project Settings → API'den URL ve anahtarları alın

### 2. Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın:

```bash
cp .env.example .env.local
```

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (sadece sunucu) |
| `YOUTUBE_CHANNEL_ID` | `UCfIOM2FhhCPc8ap9T_NoMjQ` (Burak Durgun) |
| `YOUTUBE_API_KEY` | Opsiyonel — tüm geçmiş için gerekli |
| `CRON_SECRET` | Sync endpoint koruması |

> **Not:** `YOUTUBE_API_KEY` olmadan RSS ile sadece **son 15 video** senkronize edilir. Tüm kanal geçmişi için [Google Cloud Console](https://console.cloud.google.com/) üzerinden YouTube Data API v3 anahtarı oluşturun.

### 3. Yerel çalıştırma

```bash
npm install
npm run dev
```

İlk veri yüklemesi:

```bash
npm run sync
```

### 4. Vercel deploy

1. Repoyu GitHub'a push edin
2. [vercel.com](https://vercel.com) → Import Project
3. Environment Variables bölümüne `.env.local` değerlerini ekleyin
4. Deploy

### 5. cron-job.org (otomatik güncelleme)

1. [cron-job.org](https://cron-job.org) hesabı oluşturun
2. Yeni cron job:
   - **URL:** `https://SIZIN-DOMAIN.vercel.app/api/sync?secret=CRON_SECRET`
   - **Schedule:** Her 6 saatte bir (veya günde 4 kez)
   - **Method:** GET
   - **Headers (alternatif):** `Authorization: Bearer CRON_SECRET`

Yeni video atıldığında bir sonraki cron çalışmasında haritaya eklenir.

## API

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/map` | Harita istatistikleri + ülke/şehir koordinatları |
| `GET /api/sync?secret=...` | YouTube → Supabase senkronizasyonu (cron) |

## Konum parser

Parser şu kaynaklardan yer çıkarır:

1. Başlık kalıpları: `FAS'A GELDİM`, `FAS'IN ...`
2. Hashtag'ler: `#fas`, `#marakesh`, `#fes`
3. Bilinen şehir adları (MARAKEŞ, SEVİLLA vb.)

Yeni ülke/şehir alias'ları `src/lib/locations/location-aliases.ts` dosyasına eklenebilir.

## Kanal bilgisi

- **Kanal:** https://www.youtube.com/@BurakDurgun
- **Channel ID:** `UCfIOM2FhhCPc8ap9T_NoMjQ`
