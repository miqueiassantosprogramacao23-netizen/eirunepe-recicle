import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "../store/useAppStore";
import { collectionPoints, demoTrackingEvents } from "../mocks/seed";
import type { ChecklistTask } from "../types";
import RequestWizard from "./RequestWizard";
import Education, { FAQAccordion } from "./Education";
import PointCard from "./PointCard";
import TrackingTimeline from "./TrackingTimeline";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("interactive components", () => {
  it("validates required fields before advancing the request wizard", async () => {
    const user = userEvent.setup();
    render(<RequestWizard />);
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(
      await screen.findByText("Informe seu nome completo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
  });

  it("creates a symbolic voucher from the four-step wizard", async () => {
    const user = userEvent.setup();
    render(<RequestWizard />);
    await user.type(
      screen.getByLabelText("Nome completo *"),
      "Pessoa de Teste",
    );
    await user.type(screen.getByLabelText("E-mail *"), "teste@example.com");
    await user.type(screen.getByLabelText("Telefone com DDD *"), "97999991234");
    await user.type(screen.getByLabelText("Bairro ou comunidade *"), "Centro");
    await user.click(
      screen.getByRole("checkbox", { name: /consinto com o uso local/i }),
    );
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(screen.getByLabelText("Celular ou smartphone"));
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(screen.getByLabelText(/Agência dos Correios Eirunepé/));
    await user.click(
      screen.getByRole("button", { name: /gerar voucher simbólico/i }),
    );
    expect(await screen.findByText("REEE-EIR-2026-0001")).toBeInTheDocument();
    expect(
      screen.getByText(/não substitui etiqueta oficial/i),
    ).toBeInTheDocument();
  });

  it("toggles FAQ answers with accessible expanded state", async () => {
    const user = userEvent.setup();
    render(<FAQAccordion />);
    const answerButton = screen.getByRole("button", {
      name: "O serviço é gratuito?",
    });
    expect(answerButton).toHaveAttribute("aria-expanded", "true");
    await user.click(answerButton);
    expect(answerButton).toHaveAttribute("aria-expanded", "false");
  });

  it("shows point status and triggers map selection", async () => {
    const user = userEvent.setup();
    const point = collectionPoints[0];
    const onSelect = vi.fn();
    render(<PointCard point={point} selected={false} onSelect={onSelect} />);
    expect(screen.getByText("A confirmar")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /ver no mapa/i }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("renders simulated tracking stages and highlights the current step", () => {
    render(
      <TrackingTimeline
        events={demoTrackingEvents("REEE-EIR-2026-0001")}
        currentStatus="EM_TRANSPORTE"
      />,
    );
    const currentStage = screen.getByText("Em transporte").closest("article");
    expect(currentStage).toHaveAttribute("aria-current", "step");
    expect(
      screen.getByText("Matéria-prima reciclada e reinserida (simulado)"),
    ).toBeInTheDocument();
  });

  it("persists checklist interactions through the shared store", () => {
    const checklist: ChecklistTask[] = [
      { id: "backup", label: "Fazer backup", completed: false },
    ];
    useAppStore.setState({ checklist });
    const task = useAppStore.getState().checklist[0];
    useAppStore.getState().toggleChecklistTask(task.id);
    expect(useAppStore.getState().checklist[0].completed).toBe(true);
  });

  it("updates the visible checklist progress when a task is checked", async () => {
    useAppStore.getState().resetChecklist();
    const user = userEvent.setup();
    render(<Education />);
    await user.click(
      screen.getByRole("checkbox", { name: /fazer backup de fotos/i }),
    );
    expect(screen.getByText("1 de 6 tarefas")).toBeInTheDocument();
  });
});
