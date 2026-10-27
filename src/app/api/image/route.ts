import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl || imageUrl.includes("[object")) {
    return new NextResponse("URL tidak valid", { status: 400 });
  }

  const lowerUrl = imageUrl.toLowerCase();

  // 1. SOLUSI BYPASS KOMIKU (Termasuk komiku.to)
  if (lowerUrl.includes("komiku.org") || lowerUrl.includes("komiku.to") || lowerUrl.includes("komiktap")) {
    try {
      const proxiedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=400`;
      const wsrvRes = await fetch(proxiedUrl);
      if (!wsrvRes.ok) throw new Error("wsrv gagal");
      
      const buffer = await wsrvRes.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": wsrvRes.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error) {
      console.error(`[IMAGE PROXY KOMIKU] Gagal: ${(error as Error).message}`);
    }
  }

  // 2. FETCH LANGSUNG (MangaDex / dll)
  try {
    let referer = "https://mangadex.org/";
    if (lowerUrl.includes("myanimelist.net")) referer = "https://myanimelist.net/";
    if (lowerUrl.includes("komiku.to")) referer = "https://komiku.to/"; // Tambahan
    if (lowerUrl.includes("komiku.org")) referer = "https://komiku.org/"; // Tambahan

    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Origin": new URL(referer).origin,
        "Referer": referer,
      },
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error(`Status: ${res.status}`);
    
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    const svgError = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" font-family="monospace" font-size="16" fill="#6b7280" dominant-baseline="middle" text-anchor="middle">Gambar Error</text></svg>`;
    return new NextResponse(svgError, { headers: { "Content-Type": "image/svg+xml" } });
  }
}