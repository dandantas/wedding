"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type FormEvent,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { fadeInUp } from "@/lib/animations";

type FormStatus = "idle" | "submitting" | "success" | "error";

interface GuestOption {
  id: string;
  name: string;
}

interface RsvpFormData {
  guestId: string | null;
  guestName: string;
  maxCompanions: number;
  attending: boolean | null;
  companionCount: number;
  message: string;
  isUpdate: boolean;
}

interface FormErrors {
  guest?: string;
}

const TOTAL_STEPS = 4;

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

const INITIAL_FORM_DATA: RsvpFormData = {
  guestId: null,
  guestName: "",
  maxCompanions: 0,
  attending: null,
  companionCount: 0,
  message: "",
  isUpdate: false,
};

export function RSVPSection() {
  const t = useTranslations("rsvp");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [guests, setGuests] = useState<GuestOption[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [guestsError, setGuestsError] = useState(false);
  const [formData, setFormData] = useState<RsvpFormData>(INITIAL_FORM_DATA);

  async function fetchGuests() {
    setGuestsLoading(true);
    setGuestsError(false);
    try {
      const response = await fetch("/api/guests");
      if (!response.ok) throw new Error("Failed to fetch guests");
      const data = (await response.json()) as { guests: GuestOption[] };
      setGuests(data.guests);
    } catch {
      setGuestsError(true);
    } finally {
      setGuestsLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    fetchGuests();
  }, []);

  const handleGuestSelect = useCallback(async (guest: GuestOption) => {
    setErrors({});

    try {
      const response = await fetch(`/api/rsvp/${guest.id}`);
      if (!response.ok) throw new Error("Failed to fetch RSVP");

      const data = (await response.json()) as {
        guest: { maxCompanions: number };
        rsvp: {
          attending: boolean;
          companionCount: number;
          message: string | null;
        } | null;
      };

      setFormData({
        guestId: guest.id,
        guestName: guest.name,
        maxCompanions: data.guest.maxCompanions,
        attending: data.rsvp?.attending ?? null,
        companionCount: data.rsvp?.companionCount ?? 0,
        message: data.rsvp?.message ?? "",
        isUpdate: data.rsvp !== null,
      });
    } catch {
      setFormData({
        ...INITIAL_FORM_DATA,
        guestId: guest.id,
        guestName: guest.name,
      });
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof RsvpFormData>(field: K, value: RsvpFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const validateStep = useCallback(
    (currentStep: number): boolean => {
      if (currentStep === 0) {
        if (!formData.guestId) {
          setErrors({ guest: t("validation.guestRequired") });
          return false;
        }
        setErrors({});
        return true;
      }
      if (currentStep === 1) {
        return formData.attending !== null;
      }
      return true;
    },
    [formData.guestId, formData.attending, t],
  );

  const activeSteps = useMemo(() => {
    const skipCompanions =
      formData.attending === false || formData.maxCompanions === 0;
    return skipCompanions ? [0, 1, 3] : [0, 1, 2, 3];
  }, [formData.attending, formData.maxCompanions]);

  const progressIndex = activeSteps.indexOf(step);
  const progressTotal = activeSteps.length;

  const goNext = useCallback(() => {
    if (!validateStep(step)) return;

    setDirection(1);

    if (step === 1) {
      const skipCompanions =
        formData.attending === false || formData.maxCompanions === 0;
      if (skipCompanions) {
        setStep(3);
        return;
      }
    }

    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, [step, validateStep, formData.attending, formData.maxCompanions]);

  const goBack = useCallback(() => {
    setDirection(-1);

    if (step === 3) {
      const skipCompanions =
        formData.attending === false || formData.maxCompanions === 0;
      if (skipCompanions) {
        setStep(1);
        return;
      }
    }

    setStep((s) => Math.max(s - 1, 0));
  }, [step, formData.attending, formData.maxCompanions]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus("submitting");

      try {
        const response = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestId: formData.guestId,
            attending: formData.attending,
            companionCount: formData.attending ? formData.companionCount : 0,
            message: formData.message || undefined,
          }),
        });

        if (!response.ok) throw new Error("Submission failed");
        setStatus("success");
      } catch {
        setStatus("error");
      }
    },
    [formData],
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setStep(0);
    setDirection(1);
    setStatus("idle");
    setErrors({});
  }, []);

  return (
    <section
      id="rsvp"
      className="bg-forest-dark pt-10 pb-20 text-white md:pt-16 md:pb-32"
    >
      <div className="mx-auto max-w-4xl px-2 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-amber md:text-sm">
            {t("label")}
          </p>
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mb-12 text-base leading-relaxed text-white/70 md:text-lg">
            {t("description")}
          </p>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <SuccessState
                attending={formData.attending ?? false}
                t={t}
                onReset={resetForm}
              />
            ) : status === "error" ? (
              <ErrorState t={t} onRetry={() => setStatus("idle")} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StepIndicator
                  activeSteps={activeSteps}
                  currentStep={step}
                  progressIndex={progressIndex}
                  t={t}
                />

                <form onSubmit={handleSubmit}>
                  <div className="relative min-h-[320px] overflow-hidden sm:min-h-[280px]">
                    <AnimatePresence
                      mode="wait"
                      custom={direction}
                      initial={false}
                    >
                      {step === 0 && (
                        <StepGuestSelect
                          key="step-0"
                          direction={direction}
                          guests={guests}
                          guestsLoading={guestsLoading}
                          guestsError={guestsError}
                          selectedGuestId={formData.guestId}
                          isUpdate={formData.isUpdate}
                          error={errors.guest}
                          onSelect={handleGuestSelect}
                          onRetryLoad={fetchGuests}
                          t={t}
                        />
                      )}
                      {step === 1 && (
                        <StepAttendance
                          key="step-1"
                          direction={direction}
                          formData={formData}
                          updateField={updateField}
                          t={t}
                        />
                      )}
                      {step === 2 && (
                        <StepDetails
                          key="step-2"
                          direction={direction}
                          formData={formData}
                          updateField={updateField}
                          t={t}
                        />
                      )}
                      {step === 3 && (
                        <StepMessage
                          key="step-3"
                          direction={direction}
                          formData={formData}
                          updateField={updateField}
                          t={t}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <NavigationButtons
                    isFirst={progressIndex === 0}
                    isLast={progressIndex === progressTotal - 1}
                    isSubmitting={status === "submitting"}
                    isUpdate={formData.isUpdate}
                    onBack={goBack}
                    onNext={goNext}
                    t={t}
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Step Indicator ─── */

function StepIndicator({
  activeSteps,
  currentStep,
  progressIndex,
  t,
}: {
  activeSteps: number[];
  currentStep: number;
  progressIndex: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const stepKeys = ["guest", "attendance", "details", "message"] as const;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {activeSteps.map((stepIndex, i) => (
          <div key={stepIndex} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && (
              <div
                className={`h-px w-6 transition-colors duration-500 sm:w-10 ${
                  i <= progressIndex ? "bg-amber" : "bg-white/20"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-500 ${
                  stepIndex === currentStep
                    ? "border-amber bg-amber text-white"
                    : i < progressIndex
                      ? "border-amber/60 bg-amber/20 text-amber"
                      : "border-white/20 text-white/40"
                }`}
                animate={
                  stepIndex === currentStep
                    ? { scale: [1, 1.1, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3 }}
              >
                {i + 1}
              </motion.div>
              <span
                className={`hidden text-[10px] uppercase tracking-wider sm:block ${
                  stepIndex === currentStep ? "text-amber" : "text-white/40"
                }`}
              >
                {t(`steps.${stepKeys[stepIndex]}`)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 0: Guest Selection ─── */

function StepGuestSelect({
  direction,
  guests,
  guestsLoading,
  guestsError,
  selectedGuestId,
  isUpdate,
  error,
  onSelect,
  onRetryLoad,
  t,
}: {
  direction: number;
  guests: GuestOption[];
  guestsLoading: boolean;
  guestsError: boolean;
  selectedGuestId: string | null;
  isUpdate: boolean;
  error?: string;
  onSelect: (guest: GuestOption) => void;
  onRetryLoad: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return guests;
    const normalised = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return guests.filter((g) =>
      g.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(normalised),
    );
  }, [guests, query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && filtered[highlightIndex]) {
          selectGuest(filtered[highlightIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }

  function selectGuest(guest: GuestOption) {
    setQuery(guest.name);
    setIsOpen(false);
    onSelect(guest);
  }

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const selectedName = guests.find((g) => g.id === selectedGuestId)?.name;

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute inset-x-0"
    >
      <motion.div
        variants={staggerChildren}
        initial="enter"
        animate="center"
        className="space-y-6"
      >
        <motion.div variants={fieldVariant}>
          <label
            htmlFor="rsvp-guest-search"
            className="mb-2 block text-sm uppercase tracking-wider text-white/60"
          >
            {t("form.selectGuest")} *
          </label>

          {guestsLoading ? (
            <div className="flex items-center gap-3 py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1,
                  ease: "linear",
                }}
                className="h-5 w-5 rounded-full border-2 border-amber/30 border-t-amber"
              />
              <span className="text-white/40">{t("form.loadingGuests")}</span>
            </div>
          ) : guestsError ? (
            <div className="space-y-3 py-4">
              <p className="text-sm text-red-400">{t("form.loadError")}</p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetryLoad}
                className="text-sm uppercase tracking-wider text-amber transition-colors hover:text-amber/80"
              >
                {t("error.retry")}
              </motion.button>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={inputRef}
                id="rsvp-guest-search"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                  setHighlightIndex(-1);
                  if (selectedGuestId && e.target.value !== selectedName) {
                    onSelect({ id: "", name: "" });
                  }
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder={t("form.searchPlaceholder")}
                autoComplete="off"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls="guest-listbox"
                aria-activedescendant={
                  highlightIndex >= 0
                    ? `guest-option-${highlightIndex}`
                    : undefined
                }
                className={`w-full border-b bg-transparent px-0 py-3 text-lg text-white placeholder-white/30 outline-none transition-colors focus:border-amber ${
                  error ? "border-red-400" : "border-white/20"
                }`}
              />

              {selectedGuestId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3.5 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber/20 text-amber"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    className="h-3.5 w-3.5"
                  >
                    <title>Selected</title>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              <AnimatePresence>
                {isOpen && query.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-2 max-h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-forest-dark/95 shadow-2xl backdrop-blur-md"
                  >
                    {filtered.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-white/40">
                        {t("form.guestNotFound")}
                      </p>
                    ) : (
                      <div
                        ref={listRef}
                        id="guest-listbox"
                        role="listbox"
                        className="max-h-48 overflow-y-auto"
                      >
                        {filtered.map((guest, i) => (
                          <div
                            key={guest.id}
                            id={`guest-option-${i}`}
                            role="option"
                            tabIndex={0}
                            aria-selected={guest.id === selectedGuestId}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectGuest(guest)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                selectGuest(guest);
                              }
                            }}
                            onMouseEnter={() => setHighlightIndex(i)}
                            className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                              i === highlightIndex
                                ? "bg-amber/15 text-amber"
                                : guest.id === selectedGuestId
                                  ? "bg-amber/10 text-amber"
                                  : "text-white/80 hover:bg-white/5"
                            }`}
                          >
                            {guest.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isUpdate && selectedGuestId && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm text-amber/70"
              >
                {t("form.existingRsvp")}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step 1: Attendance ─── */

function StepAttendance({
  direction,
  formData,
  updateField,
  t,
}: {
  direction: number;
  formData: RsvpFormData;
  updateField: <K extends keyof RsvpFormData>(
    field: K,
    value: RsvpFormData[K],
  ) => void;
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
      className="absolute inset-x-0"
    >
      <motion.div
        variants={staggerChildren}
        initial="enter"
        animate="center"
        className="space-y-6"
      >
        <motion.p
          variants={fieldVariant}
          className="text-center text-xl text-white/80 md:text-2xl"
        >
          {t("form.attending")}
        </motion.p>

        <motion.div
          variants={fieldVariant}
          className="flex flex-col gap-4 px-2 sm:flex-row"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateField("attending", true)}
            className={`flex-1 rounded-xl border-2 px-6 py-6 text-center transition-all duration-300 ${
              formData.attending === true
                ? "border-amber bg-amber/15 text-amber"
                : "border-white/15 text-white/60 hover:border-white/30"
            }`}
          >
            <div className="mb-2 text-3xl">
              {formData.attending === true ? "✓" : "♥"}
            </div>
            <span className="text-lg font-medium">
              {t("form.attendingYes")}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateField("attending", false)}
            className={`flex-1 rounded-xl border-2 px-6 py-6 text-center transition-all duration-300 ${
              formData.attending === false
                ? "border-amber bg-amber/15 text-amber"
                : "border-white/15 text-white/60 hover:border-white/30"
            }`}
          >
            <div className="mb-2 text-3xl">
              {formData.attending === false ? "✓" : "✉"}
            </div>
            <span className="text-lg font-medium">
              {t("form.attendingNo")}
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step 2: Companion Details ─── */

function StepDetails({
  direction,
  formData,
  updateField,
  t,
}: {
  direction: number;
  formData: RsvpFormData;
  updateField: <K extends keyof RsvpFormData>(
    field: K,
    value: RsvpFormData[K],
  ) => void;
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
      className="absolute inset-x-0"
    >
      <motion.div
        variants={staggerChildren}
        initial="enter"
        animate="center"
        className="space-y-8"
      >
        <motion.div variants={fieldVariant}>
          <label
            htmlFor="rsvp-companions"
            className="mb-2 block text-sm uppercase tracking-wider text-white/60"
          >
            {t("form.companions")}
          </label>
          <p className="mb-4 text-sm text-white/40">
            {t("form.companionsDescription")}
          </p>
          <div className="flex items-center justify-center gap-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                updateField(
                  "companionCount",
                  Math.max(0, formData.companionCount - 1),
                )
              }
              disabled={formData.companionCount === 0}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-xl text-white/60 transition-colors hover:border-amber hover:text-amber disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/60"
            >
              −
            </motion.button>
            <motion.span
              key={formData.companionCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 text-center text-4xl font-normal text-white"
            >
              {formData.companionCount}
            </motion.span>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                updateField(
                  "companionCount",
                  Math.min(formData.maxCompanions, formData.companionCount + 1),
                )
              }
              disabled={formData.companionCount >= formData.maxCompanions}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-xl text-white/60 transition-colors hover:border-amber hover:text-amber disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/60"
            >
              +
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step 3: Message ─── */

function StepMessage({
  direction,
  formData,
  updateField,
  t,
}: {
  direction: number;
  formData: RsvpFormData;
  updateField: <K extends keyof RsvpFormData>(
    field: K,
    value: RsvpFormData[K],
  ) => void;
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
      className="absolute inset-x-0"
    >
      <motion.div
        variants={staggerChildren}
        initial="enter"
        animate="center"
        className="space-y-6"
      >
        <motion.div variants={fieldVariant}>
          <label
            htmlFor="rsvp-message"
            className="mb-2 block text-sm uppercase tracking-wider text-white/60"
          >
            {t("form.message")}
          </label>
          <textarea
            id="rsvp-message"
            value={formData.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder={t("form.messagePlaceholder")}
            rows={5}
            className="w-full resize-none border-b border-white/20 bg-transparent px-0 py-3 text-lg text-white placeholder-white/30 outline-none transition-colors focus:border-amber"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Navigation Buttons ─── */

function NavigationButtons({
  isFirst,
  isLast,
  isSubmitting,
  isUpdate,
  onBack,
  onNext,
  t,
}: {
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
  isUpdate: boolean;
  onBack: () => void;
  onNext: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <div>
        {!isFirst && (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="text-sm uppercase tracking-wider text-white/50 transition-colors hover:text-white"
          >
            ← {t("form.back")}
          </motion.button>
        )}
      </div>

      <div>
        {isLast ? (
          <motion.button
            key="submit-btn"
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            className="rounded-full border-2 border-amber bg-amber/10 px-8 py-3 text-sm font-medium uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-10"
          >
            {isSubmitting ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1.5,
                }}
              >
                ...
              </motion.span>
            ) : isUpdate ? (
              t("form.update")
            ) : (
              t("form.submit")
            )}
          </motion.button>
        ) : (
          <motion.button
            key="next-btn"
            type="button"
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="rounded-full border-2 border-amber bg-amber/10 px-8 py-3 text-sm font-medium uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-white sm:px-10"
          >
            {t("form.next")} →
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ─── Success State ─── */

function SuccessState({
  attending,
  t,
  onReset,
}: {
  attending: boolean;
  t: ReturnType<typeof useTranslations>;
  onReset: () => void;
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-8 text-center"
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
        className="mb-3 text-3xl font-semibold text-white md:text-4xl"
      >
        {t("success.title")}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8 text-lg text-white/70"
      >
        {attending ? t("success.attending") : t("success.notAttending")}
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="text-sm uppercase tracking-wider text-white/40 transition-colors hover:text-white/70"
      >
        {t("success.another")}
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
      className="py-8 text-center"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-400/50">
        <span className="text-4xl text-red-400">!</span>
      </div>

      <h3 className="mb-3 text-3xl font-semibold text-white">
        {t("error.title")}
      </h3>

      <p className="mb-8 text-lg text-white/70">{t("error.description")}</p>

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
