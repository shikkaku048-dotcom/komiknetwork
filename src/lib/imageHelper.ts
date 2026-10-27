// src/lib/imageHelper.ts

export function getImageUrl(originalUrl: string | undefined | null) {
  if (!originalUrl) return "https://placehold.co/400x600/png?text=No+Image";
  
  const lowerUrl = originalUrl.toLowerCase();

  // 1. BYPASS KOMIKU: Tembak langsung ke wsrv.nl dari browser user (Vercel tidak kerja)
  if (lowerUrl.includes("komiku.org") || lowerUrl.includes("komiktap")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=400`;
  }

  // 2. MANGADEX: Biasanya aman untuk direct link
  if (lowerUrl.includes("mangadex.org")) {
    return originalUrl; 
  }

  // 3. LAINNYA: Tetap gunakan API Proxy Vercel (jika ada sumber lain)
  return `/api/image?url=${encodeURIComponent(originalUrl)}`;
}