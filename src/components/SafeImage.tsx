"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  originalSrc?: string; // URL asli sebelum diubah oleh getImageUrl
}

export default function SafeImage({ src, alt, originalSrc, className, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  // Reset state jika prop src berubah (misal karena ganti halaman/filter)
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    // Jika gambar dari wsrv gagal, coba fallback ke API Proxy Vercel
    if (!imgSrc.includes('/api/image') && originalSrc) {
      setImgSrc(`/api/image?url=${encodeURIComponent(originalSrc)}`);
    } 
    // Jika API Proxy juga gagal, tampilkan gambar placeholder
    else if (!imgSrc.includes('placehold.co')) {
      setImgSrc("https://placehold.co/400x600/png?text=No+Image");
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}