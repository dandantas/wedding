"use client";

import { useState, useCallback, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { fadeInUp } from "@/lib/animations";
import { formatBrazilianPhone, unmaskPhone } from "@/lib/masks";

type GiftView = "grid" | "amount" | "form" | "processing" | "success" | "error";

interface Gift {
  id: string;
  name: string;
  nameEn: string;
  description: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  suggestedPrice: number;
}

interface GuestFormData {
  name: string;
  email: string;
  phone: string;
  taxId: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  taxId?: string;
  amount?: string;
}

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const staggerChildren = {
  center: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fieldVariant = {
  enter: { opacity: 0, y: 20 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function detectLocale(): string {
  if (typeof window === "undefined") return "pt";
  const path = window.location.pathname;
  return path.startsWith("/en") ? "en" : "pt";
}

export function GiftsSection() {
  const t = useTranslations("gifts");
  const [view, setView] = useState<GiftView>("grid");
  const [direction, setDirection] = useState(1);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);
  const [giftsError, setGiftsError] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [formData, setFormData] = useState<GuestFormData>({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setIsPaymentSuccess(true);
      setView("success");
      window.history.replaceState({}, "", window.location.pathname + "#gifts");
    }
  }, []);

  const fetchGifts = useCallback(async () => {
    setLoadingGifts(true);
    setGiftsError(false);
    try {
      const response = await fetch("/api/gifts");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGifts(data.gifts);
    } catch {
      setGiftsError(true);
    } finally {
      setLoadingGifts(false);
    }
  }, []);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  const selectGift = useCallback((gift: Gift) => {
    setSelectedGift(gift);
    setAmount(gift.suggestedPrice);
    setIsCustom(false);
    setCustomAmount("");
    setDirection(1);
    setView("amount");
  }, []);

  const selectPresetAmount = useCallback((value: number) => {
    setAmount(value);
    setIsCustom(false);
    setCustomAmount("");
  }, []);

  const handleCustomAmount = useCallback((value: string) => {
    const numericValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    setCustomAmount(numericValue);
    setIsCustom(true);
    const cents = Math.round(Number.parseFloat(numericValue || "0") * 100);
    setAmount(cents);
  }, []);

  const goToForm = useCallback(() => {
    if (amount < 100) {
      setErrors({ amount: "amountMin" });
      return;
    }
    setErrors({});
    setDirection(1);
    setView("form");
  }, [amount]);

  const goBack = useCallback(() => {
    setDirection(-1);
    if (view === "form") setView("amount");
    else if (view === "amount") setView("grid");
    else if (view === "error") setView("form");
  }, [view]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "nameRequired";
    if (!formData.email.trim()) {
      newErrors.email = "emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "emailInvalid";
    }
    if (!formData.taxId.trim()) newErrors.taxId = "taxIdRequired";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm() || !selectedGift) return;

      setDirection(1);
      setView("processing");

      try {
        const response = await fetch("/api/gifts/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftId: selectedGift.id,
            amount,
            guestName: formData.name,
            guestEmail: formData.email,
            guestPhone: unmaskPhone(formData.phone) || undefined,
            guestTaxId: formData.taxId,
            message: formData.message || undefined,
          }),
        });

        if (!response.ok) throw new Error("Checkout failed");

        const data = await response.json();

        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          throw new Error("No payment URL returned");
        }
      } catch {
        setView("error");
      }
    },
    [validateForm, selectedGift, amount, formData]
  );

  const resetFlow = useCallback(() => {
    setSelectedGift(null);
    setAmount(0);
    setCustomAmount("");
    setIsCustom(false);
    setFormData({ name: "", email: "", phone: "", taxId: "", message: "" });
    setErrors({});
    setDirection(-1);
    setView("grid");
    setIsPaymentSuccess(false);
  }, []);

  const updateField = useCallback(
    <K extends keyof GuestFormData>(field: K, value: GuestFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field in errors) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const locale = detectLocale();

  function getGiftName(gift: Gift): string {
    return locale === "en" ? gift.nameEn : gift.name;
  }

  function getGiftDescription(gift: Gift): string | null {
    return locale === "en" ? gift.descriptionEn : gift.description;
  }

  return (
    <section id="gifts" className="bg-cream pt-10 pb-20 md:pt-16 md:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-amber md:text-sm">
            {t("label")}
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-forest-dark md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-olive md:text-lg">
            {t("description")}
          </p>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {view === "grid" && (
              <GiftGrid
                key="grid"
                direction={direction}
                gifts={gifts}
                loading={loadingGifts}
                hasError={giftsError}
                onSelect={selectGift}
                onRetry={fetchGifts}
                getGiftName={getGiftName}
                getGiftDescription={getGiftDescription}
                t={t}
              />
            )}
            {view === "amount" && selectedGift && (
              <AmountPicker
                key="amount"
                direction={direction}
                gift={selectedGift}
                amount={amount}
                customAmount={customAmount}
                isCustom={isCustom}
                errors={errors}
                onSelectPreset={selectPresetAmount}
                onCustomChange={handleCustomAmount}
                onContinue={goToForm}
                onBack={goBack}
                getGiftName={getGiftName}
                t={t}
              />
            )}
            {view === "form" && (
              <GuestForm
                key="form"
                direction={direction}
                formData={formData}
                errors={errors}
                amount={amount}
                updateField={updateField}
                onSubmit={handleSubmit}
                onBack={goBack}
                t={t}
              />
            )}
            {view === "processing" && (
              <ProcessingState key="processing" t={t} />
            )}
            {view === "success" && (
              <SuccessState
                key="success"
                t={t}
                onReset={resetFlow}
                fromPayment={isPaymentSuccess}
              />
            )}
            {view === "error" && (
              <ErrorState key="error" t={t} onRetry={goBack} />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Gift Grid ─── */

function GiftGrid({
  direction,
  gifts,
  loading,
  hasError,
  onSelect,
  onRetry,
  getGiftName,
  getGiftDescription,
  t,
}: {
  direction: number;
  gifts: Gift[];
  loading: boolean;
  hasError: boolean;
  onSelect: (gift: Gift) => void;
  onRetry: () => void;
  getGiftName: (gift: Gift) => string;
  getGiftDescription: (gift: Gift) => string | null;
  t: ReturnType<typeof useTranslations>;
}) {
  if (loading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-16 text-center"
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          className="text-lg text-olive"
        >
          {t("loading")}
        </motion.div>
      </motion.div>
    );
  }

  if (hasError) {
    return (
      <motion.div
        key="error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-16 text-center"
      >
        <p className="mb-6 text-lg text-olive">
          {t("errorLoading")}
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="rounded-full border-2 border-amber bg-amber/10 px-8 py-3 text-sm font-medium uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-white"
        >
          {t("retry")}
        </motion.button>
      </motion.div>
    );
  }

  if (gifts.length === 0) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-16 text-center"
      >
        <p className="text-lg text-olive">{t("empty")}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="grid"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((gift, i) => (
          <motion.div
            key={gift.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <motion.button
              type="button"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(gift)}
              className="group w-full overflow-hidden rounded-2xl border border-amber/10 bg-white text-left shadow-sm transition-shadow hover:shadow-lg"
            >
              {gift.imageUrl && (
                <div className="aspect-4/3 overflow-hidden bg-marigold/30">
                  {/* biome-ignore lint: dynamic external URLs from DB */}
                  <img
                    src={gift.imageUrl}
                    alt={getGiftName(gift)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="mb-1 text-lg font-semibold text-forest-dark">
                  {getGiftName(gift)}
                </h3>
                {getGiftDescription(gift) && (
                  <p className="mb-3 line-clamp-2 text-sm text-olive">
                    {getGiftDescription(gift)}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-olive">
                      {t("suggested")}
                    </span>
                    <p className="text-xl font-semibold text-amber">
                      {formatCurrency(gift.suggestedPrice)}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber/20 bg-amber/5 px-4 py-2 text-sm font-medium text-amber transition-colors group-hover:bg-amber group-hover:text-white">
                    {t("giftThis")}
                  </span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Amount Picker ─── */

function AmountPicker({
  direction,
  gift,
  amount,
  customAmount,
  isCustom,
  errors,
  onSelectPreset,
  onCustomChange,
  onContinue,
  onBack,
  getGiftName,
  t,
}: {
  direction: number;
  gift: Gift;
  amount: number;
  customAmount: string;
  isCustom: boolean;
  errors: FormErrors;
  onSelectPreset: (value: number) => void;
  onCustomChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  getGiftName: (gift: Gift) => string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="mx-auto max-w-lg"
    >
      <motion.div
        variants={staggerChildren}
        initial="enter"
        animate="center"
        className="space-y-8"
      >
        <motion.div variants={fieldVariant} className="text-center">
          <h3 className="mb-2 text-2xl font-semibold text-forest-dark md:text-3xl">
            {getGiftName(gift)}
          </h3>
          <p className="text-base text-olive">
            {t("amount.suggested", {
              amount: formatCurrency(gift.suggestedPrice),
            })}
          </p>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <p className="mb-4 text-center text-sm uppercase tracking-wider text-olive">
            {t("amount.title")}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PRESET_AMOUNTS.map((value) => (
              <motion.button
                key={value}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectPreset(value)}
                className={`rounded-xl border-2 px-4 py-4 text-center transition-all duration-300 ${
                  !isCustom && amount === value
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-amber/15 text-olive hover:border-amber/30"
                }`}
              >
                <span className="text-lg font-semibold">
                  {formatCurrency(value)}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <label
            htmlFor="gift-custom-amount"
            className="mb-2 block text-sm uppercase tracking-wider text-olive"
          >
            {t("amount.custom")}
          </label>
          <div className="relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg text-olive">
              R$
            </span>
            <input
              id="gift-custom-amount"
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder={t("amount.customPlaceholder")}
              className={`w-full border-b bg-transparent py-3 pl-8 text-lg text-forest-dark placeholder-olive/40 outline-none transition-colors focus:border-amber ${
                isCustom ? "border-amber" : "border-amber/20"
              }`}
            />
          </div>
          <p className="mt-2 text-xs text-olive">
            {t("amount.minimum")}
          </p>
          <AnimatePresence>
            {errors.amount && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-red-500"
              >
                {t(`validation.${errors.amount}`)}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {amount >= 100 && (
          <motion.div
            variants={fieldVariant}
            className="text-center"
          >
            <p className="text-sm text-olive">
              Total:{" "}
              <span className="text-xl font-semibold text-amber">
                {formatCurrency(amount)}
              </span>
            </p>
          </motion.div>
        )}

        <motion.div
          variants={fieldVariant}
          className="flex items-center justify-between gap-4 pt-2"
        >
          <motion.button
            type="button"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="text-sm uppercase tracking-wider text-olive transition-colors hover:text-forest-dark"
          >
            ← {t("form.back")}
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="rounded-full border-2 border-amber bg-amber/10 px-8 py-3 text-sm font-medium uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-white sm:px-10"
          >
            {t("amount.continue")} →
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Guest Details Form ─── */

function GuestForm({
  direction,
  formData,
  errors,
  amount,
  updateField,
  onSubmit,
  onBack,
  t,
}: {
  direction: number;
  formData: GuestFormData;
  errors: FormErrors;
  amount: number;
  updateField: <K extends keyof GuestFormData>(
    field: K,
    value: GuestFormData[K]
  ) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="mx-auto max-w-lg"
    >
      <form onSubmit={onSubmit}>
        <motion.div
          variants={staggerChildren}
          initial="enter"
          animate="center"
          className="space-y-6"
        >
          <motion.div variants={fieldVariant} className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-semibold text-forest-dark">
              {t("form.title")}
            </h3>
            <p className="text-sm text-olive">
              Total:{" "}
              <span className="text-lg font-semibold text-amber">
                {formatCurrency(amount)}
              </span>
            </p>
          </motion.div>

          <motion.div variants={fieldVariant}>
            <label
              htmlFor="gift-name"
              className="mb-2 block text-sm uppercase tracking-wider text-olive"
            >
              {t("form.name")} *
            </label>
            <input
              id="gift-name"
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t("form.namePlaceholder")}
              className={`w-full border-b bg-transparent px-0 py-3 text-lg text-forest-dark placeholder-olive/40 outline-none transition-colors focus:border-amber ${
                errors.name ? "border-red-400" : "border-amber/20"
              }`}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm text-red-500"
                >
                  {t(`validation.${errors.name}`)}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={fieldVariant}>
            <label
              htmlFor="gift-email"
              className="mb-2 block text-sm uppercase tracking-wider text-olive"
            >
              {t("form.email")} *
            </label>
            <input
              id="gift-email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder={t("form.emailPlaceholder")}
              className={`w-full border-b bg-transparent px-0 py-3 text-lg text-forest-dark placeholder-olive/40 outline-none transition-colors focus:border-amber ${
                errors.email ? "border-red-400" : "border-amber/20"
              }`}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm text-red-500"
                >
                  {t(`validation.${errors.email}`)}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={fieldVariant}>
            <label
              htmlFor="gift-phone"
              className="mb-2 block text-sm uppercase tracking-wider text-olive"
            >
              {t("form.phone")}
            </label>
            <input
              id="gift-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                updateField("phone", formatBrazilianPhone(e.target.value))
              }
              placeholder={t("form.phonePlaceholder")}
              className="w-full border-b border-amber/20 bg-transparent px-0 py-3 text-lg text-forest-dark placeholder-olive/40 outline-none transition-colors focus:border-amber"
            />
          </motion.div>

          <motion.div variants={fieldVariant}>
            <label
              htmlFor="gift-taxid"
              className="mb-2 block text-sm uppercase tracking-wider text-olive"
            >
              {t("form.taxId")} *
            </label>
            <input
              id="gift-taxid"
              type="text"
              value={formData.taxId}
              onChange={(e) => updateField("taxId", e.target.value)}
              placeholder={t("form.taxIdPlaceholder")}
              className={`w-full border-b bg-transparent px-0 py-3 text-lg text-forest-dark placeholder-olive/40 outline-none transition-colors focus:border-amber ${
                errors.taxId ? "border-red-400" : "border-amber/20"
              }`}
            />
            <AnimatePresence>
              {errors.taxId && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm text-red-500"
                >
                  {t(`validation.${errors.taxId}`)}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={fieldVariant}>
            <label
              htmlFor="gift-message"
              className="mb-2 block text-sm uppercase tracking-wider text-olive"
            >
              {t("form.message")}
            </label>
            <textarea
              id="gift-message"
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder={t("form.messagePlaceholder")}
              rows={3}
              className="w-full resize-none border-b border-amber/20 bg-transparent px-0 py-3 text-lg text-forest-dark placeholder-olive/40 outline-none transition-colors focus:border-amber"
            />
          </motion.div>

          <motion.div
            variants={fieldVariant}
            className="flex items-center justify-between gap-4 pt-4"
          >
            <motion.button
              type="button"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="text-sm uppercase tracking-wider text-olive transition-colors hover:text-forest-dark"
            >
              ← {t("form.back")}
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border-2 border-amber bg-amber/10 px-8 py-3 text-sm font-medium uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-white sm:px-10"
            >
              {t("form.pay")} →
            </motion.button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}

/* ─── Processing State ─── */

function ProcessingState({
  t,
}: {
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="py-16 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 1.2,
          ease: "linear",
        }}
        className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-amber/20 border-t-amber"
      />
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        className="text-lg text-olive"
      >
        {t("checkout.processing")}
      </motion.p>
      <p className="mt-2 text-sm text-olive/60">
        {t("checkout.redirecting")}
      </p>
    </motion.div>
  );
}

/* ─── Success State ─── */

function SuccessState({
  t,
  onReset,
  fromPayment,
}: {
  t: ReturnType<typeof useTranslations>;
  onReset: () => void;
  fromPayment: boolean;
}) {
  return (
    <motion.div
      key="success"
      initial={fromPayment ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber"
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-amber"
          aria-label="Success checkmark"
          role="img"
        >
          <title>Success</title>
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          />
        </motion.svg>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-3 text-3xl font-semibold text-forest-dark md:text-4xl"
      >
        {t("success.title")}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8 text-lg text-olive"
      >
        {t("success.description")}
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="text-sm uppercase tracking-wider text-olive/60 transition-colors hover:text-olive"
      >
        {t("success.backToGifts")}
      </motion.button>
    </motion.div>
  );
}

/* ─── Error State ─── */

function ErrorState({
  t,
  onRetry,
}: {
  t: ReturnType<typeof useTranslations>;
  onRetry: () => void;
}) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="py-12 text-center"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-400/50">
        <span className="text-4xl text-red-400">!</span>
      </div>

      <h3 className="mb-3 text-3xl font-semibold text-forest-dark">
        {t("error.title")}
      </h3>

      <p className="mb-8 text-lg text-olive">
        {t("error.description")}
      </p>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="rounded-full border-2 border-amber bg-amber/10 px-10 py-3 text-sm font-medium uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-white"
      >
        {t("error.retry")}
      </motion.button>
    </motion.div>
  );
}
