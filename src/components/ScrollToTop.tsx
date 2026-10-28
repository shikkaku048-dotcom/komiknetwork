"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Paksa scroll ke paling atas setiap kali rute berubah
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}