"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { fadeInUp } from "@/lib/animations";

export function AttireSection() {
  const t = useTranslations("attire");

  return (
    <section id="attire" className="bg-[#fdfdfd] pt-10 pb-20 md:pt-16 md:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-amber md:text-sm">
            {t("title")}
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-forest md:text-4xl lg:text-5xl">
            {t("dressCode")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-neutral-800 md:text-lg">
            {t("note")}
          </p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-4 md:mb-16"
        >
          <Image
            src="/attire/attire.png"
            alt={t("title")}
            width={1000}
            height={800}
            className="mx-auto h-auto w-full max-w-3xl object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
