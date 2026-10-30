export type WasteCategory =
  | "CELULAR"
  | "CARREGADOR"
  | "CABO_FONE"
  | "BATERIA_AVULSA"
  | "BATERIA_INTEGRADA"
  | "BATERIA_DANIFICADA"
  | "OUTRO_ELETROELETRONICO";

export type DeliveryMode =
  | "AGENCIA_CORREIOS_EIRUNEPE"
  | "PONTO_COLETA_IFAM"
  | "COLETA_COMUNITARIA"
  | "PONTO_PARCEIRO";

export type CycleStatus =
  | "SOLICITACAO_REGISTRADA"
  | "ENTREGUE_PONTO_COLETA"
  | "EM_TRANSPORTE"
  | "RECEBIDO_OPERADOR_AMBIENTAL"
  | "MATERIA_PRIMA_RECICLADA";

export interface Applicant {
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  addressExtra: string;
  consent: boolean;
}

export interface WasteItem {
  category: WasteCategory;
  quantity: number;
  notes?: string;
}

export interface ImpactEstimate {
  weightKg: number;
  co2AvoidedKg: number;
  waterLiters: number;
  heavyMetalsGrams: number;
}

export interface CollectionPoint {
  id: string;
  name: string;
  type: DeliveryMode;
  address: string;
  hours: string;
  acceptedCategories: WasteCategory[];
  latitude: number;
  longitude: number;
  verified: boolean;
  note: string;
}

export interface VoucherRecord {
  code: string;
  createdAt: string;
  status: CycleStatus;
  items: WasteItem[];
  deliveryMode: DeliveryMode;
  pointId: string;
  applicant: Applicant;
  payloadQrCode: string;
  impact: ImpactEstimate;
  checksum: string;
  specialHandling: boolean;
  safetyAcknowledged: boolean;
}

export interface TrackingEvent {
  code: string;
  status: CycleStatus;
  timestamp: string;
  simulatedLocation: string;
  description: string;
}

export interface Partner {
  id: string;
  institutionName: string;
  document: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  partnershipType: "PONTO_DE_ENTREGA" | "PONTO_DE_DIVULGACAO";
  categories: WasteCategory[];
  hours: string;
  acceptedTerms: boolean;
  status: "PENDENTE_VALIDACAO";
}

export interface MonthlyMetric {
  month: string;
  year: number;
  units: number;
  weightKg: number;
}

export interface ChecklistTask {
  id: string;
  label: string;
  completed: boolean;
}
