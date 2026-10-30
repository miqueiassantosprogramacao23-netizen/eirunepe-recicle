import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Printer,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { collectionPoints } from "../mocks/seed";
import { useAppStore } from "../store/useAppStore";
import type {
  Applicant,
  DeliveryMode,
  WasteCategory,
  WasteItem,
  VoucherRecord,
} from "../types";
import {
  calculateImpact,
  categoryLabels,
  formatPhone,
  isValidPhone,
  makeChecksum,
  maskEmail,
  maskPhone,
  wasteCategories,
} from "../utils/domain";
import { createVoucherCode, STORAGE_KEYS } from "../services/storage";

const applicantSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z
    .string()
    .refine(isValidPhone, "Informe telefone com DDD e 10 ou 11 dígitos."),
  neighborhood: z.string().trim().min(2, "Informe bairro ou comunidade."),
  addressExtra: z.string().trim().max(120, "Use até 120 caracteres."),
  consent: z
    .boolean()
    .refine(
      (value) => value,
      "O consentimento é necessário para esta demonstração.",
    ),
});

type ApplicantForm = z.infer<typeof applicantSchema>;
type DraftData = {
  applicant?: Partial<ApplicantForm>;
  quantities?: Partial<Record<WasteCategory, number>>;
  damaged?: boolean;
  safetyAcknowledged?: boolean;
  mode?: DeliveryMode;
  pointId?: string;
};
const stepNames = ["Seus dados", "O que descartar", "Entrega", "Voucher"];
const deliveryOptions: {
  mode: DeliveryMode;
  label: string;
  detail: string;
  pointId: string;
}[] = [
  {
    mode: "AGENCIA_CORREIOS_EIRUNEPE",
    label: "Agência dos Correios Eirunepé",
    detail: "Disponibilidade e condições a confirmar",
    pointId: "correios-demo",
  },
  {
    mode: "PONTO_COLETA_IFAM",
    label: "Ponto de coleta IFAM",
    detail: "Exemplo educacional, sem parceria confirmada",
    pointId: "ifam-demo",
  },
  {
    mode: "COLETA_COMUNITARIA",
    label: "Coleta comunitária",
    detail: "Datas e locais a divulgar",
    pointId: "comunidade-demo",
  },
  {
    mode: "PONTO_PARCEIRO",
    label: "Ponto parceiro",
    detail: "Pontos demonstrativos, sujeitos a validação",
    pointId: "parceiro-demo",
  },
];

function loadDraft(): DraftData {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.draft) ?? "{}",
    ) as DraftData;
  } catch {
    return {};
  }
}

