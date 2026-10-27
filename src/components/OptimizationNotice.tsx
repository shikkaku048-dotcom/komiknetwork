"use client";

import { useState } from "react";
import Link from "next/link";
// HAPUS Facebook DARI IMPORT LUCIDE-REACT
import { ArrowRight, X, Crosshair } from "lucide-react";

// KOMPONEN IKON FACEBOOK (SVG ASLI)
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function OptimizationNotice() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 font-sans selection:bg-[#d97706] selection:text-white">
      
      <div className="relative w-full max-w-[1400px] h-full md:h-[85vh] bg-[#f4f4f0] text-[#2b3a42] border-4 border-[#2b3a42] shadow-[12px_12px_0px_#2b3a42] flex flex-col md:flex-row overflow-hidden">
        
        {/* Tombol Close (X) */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-0 right-0 md:top-4 md:right-4 z-50 bg-[#2b3a42] text-white p-2 md:p-3 border-2 border-transparent hover:border-[#d97706] hover:bg-[#d97706] transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1"
        >
          <X className="w-6 h-6" />
        </button>

        {/* AREA KIRI */}
        <div className="relative w-full md:w-[55%] h-full flex flex-col justify-between p-6 md:p-12 lg:p-16 z-20">
          <div className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2 flex flex-col items-center gap-4 text-[10px] font-mono text-[#2b3a42]/60 hidden md:flex">
            <span>01</span>
            <div className="h-24 w-px bg-[#2b3a42]/30 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-px bg-[#2b3a42]/50"></div>
            </div>
            <span>05</span>
          </div>

          <div className="flex items-start gap-2 mb-8 md:mb-0 ml-0 md:ml-8">
            <Crosshair className="w-5 h-5 mt-0.5 text-[#2b3a42]" />
            <div className="flex flex-col font-mono text-[9px] md:text-[10px] uppercase tracking-widest leading-tight font-bold">
              <span>Issue 01</span>
              <span className="opacity-60">System Maintenance</span>
            </div>
          </div>

          <div className="flex flex-col justify-center mt-auto md:mt-0 ml-0 md:ml-8 pr-0 md:pr-8">
            <h1 className="text-[55px] sm:text-[75px] lg:text-[90px] xl:text-[110px] font-black uppercase tracking-tighter leading-[0.8] text-[#2b3a42] mb-6">
              SEDANG<br />OPTIMALISASI
            </h1>
            
            <p className="font-serif text-lg md:text-xl lg:text-2xl text-[#2b3a42]/90 max-w-md mb-10 leading-snug">
              Beberapa fitur mungkin mengalami bug saat sistem sedang disesuaikan. Mohon bersabar.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 mb-12">
              <Link
                href="/subscription"
                className="bg-[#d97706] text-[#1a1a1a] font-mono text-xs md:text-sm font-bold uppercase tracking-widest py-3 px-6 flex items-center gap-4 hover:bg-[#b45309] hover:text-white transition-all border-2 border-[#2b3a42] shadow-[4px_4px_0px_#2b3a42] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Dukung & Berlangganan <ArrowRight className="w-4 h-4" />
              </Link>

              {/* LINK FACEBOOK DENGAN SVG KUSTOM */}
              <a 
                href="https://web.facebook.com/profile.php?id=61595541045826"
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                 <div className="w-10 h-10 border-2 border-[#2b3a42] flex items-center justify-center bg-white shadow-[3px_3px_0px_#2b3a42] group-hover:shadow-none group-hover:translate-x-[3px] group-hover:translate-y-[3px] transition-all">
                    {/* MENGGUNAKAN KOMPONEN SVG YANG BARU KITA BUAT */}
                    <FacebookIcon className="w-5 h-5 text-[#2b3a42] group-hover:text-[#1877F2] transition-colors" />
                 </div>
                 
                 <div className="flex flex-col font-mono text-[9px] uppercase tracking-widest font-bold">
                   <span>Komik Network</span>
                   <span className="opacity-60 group-hover:text-[#1877F2] transition-colors">Kunjungi Facebook</span>
                 </div>
              </a>
            </div>

            <div className="font-mono text-[10px] uppercase tracking-widest text-[#2b3a42]/80 relative w-max font-bold">
              <span className="text-[#d97706] font-black text-sm block mb-1">207</span>
              <span>Entities Detected</span>
              <div className="absolute -top-2 -left-3 w-2 h-2 border-t-2 border-l-2 border-[#2b3a42]/60"></div>
              <div className="absolute -top-2 -right-3 w-2 h-2 border-t-2 border-r-2 border-[#2b3a42]/60"></div>
              <div className="absolute -bottom-2 -left-3 w-2 h-2 border-b-2 border-l-2 border-[#2b3a42]/60"></div>
              <div className="absolute -bottom-2 -right-3 w-2 h-2 border-b-2 border-r-2 border-[#2b3a42]/60"></div>
            </div>
          </div>
          
          <div className="hidden md:flex mt-12 pt-4 border-t-2 border-[#2b3a42]/20 justify-between items-center font-mono text-[10px] uppercase tracking-widest text-[#2b3a42]/60 font-bold ml-0 md:ml-8">
            <span>Komik Network</span>
            <span>Error Code: 0x00A1</span>
          </div>
        </div>

        {/* AREA KANAN */}
        <div className="relative w-full md:w-[45%] h-[40vh] md:h-full bg-[#e0e0dc]">
          <div className="relative w-full h-full overflow-hidden">
             <img 
               src="/image/child.png" 
               alt="Maintenance Visual" 
               className="w-full h-full object-cover grayscale contrast-125"
             />
             <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#f4f4f0] to-transparent hidden md:block z-10"></div>
          </div>
        </div>

      </div>
    </div>
  );
}