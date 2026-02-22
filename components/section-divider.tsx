"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type DividerVariant = "wave" | "arch" | "gentle";

interface PathPoints {
  y0: number;
  cy1: number;
  cy2: number;
  y3: number;
}

const FLAT: PathPoints = { y0: 100, cy1: 100, cy2: 100, y3: 100 };

const CURVE_TARGETS: Record<DividerVariant, PathPoints> = {
  wave: { y0: 30, cy1: 90, cy2: 10, y3: 50 },
  arch: { y0: 70, cy1: 10, cy2: 10, y3: 70 },
  gentle: { y0: 55, cy1: 30, cy2: 80, y3: 40 },
};

function buildPath(pts: PathPoints): string {
  return `M 0 ${pts.y0} C 480 ${pts.cy1} 960 ${pts.cy2} 1440 ${pts.y3} L 1440 100 L 0 100 Z`;
}

interface SectionDividerProps {
  topColor: string;
  bottomColor: string;
  variant?: DividerVariant;
  flip?: boolean;
  overlay?: boolean;
}

export function SectionDivider({
  topColor,
  bottomColor,
  variant = "wave",
  flip = false,
  overlay = false,
}: SectionDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const target = CURVE_TARGETS[variant];

  useGSAP(
    () => {
      if (!pathRef.current || !containerRef.current) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReduced) {
        pathRef.current.setAttribute("d", buildPath(target));
        return;
      }

      const pts = { ...FLAT };

      gsap.to(pts, {
        y0: target.y0,
        cy1: target.cy1,
        cy2: target.cy2,
        y3: target.y3,
        ease: "power2.inOut",
        onUpdate: () => {
          pathRef.current?.setAttribute("d", buildPath(pts));
        },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 92%",
          end: "top 40%",
          scrub: 1.5,
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${overlay ? "-mt-[80px] z-20 md:-mt-[120px] lg:-mt-[160px]" : ""}`}
      style={{ backgroundColor: overlay ? "transparent" : topColor }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        role="img"
        className={`block h-[80px] w-full md:h-[120px] lg:h-[160px] ${flip ? "-scale-x-100" : ""}`}
      >
        <title>Section transition</title>
        <path ref={pathRef} d={buildPath(FLAT)} fill={bottomColor} />
      </svg>
    </div>
  );
}
