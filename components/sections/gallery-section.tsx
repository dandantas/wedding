"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { GALLERY_IMAGES } from "@/lib/gallery";

gsap.registerPlugin(ScrollTrigger);

function OrnamentalDivider() {
  return (
    <svg
      className="mx-auto h-4 w-40 text-forest/40"
      viewBox="0 0 160 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 8h60q5-6 10 0h20q5 6 10 0h60"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="80" cy="8" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function GallerySection() {
  const t = useTranslations("gallery");
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".gallery-card");

      gsap.set(cards, { y: 60, opacity: 0 });

      ScrollTrigger.batch(cards, {
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
          });
        },
        start: "top 90%",
      });

      gsap.from(".gallery-header > *", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".gallery-header",
          start: "top 85%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative overflow-hidden py-20 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, var(--color-cream) 0%, #f5f0e0 50%, var(--color-cream) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="gallery-header mb-16 text-center md:mb-20">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-forest md:text-sm">
            {t("label")}
          </p>
          <h2 className="mb-6 text-3xl font-semibold text-forest-dark md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <OrnamentalDivider />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {GALLERY_IMAGES.map((src, i) => (
            <div
              key={src.src}
              className="gallery-card group relative"
            >
              <div className="relative overflow-hidden rounded-xl bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out sm:p-3 group-hover:-translate-y-3 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_20px_50px_rgba(0,0,0,0.1)]">
                <div className="relative aspect-4/5 overflow-hidden rounded-lg">
                  <Image
                    src={src}
                    alt={`${t("title")} — ${i + 1}`}
                    fill
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
