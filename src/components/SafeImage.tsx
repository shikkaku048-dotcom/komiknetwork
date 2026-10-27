"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  originalSrc?: string; 
}

export default function SafeImage({ src, alt, originalSrc, className, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    // Jika Direct Link gagal, coba lewat wsrv.nl
    if (!imgSrc.includes('wsrv.nl') && !imgSrc.includes('placehold.co') && originalSrc) {
      setImgSrc(`https://wsrv.nl/?url=${encodeURIComponent(originalSrc)}&w=400`);
    } 
    // Jika wsrv.nl juga gagal, baru ke placeholder
    else if (!imgSrc.includes('placehold.co')) {
      setImgSrc("https://placehold.co/400x600/png?text=No+Image");
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer" 
      onError={handleError}
      {...props}
    />
  );
}