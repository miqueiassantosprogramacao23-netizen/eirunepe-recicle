import { useState, type FormEvent } from "react";
import { Check, Handshake, ShieldAlert } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { Partner, WasteCategory } from "../types";
import {
  categoryLabels,
  isValidCpfCnpj,
  isValidEmail,
  isValidPhone,
  wasteCategories,
} from "../utils/domain";

const initialTypes: Partner["partnershipType"][] = [
  "PONTO_DE_ENTREGA",
  "PONTO_DE_DIVULGACAO",
];

export default function Partners() {
  const partners = useAppStore((state) => state.partners);
  const addPartner = useAppStore((state) => state.addPartner);
  const [partnershipType, setPartnershipType] = useState<
    Partner["partnershipType"]
  >(initialTypes[0]);
  const [selectedCategories, setSelectedCategories] = useState<WasteCategory[]>(
    [],
  );
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function toggleCategory(category: WasteCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  }

  function submitPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const institutionName = String(data.get("institutionName") ?? "").trim();
    const document = String(data.get("document") ?? "").trim();
    const contactName = String(data.get("contactName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    const hours = String(data.get("hours") ?? "").trim();
    const acceptedTerms = data.get("acceptedTerms") === "on";
    if (
      institutionName.length < 2 ||
      contactName.length < 3 ||
      address.length < 3
    ) {
      setError("Preencha instituição, responsável e endereço em Eirunepé-AM.");
      return;
    }
    if (!isValidCpfCnpj(document)) {
      setError(
        "Informe CPF ou CNPJ válido. Não use dados reais neste protótipo.",
      );
      return;
    }
    if (!isValidEmail(email) || !isValidPhone(phone)) {
      setError("Confira o e-mail e o telefone com DDD.");
      return;
    }
    if (
      partnershipType === "PONTO_DE_ENTREGA" &&
      (!selectedCategories.length || hours.length < 3)
    ) {
      setError(
        "Para ponto de entrega, informe ao menos uma categoria e um horário de exemplo.",
      );
      return;
    }
    if (!acceptedTerms) {
      setError("É necessário aceitar os termos de uso e privacidade.");
      return;
    }
    const partner: Partner = {
      id: crypto.randomUUID(),
      institutionName,
      document:
        document.replace(/\D/g, "").length === 11
          ? "CPF mascarado"
          : "CNPJ mascarado",
      contactName,
      email,
      phone,
      address,
      partnershipType,
      categories:
        partnershipType === "PONTO_DE_ENTREGA" ? selectedCategories : [],
      hours: partnershipType === "PONTO_DE_ENTREGA" ? hours : "",
      acceptedTerms,
      status: "PENDENTE_VALIDACAO",
    };
    addPartner(partner);
    setFeedback(
      "Cadastro demonstrativo salvo neste navegador. O status permanece pendente de validação.",
    );
    event.currentTarget.reset();
    setSelectedCategories([]);
    setPartnershipType("PONTO_DE_ENTREGA");
  }

  return (
    <section className="animate-in">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PARTICIPAÇÃO COMUNITÁRIA</div>
          <h1>Seja parceiro</h1>
          <p>
            Registre interesse de uma instituição. O cadastro não credencia nem
            aprova pontos automaticamente.
          </p>
        </div>
        <span className="tag tag-orange">
          <Handshake size={13} /> VALIDAÇÃO MANUAL
        </span>
      </div>
      <div className="partner-layout">
        <form
          className="panel partner-form"
          onSubmit={submitPartner}
          noValidate
        >
          <h2>Dados da instituição</h2>
          <p>
            Use informações de teste nesta versão. O cadastro será armazenado
            apenas neste navegador.
          </p>
          <div className="form-grid">
            <div className="form-field full">
              <label className="field-label" htmlFor="partner-name">
                Nome da instituição ou empresa *
              </label>
              <input
                id="partner-name"
                name="institutionName"
                required
                className="form-control"
                autoComplete="organization"
                placeholder="Ex.: Instituição demonstrativa"
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="partner-document">
                CPF ou CNPJ *
              </label>
              <input
                id="partner-document"
                name="document"
                required
                inputMode="numeric"
                className="form-control"
                placeholder="Somente números ou formato"
              />
              <div className="field-hint">
                Validação local de dígitos; não informe documento real.
              </div>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="partner-contact">
                Nome do responsável *
              </label>
              <input
                id="partner-contact"
                name="contactName"
                required
                autoComplete="name"
                className="form-control"
                placeholder="Nome para contato"
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="partner-email">
                E-mail *
              </label>
              <input
                id="partner-email"
                name="email"
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                className="form-control"
                placeholder="contato@exemplo.com"
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="partner-phone">
                Telefone com DDD *
              </label>
              <input
                id="partner-phone"
                name="phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="form-control"
                placeholder="(97) 99999-9999"
              />
            </div>
            <div className="form-field full">
              <label className="field-label" htmlFor="partner-address">
                Endereço em Eirunepé-AM *
              </label>
              <input
                id="partner-address"
                name="address"
                required
                className="form-control"
                autoComplete="street-address"
                placeholder="Endereço para validação posterior"
              />
            </div>
            <div className="form-field full">
              <span className="field-label">Tipo de parceria *</span>
              <div className="delivery-options">
                {[
                  ["PONTO_DE_ENTREGA", "Ponto de entrega"],
                  ["PONTO_DE_DIVULGACAO", "Ponto de divulgação"],
                ].map(([value, label]) => (
                  <label className="delivery-option" key={value}>
                    <input
                      type="radio"
                      name="partnershipType"
                      checked={partnershipType === value}
                      onChange={() =>
                        setPartnershipType(value as Partner["partnershipType"])
                      }
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>
                        {value === "PONTO_DE_ENTREGA"
                          ? "Possível recebimento, sujeito a validação e acordos."
                          : "Apoio a ações de informação e educação."}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {partnershipType === "PONTO_DE_ENTREGA" && (
              <>
                <div className="form-field full">
                  <span className="field-label">
                    Categorias que pretende aceitar *
                  </span>
                  <div className="item-options">
                    {wasteCategories.map((category) => (
                      <label className="checkbox-row" key={category}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                        />
                        <span>{categoryLabels[category]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-field full">
                  <label className="field-label" htmlFor="partner-hours">
                    Horários pretendidos *
                  </label>
                  <input
                    id="partner-hours"
                    name="hours"
                    className="form-control"
                    placeholder="Ex.: dias úteis, horário a confirmar"
                  />
                </div>
              </>
            )}
            <div className="form-field full">
              <label className="checkbox-row">
                <input type="checkbox" name="acceptedTerms" />
                <span>
                  Li os termos e a política de privacidade resumida. Entendo que
                  o cadastro é uma manifestação de interesse, não uma aprovação
                  automática.
                </span>
              </label>
            </div>
          </div>
          {error && (
            <div className="field-error" role="alert" style={{ marginTop: 14 }}>
              {error}
            </div>
          )}
          {feedback && (
            <div
              className="notice notice-success"
              role="status"
              style={{ marginTop: 14 }}
            >
              <Check size={17} />
              <div>{feedback}</div>
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            <button className="button button-primary" type="submit">
              Enviar interesse <Handshake size={16} />
            </button>
          </div>
        </form>
        <aside className="partner-side">
          <section className="panel partner-status-card">
            <div className="eyebrow">PRÓXIMA ETAPA</div>
            <h3>Validação antes de qualquer operação</h3>
            <p>
              Os registros locais não são enviados a uma equipe. Em operação
              real, seria necessário validar documentação, endereço, capacidade
              e acordos ambientais.
            </p>
            {partners.length > 0 && (
              <div
                className="partner-list"
                aria-label="Parceiros cadastrados neste navegador"
              >
                {partners.map((partner) => (
                  <div className="partner-list-row" key={partner.id}>
                    <strong>{partner.institutionName}</strong>
                    <span>Pendente de validação</span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <div className="notice notice-warning">
            <ShieldAlert size={18} />
            <div>
              <strong>Sem credenciamento oficial</strong>Este protótipo não
              representa parceria com órgão público, instituto, transportadora
              ou operador ambiental.
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
