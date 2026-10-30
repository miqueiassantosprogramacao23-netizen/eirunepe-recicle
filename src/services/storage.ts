import type { VoucherRecord } from "../types";
import { generateVoucherCode } from "../utils/domain";

export const STORAGE_KEYS = {
  app: "eirunepe-recicla-state-v1",
  draft: "eirunepe-recicla-request-draft-v1",
  checklist: "eirunepe-recicla-checklist-v1",
};

export function createVoucherCode(
  existingCodes: string[],
  year = new Date().getFullYear(),
): string {
  return generateVoucherCode(existingCodes, year);
}

export function findVoucher(
  records: VoucherRecord[],
  code: string,
): VoucherRecord | undefined {
  const normalized = code.trim().replace(/\s+/g, "").toUpperCase();
  return records.find((record) => record.code.toUpperCase() === normalized);
}
