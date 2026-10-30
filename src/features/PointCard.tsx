import { ExternalLink, MapPin, Navigation2 } from "lucide-react";
import type { CollectionPoint } from "../types";
import { categoryLabels } from "../utils/domain";

interface Props {
  point: CollectionPoint;
  selected: boolean;
  onSelect: () => void;
}

export default function PointCard({ point, selected, onSelect }: Props) {
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${point.latitude},${point.longitude}`)}`;
  return (
    <article className={`panel point-card ${selected ? "selected" : ""}`}>
      <div className="point-type">
        {point.type.replaceAll("_", " ").toLowerCase()} ·{" "}
        <span className="tag tag-orange">
          {point.verified ? "Verificado" : "A confirmar"}
        </span>
      </div>
      <h3>{point.name}</h3>
      <div className="point-meta">
        <span>
          <MapPin size={14} />
          {point.address}
        </span>
        <span>{point.hours}</span>
        <span>
          {point.verified
            ? "Localização confirmada"
            : "Localização aproximada; dados de exemplo"}
        </span>
        <span>
          Aceita:{" "}
          {point.acceptedCategories
            .map((category) => categoryLabels[category])
            .join(", ")}
        </span>
      </div>
      <p className="field-hint">{point.note}</p>
      <div className="point-actions">
        <button
          className="button button-secondary button-small"
          type="button"
          onClick={onSelect}
        >
          <MapPin size={14} /> Ver no mapa
        </button>
        <a
          className="button button-outline button-small"
          href={routeUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Navigation2 size={14} /> Obter rota <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
}
