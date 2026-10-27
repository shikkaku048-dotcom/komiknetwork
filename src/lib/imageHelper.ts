// src/lib/imageHelper.ts

export function getImageUrl(originalUrl: string | undefined | null) {
  if (!originalUrl) return "https://placehold.co/400x600/png?text=No+Image";
  
  const lowerUrl = originalUrl.toLowerCase();

  // 1. HANYA KOMIKU YANG DILEWATKAN KE WSRV.NL (Agar tidak kena limit)
  if (lowerUrl.includes("komiku.org") || lowerUrl.includes("komiktap")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=400`;
  }

  // 2. MANGADEX & LAINNYA: Langsung saja (MangaDex punya CDN sendiri yang cepat & tidak blokir)
  return originalUrl; 
}