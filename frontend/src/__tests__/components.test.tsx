import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceCard } from "../components/EvidenceCard";
import { MessageBubble } from "../components/MessageBubble";
import { GraphPath } from "../components/GraphPath";
import type { EvidenceItem, Message } from "../types";

describe("EvidenceCard Component", () => {
  it("renders ticket ID, action, and FAILED status accurately", () => {
    const item: EvidenceItem = {
      ticket_id: "T-101",
      issue: "Account Login Failure",
      attempt: "password_reset",
      outcome: "FAILED",
      notes: "SMS code expired",
    };

    render(<EvidenceCard item={item} />);

    expect(screen.getByText("Ticket T-101")).toBeDefined();
    expect(screen.getByText("FAILED")).toBeDefined();
    expect(screen.getByText(/password reset/i)).toBeDefined();
    expect(screen.getByText("SMS code expired")).toBeDefined();
  });

  it("renders RESOLVED outcome with appropriate badge", () => {
    const item: EvidenceItem = {
      ticket_id: "T-204",
      issue: "Billing Sync",
      attempt: "invoice_reissue",
      outcome: "RESOLVED",
    };

    render(<EvidenceCard item={item} />);

    expect(screen.getByText("Ticket T-204")).toBeDefined();
    expect(screen.getByText("RESOLVED")).toBeDefined();
  });
});

describe("MessageBubble Component", () => {
  it("renders grounded assistant answer, next step, and uncertainty boundary", () => {
    const message: Message = {
      id: "asst-1",
      sender: "assistant",
      text: "I reviewed your records and found that ticket T-101 failed.",
      timestamp: new Date().toISOString(),
      suggestedNextStep: "Check IAM account lock status.",
      uncertainty: "Root cause unconfirmed until IAM logs are checked.",
      isMock: true,
      evidence: [
        {
          ticket_id: "T-101",
          attempt: "password_reset",
          outcome: "FAILED",
        },
      ],
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText(/I reviewed your records/i)).toBeDefined();
    expect(screen.getByText("Check IAM account lock status.")).toBeDefined();
    expect(screen.getByText(/Root cause unconfirmed until IAM logs are checked/i)).toBeDefined();
    expect(screen.getByText("Demo Fixture")).toBeDefined();
    expect(screen.getByText(/Backed by 1 Neo4j Record/i)).toBeDefined();
  });

  it("renders customer messages distinctly without assistant metadata", () => {
    const message: Message = {
      id: "cust-1",
      sender: "customer",
      text: "My account still isn't working.",
      timestamp: new Date().toISOString(),
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText("My account still isn't working.")).toBeDefined();
    expect(screen.queryByText(/Demo Fixture/i)).toBeNull();
  });
});

describe("GraphPath Component", () => {
  it("renders truthful graph path when Neo4j evidence is present", () => {
    const evidence: EvidenceItem[] = [
      {
        ticket_id: "T-101",
        issue: "Account Login Failure",
        attempt: "password_reset",
        outcome: "FAILED",
      },
    ];

    render(
      <GraphPath
        evidence={evidence}
        suggestedNextStep="Inspect IAM Lock Status"
      />
    );

    expect(screen.getByText("Ticket T-101")).toBeDefined();
    expect(screen.getByText("Account Login Failure")).toBeDefined();
    expect(screen.getByText("password reset")).toBeDefined();
    expect(screen.getByText("FAILED")).toBeDefined();
    expect(screen.getByText("Inspect IAM Lock Status")).toBeDefined();
  });

  it("renders truthful empty message when zero evidence exists", () => {
    render(<GraphPath evidence={[]} />);
    expect(screen.getByText(/No graph relationships retrieved/i)).toBeDefined();
  });
});
