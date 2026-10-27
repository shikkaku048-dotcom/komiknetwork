// src/lib/imageHelper.ts

export function getImageUrl(originalUrl: string | undefined | null) {
  if (!originalUrl) return "https://placehold.co/400x600/png?text=No+Image";
  
  const lowerUrl = originalUrl.toLowerCase();

  // SEMUA GAMBAR KOMIKU WAJIB LEWAT WSRV.NL
  if (
    lowerUrl.includes("komiku.org") || 
    lowerUrl.includes("komiku.to") || 
    lowerUrl.includes("komiktap")
  ) {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=400`;
  }

  // MANGADEX: Direct Link
  if (lowerUrl.includes("mangadex.org")) {
    return originalUrl; 
  }

  return `/api/image?url=${encodeURIComponent(originalUrl)}`;
}