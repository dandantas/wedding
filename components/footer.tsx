"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { fadeIn } from "@/lib/animations";

export function Footer() {
  const t = useTranslations("footer");
  const tHero = useTranslations("hero");

  return (
    <footer className="bg-forest-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeIn} className="text-center">
          <h3 className="mb-4 font-script text-3xl">
            {tHero("coupleNames")}
          </h3>
          <p className="mb-8 text-base text-white/70 md:text-lg">
            {tHero("date")} | {tHero("location")}
          </p>

          <div className="mb-8 flex justify-center gap-6">
            {["Instagram", "Facebook", "Pinterest"].map((social) => (
              <button
                type="button"
                key={social}
                className="text-sm text-white/50 transition-colors hover:text-amber"
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
