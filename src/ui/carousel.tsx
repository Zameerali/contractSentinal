import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Carousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ minHeight: 640 }}
    >
      <div className="absolute inset-0">
        <Image
          src={images[index]}
          alt={`slide-${index}`}
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={
                i === index ? "w-8 h-2 rounded-full" : "w-4 h-2 rounded-full"
              }
              style={{
                backgroundColor:
                  i === index ? "var(--color-primary)" : "#9CA3AF",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
