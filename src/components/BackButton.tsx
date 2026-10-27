"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Kembali
    </button>
  );
}