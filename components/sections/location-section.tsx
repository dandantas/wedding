"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { MapPinIcon } from "@/components/icons";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Corner+of+Water/@-15.8419176,-47.9490784,12z/data=!4m6!3m5!1s0x935a294707d6a447:0xb98207029ac09564!8m2!3d-15.9270817!4d-47.9829297!16s%2Fg%2F1ptz5rlhy?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const headerStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const fadeSlide = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

const clipContainer = {
  hidden: {},
  visible: {},
};

const clipReveal = {
  hidden: { y: "100%" },
  visible: {
    y: "0%",
    transition: { duration: 0.7, ease: EASE },
  },
};

const mapReveal = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const infoStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const infoItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

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

export function LocationSection() {
  const t = useTranslations("location");

  return (
    <section
      id="location"
      className="py-20 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, var(--color-meadow) 0%, var(--color-sage) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerStagger}
          className="mb-12 text-center md:mb-16"
        >
          <motion.p
            variants={fadeSlide}
            className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-forest md:text-sm"
          >
            {t("label")}
          </motion.p>

          <motion.div
            variants={clipContainer}
            className="mb-6 overflow-hidden"
          >
            <motion.h2
              variants={clipReveal}
              className="text-3xl font-semibold text-forest-dark md:text-4xl lg:text-5xl"
            >
              {t("title")}
            </motion.h2>
          </motion.div>

          <motion.div variants={fadeSlide}>
            <OrnamentalDivider />
          </motion.div>
        </motion.div>

        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={mapReveal}
          >
            <div className="overflow-hidden rounded-2xl border border-forest/10 shadow-lg">
              <Image
                src="/location/map.png"
                alt={`${t("venue")} — ${t("address")}`}
                width={1200}
                height={900}
                className="h-auto w-full object-cover"
                priority={false}
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={infoStagger}
            className="flex flex-col items-center text-center md:items-start md:text-left"
          >
            <motion.h3
              variants={infoItem}
              className="mb-3 text-2xl font-semibold text-forest-dark md:text-3xl"
            >
              {t("venue")}
            </motion.h3>

            <motion.p
              variants={infoItem}
              className="mb-5 text-base tracking-wide text-forest-dark/70 md:text-lg"
            >
              {t("address")}
            </motion.p>

            <motion.a
              variants={infoItem}
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-forest/20 bg-forest px-8 py-3.5 font-medium text-cream shadow-md transition-all duration-300 hover:scale-105 hover:bg-forest-dark hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-forest/50 focus:ring-offset-2 focus:ring-offset-meadow"
            >
              <MapPinIcon className="h-5 w-5" />
              {t("directions")}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
