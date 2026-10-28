import { NextRequest, NextResponse } from "next/server";
import { getChapterImages, getMangaChapters } from "@/lib/mangadex";
import { getKomikuChapterPages } from "@/lib/komiku";

export async function GET(req: NextRequest, { params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const mangaId = searchParams.get("mangaId");
  const source = searchParams.get("source");
  
  if (source === "komiku") {
    try {
      // Decode URL jika masih dalam bentuk encoded
      let chapterUrl = chapterId;
      if (chapterUrl.includes("%")) {
          try { chapterUrl = decodeURIComponent(chapterUrl); } catch(e) {}
      }

      const result = await getKomikuChapterPages(chapterUrl);

      // Jika gambar kosong (diblokir atau chapter habis), return kosong aja
      if (!result || !result.images || result.images.length === 0) {
        return NextResponse.json({ 
          chapterId, 
          images: [], 
          nextChapterId: null, 
          chapterNumber: "?" 
        });
      }

      let nextChapterId = null;
      if (result.nextUrl) {
        nextChapterId = encodeURIComponent(result.nextUrl); 
      }

      return NextResponse.json({ 
        chapterId, 
        images: result.images, 
        nextChapterId, 
        chapterNumber: "?" 
      });
    } catch (error) {
      console.error("[API KOMIKU ERROR]", error);
      // JIKA ERROR, KEMBALIKAN 200 KOSONG AGAR CLIENT BERHENTI DENGAN RAPI
      return NextResponse.json({ images: [], nextChapterId: null });
    }
  }

  // (Logika MangaDex tetap sama)
  if (!mangaId) return NextResponse.json({ error: "Missing mangaId" }, { status: 400 });
  const result = await getChapterImages(chapterId);
  
  let nextChapterId = null;
  if (!result.externalUrl) {
    try {
      const chaptersData = await getMangaChapters(mangaId);
      const allChapters = chaptersData?.data || [];
      const sortedChapters = [...allChapters].sort((a: any, b: any) => (parseFloat(a.attributes.chapter) || 0) - (parseFloat(b.attributes.chapter) || 0));
      const currentIndex = sortedChapters.findIndex((c: any) => c.id === chapterId);
      
      if (currentIndex !== -1 && currentIndex < sortedChapters.length - 1) {
        nextChapterId = sortedChapters[currentIndex + 1].id;
      }
    } catch (error) {}
  }

  return NextResponse.json({
    chapterId,
    chapterNumber: result.chapterNumber,
    images: result.images,
    externalUrl: result.externalUrl,
    nextChapterId
  });
}