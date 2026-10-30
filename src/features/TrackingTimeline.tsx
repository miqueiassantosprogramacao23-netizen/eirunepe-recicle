import { Check, Circle, Factory, MapPin, Recycle, Truck } from "lucide-react";
import type { CycleStatus, TrackingEvent } from "../types";

const stages: { status: CycleStatus; label: string; icon: typeof Circle }[] = [
  {
    status: "SOLICITACAO_REGISTRADA",
    label: "Solicitação registrada",
    icon: Check,
  },
  {
    status: "ENTREGUE_PONTO_COLETA",
    label: "Entregue no ponto de coleta",
    icon: MapPin,
  },
  { status: "EM_TRANSPORTE", label: "Em transporte", icon: Truck },
  {
    status: "RECEBIDO_OPERADOR_AMBIENTAL",
    label: "Recebido por operador ambiental licenciado (simulado)",
    icon: Factory,
  },
  {
    status: "MATERIA_PRIMA_RECICLADA",
    label: "Matéria-prima reciclada e reinserida (simulado)",
    icon: Recycle,
  },
];

interface Props {
  events: TrackingEvent[];
  currentStatus: CycleStatus;
}

export default function TrackingTimeline({ events, currentStatus }: Props) {
  const currentIndex = stages.findIndex(
    (stage) => stage.status === currentStatus,
  );
  return (
    <div
      className="timeline"
      aria-label="Etapas demonstrativas do ciclo de logística reversa"
    >
      {stages.map((stage, index) => {
        const event = events.find((item) => item.status === stage.status);
        const completed = index <= currentIndex;
        const Icon = completed ? Check : stage.icon;
        return (
          <article
            className={`timeline-step ${completed ? "complete" : ""} ${index === currentIndex ? "current" : ""}`}
            key={stage.status}
            aria-current={index === currentIndex ? "step" : undefined}
          >
            <span className="timeline-symbol">
              <Icon size={16} aria-hidden="true" />
            </span>
            <div className="timeline-content">
              <h3>{stage.label}</h3>
              <p>
                {event?.description ?? "Etapa ainda não simulada."}{" "}
                {event?.simulatedLocation && (
                  <span>Local: {event.simulatedLocation}.</span>
                )}
              </p>
              {event && (
                <time dateTime={event.timestamp}>
                  {new Date(event.timestamp).toLocaleString("pt-BR")}
                </time>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
