import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl || imageUrl.includes("[object")) {
    return new NextResponse("URL tidak valid", { status: 400 });
  }

  const lowerUrl = imageUrl.toLowerCase();

  // =====================================================================
  // 1. SOLUSI BYPASS KOMIKU: Gunakan wsrv.nl sebagai PROXY (bukan redirect)
  // =====================================================================
  if (lowerUrl.includes("komiku.org") || lowerUrl.includes("komiktap")) {
    try {
      const proxiedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=400`;
      
      // Ambil gambar dari wsrv.nl
      const wsrvRes = await fetch(proxiedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        }
      });

      if (!wsrvRes.ok) throw new Error(`wsrv gagal: ${wsrvRes.status}`);

      // Kirimkan hasil gambar ke browser
      const buffer = await wsrvRes.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": wsrvRes.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    } catch (error) {
      console.error(`[IMAGE PROXY KOMIKU] Gagal: ${(error as Error).message}`);
      // Jika wsrv gagal, coba fetch langsung (cadangan)
    }
  }

  // =====================================================================
  // 2. FETCH LANGSUNG UNTUK MANGADEX & SUMBER LAIN
  // =====================================================================
  try {
    let referer = "https://mangadex.org/";
    if (lowerUrl.includes("myanimelist.net") || lowerUrl.includes("mal.com")) {
      referer = "https://myanimelist.net/";
    } else if (lowerUrl.includes("anilist") || lowerUrl.includes("anili.st")) {
      referer = "https://anilist.co/";
    }

    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
        "Origin": new URL(referer).origin,
        "Referer": referer,
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      cache: 'force-cache',
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Status: ${res.status}`);

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error(`[IMAGE PROXY] Gagal: ${(error as Error).message}`);
    
    // Fallback SVG jika gambar benar-benar mati
    const svgError = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" font-family="monospace" font-size="16" fill="#6b7280" dominant-baseline="middle" text-anchor="middle">Gambar Error</text></svg>`;
    return new NextResponse(svgError, { headers: { "Content-Type": "image/svg+xml" } });
  }
}