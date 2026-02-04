"use client";

import { TZDate } from "@date-fns/tz";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Image from "next/image";

// import HeroImage from '@/public/hero_image.webp'
import HeroImage from '@/public/IMG_8311.jpg'

// Wedding date: June 6, 2026 at 15:30 in Brasilia, Brazil (America/Sao_Paulo timezone)
const WEDDING_DATE = new TZDate(2026, 5, 6, 15, 30, 0, "America/Sao_Paulo");

// Animation variants for scroll reveal
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.8 },
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  viewport: { once: true },
};

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("navigation");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: t("home") },
    { href: "#story", label: t("story") },
    { href: "#event", label: t("event") },
    { href: "#rsvp", label: t("rsvp") },
    { href: "#gifts", label: t("gifts") },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <a
            href="#home"
            className="relative shrink-0"
            aria-label="Go to home"
          >
            <Image
              src="/monogram.png"
              alt="Monogram"
              width={49}
              height={48}
              className="h-10 w-auto object-contain md:h-12"
              priority
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[#d4a574] ${
                  isScrolled ? "text-[#2d2a26]" : "text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
            {/* <LanguageSwitcher className={isScrolled ? "text-[#2d2a26]" : "text-white"} /> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* <LanguageSwitcher className={isScrolled ? "text-[#2d2a26]" : "text-white"} /> */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled ? "text-[#2d2a26]" : "text-white"}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white pb-4 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[#2d2a26] hover:text-[#d4a574]"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  const t = useTranslations("hero");
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

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Hero Background Image */}
      <Image
        src={HeroImage}
        alt="Hero background"
        fill
        priority
        placeholder="blur"
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 px-4 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-engravers mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/80 md:text-base"
        >
          {t("subtitle")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-6 font-billa text-3xl font-semibold leading-tight md:text-7xl lg:text-8xl"
        >
          {t("coupleNames")}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mx-auto mb-8 h-px w-24 md:w-32"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-12 font-engravers text-lg font-light tracking-wide md:text-2xl lg:text-3xl"
        >
          {t("date")} | {t("location")}
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-16 flex justify-center gap-4 md:gap-8 font-engravers"
        >
          {countdownItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className="mb-1 text-3xl font-light md:text-5xl">
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="text-xs uppercase tracking-wider text-white/70 md:text-sm">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="flex flex-col items-center"
          >
            <span className="mb-2 text-xs uppercase tracking-wider text-white/60">
              {t("scroll")}
            </span>
            <svg
              className="h-6 w-6 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div> */}
      </div>
    </section>
  );
}

// Our Story Section
function StorySection() {
  const t = useTranslations("story");

  const storyEvents = [
    {
      key: "howWeMet",
      year: t("events.howWeMet.year"),
      title: t("events.howWeMet.title"),
      description: t("events.howWeMet.description"),
    },
    {
      key: "firstTrip",
      year: t("events.firstTrip.year"),
      title: t("events.firstTrip.title"),
      description: t("events.firstTrip.description"),
    },
    {
      key: "proposal",
      year: t("events.proposal.year"),
      title: t("events.proposal.title"),
      description: t("events.proposal.description"),
    },
  ];

  return (
    <section id="story" className="bg-[#f5f0eb] py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#d4a574]">
            {t("label")}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-semibold text-[#2d2a26] md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
        </motion.div>

        <motion.div
          {...staggerContainer}
          className="grid gap-8 md:grid-cols-3 md:gap-12"
        >
          {storyEvents.map((event, index) => (
            <motion.div
              key={event.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative rounded-lg bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 font-[family-name:var(--font-playfair)] text-5xl font-bold text-[#e8d5c4]">
                {event.year}
              </div>
              <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#2d2a26]">
                {event.title}
              </h3>
              <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-[#6b6560]">
                {event.description}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#d4a574] transition-all duration-300 group-hover:w-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Event Details Section
function EventSection() {
  const t = useTranslations("event");

  const events = [
    {
      key: "ceremony",
      type: t("ceremony.type"),
      time: t("ceremony.time"),
      venue: t("ceremony.venue"),
      address: t("ceremony.address"),
      description: t("ceremony.description"),
    },
    {
      key: "reception",
      type: t("reception.type"),
      time: t("reception.time"),
      venue: t("reception.venue"),
      address: t("reception.address"),
      description: t("reception.description"),
    },
  ];

  return (
    <section id="event" className="bg-white py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#d4a574]">
            {t("label")}
          </p>
          <h2 className="mb-4 font-[family-name:var(--font-playfair)] text-4xl font-semibold text-[#2d2a26] md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#6b6560]">
            {t("date")}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {events.map((event, index) => (
            <motion.div
              key={event.key}
              initial={{ opacity: 0, x: index === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-lg border border-[#e8d5c4] bg-[#f5f0eb]/50 p-8 text-center md:p-12"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#d4a574]/10">
                {event.key === "ceremony" ? (
                  <svg
                    className="h-8 w-8 text-[#d4a574]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8 text-[#d4a574]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                )}
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2d2a26]">
                {event.type}
              </h3>
              <p className="mb-4 text-lg font-medium text-[#d4a574]">
                {event.time}
              </p>
              <p className="mb-2 font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#2d2a26]">
                {event.venue}
              </p>
              <p className="mb-4 text-sm text-[#6b6560]">{event.address}</p>
              <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#6b6560]">
                {event.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// RSVP Section (Placeholder)
function RSVPSection() {
  const t = useTranslations("rsvp");

  return (
    <section id="rsvp" className="bg-[#2d2a26] py-20 text-white md:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div {...fadeInUp}>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#d4a574]">
            {t("label")}
          </p>
          <h2 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-semibold md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="mb-10 font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-white/80">
            {t("description")}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="inline-flex items-center rounded-full border-2 border-[#d4a574] bg-transparent px-10 py-4 font-medium text-[#d4a574] transition-colors hover:bg-[#d4a574] hover:text-white"
          >
            {t("button")}
          </motion.button>
          <p className="mt-6 text-sm text-white/50">
            {t("comingSoon")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Gifts Section (Placeholder)
function GiftsSection() {
  const t = useTranslations("gifts");

  return (
    <section id="gifts" className="bg-[#f5f0eb] py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div {...fadeInUp}>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#d4a574]">
            {t("label")}
          </p>
          <h2 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-semibold text-[#2d2a26] md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="mb-10 font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-[#6b6560]">
            {t("description")}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="inline-flex items-center rounded-full bg-[#d4a574] px-10 py-4 font-medium text-white transition-colors hover:bg-[#8b7355]"
          >
            {t("button")}
          </motion.button>
          <p className="mt-6 text-sm text-[#6b6560]">
            {t("comingSoon")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const t = useTranslations("footer");
  const tHero = useTranslations("hero");

  return (
    <footer className="bg-[#2d2a26] py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeIn} className="text-center">
          <h3 className="mb-4 font-[family-name:var(--font-playfair)] text-3xl font-semibold">
            {tHero("coupleNames")}
          </h3>
          <p className="mb-8 font-[family-name:var(--font-cormorant)] text-lg text-white/70">
            {tHero("date")} | {tHero("location")}
          </p>

          {/* Social Links Placeholder */}
          <div className="mb-8 flex justify-center gap-6">
            {["Instagram", "Facebook", "Pinterest"].map((social) => (
              <button
                type="button"
                key={social}
                className="text-sm text-white/50 transition-colors hover:text-[#d4a574]"
                onClick={() => {}}
              >
                {social}
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-sm text-white/40">
              {t("madeWith")} | {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function Home() {
  return (
    <>
      {/* <Navigation /> */}
      <main>
        <HeroSection />
        {/* <StorySection />
        <EventSection />
        <RSVPSection />
        <GiftsSection /> */}
      </main>
      {/* <Footer /> */}
    </>
  );
}
