/**
 * Brazilian phone number formatting utilities.
 *
 * Supports both mobile (11 digits) and landline (10 digits) formats:
 * - Mobile:   +55 (XX) XXXXX-XXXX
 * - Landline: +55 (XX) XXXX-XXXX
 */

const BRAZIL_COUNTRY_CODE = "55";
const MAX_DIGITS = 13; // 55 + 11-digit mobile

export function formatBrazilianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 0) return "";

  if (!digits.startsWith(BRAZIL_COUNTRY_CODE)) {
    digits = BRAZIL_COUNTRY_CODE + digits;
  }

  digits = digits.slice(0, MAX_DIGITS);

  const countryCode = digits.slice(0, 2);
  const ddd = digits.slice(2, 4);
  const remaining = digits.slice(4);

  if (digits.length <= 2) {
    return `+${countryCode}`;
  }

  if (digits.length <= 4) {
    return `+${countryCode} (${ddd}`;
  }

  const isMobile = remaining.length > 4 && digits.length > 12;

  if (isMobile) {
    const firstPart = remaining.slice(0, 5);
    const secondPart = remaining.slice(5);
    if (secondPart.length === 0) {
      return `+${countryCode} (${ddd}) ${firstPart}`;
    }
    return `+${countryCode} (${ddd}) ${firstPart}-${secondPart}`;
  }

  if (remaining.length <= 4) {
    return `+${countryCode} (${ddd}) ${remaining}`;
  }

  const firstPart = remaining.slice(0, remaining.length - 4);
  const secondPart = remaining.slice(-4);
  return `+${countryCode} (${ddd}) ${firstPart}-${secondPart}`;
}

export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, "");
}
