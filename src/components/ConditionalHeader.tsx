"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function ConditionalHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. Tambahkan "/comic" di sini
  const hideHeaderPaths = [
    "/profile", 
    "/login", 
    "/register", 
    "/subscription", 
    "/download", 
    "/terms",
    "/privacy",
    "/comic" // <-- Menyembunyikan header di /comic/[id] dan /comic/[id]/chapter/...
  ]; 
  
  const isHiddenPath = hideHeaderPaths.some(path => pathname.startsWith(path));

  // 2. Logika isChapterPage sebenarnya sudah tercakup oleh startsWith("/comic"), 
  // tapi kita biarkan saja untuk berjaga-jaga.
  const isChapterPage = pathname.includes("/chapter/");

  if (isHiddenPath || isChapterPage) {
    return null;
  }

  return <>{children}</>;
}