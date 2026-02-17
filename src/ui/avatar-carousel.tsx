import React, { useEffect, useState } from "react";
import { Avatar } from "./avatar";

export function AvatarCarousel({
  images,
  onIndexChange,
}: {
  images: string[];
  onIndexChange?: (i: number) => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  return (
    <div className="flex items-center" style={{ paddingLeft: 0 }}>
      {images.map((src, i) => {
        const isActive = i === index;
        const z = isActive ? images.length + 10 : i;
        const marginLeft = i === 0 ? 0 : -12;
        const transform = isActive
          ? "translateY(-4px) scale(1.12)"
          : "scale(0.92)";

        return (
          <div
            key={i}
            className="relative transition-all duration-300"
            style={{
              marginLeft,
              zIndex: z,
              transform,
            }}
          >
            <Avatar
              src={src}
              alt={`User ${i + 1}`}
              className="w-[40px] h-[40px] flex-shrink-0"
              style={{
                border: "2px solid #ffffff",
                borderRadius: "200px",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default AvatarCarousel;
