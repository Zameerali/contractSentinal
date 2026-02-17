"use client";

import React, { useState } from "react";
import Image from "next/image";
import AvatarCarousel from "./avatar-carousel";

interface SignupRightSideProps {
  currentStep: number; // 1-4 for different signup steps
}

export function SignupRightSide({ currentStep }: SignupRightSideProps) {
  const carouselImages = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&auto=format&fit=crop",
  ];
  const [carouselIndex, setCarouselIndex] = useState(0);
  return (
    <div
      className="hidden lg:block lg:w-1/2 relative"
      style={{
        background: "linear-gradient(45deg, #101828 0%, #475467 100%)",
      }}
    >
      {/* Main content */} 
      <div className="flex flex-col justify-center h-full px-16 text-left">
        <div>
          <div className="relative mb-4" style={{ width: 96, height: 96 }}>
            {/* Top-left small golden star */}
            <div className="absolute" style={{ left: 0, top: 25 }}>
              <Image
                src="/images/Star (1).svg"
                alt="Small star"
                width={16}
                height={16}
              />
            </div>

            {/* Top-right small star */}
            <div className="absolute" style={{ right: 40, top: 35 }}>
              <Image
                src="/images/Star (2).svg"
                alt="Small star"
                width={12}
                height={12}
              />
            </div>

            {/* Main large star centered */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ right: 36, top: 6 }}
            >
              <Image src="/images/Star.svg" alt="Star" width={56} height={56} />
            </div>
          </div>

          <h2
            className="font-medium text-2xl lg:text-4xl xl:text-display-xl mb-6"
            style={{ color: "#ffffff" }}
          >
            Start turning your ideas into reality.
          </h2>
          <p
            className="text-title font-medium mb-8 max-w-lg"
            style={{ color: "#ffffff" }}
          >
            Create a free account and get full access to all features for
            30-days. No credit card needed. Get started in 2 minutes.
          </p>
        </div>

        {/* Avatar carousel (vertical flow) */}
        <div className="flex items-center gap-6">
          <div className="relative flex">
            <AvatarCarousel
              images={carouselImages}
              onIndexChange={setCarouselIndex}
            />
          </div>

          <div className="flex flex-col text-left">
            <p
              className="text-white text-title font-medium"
              style={{ color: "#ffffff" }}
            >
              Join 40,000+ users
            </p>
          </div>
        </div>
      </div>

      {/* Progress indicator dots (reflect carousel index) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2">
          {carouselImages.map((_, i) => (
            <div
              key={i}
              role="button"
              aria-current={i === carouselIndex}
              className={
                i === carouselIndex
                  ? "transition-all duration-200 ease-out w-8 h-2 rounded-full"
                  : "transition-all duration-200 ease-out w-4 h-2 rounded-full"
              }
              style={{
                backgroundColor:
                  i === carouselIndex ? "var(--color-primary)" : "#9CA3AF",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
