import { NextRequest, NextResponse } from "next/server";
import { getKomikuChapterPages } from "@/lib/komiku";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  
  if (!url) {
    return NextResponse.json({ images: [], nextChapterId: null });
  }

  try {
    let decodedUrl = url;
    try { decodedUrl = decodeURIComponent(url); } catch(e) {}
    
    const result = await getKomikuChapterPages(decodedUrl);
    
    if (!result || !result.images || result.images.length === 0) {
      return NextResponse.json({ images: [], nextChapterId: null });
    }

    const nextChapterId = result.nextUrl ? encodeURIComponent(result.nextUrl) : null;

    // EKSTRAK ANGKA CHAPTER DARI URL
    let chapterNumber = "?";
    const match = decodedUrl.match(/(?:chapter|ch)[-/_]?(\d+(?:\.\d+)?)/i);
    if (match) {
      chapterNumber = match[1];
    }

    return NextResponse.json({ 
      chapterId: decodedUrl,
      images: result.images, 
      nextChapterId, 
      chapterNumber // <-- Kirim angka chapter yang benar
    });
  } catch (error) {
    console.error("[API KOMIKU READ ERROR]", error);
    return NextResponse.json({ images: [], nextChapterId: null });
  }
}