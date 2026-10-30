import { lazy, Suspense, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  Boxes,
  ChevronRight,
  ClipboardList,
  Leaf,
  MapPin,
  Menu,
  Recycle,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
const Overview = lazy(() => import("./features/Overview"));
const RequestWizard = lazy(() => import("./features/RequestWizard"));
const Tracking = lazy(() => import("./features/Tracking"));
const Partners = lazy(() => import("./features/Partners"));
const Education = lazy(() => import("./features/Education"));
const Points = lazy(() => import("./features/Points"));
const navigation = [
  { to: "/painel", label: "Visão geral", short: "Painel", icon: Activity },
  {
    to: "/solicitar",
    label: "Solicitar descarte",
    short: "Solicitar",
    icon: ClipboardList,
  },
  { to: "/pontos", label: "Pontos de coleta", short: "Pontos", icon: MapPin },
  {
    to: "/rastreio",
    label: "Acompanhar ciclo",
    short: "Rastreio",
    icon: Truck,
  },
  { to: "/parceiros", label: "Seja parceiro", short: "Parceiros", icon: Boxes },
  {
    to: "/educacao",
    label: "Educação e segurança",
    short: "Educação",
    icon: BookOpenCheck,
  },
];

function AppShell() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentPage = navigation.find((item) => item.to === location.pathname);

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink
          to="/painel"
          className="brand"
          aria-label="Eirunepé Recicla REEE, início"
        >
          <span className="brand-mark">
            <Recycle size={23} strokeWidth={2.2} />
          </span>
          <span className="brand-name">
            Eirunepé<span>Recicla REEE</span>
          </span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="header-privacy" onClick={() => setPrivacyOpen(true)}>
          <ShieldCheck size={17} /> Privacidade
        </button>
        <button
          className="icon-button mobile-menu-button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      {menuOpen && (
        <nav className="mobile-menu" aria-label="Menu principal">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} onClick={() => setMenuOpen(false)} to={to}>
              <Icon size={18} />
              {label}
              <ChevronRight size={16} />
            </NavLink>
          ))}
        </nav>
      )}
      <main className="main-content">
        <div className="page-kicker">
          <span className="kicker-dot" /> PROTÓTIPO COMUNITÁRIO{" "}
          <span className="kicker-divider">/</span> EIRUNEPÉ, AM
        </div>
        <Suspense
          fallback={
            <div className="loading-panel" role="status">
              Carregando módulo...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/painel" replace />} />
            <Route path="/painel" element={<Overview />} />
            <Route path="/solicitar" element={<RequestWizard />} />
            <Route path="/pontos" element={<Points />} />
            <Route path="/rastreio" element={<Tracking />} />
            <Route path="/parceiros" element={<Partners />} />
            <Route path="/educacao" element={<Education />} />
            <Route path="*" element={<Navigate to="/painel" replace />} />
          </Routes>
        </Suspense>
        <footer className="site-footer">
          <span>
            <Leaf size={15} /> Uma iniciativa demonstrativa de educação
            ambiental.
          </span>
          <button onClick={() => setPrivacyOpen(true)}>
            Privacidade e termos <ArrowUpRight size={14} />
          </button>
          <span className="footer-disclaimer">
            Sem operação oficial ou coleta confirmada nesta versão.
          </span>
        </footer>
      </main>
      <nav className="bottom-nav" aria-label="Navegação mobile">
        {navigation.map(({ to, short, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={short}
            className={({ isActive }) =>
              isActive ? "bottom-nav-item active" : "bottom-nav-item"
            }
          >
            <Icon size={20} />
            <span>{short}</span>
          </NavLink>
        ))}
      </nav>
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
            aria-labelledby="privacy-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Fechar"
              onClick={() => setPrivacyOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="eyebrow">SEUS DADOS, SEU CONTROLE</div>
            <h2 id="privacy-title">Privacidade e uso responsável</h2>
            <p>
              Este protótipo guarda solicitações, parceiros e checklist somente
              neste navegador. Não há envio a serviços externos nem operação de
              coleta real.
            </p>
            <p>
              Os dados inseridos são usados apenas para demonstrar os fluxos da
              plataforma. Evite inserir informações pessoais reais nesta versão
              educacional.
            </p>
            <p>
              O tratamento futuro deverá ser revisado por responsável legal e
              observar a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              Consulte o texto vigente em fonte oficial.
            </p>
            <button
              className="button button-primary"
              onClick={() => setPrivacyOpen(false)}
            >
              Entendi
            </button>
          </section>
        </div>
      )}
      {currentPage && (
        <span className="sr-only" aria-live="polite">
          Página: {currentPage.label}
        </span>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
