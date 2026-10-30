import { describe, expect, it } from "vitest";
import {
  calculateImpact,
  formatPhone,
  generateVoucherCode,
  isValidCpfCnpj,
  isValidEmail,
  isValidPhone,
  normalizeTrackingCode,
} from "./domain";

describe("domain helpers", () => {
  it("creates a unique voucher sequence for the year", () => {
    expect(
      generateVoucherCode(["REEE-EIR-2026-0001", "REEE-EIR-2026-0004"], 2026),
    ).toBe("REEE-EIR-2026-0005");
    expect(generateVoucherCode(["REEE-EIR-2025-0009"], 2026)).toBe(
      "REEE-EIR-2026-0001",
    );
  });

  it("validates Brazilian CPF and CNPJ check digits", () => {
    expect(isValidCpfCnpj("529.982.247-25")).toBe(true);
    expect(isValidCpfCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCpfCnpj("111.111.111-11")).toBe(false);
    expect(isValidCpfCnpj("12.345.678/0001-00")).toBe(false);
  });

  it("validates email and Brazilian phone input", () => {
    expect(isValidEmail("teste@exemplo.com")).toBe(true);
    expect(isValidEmail("teste@@exemplo")).toBe(false);
    expect(isValidPhone("(97) 99999-1234")).toBe(true);
    expect(isValidPhone("9999")).toBe(false);
    expect(formatPhone("97999991234")).toBe("(97) 99999-1234");
  });

  it("normalizes tracking codes and estimates impact with transparent factors", () => {
    expect(normalizeTrackingCode(" reee-eir-2026-0001 ")).toBe(
      "REEE-EIR-2026-0001",
    );
    expect(calculateImpact([{ category: "CELULAR", quantity: 2 }])).toEqual({
      weightKg: 0.36,
      co2AvoidedKg: 0.86,
      waterLiters: 14,
      heavyMetalsGrams: 0.004,
    });
  });
});
