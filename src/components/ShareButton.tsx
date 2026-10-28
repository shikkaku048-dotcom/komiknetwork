"use client";

import { useState } from "react";
import { Share2, Copy, X as CloseIcon } from "lucide-react";

// Ikon SVG Kustom
const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
    <path d="M14 14a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1Z" />
    <path d="M9.5 14.5c1.5 1.5 4 1.5 5 0" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function ShareButton({ title, url }: { title: string; url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const shareText = `Baca komik ${title} hanya di KomikNet!`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: url });
      } catch (error) {
        console.log("Share dibatalkan");
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link berhasil disalin!");
      setIsOpen(false);
    } catch (err) {
      alert("Gagal menyalin link.");
    }
  };

  const socials = [
    {
      name: "WhatsApp",
      icon: WhatsappIcon,
      color: "hover:bg-green-500 hover:text-white",
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      color: "hover:bg-blue-600 hover:text-white",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      icon: TwitterIcon,
      color: "hover:bg-black hover:text-white",
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
  ];

  return (
    <>
      {/* Tombol Share Utama */}
      <button
        onClick={handleShareClick}
        className="bg-white border-2 border-gray-900 text-gray-900 font-mono font-bold uppercase tracking-widest py-3 px-0 md:px-6 w-12 md:w-auto shrink-0 flex items-center justify-center gap-2 transition-all duration-150 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1"
      >
        <Share2 className="w-4 h-4" /> 
        <span className="hidden md:inline">Share</span>
      </button>

      {/* MODAL SHARE (Perbaikan Tampilan Mobile) */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Card Modal */}
          <div className="bg-white border-4 border-gray-900 w-full max-w-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b-4 border-gray-900 p-4 bg-[#f4f4f4]">
              <h3 className="font-black uppercase tracking-tighter text-lg md:text-xl">Bagikan Komik</h3>
              <button onClick={() => setIsOpen(false)} className="hover:text-red-500">
                <CloseIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <p className="font-mono text-[10px] md:text-xs text-gray-500 mb-4 md:mb-6 line-clamp-2">
                "{shareText}"
              </p>

              {/* GRID MEDIA SOSIAL (Dibuat lebih rapat di mobile) */}
              <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // REVISI: Padding lebih kecil di mobile, teks lebih kecil
                    className={`flex flex-col items-center justify-center gap-1 md:gap-2 p-2 md:p-3 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-1 ${s.color}`}
                  >
                    <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[8px] md:text-[10px] font-bold font-mono uppercase text-center">{s.name}</span>
                  </a>
                ))}
                
                {/* Tombol Copy Link */}
                <button
                  onClick={copyToClipboard}
                  className="flex flex-col items-center justify-center gap-1 md:gap-2 p-2 md:p-3 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-1 hover:bg-gray-200"
                >
                  <Copy className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-[8px] md:text-[10px] font-bold font-mono uppercase">Salin</span>
                </button>
              </div>

              {/* Tombol Tutup */}
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#d97706] text-white font-mono font-bold uppercase tracking-widest py-2 md:py-3 border-2 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}