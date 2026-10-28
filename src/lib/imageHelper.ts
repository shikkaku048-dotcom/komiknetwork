// src/lib/imageHelper.ts

// src/lib/imageHelper.ts
export function getImageUrl(originalUrl: string | undefined | null, isChapterPage = false) {
  if (!originalUrl) return "https://placehold.co/400x600/png?text=No+Image";
  
  const lowerUrl = originalUrl.toLowerCase();

  // 1. GAMBAR CHAPTER KOMIKU: Jangan lewat proxy, langsung saja
  // (Karena halaman chapter butuh kualitas tinggi dan cepat)
  if (isChapterPage) {
    if (lowerUrl.includes("komiku.org") || lowerUrl.includes("komiku.to")) {
      return originalUrl; 
    }
  }

  // 2. COVER KOMIKU: Lewat wsrv.nl agar cepat dan hemat
  if (lowerUrl.includes("komiku.org") || lowerUrl.includes("komiku.to") || lowerUrl.includes("komiktap")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=400`;
  }

  // 3. MANGADEX: Direct Link
  if (lowerUrl.includes("mangadex.org")) {
    return originalUrl; 
  }

  return `/api/image?url=${encodeURIComponent(originalUrl)}`;
}