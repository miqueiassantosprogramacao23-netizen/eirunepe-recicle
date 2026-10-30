import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChecklistTask, Partner, VoucherRecord } from "../types";

const defaultChecklist: ChecklistTask[] = [
  {
    id: "backup",
    label: "Fazer backup de fotos, contatos e arquivos importantes",
    completed: false,
  },
  {
    id: "accounts",
    label: "Desvincular contas digitais e aplicativos",
    completed: false,
  },
  {
    id: "sim",
    label: "Remover cartão SIM e cartão de memória",
    completed: false,
  },
  {
    id: "factory-reset",
    label: "Restaurar a configuração de fábrica",
    completed: false,
  },
  {
    id: "manufacturer",
    label: "Verificar se a conta do fabricante foi removida",
    completed: false,
  },
  {
    id: "secure-erase",
    label: "Apagar dados de forma segura",
    completed: false,
  },
];

interface AppState {
  vouchers: VoucherRecord[];
  partners: Partner[];
  checklist: ChecklistTask[];
  addVoucher: (voucher: VoucherRecord) => void;
  addPartner: (partner: Partner) => void;
  toggleChecklistTask: (id: string) => void;
  resetChecklist: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      vouchers: [],
      partners: [],
      checklist: defaultChecklist,
      addVoucher: (voucher) =>
        set((state) => ({ vouchers: [voucher, ...state.vouchers] })),
      addPartner: (partner) =>
        set((state) => ({ partners: [partner, ...state.partners] })),
      toggleChecklistTask: (id) =>
        set((state) => ({
          checklist: state.checklist.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task,
          ),
        })),
      resetChecklist: () =>
        set({
          checklist: defaultChecklist.map((task) => ({
            ...task,
            completed: false,
          })),
        }),
    }),
    {
      name: "eirunepe-recicla-state-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
