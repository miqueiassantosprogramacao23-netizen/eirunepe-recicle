import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinned, Search } from "lucide-react";
import { collectionPoints } from "../mocks/seed";
import { categoryLabels, wasteCategories } from "../utils/domain";
import PointCard from "./PointCard";

export { PointCard };

export default function Points() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState(collectionPoints[0]?.id ?? "");
  const filteredPoints = useMemo(
    () =>
      collectionPoints.filter((point) => {
        const search = query.trim().toLocaleLowerCase("pt-BR");
        const matchesText =
          !search ||
          `${point.name} ${point.address}`
            .toLocaleLowerCase("pt-BR")
            .includes(search);
        return (
          matchesText &&
          (!category ||
            point.acceptedCategories.includes(
              category as (typeof wasteCategories)[number],
            ))
        );
      }),
    [category, query],
  );

  return (
    <section className="animate-in">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PRESENÇA LOCAL, A CONFIRMAR</div>
          <h1>Pontos de coleta</h1>
          <p>
            Consulte locais de exemplo. Confirme endereço, horário e aceitação
            antes de se deslocar.
          </p>
        </div>
        <span className="tag tag-orange">
          <MapPinned size={13} /> DADOS NÃO VERIFICADOS
        </span>
      </div>
      <div className="points-toolbar">
        <label className="sr-only" htmlFor="point-search">
          Buscar ponto por nome ou endereço
        </label>
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 14,
              left: 12,
              color: "#87918a",
            }}
          />
          <input
            id="point-search"
            className="form-control"
            style={{ paddingLeft: 36 }}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome ou endereço"
          />
        </div>
        <label>
          <span className="sr-only">Filtrar por resíduo aceito</span>
          <select
            className="form-control"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Todas as categorias</option>
            {wasteCategories.map((item) => (
              <option key={item} value={item}>
                {categoryLabels[item]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="notice notice-warning" style={{ marginBottom: 14 }}>
        <MapPinned size={18} />
        <div>
          <strong>Mapa ilustrativo</strong>Endereços, horários, coordenadas e
          parcerias são placeholders. Não há ponto confirmado ou credenciado por
          esta aplicação.
        </div>
      </div>
      <div className="points-layout">
        <div className="point-list" aria-label="Lista de pontos demonstrativos">
          {filteredPoints.length ? (
            filteredPoints.map((point) => (
              <PointCard
                key={point.id}
                point={point}
                selected={selectedId === point.id}
                onSelect={() => setSelectedId(point.id)}
              />
            ))
          ) : (
            <div className="panel empty-state">
              <Search size={25} />
              <h3>Nenhum ponto nesta busca</h3>
              <p>Altere o termo ou remova o filtro de categoria.</p>
            </div>
          )}
        </div>
        <section
          className="panel map-panel"
          aria-label="Mapa aproximado de Eirunepé, Amazonas"
        >
          <div className="map-caption">
            <strong>Eirunepé-AM · localização aproximada</strong>Pinos são
            exemplos, não endereços confirmados.
          </div>
          <MapContainer
            center={[-6.6597, -69.8734]}
            zoom={14}
            scrollWheelZoom={false}
            aria-label="Mapa OpenStreetMap de Eirunepé"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={
                import.meta.env.VITE_MAP_TILES_URL ||
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />
            {filteredPoints.map((point, index) => (
              <CircleMarker
                key={point.id}
                center={[
                  point.latitude + index * 0.0007,
                  point.longitude + index * 0.0007,
                ]}
                radius={selectedId === point.id ? 11 : 8}
                pathOptions={{
                  color: selectedId === point.id ? "#1b5e20" : "#0288d1",
                  fillColor: selectedId === point.id ? "#2e7d32" : "#65b8de",
                  fillOpacity: 0.9,
                  weight: 2,
                }}
                eventHandlers={{ click: () => setSelectedId(point.id) }}
              >
                <Popup>
                  <strong>{point.name}</strong>
                  <br />
                  Localização aproximada
                  <br />
                  {point.address}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </section>
      </div>
    </section>
  );
}
