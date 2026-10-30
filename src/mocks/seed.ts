import type {
  CollectionPoint,
  CycleStatus,
  MonthlyMetric,
  TrackingEvent,
  WasteCategory,
} from "../types";

export const collectionPoints: CollectionPoint[] = [
  {
    id: "correios-demo",
    name: "Agência dos Correios Eirunepé",
    type: "AGENCIA_CORREIOS_EIRUNEPE",
    address: "Endereço a confirmar, Centro, Eirunepé-AM",
    hours: "Horário a confirmar",
    acceptedCategories: ["CELULAR", "CARREGADOR", "CABO_FONE"],
    latitude: -6.6597,
    longitude: -69.8734,
    verified: false,
    note: "Localização apenas aproximada. Não representa parceria ou serviço confirmado.",
  },
  {
    id: "ifam-demo",
    name: "IFAM Campus Eirunepé",
    type: "PONTO_COLETA_IFAM",
    address: "Endereço a confirmar, Eirunepé-AM",
    hours: "Disponibilidade e horário a confirmar",
    acceptedCategories: [
      "CELULAR",
      "CARREGADOR",
      "CABO_FONE",
      "BATERIA_AVULSA",
    ],
    latitude: -6.6603,
    longitude: -69.8728,
    verified: false,
    note: "Exemplo educacional. Não representa parceria ou ponto ativo confirmado.",
  },
  {
    id: "parceiro-demo",
    name: "Comércio local participante (exemplo)",
    type: "PONTO_PARCEIRO",
    address: "Endereço ilustrativo, Eirunepé-AM",
    hours: "A definir",
    acceptedCategories: ["CELULAR", "CARREGADOR", "CABO_FONE"],
    latitude: -6.6593,
    longitude: -69.8741,
    verified: false,
    note: "Placeholder de demonstração. Nenhum estabelecimento real está cadastrado.",
  },
  {
    id: "comunidade-demo",
    name: "Ponto comunitário (exemplo)",
    type: "COLETA_COMUNITARIA",
    address: "Local a definir, Eirunepé-AM",
    hours: "Datas a divulgar",
    acceptedCategories: [
      "CELULAR",
      "CARREGADOR",
      "CABO_FONE",
      "OUTRO_ELETROELETRONICO",
    ],
    latitude: -6.6601,
    longitude: -69.8744,
    verified: false,
    note: "Ponto e agenda fictícios para demonstração.",
  },
];

export const categories: WasteCategory[] = [
  "CELULAR",
  "CARREGADOR",
  "CABO_FONE",
  "BATERIA_AVULSA",
  "BATERIA_INTEGRADA",
  "BATERIA_DANIFICADA",
  "OUTRO_ELETROELETRONICO",
];

const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;

export const monthlyMetrics: MonthlyMetric[] = [
  {
    month: `Nov/${String(previousYear).slice(-2)}`,
    year: previousYear,
    units: 80,
    weightKg: 25,
  },
  {
    month: `Dez/${String(previousYear).slice(-2)}`,
    year: previousYear,
    units: 90,
    weightKg: 28,
  },
  { month: "Jan", year: currentYear, units: 95, weightKg: 30 },
  { month: "Fev", year: currentYear, units: 100, weightKg: 31 },
  { month: "Mar", year: currentYear, units: 105, weightKg: 32 },
  { month: "Abr", year: currentYear, units: 110, weightKg: 34 },
  { month: "Mai", year: currentYear, units: 95, weightKg: 29 },
  { month: "Jun", year: currentYear, units: 100, weightKg: 30 },
  { month: "Jul", year: currentYear, units: 105, weightKg: 32 },
  { month: "Ago", year: currentYear, units: 110, weightKg: 34 },
  { month: "Set", year: currentYear, units: 115, weightKg: 36 },
  { month: "Out", year: currentYear, units: 135, weightKg: 39 },
];

const steps: CycleStatus[] = [
  "SOLICITACAO_REGISTRADA",
  "ENTREGUE_PONTO_COLETA",
  "EM_TRANSPORTE",
  "RECEBIDO_OPERADOR_AMBIENTAL",
  "MATERIA_PRIMA_RECICLADA",
];

export function demoTrackingEvents(code: string): TrackingEvent[] {
  const now = new Date();
  return steps.map((status, index) => {
    const timestamp = new Date(
      now.getTime() - (steps.length - index - 1) * 86400000 * 2,
    );
    return {
      code,
      status,
      timestamp: timestamp.toISOString(),
      simulatedLocation: [
        "Eirunepé-AM",
        "Ponto de coleta (simulado)",
        "Transporte (simulado)",
        "Operador ambiental (simulado)",
        "Cadeia circular (simulada)",
      ][index],
      description: [
        "Solicitação demonstrativa registrada no protótipo.",
        "Etapa de entrega registrada como exemplo.",
        "Etapa de transporte simulada para fins educativos.",
        "Recebimento por operador licenciado simulado, sem comprovação real.",
        "Reciclagem e reinserção simuladas, sem comprovação real.",
      ][index],
    };
  });
}

// TODO: confirmar dado oficial antes de exibir endereços, horários ou coordenadas como reais.
