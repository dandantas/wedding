"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { fadeInUp, staggerContainer } from "@/lib/animations";

export function StorySection() {
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
    <section id="story" className="bg-cream py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-amber md:text-sm">
            {t("label")}
          </p>
          <h2 className="text-3xl font-semibold text-forest-dark md:text-4xl lg:text-5xl">
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
              <div className="mb-4 text-4xl font-bold text-marigold md:text-5xl">
                {event.year}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-forest-dark">
                {event.title}
              </h3>
              <p className="text-base leading-relaxed text-olive md:text-lg">
                {event.description}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-amber transition-all duration-300 group-hover:w-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
