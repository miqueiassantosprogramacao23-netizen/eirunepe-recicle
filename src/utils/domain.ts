import type { ImpactEstimate, WasteCategory, WasteItem } from "../types";

export const categoryLabels: Record<WasteCategory, string> = {
  CELULAR: "Celular ou smartphone",
  CARREGADOR: "Carregador ou fonte",
  CABO_FONE: "Cabos ou fones",
  BATERIA_AVULSA: "Bateria avulsa",
  BATERIA_INTEGRADA: "Aparelho com bateria integrada",
  BATERIA_DANIFICADA: "Bateria danificada",
  OUTRO_ELETROELETRONICO: "Outro eletroeletrônico pequeno",
};

export const wasteCategories = Object.keys(categoryLabels) as WasteCategory[];

export function normalizeTrackingCode(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function isValidTrackingCode(value: string): boolean {
  return /^REEE-EIR-\d{4}-\d{4,}$/.test(normalizeTrackingCode(value));
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 3) return digits ? `(${digits}` : "";
  if (digits.length < 8) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length < 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

function hasValidCpfDigits(digits: string): boolean {
  if (/^(\d)\1{10}$/.test(digits)) return false;
  const first = digits
    .slice(0, 9)
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * (10 - index), 0);
  const firstCheck = ((first * 10) % 11) % 10;
  const second = digits
    .slice(0, 10)
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * (11 - index), 0);
  const secondCheck = ((second * 10) % 11) % 10;
  return firstCheck === Number(digits[9]) && secondCheck === Number(digits[10]);
}

function hasValidCnpjDigits(digits: string): boolean {
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const calculate = (base: string, weights: number[]) => {
    const total = base
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const first = calculate(
    digits.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const second = calculate(
    digits.slice(0, 12) + first,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  return first === Number(digits[12]) && second === Number(digits[13]);
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11
    ? hasValidCpfDigits(digits)
    : digits.length === 14 && hasValidCnpjDigits(digits);
}

export function generateVoucherCode(
  existingCodes: string[],
  year = new Date().getFullYear(),
): string {
  const prefix = `REEE-EIR-${year}-`;
  const highest = existingCodes.reduce((max, code) => {
    const match = code
      .toUpperCase()
      .match(new RegExp(`^REEE-EIR-${year}-(\\d+)$`));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

const estimatedWeightPerItem: Record<WasteCategory, number> = {
  CELULAR: 0.18,
  CARREGADOR: 0.12,
  CABO_FONE: 0.06,
  BATERIA_AVULSA: 0.05,
  BATERIA_INTEGRADA: 0.18,
  BATERIA_DANIFICADA: 0.05,
  OUTRO_ELETROELETRONICO: 0.35,
};

export function calculateImpact(items: WasteItem[]): ImpactEstimate {
  const weightKg = items.reduce(
    (total, item) =>
      total + estimatedWeightPerItem[item.category] * item.quantity,
    0,
  );
  return {
    weightKg: Number(weightKg.toFixed(2)),
    co2AvoidedKg: Number((weightKg * 2.4).toFixed(2)),
    waterLiters: Math.round(weightKg * 38),
    heavyMetalsGrams: Number((weightKg * 0.012).toFixed(3)),
  };
}

export function makeChecksum(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1)
    hash = (hash * 33) ^ value.charCodeAt(index);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "***";
  return `${name.slice(0, 1)}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `(**) *****-${digits.slice(-4)}` : "***";
}
