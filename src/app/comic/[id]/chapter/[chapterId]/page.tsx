import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react"; // ArrowLeft dihapus
import { getChapterImages, getMangaChapters } from "@/lib/mangadex";
import { getKomikuChapterPages } from "@/lib/komiku";
import ContinuousReader from "@/components/ContinuousReader";
import AdBanner from "@/components/AdBanner"; 
import ReaderHeader from "@/components/ReaderHeader"; // Import Header Baru

export async function generateMetadata(
  { params }: { params: Promise<{ id: string; chapterId: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const comicTitle = decodeURIComponent(id).split("/").pop()?.replace(/-/g, " ") || "Komik";
  
  return {
    title: `Baca Chapter - ${comicTitle}`,
    description: `Baca chapter terbaru dari ${comicTitle} dengan kualitas gambar terbaik hanya di KomikNet.`,
    robots: { index: false }
  };
}

function decodeUrlSafe(str: string): string {
  let decoded = str;
  try { decoded = decodeURIComponent(decoded); } catch(e) {}
  
  while (/^[A-Za-z0-9+/=]+$/.test(decoded)) {
    try {
      const next = atob(decoded);
      if (!next) break;
      decoded = next;
    } catch(e) {
      break;
    }
  }
  
  try { decoded = decodeURIComponent(decoded); } catch(e) {}
  return decoded;
}

async function ReaderContent({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string; chapterId: string }>;
  searchParams: Promise<{ source?: string; mangaUrl?: string }>;
}) {
  const { id, chapterId } = await params;
  const { source, mangaUrl } = await searchParams;

  let decodedId = id;
  try { decodedId = decodeURIComponent(id); } catch(e) {}

  // ==========================================
  // LOGIKA SUMBER KOMIKU
  // ==========================================
  if (source === "komiku") {
    let images: string[] = [];
    let nextChapterId = null;
    
    let finalChapterUrl = decodeUrlSafe(chapterId);
    let komikuMangaUrl = decodedId.replace("komiku:", "");

    try {
      const result = await getKomikuChapterPages(finalChapterUrl);
      images = result.images;

      if (result.nextUrl) {
        nextChapterId = encodeURIComponent(result.nextUrl);
      }
    } catch (err) {
      console.error(`[READER] Gagal memuat dari Komiku:`, err);
    }

    if (!images || images.length === 0) {
      return <ErrorState id={id} message="Gagal memuat gambar dari Komiku. Server sumber sedang membatasi akses atau scrapper error." />;
    }

    const initialData = {
      chapterId: chapterId,
      chapterNumber: "?", 
      images: images,
      externalUrl: null,
      nextChapterId: nextChapterId ? decodeURIComponent(nextChapterId) : null 
    };

    return (
      <div className="w-full">
        <div className="max-w-3xl mx-auto pt-4 px-4 md:px-0">
          <AdBanner 
            imageUrl="https://placehold.co/728x90/1a1a1a/ffffff?text=Dukung+Komik+Network,+Bebas+Iklan+dengan+Premium" 
            linkUrl="/subscription"
            label="SPONSOR"
            isInternal={true}
          />
        </div>
        <ContinuousReader 
          initialData={initialData} 
          mangaId={id} 
          source="komiku" 
          mangaUrl={komikuMangaUrl} 
        />
      </div>
    );
  }

  // ==========================================
  // LOGIKA UTAMA (MangaDex)
  // ==========================================
  const result = await getChapterImages(chapterId);
  
  if (result.externalUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-mono bg-[#f4f4f4]">
        <div className="bg-white border-2 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-lg">
          <ExternalLink className="w-12 h-12 text-gray-900 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase mb-2">Chapter Eksternal</h1>
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            Chapter ini tidak tersedia langsung. Silakan baca di situs resmi penerbitnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/comic/${id}`} className="border-2 border-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition">
              Kembali
            </Link>
            <a href={result.externalUrl} target="_blank" rel="noopener noreferrer" className="bg-[#d97706] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#b45309] transition">
              Baca di Situs Resmi
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!result.images || result.images.length === 0) {
    return <ErrorState id={id} message="Server gambar gagal dihubungi." />;
  }

  let nextChapterId = null;
  try {
    const chaptersData = await getMangaChapters(id);
    const allChapters = chaptersData?.data || [];
    const sortedChapters = [...allChapters].sort(
      (a: any, b: any) => (parseFloat(a.attributes.chapter) || 0) - (parseFloat(b.attributes.chapter) || 0)
    );
    const currentIndex = sortedChapters.findIndex((c: any) => c.id === chapterId);
    if (currentIndex !== -1 && currentIndex < sortedChapters.length - 1) {
      nextChapterId = sortedChapters[currentIndex + 1].id;
    }
  } catch (error) {}

  const initialData = {
    chapterId,
    chapterNumber: result.chapterNumber,
    images: result.images,
    externalUrl: null,
    nextChapterId
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto pt-4 px-4 md:px-0">
        <AdBanner 
          imageUrl="https://placehold.co/728x90/1a1a1a/ffffff?text=Dukung+Komik+Network,+Bebas+Iklan+dengan+Premium" 
          linkUrl="/subscription"
          label="SPONSOR"
          isInternal={true}
        />
      </div>
      <ContinuousReader initialData={initialData} mangaId={id} />
    </div>
  );
}

function ErrorState({ id, message }: { id: string, message: string }) {
  let decodedId = id;
  try { decodedId = decodeURIComponent(id); } catch(e) {}
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-mono bg-[#f4f4f4]">
      <div className="bg-white border-2 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-lg">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black uppercase mb-2">Gagal Memuat Gambar</h1>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>
        <Link href={`/comic/${decodedId}`} className="inline-block bg-gray-900 text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-gray-700 transition">Kembali ke Detail</Link>
      </div>
    </div>
  );
}

export default async function ChapterReaderPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string; chapterId: string }>;
  searchParams: Promise<{ source?: string; mangaUrl?: string }>;
}) {
  const resolvedParams = await params;
  const comicId = resolvedParams.id;

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-0 font-sans">
      
      {/* HEADER BARU YANG BISA AUTO-HIDE */}
      <ReaderHeader comicId={comicId} />
      
      <Suspense fallback={
        <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-gray-900" />
          Memuat Gambar...
        </div>
      }>
        <ReaderContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}