function downloadQr() {
  const svg = document.querySelector<SVGElement>("#voucher-qr svg");
  if (!svg) return;
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: "image/svg+xml",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "voucher-simbolico-reee.svg";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function RequestWizard() {
  const storeVouchers = useAppStore((state) => state.vouchers);
  const addVoucher = useAppStore((state) => state.addVoucher);
  const draft = useMemo(loadDraft, []);
  const [step, setStep] = useState(0);
  const [quantities, setQuantities] = useState<
    Partial<Record<WasteCategory, number>>
  >(draft.quantities ?? {});
  const [damaged, setDamaged] = useState(draft.damaged ?? false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(
    draft.safetyAcknowledged ?? false,
  );
  const [mode, setMode] = useState<DeliveryMode | "">(draft.mode ?? "");
  const [pointId, setPointId] = useState(draft.pointId ?? "");
  const [voucher, setVoucher] = useState<VoucherRecord | null>(null);
  const [feedback, setFeedback] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const form = useForm<ApplicantForm>({
    resolver: zodResolver(applicantSchema),
    mode: "onTouched",
    defaultValues: {
      name: draft.applicant?.name ?? "",
      email: draft.applicant?.email ?? "",
      phone: draft.applicant?.phone ?? "",
      neighborhood: draft.applicant?.neighborhood ?? "",
      addressExtra: draft.applicant?.addressExtra ?? "",
      consent: draft.applicant?.consent ?? false,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      const current: DraftData = {
        ...loadDraft(),
        applicant: values as Partial<ApplicantForm>,
        quantities,
        damaged,
        safetyAcknowledged,
        mode: mode || undefined,
        pointId,
      };
      localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(current));
    });
    return () => subscription.unsubscribe();
  }, [form, quantities, damaged, safetyAcknowledged, mode, pointId]);

  const selectedItems = useMemo(
    () =>
      wasteCategories
        .filter((category) => (quantities[category] ?? 0) > 0)
        .map((category): WasteItem => ({
          category,
          quantity: quantities[category] ?? 0,
        })),
    [quantities],
  );
  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const hasDamagedBattery =
    damaged ||
    selectedItems.some((item) => item.category === "BATERIA_DANIFICADA");
  const selectedPoint = collectionPoints.find((point) => point.id === pointId);

  function setQuantity(category: WasteCategory, value: number) {
    setQuantities((current) => ({
      ...current,
      [category]: value <= 0 ? 0 : Math.min(50, Math.floor(value)),
    }));
  }

  function nextFromItems() {
    if (totalQuantity < 1) {
      setFeedback("Selecione pelo menos um item.");
      return;
    }
    if (totalQuantity > 50) {
      setFeedback("O limite é de 50 itens por solicitação.");
      return;
    }
    if (hasDamagedBattery && !safetyAcknowledged) {
      setFeedback("Confirme que leu as orientações para continuar.");
      return;
    }
    setFeedback("");
    setStep(2);
  }

  function createVoucher(applicant: Applicant) {
    if (!mode || !pointId) {
      setFeedback("Selecione um modo de entrega.");
      return;
    }
    const code = createVoucherCode(storeVouchers.map((record) => record.code));
    const createdAt = new Date().toISOString();
    const impact = calculateImpact(selectedItems);
    const checksum = makeChecksum(
      `${code}|${createdAt}|${JSON.stringify(selectedItems)}`,
    );
    const record: VoucherRecord = {
      code,
      createdAt,
      status: "SOLICITACAO_REGISTRADA",
      items: selectedItems,
      deliveryMode: mode,
      pointId,
      applicant,
      payloadQrCode: JSON.stringify({
        c: code,
        d: createdAt.slice(0, 10),
        p: pointId,
        h: checksum,
      }),
      impact,
      checksum,
      specialHandling: hasDamagedBattery,
      safetyAcknowledged,
    };
    addVoucher(record);
    setVoucher(record);
    setFeedback("Voucher simbólico criado neste navegador.");
    setStep(3);
    localStorage.removeItem(STORAGE_KEYS.draft);
  }

  function onSubmitApplicant(values: ApplicantForm) {
    if (step === 0) {
      setStep(1);
      setFeedback("");
      return;
    }
    createVoucher(values);
  }

  async function copyCode() {
    if (!voucher) return;
    try {
      await navigator.clipboard.writeText(voucher.code);
      setFeedback("Código copiado.");
    } catch {
      setFeedback(
        "Não foi possível copiar automaticamente; selecione o código para copiá-lo.",
      );
    }
  }

  return (
    <section className="animate-in">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DESCARTE CONSCIENTE, PASSO A PASSO</div>
          <h1>Solicitar descarte</h1>
          <p>
            Preencha os dados demonstrativos para gerar um voucher simbólico.
          </p>
        </div>
        <span className="tag tag-orange">
          <ShieldCheck size={13} /> DADOS LOCAIS NESTE NAVEGADOR
        </span>
      </div>
      <div className="wizard-layout">
        <form
          className="panel wizard-card"
          onSubmit={form.handleSubmit(onSubmitApplicant)}
          noValidate
        >
          <div className="stepper" aria-label={`Etapa ${step + 1} de 4`}>
            {stepNames.map((name, index) => (
              <div
                key={name}
                className={`step-item ${step === index ? "active" : ""} ${step > index ? "done" : ""}`}
                aria-current={step === index ? "step" : undefined}
              >
                <span className="step-circle">
                  {step > index ? <Check size={16} /> : index + 1}
                </span>
                <span>{name}</span>
              </div>
            ))}
          </div>

          {step === 0 && (
            <>
              <h2>Quem está solicitando?</h2>
              <p>
                Usamos estes dados somente para compor o voucher nesta
                demonstração. Evite inserir dados pessoais reais.
              </p>
              <div className="form-grid">
                <div className="form-field full">
                  <label className="field-label" htmlFor="applicant-name">
                    Nome completo *
                  </label>
                  <input
                    id="applicant-name"
                    className="form-control"
                    autoComplete="name"
                    {...form.register("name")}
                    placeholder="Ex.: Maria da Silva"
                  />
                  {form.formState.errors.name && (
                    <div className="field-error">
                      {form.formState.errors.name.message}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="applicant-email">
                    E-mail *
                  </label>
                  <input
                    id="applicant-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="form-control"
                    {...form.register("email")}
                    placeholder="voce@exemplo.com"
                  />
                  {form.formState.errors.email && (
                    <div className="field-error">
                      {form.formState.errors.email.message}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="applicant-phone">
                    Telefone com DDD *
                  </label>
                  <input
                    id="applicant-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="form-control"
                    {...form.register("phone", {
                      onChange: (event) =>
                        form.setValue(
                          "phone",
                          formatPhone(event.target.value),
                          { shouldValidate: true },
                        ),
                    })}
                    placeholder="(97) 99999-9999"
                  />
                  {form.formState.errors.phone && (
                    <div className="field-error">
                      {form.formState.errors.phone.message}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label
                    className="field-label"
                    htmlFor="applicant-neighborhood"
                  >
                    Bairro ou comunidade *
                  </label>
                  <input
                    id="applicant-neighborhood"
                    className="form-control"
                    autoComplete="address-level3"
                    {...form.register("neighborhood")}
                    placeholder="Campo livre em Eirunepé-AM"
                  />
                  {form.formState.errors.neighborhood && (
                    <div className="field-error">
                      {form.formState.errors.neighborhood.message}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="applicant-address">
                    Complemento do endereço
                  </label>
                  <input
                    id="applicant-address"
                    className="form-control"
                    autoComplete="address-line2"
                    {...form.register("addressExtra")}
                    placeholder="Referência ou complemento (opcional)"
                  />
                </div>
                <div className="form-field full">
                  <label className="checkbox-row">
                    <input type="checkbox" {...form.register("consent")} />
                    <span>
                      Consinto com o uso local destes dados para demonstrar a
                      solicitação, conforme a finalidade informada.{" "}
                      <button
                        className="subtle-link"
                        type="button"
                        onClick={() => setPrivacyOpen(true)}
                      >
                        Ler resumo de privacidade
                      </button>
                    </span>
                  </label>
                  {form.formState.errors.consent && (
                    <div className="field-error">
                      {form.formState.errors.consent.message}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2>O que você quer descartar?</h2>
              <p>
                Escolha as categorias e informe a quantidade. Limite de 50 itens
                por solicitação.
              </p>
              <div className="item-options">
                {wasteCategories.map((category) => (
                  <label key={category} className="item-option">
                    <input
                      type="checkbox"
                      checked={(quantities[category] ?? 0) > 0}
                      onChange={(event) =>
                        setQuantity(category, event.target.checked ? 1 : 0)
                      }
                    />
                    <span>{categoryLabels[category]}</span>
                    <input
                      aria-label={`Quantidade: ${categoryLabels[category]}`}
                      type="number"
                      min="1"
                      max="50"
                      value={quantities[category] || ""}
                      disabled={!quantities[category]}
                      onChange={(event) =>
                        setQuantity(category, Number(event.target.value))
                      }
                    />
                  </label>
                ))}
              </div>
              <p className="field-hint">
                Total selecionado: {totalQuantity} / 50 itens.
              </p>
              <label className="checkbox-row" style={{ margin: "12px 0" }}>
                <input
                  type="checkbox"
                  checked={damaged}
                  onChange={(event) => setDamaged(event.target.checked)}
                />
                <span>
                  O aparelho tem bateria estufada, vazada, quente ou rompida.
                </span>
              </label>
              {hasDamagedBattery && (
                <div className="notice notice-danger" role="alert">
                  <ShieldAlert size={20} />
                  <div>
                    <strong>Manuseio especial recomendado</strong>Não transporte
                    a bateria solta em bolso ou bolsa. Evite curto-circuito;
                    isole os terminais somente se for seguro e leve diretamente
                    a ponto adequado. Não perfure, aqueça ou descarte no lixo
                    comum.
                    <label className="checkbox-row safety-confirm">
                      <input
                        type="checkbox"
                        checked={safetyAcknowledged}
                        onChange={(event) =>
                          setSafetyAcknowledged(event.target.checked)
                        }
                      />
                      <span>Li e compreendi as orientações de segurança.</span>
                    </label>
                  </div>
                </div>
              )}
              {feedback && (
                <div className="field-error" role="alert">
                  {feedback}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h2>Como pretende entregar?</h2>
              <p>
                Disponibilidade e horários são exemplos e devem ser confirmados
                antes de qualquer deslocamento.
              </p>
              <div className="delivery-options">
                {deliveryOptions.map((option) => (
                  <label key={option.mode} className="delivery-option">
                    <input
                      type="radio"
                      name="delivery-mode"
                      checked={mode === option.mode}
                      onChange={() => {
                        setMode(option.mode);
                        setPointId(option.pointId);
                      }}
                    />
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.detail}</small>
                    </span>
                    <span className="tag tag-orange">Exemplo</span>
                  </label>
                ))}
              </div>
              {selectedPoint && (
                <div className="notice notice-info" style={{ marginTop: 14 }}>
                  <ShieldAlert size={17} />
                  <div>
                    <strong>{selectedPoint.name}</strong>
                    {selectedPoint.address}. {selectedPoint.note}
                  </div>
                </div>
              )}
              {feedback && (
                <div className="field-error" role="alert">
                  {feedback}
                </div>
              )}
            </>
          )}

          {step === 3 && voucher && (
            <>
              <div className="notice notice-success">
                <Check size={18} />
                <div>
                  <strong>Voucher simbólico gerado</strong>O código foi salvo
                  somente neste navegador. O rastreio é uma simulação.
                </div>
              </div>
              <article
                className="panel voucher-card"
                aria-label="Voucher simbólico de postagem"
              >
                <div className="voucher-topline">
                  <div>
                    <div className="eyebrow">
                      VOUCHER SIMBÓLICO / EDUCACIONAL
                    </div>
                    <div className="voucher-code">{voucher.code}</div>
                  </div>
                  <span className="tag tag-green">Não oficial</span>
                </div>
                <div className="voucher-qr" id="voucher-qr">
                  <QRCodeSVG
                    value={voucher.payloadQrCode}
                    size={152}
                    level="M"
                    includeMargin
                    aria-label={`QR Code do voucher ${voucher.code}`}
                  />
                  <span className="field-hint">QR Code demonstrativo</span>
                </div>
                <div className="voucher-details">
                  <div>
                    <small>Solicitante</small>
                    <strong>{voucher.applicant.name}</strong>
                  </div>
                  <div>
                    <small>Contato mascarado</small>
                    <strong>
                      {maskEmail(voucher.applicant.email)} ·{" "}
                      {maskPhone(voucher.applicant.phone)}
                    </strong>
                  </div>
                  <div>
                    <small>Itens</small>
                    <strong>
                      {voucher.items
                        .map(
                          (item) =>
                            `${item.quantity} × ${categoryLabels[item.category]}`,
                        )
                        .join(", ")}
                    </strong>
                  </div>
                  <div>
                    <small>Entrega</small>
                    <strong>{selectedPoint?.name ?? "Ponto de exemplo"}</strong>
                  </div>
                  <div>
                    <small>Criado em</small>
                    <strong>
                      {new Date(voucher.createdAt).toLocaleString("pt-BR")}
                    </strong>
                  </div>
                  <div>
                    <small>Estimativa de peso</small>
                    <strong>{voucher.impact.weightKg} kg · educativa</strong>
                  </div>
                </div>
                {voucher.specialHandling && (
                  <div
                    className="notice notice-danger"
                    style={{ marginTop: 14 }}
                  >
                    <ShieldAlert size={18} />
                    <div>
                      <strong>MANUSEIO ESPECIAL RECOMENDADO</strong>Confirmação
                      de ciência registrada nesta solicitação.
                    </div>
                  </div>
                )}
                <p className="voucher-warning">
                  Documento simbólico/educacional. Não substitui etiqueta
                  oficial dos Correios nem comprova coleta real sem integração
                  com operador licenciado.
                </p>
                <div className="voucher-actions no-print">
                  <button
                    className="button button-outline button-small"
                    type="button"
                    onClick={copyCode}
                  >
                    <Copy size={15} /> Copiar código
                  </button>
                  <button
                    className="button button-outline button-small"
                    type="button"
                    onClick={downloadQr}
                  >
                    <Download size={15} /> Baixar QR
                  </button>
                  <button
                    className="button button-primary button-small"
                    type="button"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} /> Imprimir / salvar PDF
                  </button>
                </div>
              </article>
              <p className="draft-label">
                Código de integridade local: {voucher.checksum}
              </p>
            </>
          )}

          {feedback && step !== 3 && (
            <div className="field-hint" role="status">
              {feedback}
            </div>
          )}
          {step < 3 && (
            <div className="wizard-actions">
              <button
                className="button button-outline"
                type="button"
                disabled={step === 0}
                onClick={() => {
                  setStep((current) => Math.max(0, current - 1));
                  setFeedback("");
                }}
              >
                <ArrowLeft size={15} /> Voltar
              </button>
              {step === 0 ? (
                <button className="button button-primary" type="submit">
                  Continuar <ArrowRight size={15} />
                </button>
              ) : step === 1 ? (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={nextFromItems}
                >
                  Continuar <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={form.handleSubmit(createVoucher)}
                >
                  Gerar voucher simbólico <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="wizard-actions no-print">
              <button
                className="button button-outline"
                type="button"
                onClick={() => {
                  setStep(0);
                  setVoucher(null);
                  setFeedback("");
                }}
              >
                Nova solicitação
              </button>
            </div>
          )}
        </form>
        <aside className="panel step-aside">
          <div className="eyebrow">ANTES DE CONTINUAR</div>
          <h3>Um descarte mais seguro</h3>
          <p>
            Prepare seu aparelho para proteger seus dados e facilitar uma
            destinação responsável.
          </p>
          <ul>
            <li>Faça backup e remova contas.</li>
            <li>Retire SIM e cartão de memória.</li>
            <li>Confira a orientação para baterias.</li>
          </ul>
          <div className="notice notice-info">
            <ShieldCheck size={17} />
            <div>
              <strong>Privacidade neste protótipo</strong>Os dados ficam no
              armazenamento local do seu navegador. Não são enviados a uma
              equipe ou operador.
            </div>
          </div>
        </aside>
      </div>
      {privacyOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setPrivacyOpen(false)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-privacy-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="form-privacy-title">Resumo de privacidade</h2>
            <p>
              Os campos são usados para montar uma demonstração de voucher e
              armazenados localmente neste navegador. Não insira dados pessoais
              reais. A versão não envia nem compartilha informações.
            </p>
            <p>
              Uma operação real exigiria aviso de privacidade revisado, base
              legal definida e controles de segurança conforme a LGPD (Lei nº
              13.709/2018).
            </p>
            <button
              className="button button-primary"
              onClick={() => setPrivacyOpen(false)}
            >
              Fechar
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
