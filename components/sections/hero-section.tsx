"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { WEDDING_DATE } from "@/lib/constants";
import HeroImage from "@/public/HERO_IMG.jpg";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const t = useTranslations("hero");
  const heroRef = useRef<HTMLElement>(null);
  const countRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevValues = useRef<number[]>([0, 0, 0, 0]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = WEDDING_DATE.getTime() - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdownItems = [
    { value: timeLeft.days, label: t("countdown.days") },
    { value: timeLeft.hours, label: t("countdown.hours") },
    { value: timeLeft.minutes, label: t("countdown.minutes") },
    { value: timeLeft.seconds, label: t("countdown.seconds") },
  ];

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.from(".hero-subtitle", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        .from(
          ".hero-title",
          { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" },
          "-=0.3",
        )
        .from(
          ".hero-line",
          { scaleX: 0, duration: 0.5, ease: "power2.out" },
          "-=0.4",
        )
        .from(
          ".hero-date",
          { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3",
        )
        .from(
          ".hero-countdown",
          { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3",
        );

      gsap.to(".hero-bg", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: heroRef },
  );

  useEffect(() => {
    const values = [
      timeLeft.days,
      timeLeft.hours,
      timeLeft.minutes,
      timeLeft.seconds,
    ];
    values.forEach((value, i) => {
      if (prevValues.current[i] !== value && countRefs.current[i]) {
        gsap.fromTo(
          countRefs.current[i],
          { y: -8, opacity: 0.5 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        );
      }
      prevValues.current[i] = value;
    });
  }, [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div className="hero-bg absolute inset-0 overflow-hidden">
        <Image
          src={HeroImage}
          alt="Hero background"
          fill
          priority
          placeholder="blur"
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/50 to-transparent" />

      <div className="relative z-10 px-4 text-center text-white">
        <p className="hero-subtitle mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/80 md:text-sm">
          {t("subtitle")}
        </p>

        <h1 className="hero-title mb-6 font-script text-5xl leading-none md:text-7xl lg:text-9xl">
          {t("coupleNames")}
        </h1>

        <div className="hero-line mx-auto mb-8 h-px w-24 origin-center bg-white/50 md:w-32" />

        <p className="hero-date mb-12 text-base tracking-wide md:text-lg lg:text-xl">
          {t("date")} | {t("location")}
        </p>

        <div className="hero-countdown mb-16 flex justify-center gap-4 md:gap-8">
          {countdownItems.map((item, index) => (
            <div key={item.label} className="text-center">
              <div
                ref={(el) => {
                  countRefs.current[index] = el;
                }}
                className="mb-1 text-3xl font-normal md:text-5xl"
              >
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="text-xs uppercase tracking-wider text-white/70 md:text-sm">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
