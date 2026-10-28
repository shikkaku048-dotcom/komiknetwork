"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

function PageImage({ src, alt }: { src: string; alt: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
  }, [src]);

  return (
    <div className="w-full relative bg-[#e5e5e5] min-h-[200px]">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#e5e5e5] z-10">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Memuat...</span>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full h-auto block transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          setIsLoading(false); 
          if (!e.currentTarget.src.includes('/api/image') && !e.currentTarget.src.includes('placehold.co')) {
            e.currentTarget.src = `/api/image?url=${encodeURIComponent(src)}`;
          } else {
            e.currentTarget.src = "https://placehold.co/400x800/png?text=Gagal";
          }
        }}
      />
    </div>
  );
}

export default function ContinuousReader({ initialData, mangaId, source, mangaUrl }: { initialData: any; mangaId: string; source?: string; mangaUrl?: string; }) {
  const [chapters, setChapters] = useState<any[]>([initialData]);
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const currentChapter = chapters[chapters.length - 1];
  const nextChapterId = currentChapter.nextChapterId;

  useEffect(() => {
    if (!nextChapterId || loading) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          setLoading(true);
          try {
            let apiUrl = "";
            
            if (source === "komiku") {
              // nextChapterId dari API sudah dalam bentuk encoded
              apiUrl = `/api/read-komiku?url=${nextChapterId}`;
            } else {
              apiUrl = `/api/read/${nextChapterId}?mangaId=${mangaId}`;
            }

            const res = await fetch(apiUrl);
            
            // REVISI: Gunakan catch() jika API mengembalikan HTML (seperti 404).
            // Ini mencegah error merah di console.
            const data = await res.json().catch(() => null);

            if (!data || !data.images || data.images.length === 0) {
              // Jika data kosong atau HTML (gagal parse), hentikan scroll.
              setChapters((prev) => {
                const newChaps = [...prev];
                newChaps[newChaps.length - 1].nextChapterId = null;
                return newChaps;
              });
              return;
            }
            
            // Jika sukses, tambahkan chapter baru
            setChapters((prev) => [...prev, data]);

          } catch (err) {
            console.error("Gagal memuat chapter selanjutnya:", err);
            // Hentikan loading jika ada error jaringan
            setChapters((prev) => {
              const newChaps = [...prev];
              newChaps[newChaps.length - 1].nextChapterId = null;
              return newChaps;
            });
          } finally {
            setLoading(false);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    if (triggerRef.current) observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [nextChapterId, loading, mangaId, source, mangaUrl]);

  return (
    <div className="flex flex-col items-center w-full bg-[#e5e5e5]">
      {chapters.map((chapter, chapterIdx) => (
        <div key={chapterIdx} className="w-full flex flex-col">
          {chapterIdx > 0 && (
            <div className="w-full max-w-3xl mx-auto px-4 py-16 bg-white border-y-2 border-gray-900 text-center font-mono mt-12 mb-8 shadow-[0_8px_0_rgba(0,0,0,0.1)]">
              <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">Lanjut ke</p>
              <h3 className="font-black text-gray-900 text-4xl uppercase tracking-tighter">
  Chapter {chapter.chapterNumber !== "?" ? chapter.chapterNumber : "Selanjutnya"}
</h3>
            </div>
          )}

          {chapter.images && chapter.images.map((img: string, i: number) => (
            <div key={i} className="relative w-full max-w-3xl mx-auto group mb-0">
              <PageImage src={getImageUrl(img, true)} alt={`Halaman ${i + 1}`} />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white font-mono text-[10px] px-2 py-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {i + 1} / {chapter.images.length}
              </div>
            </div>
          ))}
        </div>
      ))}

      {nextChapterId ? (
        <div ref={triggerRef} className="py-24 flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-500 w-full max-w-3xl mx-auto">
          {loading ? (
            <div className="bg-white border-2 border-gray-900 p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-amber-500" />
              <span className="font-black text-gray-900 text-lg">Memuat Chapter...</span>
            </div>
          ) : (
            <span className="opacity-50">Scroll ke bawah untuk memuat</span>
          )}
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto py-16 text-center border-t-2 border-gray-900 mt-8 bg-white font-mono mb-20 shadow-[0_-4px_0_rgba(0,0,0,0.1)]">
          <h2 className="font-black text-gray-900 text-xl uppercase tracking-widest mb-2">Chapter Terakhir</h2>
          <p className="text-gray-500 text-xs mb-6 uppercase tracking-widest">Anda telah mencapai akhir komik ini.</p>
          <Link href={`/comic/${mangaId}`} className="inline-block bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold uppercase tracking-widest py-3 px-8 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            Kembali ke Detail
          </Link>
        </div>
      )}
    </div>
  );
}