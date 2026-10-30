import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleCheck,
  Leaf,
  MapPin,
  Recycle,
  Scale,
  Smartphone,
} from "lucide-react";
import { monthlyMetrics } from "../mocks/seed";
import { useAppStore } from "../store/useAppStore";

const periods = [
  { id: "6", label: "6 meses" },
  { id: "12", label: "12 meses" },
  { id: "year", label: "Ano atual" },
];

function exportCsv(rows: typeof monthlyMetrics) {
  const csv = [
    "Mês,Unidades estimadas,Peso estimado (kg)",
    ...rows.map((row) => `${row.month},${row.units},${row.weightKg}`),
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "eirunepe-recicla-metricas-demo.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function Overview() {
  const [period, setPeriod] = useState("6");
  const vouchers = useAppStore((state) => state.vouchers);
  const chartData = useMemo(() => {
    if (period === "6") return monthlyMetrics.slice(-6);
    if (period === "year") {
      return monthlyMetrics.filter(
        (metric) => metric.year === new Date().getFullYear(),
      );
    }
    return monthlyMetrics.slice(-12);
  }, [period]);
  const currentDate = new Date();
  const monthlyRequests = vouchers.filter((voucher) => {
    const createdAt = new Date(voucher.createdAt);
    return (
      createdAt.getFullYear() === currentDate.getFullYear() &&
      createdAt.getMonth() === currentDate.getMonth()
    );
  }).length;
  const metrics = [
    {
      label: "Aparelhos na demonstração",
      value: "1.240",
      detail: "unidades estimadas",
      icon: Smartphone,
      tone: "green",
    },
    {
      label: "Peso destinado",
      value: "380 kg",
      detail: "estimativa educativa",
      icon: Scale,
      tone: "blue",
    },
    {
      label: "CO₂ equivalente",
      value: "912 kg",
      detail: "potencialmente evitado",
      icon: Leaf,
      tone: "lime",
    },
    {
      label: "Metais pesados",
      value: "4,6 g",
      detail: "destinação potencial estimada",
      icon: Recycle,
      tone: "lime",
    },
    {
      label: "Pontos ativos",
      value: "0",
      detail: "4 exemplos sem confirmação",
      icon: MapPin,
      tone: "orange",
    },
    {
      label: "Solicitações neste mês",
      value: String(monthlyRequests),
      detail: "criadas neste navegador",
      icon: CircleCheck,
      tone: "green",
    },
  ];

  return (
    <section className="animate-in">
      <div className="overview-hero">
        <div className="hero-copy">
          <div className="eyebrow">CICLO CIRCULAR COMEÇA COM INFORMAÇÃO</div>
          <h1>
            Pequenas escolhas.
            <br />
            <span>Um futuro mais leve.</span>
          </h1>
          <p>
            Um espaço comunitário para aprender sobre descarte responsável de
            celulares e eletroeletrônicos em Eirunepé.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/solicitar">
              Iniciar solicitação <ArrowRight size={16} />
            </Link>
            <Link className="hero-text-link" to="/educacao">
              Preparar meu aparelho <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div
          className="hero-illustration"
          aria-label="Ilustração de ciclo de reaproveitamento eletrônico"
          role="img"
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="sun-disc" />
          <div className="device-card">
            <Smartphone size={58} strokeWidth={1.3} />
            <span>RE:USE</span>
          </div>
          <div className="leaf-stamp">
            <Recycle size={31} />
          </div>
          <div className="orbit-caption">REDUZIR · REUTILIZAR · RECICLAR</div>
        </div>
        <div className="hero-note">
          <span className="hero-note-mark">
            <Recycle size={16} />
          </span>
          <span>
            <strong>Um protótipo educativo</strong>
            <small>Sem coleta oficial ou integração nesta versão</small>
          </span>
        </div>
      </div>

      <div className="section-title-row">
        <div>
          <div className="eyebrow">IMPACTO EM NÚMEROS</div>
          <h2>Uma visão do ciclo</h2>
        </div>
        <span className="tag">
          <span className="pulse-dot" /> DADOS SIMULADOS
        </span>
      </div>
      <div className="metric-grid">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className="metric-card panel" key={label}>
            <div className={`metric-icon ${tone}`}>
              <Icon size={18} />
            </div>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            <div className="metric-detail">{detail}</div>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel chart-panel" aria-labelledby="chart-title">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">MOVIMENTO DEMONSTRATIVO</div>
              <h2 id="chart-title">Materiais no ciclo</h2>
            </div>
            <div className="chart-controls">
              <label className="sr-only" htmlFor="chart-period">
                Período do gráfico
              </label>
              <select
                id="chart-period"
                className="form-control compact-select"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                {periods.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className="icon-button"
                aria-label="Exportar métricas CSV"
                title="Exportar CSV"
                onClick={() => exportCsv(chartData)}
              >
                <ArrowDownToLine size={17} />
              </button>
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-swatch units" /> Unidades
            </span>
            <span>
              <i className="legend-swatch weight" /> Peso (kg)
            </span>
          </div>
          <div
            className="chart-wrap"
            role="img"
            aria-label="Gráfico demonstrativo de unidades e peso coletado por mês. Os valores são simulados."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#edf0ed" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#78827a", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#78827a", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "#f4f7f3" }}
                  contentStyle={{
                    border: "1px solid #e4e9e5",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="units"
                  name="Unidades"
                  fill="#2e7d32"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="weightKg"
                  name="Peso (kg)"
                  fill="#9acb74"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="method-note">
            Série fictícia para demonstração; não representa coleta confirmada
            no município.
          </p>
        </section>
        <aside className="side-column">
          <section className="panel explore-panel">
            <div className="explore-top">
              <span className="explore-icon">
                <MapPin size={20} />
              </span>
              <span className="tag tag-orange">A CONFIRMAR</span>
            </div>
            <h3>Onde entregar?</h3>
            <p>
              Consulte pontos de exemplo e confirme as informações diretamente
              antes de se deslocar.
            </p>
            <Link className="text-action" to="/pontos">
              Explorar pontos <ArrowRight size={15} />
            </Link>
          </section>
          <section className="community-panel">
            <div className="community-icon">
              <Boxes size={21} />
            </div>
            <div>
              <h3>Faça parte da mudança</h3>
              <p>
                Cadastre uma instituição como interessada. A validação é feita
                fora deste protótipo.
              </p>
              <Link to="/parceiros">
                Conhecer parcerias <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
      <div className="dashboard-disclaimer">
        <Leaf size={17} />
        <span>
          <strong>Estimativas educativas, sem certificação.</strong> Fatores
          simplificados não substituem laudo técnico nem comprovam destinação.
          Os dados agregados são mockados.
        </span>
      </div>
    </section>
  );
}
