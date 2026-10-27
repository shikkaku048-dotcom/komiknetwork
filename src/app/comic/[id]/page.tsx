import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Plus, ArrowRight } from "lucide-react";
import {
  getMangaById,
  getMangaChapters,
  pickTitle,
} from "@/lib/mangadex";
import type { Metadata } from "next";
import { getKomikuMangaDetail } from "@/lib/komiku";
import ChapterList from "@/components/ChapterList";
import BookmarkButton from "@/components/BookmarkButton";

type ChapterItem = {
  id: string;
  attributes: {
    chapter: string | null;
    title: string | null;
    publishAt: string | null;
    translatedLanguage: string;
    nyoraSource: string | null;
    nyoraMangaUrl: string | null;
    sourceName: string;
  };
};

function countLanguages(chapters: ChapterItem[]) {
  const languages: Record<string, number> = {};
  for (const c of chapters) {
    const lang = c.attributes.translatedLanguage;
    languages[lang] = (languages[lang] ?? 0) + 1;
  }
  return languages;
}

// Info Komik MangaDex
function ComicInfo({ manga }: { manga: any }) {
  const title = pickTitle(manga);
  const descObj = manga.attributes.description || {};
  const description = descObj.en || descObj.id || Object.values(descObj)[0] || "Belum ada deskripsi.";

  const coverArt = manga.relationships.find((rel: any) => rel.type === "cover_art");
  const coverUrl = coverArt?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`
    : "https://komiknet.site/default-cover.jpg"; 

  const tags = manga.attributes.tags.slice(0, 3).map((t: any) => t.attributes.name.en).join(" · ");

  return (
    <div className="relative w-full border-b border-gray-300 pb-12 mb-8">
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-gray-300"><Plus className="w-6 h-6" /></div>
      <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-gray-300"><Plus className="w-6 h-6" /></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        <div className="lg:col-span-7 flex flex-col justify-between min-h-full">
          <div>
            <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-300 pb-2">
              <span>ID: {manga.id.slice(0, 8)}</span>
              <span>{manga.attributes.year || "TBA"}</span>
              <span>{manga.attributes.status}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-gray-900 mb-6 break-words">
              {title}
            </h1>
            <p className="font-serif text-xl text-gray-700 italic max-w-xl mb-8 border-l-4 border-amber-500 pl-4">
              {description.slice(0, 150)}...
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-sm font-bold tracking-widest uppercase text-gray-500">{tags}</p>
            <div className="flex flex-wrap gap-4 items-center">
              <a href="#chapter-list" className="bg-[#d97706] hover:bg-[#b45309] text-white font-mono font-bold uppercase tracking-widest py-3 px-8 flex items-center gap-3 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                Baca Komik <ArrowRight className="w-4 h-4" />
              </a>
              <BookmarkButton comic={{ id: manga.id, title, img: coverUrl, type: manga.attributes.originalLanguage === "ko" ? "Manhwa" : "Manga", chapters: manga.attributes.lastChapter || "?", readers: "0" }} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 relative group self-start">
          <div className="absolute inset-0 border border-gray-400 translate-x-3 translate-y-3 pointer-events-none"></div>
          <div className="overflow-hidden border border-gray-900 relative z-10 bg-gray-100">
            <img src={`/api/image?url=${encodeURIComponent(coverUrl)}`} alt={`Cover komik ${title}`} className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Info Komik Komiku
function KomikuComicInfo({ manga }: { manga: any }) {
  return (
    <div className="relative w-full border-b border-gray-300 pb-12 mb-8">
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-gray-300"><Plus className="w-6 h-6" /></div>
      <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-gray-300"><Plus className="w-6 h-6" /></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        <div className="lg:col-span-7 flex flex-col justify-between min-h-full">
          <div>
            <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-300 pb-2">
              <span className="bg-green-600 text-white px-2 py-0.5">KOMIKU</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-gray-900 mb-6 break-words">
              {manga.title}
            </h1>
            <p className="font-serif text-xl text-gray-700 italic max-w-xl mb-8 border-l-4 border-amber-500 pl-4">
              {manga.description || "Belum ada deskripsi."}
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4 items-center">
              <a href="#chapter-list" className="bg-[#d97706] hover:bg-[#b45309] text-white font-mono font-bold uppercase tracking-widest py-3 px-8 flex items-center gap-3 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                Baca Komik <ArrowRight className="w-4 h-4" />
              </a>
              <BookmarkButton comic={{ id: `komiku:${encodeURIComponent(manga.url)}`, title: manga.title, img: manga.img, type: "Manga", chapters: "?", readers: "0" }} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 relative group self-start">
          <div className="absolute inset-0 border border-gray-400 translate-x-3 translate-y-3 pointer-events-none"></div>
          <div className="overflow-hidden border border-gray-900 relative z-10 bg-gray-100">
            <img src={`/api/image?url=${encodeURIComponent(manga.img)}`} alt={`Cover komik ${manga.title}`} className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Daftar Chapter
async function ComicChapters({ id }: { id: string }) {
  await connection();
  let finalChapters: ChapterItem[] = [];
  let finalLanguages: Record<string, number> = {};

  if (id !== "unknown" && id !== "") {
    try {
      const chaptersData = await getMangaChapters(id);
      finalChapters = (chaptersData?.data ?? []).map((c: any) => ({
        id: c.id, 
        attributes: { chapter: c.attributes.chapter ?? null, title: c.attributes.title ?? null, publishAt: c.attributes.publishAt ?? null, translatedLanguage: c.attributes.translatedLanguage || "en", nyoraSource: null, nyoraMangaUrl: null, sourceName: "MangaDex" }
      }));
    } catch (err) {}
  }
  finalChapters.sort((a, b) => (parseFloat(b.attributes.chapter || "0") || 0) - (parseFloat(a.attributes.chapter || "0") || 0));
  finalLanguages = countLanguages(finalChapters);

  return (
    <div id="chapter-list" className="mt-12">
      <div className="flex items-end justify-between border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Indeks Chapter</h2>
        <span className="font-mono text-sm bg-gray-900 text-white px-3 py-1">TOTAL: {finalChapters.length}</span>
      </div>
      {finalChapters.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-400 bg-gray-100">
          <p className="text-gray-500 font-mono text-sm uppercase">Tidak ada chapter tersedia.</p>
        </div>
      ) : (
        <div className="border border-gray-300 bg-white">
          <ChapterList chapters={finalChapters} mangaId={id} languages={finalLanguages} />
        </div>
      )}
    </div>
  );
}

// Wrapper Params
async function ComicDetailsWrapper({ params }: { params: Promise<{ id: string }> }) {
  let id = "";
  try { id = (await params).id; } catch (e) { return <ErrorState msg="ID tidak valid." />; }
  
  let decodedId = id;
  try { decodedId = decodeURIComponent(decodeURIComponent(id)); } catch (e) { try { decodedId = decodeURIComponent(id); } catch (err) {} }
  if (decodedId.startsWith("komiku://")) decodedId = decodedId.replace("komiku://", "komiku:https://");

  // ROUTE KOMIKU
  if (decodedId.startsWith("komiku:")) {
    const komikuUrl = decodedId.replace("komiku:", "");
    let manga = null;
    try { manga = await getKomikuMangaDetail(komikuUrl); } catch (e) {}
    if (!manga) return <ErrorState msg="Data Komiku Terputus" />;

    const jsonLd = { "@context": "https://schema.org", "@type": "ComicSeries", name: manga.title, image: manga.img, description: (manga.description || "").replace(/<[^>]*>?/gm, ''), url: `https://komiknet.site/comic/${id}` };
    const formattedChapters: ChapterItem[] = (manga.chapters || []).map((c: any) => ({ id: encodeURIComponent(c.id), attributes: { chapter: c.chapter, title: c.title, publishAt: c.publishAt, translatedLanguage: "id", nyoraSource: "komiku", nyoraMangaUrl: manga.url, sourceName: "Komiku" } }));
    formattedChapters.sort((a, b) => (parseFloat(b.attributes.chapter || "0") || 0) - (parseFloat(a.attributes.chapter || "0") || 0));
    
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <KomikuComicInfo manga={manga} />
        <div id="chapter-list" className="mt-12">
          <div className="flex items-end justify-between border-b-2 border-gray-900 pb-4 mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Indeks Chapter</h2>
            <span className="font-mono text-sm bg-gray-900 text-white px-3 py-1">TOTAL: {formattedChapters.length}</span>
          </div>
          <div className="border border-gray-300 bg-white">
            <ChapterList chapters={formattedChapters} mangaId={decodedId} languages={{ id: formattedChapters.length }} />
          </div>
        </div>
      </>
    );
  }

  // ROUTE MANGADEX
  let mangaData = null;
  try { mangaData = await getMangaById(decodedId); } catch (e) {}
  if (!mangaData?.data) return <ErrorState msg="Data MangaDex Terputus" />;

  const manga = mangaData.data;
  const coverArt = manga.relationships.find((rel: any) => rel.type === "cover_art");
  const coverUrl = coverArt?.attributes?.fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}` : "https://komiknet.site/default-cover.jpg";
  const jsonLd = { "@context": "https://schema.org", "@type": "ComicSeries", name: pickTitle(manga), image: coverUrl, description: (manga.attributes.description?.en || "").replace(/<[^>]*>?/gm, ''), url: `https://komiknet.site/comic/${id}` };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ComicInfo manga={manga} />
      <Suspense fallback={<LoadingState />}><ComicChapters id={id} /></Suspense>
    </>
  );
}

