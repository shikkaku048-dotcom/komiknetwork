"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ReaderHeader({ comicId }: { comicId: string }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleBack = () => {
    router.back(); // Kembali ke Detail
  };

  return (
    <header
      className={`bg-white border-b-2 border-gray-900 sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-900 hover:text-amber-600 font-mono font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Detail
        </button>
      </div>
    </header>
  );
}