"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const localeNames: Record<string, string> = {
  en: "EN",
  pt: "PT",
};

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    // Set the locale cookie
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    
    // Refresh the page to apply the new locale
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Object.entries(localeNames).map(([loc, name], index) => (
        <span key={loc} className="flex items-center">
          {index > 0 && <span className="mx-1 opacity-50">|</span>}
          <button
            type="button"
            onClick={() => handleLocaleChange(loc)}
            disabled={isPending}
            className={`text-sm font-medium transition-colors ${
              locale === loc
                ? "text-[#d4a574]"
                : "opacity-60 hover:opacity-100"
            } ${isPending ? "cursor-wait" : "cursor-pointer"}`}
          >
            {name}
          </button>
        </span>
      ))}
    </div>
  );
}