function LoadingState() { return <div className="py-20 text-center font-mono text-xs uppercase animate-pulse">Memuat Data...</div>; }
function ErrorState({ msg }: { msg: string }) {
  return (
    <div className="text-center py-20 font-mono">
      <h1 className="text-4xl font-black uppercase mb-4">404 // Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">{msg}</p>
      <Link href="/" className="bg-gray-900 text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-gray-700 transition">Kembali ke Beranda</Link>
    </div>
  );
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let decodedId = id;
  try { decodedId = decodeURIComponent(decodeURIComponent(id)); } catch (e) { try { decodedId = decodeURIComponent(id); } catch (err) {} }
  if (decodedId.startsWith("komiku://")) decodedId = decodedId.replace("komiku://", "komiku:https://");

  let title = "Baca Komik"; let description = "Baca komik terlengkap di KomikNet."; let image = "https://komiknet.site/default-cover.jpg";

  try {
    if (decodedId.startsWith("komiku:")) {
      const manga = await getKomikuMangaDetail(decodedId.replace("komiku:", ""));
      if (manga) { title = `Baca ${manga.title} Bahasa Indonesia`; description = `Baca komik ${manga.title} online gratis.`; image = manga.img; }
    } else {
      const mangaData = await getMangaById(decodedId);
      if (mangaData?.data) {
        const manga = mangaData.data; const mangatitle = pickTitle(manga);
        title = `Baca ${mangatitle} Bahasa Indonesia`;
        const coverArt = manga.relationships.find((rel: any) => rel.type === "cover_art");
        if (coverArt?.attributes?.fileName) image = `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
      }
    }
  } catch (e) {}

  return { title: `${title} | KomikNet`, description, alternates: { canonical: `https://komiknet.site/comic/${id}` }, openGraph: { title, description, images: [{ url: image }] } };
}

export default function ComicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="w-full flex-grow bg-[#f4f4f4] text-gray-900 font-sans selection:bg-amber-500 selection:text-white pb-20">
      <main className="max-w-6xl mx-auto px-4 pt-12">
        <Suspense fallback={<LoadingState />}><ComicDetailsWrapper params={params} /></Suspense>
      </main>
    </div>
  );
}