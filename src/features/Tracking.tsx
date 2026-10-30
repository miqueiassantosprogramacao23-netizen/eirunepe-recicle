import { useState } from "react";
import { ArrowRight, Leaf, Search, ShieldAlert, Sparkles } from "lucide-react";
import { demoTrackingEvents } from "../mocks/seed";
import { useAppStore } from "../store/useAppStore";
import type { CycleStatus, VoucherRecord } from "../types";
import {
  calculateImpact,
  isValidTrackingCode,
  normalizeTrackingCode,
} from "../utils/domain";
import { findVoucher } from "../services/storage";
import TrackingTimeline from "./TrackingTimeline";

const DEMO_CODE = "REEE-EIR-2026-0001";

export default function Tracking() {
  const vouchers = useAppStore((state) => state.vouchers);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    code: string;
    events: ReturnType<typeof demoTrackingEvents>;
    status: CycleStatus;
    record?: VoucherRecord;
  } | null>(null);
  const [error, setError] = useState("");

  function searchCode(value = query) {
    const code = normalizeTrackingCode(value);
    setQuery(code);
    setResult(null);
    if (!isValidTrackingCode(code)) {
      setError("Confira o formato: REEE-EIR-AAAA-0001.");
      return;
    }
    const stored = findVoucher(vouchers, code);
    if (stored) {
      setResult({
        code,
        events: [
          {
            code,
            status: stored.status,
            timestamp: stored.createdAt,
            simulatedLocation: "Solicitação local",
            description:
              "Voucher criado neste navegador. Não representa entrega ou coleta real.",
          },
        ],
        status: stored.status,
        record: stored,
      });
      setError("");
      return;
    }
    if (code === DEMO_CODE) {
      const events = demoTrackingEvents(code);
      setResult({ code, events, status: "MATERIA_PRIMA_RECICLADA" });
      setError("");
      return;
    }
    setError(
      "Não encontramos este código neste navegador. Você pode testar o código demonstrativo abaixo.",
    );
  }

  const impact =
    result?.record?.impact ??
    (result
      ? calculateImpact([
          { category: "CELULAR", quantity: 2 },
          { category: "CARREGADOR", quantity: 1 },
        ])
      : null);

  return (
    <section className="animate-in">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ACOMPANHAMENTO EDUCATIVO</div>
          <h1>Acompanhar ciclo</h1>
          <p>
            Consulte as etapas demonstrativas de um voucher e entenda a cadeia
            circular.
          </p>
        </div>
        <span className="tag tag-orange">
          <Sparkles size={13} /> SIMULAÇÃO
        </span>
      </div>
      <form
        className="tracking-search"
        onSubmit={(event) => {
          event.preventDefault();
          searchCode();
        }}
      >
        <label className="sr-only" htmlFor="tracking-code">
          Código do voucher
        </label>
        <input
          id="tracking-code"
          className="form-control"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite um código, ex.: REEE-EIR-2026-0001"
        />
        <button className="button button-primary" type="submit">
          <Search size={16} /> Consultar código
        </button>
      </form>
      <div className="tracking-demo-row">
        <span>Código para demonstração:</span>
        <button
          type="button"
          onClick={() => {
            setQuery(DEMO_CODE);
            searchCode(DEMO_CODE);
          }}
        >
          {DEMO_CODE}
        </button>
      </div>
      {error && (
        <div
          className="notice notice-warning"
          role="alert"
          style={{ marginTop: 16 }}
        >
          <ShieldAlert size={18} />
          <div>{error}</div>
        </div>
      )}
      {!result && !error && (
        <div className="panel empty-state" style={{ marginTop: 18 }}>
          <Search size={28} />
          <h3>O ciclo começa com uma consulta</h3>
          <p>
            Digite o código de um voucher criado neste navegador ou use o código
            demonstrativo.
          </p>
        </div>
      )}
      {result && impact && (
        <>
          <div
            className="notice notice-info"
            role="status"
            style={{ marginTop: 18 }}
          >
            <ShieldAlert size={18} />
            <div>
              <strong>Rastreamento demonstrativo</strong>As etapas abaixo são
              dados simulados e não comprovam entrega, recebimento por operador
              ou reciclagem.
            </div>
          </div>
          <div className="tracking-layout">
            <section className="panel timeline-panel">
              <div className="eyebrow">CÓDIGO CONSULTADO</div>
              <h2>{result.code}</h2>
              <p className="timeline-intro">
                Ciclo circular ilustrativo, sem integração a transportadora ou
                operador ambiental.
              </p>
              <TrackingTimeline
                events={result.events}
                currentStatus={result.status}
              />
            </section>
            <aside className="panel impact-panel">
              <div className="eyebrow">ESTIMATIVA EDUCATIVA</div>
              <h2>Impacto potencial</h2>
              <div className="impact-value">{impact.weightKg} kg</div>
              <div className="impact-caption">peso estimado de REEE</div>
              <div className="divider" />
              <div className="impact-rows">
                <div className="impact-row">
                  <span>CO₂ equivalente</span>
                  <strong>{impact.co2AvoidedKg} kg</strong>
                </div>
                <div className="impact-row">
                  <span>Água potencialmente protegida</span>
                  <strong>{impact.waterLiters} L</strong>
                </div>
                <div className="impact-row">
                  <span>Metais pesados com destinação adequada</span>
                  <strong>{impact.heavyMetalsGrams} g</strong>
                </div>
              </div>
              <p className="method-note">
                Fatores simplificados para fins educativos; não são medição,
                laudo ambiental ou certificação. Para voucher local, a
                estimativa é calculada a partir das categorias informadas.
              </p>
              <div className="notice notice-warning" style={{ marginTop: 15 }}>
                <Leaf size={17} />
                <div>
                  Não há comprovação de que o material foi efetivamente recebido
                  ou reciclado.
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
      <p className="field-hint" style={{ marginTop: 19 }}>
        <ArrowRight size={13} /> Códigos e dados criados localmente permanecem
        no armazenamento deste navegador.
      </p>
    </section>
  );
}
