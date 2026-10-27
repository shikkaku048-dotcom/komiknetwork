// src/lib/imageHelper.ts

export function getImageUrl(originalUrl: string | undefined | null) {
  if (!originalUrl) return "https://placehold.co/400x600/png?text=No+Image";
  
  const lowerUrl = originalUrl.toLowerCase();

  // Komiku wajib lewat wsrv.nl karena blokir hotlink
  if (
    lowerUrl.includes("komiku.org") || 
    lowerUrl.includes("komiku.to") || 
    lowerUrl.includes("komiktap")
  ) {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=400`;
  }

  // MangaDex & lainnya: Langsung (Jangan lewat proxy agar tidak limit)
  return originalUrl; 
}