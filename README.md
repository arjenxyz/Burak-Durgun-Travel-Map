# Burak Durgun — YouTube Seyahat Haritası

Burak Durgun'un ([@BurakDurgun](https://www.youtube.com/@BurakDurgun)) YouTube video başlıklarından otomatik ülke/şehir çıkaran ve 3D dünya haritasında gösteren web uygulaması.

**Stack:** Next.js (Vercel) · Supabase · cron-job.org · globe.gl

> **Kurulum:** Adım adım detaylı rehber için → **[KURULUM.md](./KURULUM.md)**

## Özellikler

- YouTube RSS veya Data API ile video senkronizasyonu
- Başlık + hashtag + açıklama parser (ör. `FAS'A GELDİM`, `#marakesh`, `#fas`)
- Supabase'de video ve konum veritabanı
- 3D interaktif küre haritası
- cron-job.org ile otomatik güncelleme

## Hızlı başlangıç

```bash
git clone https://github.com/arjenxyz/Burak-Durgun-Travel-Map.git
cd Burak-Durgun-Travel-Map
npm install
cp .env.example .env.local   # değerleri doldur
npm run sync                 # Supabase migration sonrası
npm run dev
```

Tam kurulum (Supabase, YouTube API, Vercel, cron): **[KURULUM.md](./KURULUM.md)**

**Canlı site sync linkleri:** **[SYNC.md](./SYNC.md)** → [burak-durgun.vercel.app](https://burak-durgun.vercel.app)

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
