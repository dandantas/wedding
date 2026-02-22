"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { fadeInUp } from "@/lib/animations";
import { HeartIcon, MusicIcon } from "@/components/icons";

export function EventSection() {
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
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-amber md:text-sm">
            {t("label")}
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-forest-dark md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-olive md:text-xl">
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
              className="rounded-lg border border-marigold bg-cream/50 p-8 text-center md:p-12"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber/10">
                {event.key === "ceremony" ? (
                  <HeartIcon className="h-8 w-8 text-amber" />
                ) : (
                  <MusicIcon className="h-8 w-8 text-amber" />
                )}
              </div>
              <h3 className="mb-2 text-2xl font-semibold text-forest-dark">
                {event.type}
              </h3>
              <p className="mb-4 text-lg font-medium text-amber">
                {event.time}
              </p>
              <p className="mb-2 text-lg font-medium text-forest-dark md:text-xl">
                {event.venue}
              </p>
              <p className="mb-4 text-sm text-olive">{event.address}</p>
              <p className="text-base text-olive md:text-lg">
                {event.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
