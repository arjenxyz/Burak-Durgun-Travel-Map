# Sync — Canlı site

**Site:** [burak-durgun.vercel.app](https://burak-durgun.vercel.app)

`CRON_SECRET` değerini Vercel → **Settings → Environment Variables** içinden kopyala. Aşağıdaki linklerde `CRON_SECRET` yazan yere yapıştır.

## Hızlı linkler

| Ne yapar | Link |
|----------|------|
| Durum kontrolü (secret gerekmez) | https://burak-durgun.vercel.app/api/health |
| Harita verisi (secret gerekmez) | https://burak-durgun.vercel.app/api/map |
| **Normal sync** — yeni videolar | `https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET` |
| **Tam yenileme** — konumları sıfırla + Türkçe isimler | `https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET&reparse=1` |

### Normal sync (günlük)

```
https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET
```

### Sıfırdan parse (ülke düzeltmelerinden sonra bir kez)

```
https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET&reparse=1
```

`reparse=1` sonrası `videosPendingParse > 0` görürsen normal sync linkini birkaç kez daha aç.

## cron-job.org

| Alan | Değer |
|------|--------|
| URL | `https://burak-durgun.vercel.app/api/sync?secret=CRON_SECRET` |
| Method | GET |
| Sıklık | 6 saatte bir (önerilen) |

Secret'ı URL'de göstermek istemezsen:

- URL: `https://burak-durgun.vercel.app/api/sync`
- Header: `Authorization: Bearer CRON_SECRET`

## Yerel (bilgisayardan)

```bash
npm run sync
```

Tam sıfırlama:

```powershell
$env:REPARSE="1"; npm run sync
```

## Başarılı yanıt örneği

```json
{
  "ok": true,
  "videosFetched": 622,
  "locationsAdded": 542,
  "playlistsWithCountry": 49,
  "hint": "..."
}
```

401 alırsan → Vercel'deki `CRON_SECRET` ile linkteki secret aynı değil.
