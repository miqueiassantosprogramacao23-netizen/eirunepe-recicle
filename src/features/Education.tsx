import { useState } from "react";
import {
  BatteryWarning,
  Check,
  ChevronDown,
  Printer,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const questions = [
  {
    question: "O serviço é gratuito?",
    answer:
      "Este protótipo não realiza coleta nem prestação de serviço, portanto não cobra nem oferece gratuidade operacional. Valores e condições de um serviço futuro precisam ser confirmados com os responsáveis.",
  },
  {
    question: "Quais eletrônicos posso entregar?",
    answer:
      "As categorias mostradas são exemplos educativos: celulares, carregadores, cabos, baterias e pequenos eletroeletrônicos. A aceitação depende do ponto e de um operador responsável; confirme antes de se deslocar.",
  },
  {
    question: "O que são REEE?",
    answer:
      "Resíduos de equipamentos eletroeletrônicos são produtos descartados que dependem de manejo apropriado para reduzir riscos e possibilitar recuperação de materiais.",
  },
  {
    question: "Como funciona a logística reversa?",
    answer:
      "É um conjunto de ações e procedimentos para viabilizar a coleta e restituição de resíduos ao setor empresarial para reaproveitamento ou destinação ambientalmente adequada, conforme regras aplicáveis. Este protótipo apenas ilustra etapas.",
  },
  {
    question: "Meus dados estão protegidos?",
    answer:
      "Nesta versão demonstrativa, os dados ficam no armazenamento local do seu navegador e não são enviados a um servidor. Evite inserir dados pessoais reais. Isso não substitui uma política revisada nem controles de segurança para um serviço real.",
  },
  {
    question: "Qual a base legal e conceitual?",
    answer:
      "A Política Nacional de Resíduos Sólidos é tratada pela Lei nº 12.305/2010. O Decreto nº 10.240/2020 dispõe sobre a implementação de sistema de logística reversa de produtos eletroeletrônicos de uso doméstico e seus componentes. A LGPD é a Lei nº 13.709/2018. A aplicação não atesta conformidade legal.",
  },
];

export function FAQAccordion() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {questions.map((item, index) => {
        const expanded = openQuestion === index;
        const panelId = `faq-answer-${index}`;
        return (
          <article className="faq-item" key={item.question}>
            <h3 style={{ margin: 0 }}>
              <button
                className="faq-question"
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenQuestion(expanded ? null : index)}
              >
                {item.question}
                <ChevronDown size={17} aria-hidden="true" />
              </button>
            </h3>
            {expanded && (
              <div className="faq-answer" id={panelId} role="region">
                <p>{item.answer}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function Education() {
  const checklist = useAppStore((state) => state.checklist);
  const toggleTask = useAppStore((state) => state.toggleChecklistTask);
  const resetChecklist = useAppStore((state) => state.resetChecklist);
  const doneCount = checklist.filter((task) => task.completed).length;
  const percent = checklist.length
    ? Math.round((doneCount / checklist.length) * 100)
    : 0;

  return (
    <section className="animate-in">
      <div className="page-heading">
        <div>
          <div className="eyebrow">INFORMAÇÃO ANTES DO DESCARTE</div>
          <h1>Educação e segurança</h1>
          <p>
            Proteja seus dados e identifique cuidados importantes com
            eletroeletrônicos.
          </p>
        </div>
        <span className="tag tag-green">
          <ShieldCheck size={13} /> GUIA EDUCATIVO
        </span>
      </div>
      <div className="education-grid">
        <section
          className="panel checklist-panel"
          aria-labelledby="checklist-title"
        >
          <div className="eyebrow">PREPARE SEU APARELHO</div>
          <h2 id="checklist-title">Antes de descartar</h2>
          <p>
            Checklist salvo localmente neste navegador. O progresso pode ser
            impresso ou reiniciado.
          </p>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progresso do checklist"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="progress-value" style={{ width: `${percent}%` }} />
          </div>
          <div className="progress-caption">
            <span>
              {doneCount} de {checklist.length} tarefas
            </span>
            <strong>{percent}%</strong>
          </div>
          <div className="checklist-items">
            {checklist.map((task) => (
              <label
                key={task.id}
                className={`checklist-task ${task.completed ? "completed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.label}</span>
              </label>
            ))}
          </div>
          <div className="checklist-actions no-print">
            <button
              className="button button-outline button-small"
              type="button"
              onClick={resetChecklist}
            >
              <RotateCcw size={14} /> Reiniciar
            </button>
            <button
              className="button button-primary button-small"
              type="button"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Imprimir checklist
            </button>
          </div>
        </section>
        <aside className="safety-panel" role="alert">
          <BatteryWarning size={24} />
          <h2>Atenção às baterias</h2>
          <p>
            Baterias estufadas, vazadas, quentes ou danificadas podem oferecer
            risco.
          </p>
          <ul>
            <li>Não perfure, aqueça ou coloque no lixo comum.</li>
            <li>Não transporte solta no bolso ou na bolsa.</li>
            <li>
              Evite contato entre terminais; isole-os somente se for seguro.
            </li>
            <li>
              Leve a um ponto adequado assim que possível, confirmando antes o
              recebimento.
            </li>
          </ul>
          <p>
            Se estiver muito quente, fumegando ou com reação, afaste-se e acione
            os serviços de emergência locais.
          </p>
        </aside>
      </div>
      <section className="panel faq-panel" aria-labelledby="faq-title">
        <div className="eyebrow">PERGUNTAS FREQUENTES</div>
        <h2 id="faq-title">Entenda o processo</h2>
        <p>
          Respostas gerais; regras e disponibilidade devem ser confirmadas em
          fonte responsável.
        </p>
        <FAQAccordion />
        <div className="law-note">
          <strong>Referências legais:</strong> Lei nº 12.305/2010 (Política
          Nacional de Resíduos Sólidos), Decreto nº 10.240/2020 (sistema de
          logística reversa de eletroeletrônicos de uso doméstico) e LGPD, Lei
          nº 13.709/2018.{" "}
          <a
            href="https://www.planalto.gov.br/ccivil_03/"
            target="_blank"
            rel="noreferrer"
          >
            Consulte sempre o texto vigente no Portal da Legislação/Planalto e
            normas municipais/estaduais aplicáveis.
          </a>
        </div>
      </section>
      <div className="notice notice-info" style={{ marginTop: 14 }}>
        <Check size={17} />
        <div>
          A plataforma é um protótipo educacional. Não garante coleta oficial ou
          reciclagem sem convênio e evidência.
        </div>
      </div>
    </section>
  );
}
