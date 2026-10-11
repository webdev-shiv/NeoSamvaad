import type { CustomerProfile } from "../types";
import { DEMO_CUSTOMERS } from "../services/mockData";
import { Users, UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, Key } from "lucide-react";

interface CustomerSelectorProps {
  selectedCustomer: CustomerProfile;
  onSelectCustomer: (customer: CustomerProfile) => void;
  customIdInput: string;
  onCustomIdChange: (id: string) => void;
  onApplyCustomId: () => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onSelectCustomer,
  customIdInput,
  onCustomIdChange,
  onApplyCustomId,
}) => {
  const getScenarioIcon = (scenarioLabel?: string) => {
    if (!scenarioLabel) return <Users size={16} />;
    if (scenarioLabel.includes("Scenario A")) return <AlertTriangle size={16} color="#ef4444" />;
    if (scenarioLabel.includes("Scenario B")) return <Key size={16} color="#f59e0b" />;
    if (scenarioLabel.includes("Scenario C")) return <CheckCircle2 size={16} color="#10b981" />;
    if (scenarioLabel.includes("Scenario D")) return <ShieldAlert size={16} color="#ec4899" />;
    return <UserCheck size={16} color="#8b5cf6" />;
  };

  return (
    <aside
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        padding: "16px",
      }}
      aria-label="Customer Selection Panel"
    >
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", marginBottom: "4px" }}>
          Active Customer Context
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Select a verified persona to test graph evidence grounding.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {DEMO_CUSTOMERS.map((cust) => {
          const isSelected = selectedCustomer.id === cust.id;
          return (
            <button
              key={cust.id}
              onClick={() => onSelectCustomer(cust)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: isSelected ? "var(--bg-surface-elevated)" : "transparent",
                border: isSelected ? "1px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {getScenarioIcon(cust.scenarioLabel)}
                  <span style={{ fontSize: "13px", fontWeight: 600, color: isSelected ? "var(--text-main)" : "var(--text-muted)" }}>
                    {cust.id}
                  </span>
                </div>
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "var(--border-subtle)", color: "var(--text-dim)" }}>
                  {cust.tier}
                </span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-main)", marginBottom: "2px" }}>
                {cust.name}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: "1.3" }}>
                {cust.description}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
        <label htmlFor="custom-cust-id" style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
          Or Enter Customer ID manually:
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            id="custom-cust-id"
            type="text"
            value={customIdInput}
            onChange={(e) => onCustomIdChange(e.target.value)}
            placeholder="e.g. CUST-999"
            style={{
              flex: 1,
              padding: "6px 10px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-highlight)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-main)",
              fontSize: "12px",
            }}
          />
          <button
            onClick={onApplyCustomId}
            style={{
              padding: "6px 12px",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-main)",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Set
          </button>
        </div>
      </div>
    </aside>
  );
};
