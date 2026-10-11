import { useState } from "react";
import type { CustomerProfile } from "../types";
import { DEMO_CUSTOMERS } from "../services/mockData";
import { Users, UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, Key, Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = DEMO_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.scenarioLabel && c.scenarioLabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getScenarioIcon = (scenarioLabel?: string) => {
    if (!scenarioLabel) return <Users size={15} />;
    if (scenarioLabel.includes("Scenario A")) return <AlertTriangle size={15} color="#ef4444" />;
    if (scenarioLabel.includes("Scenario B")) return <Key size={15} color="#f59e0b" />;
    if (scenarioLabel.includes("Scenario C")) return <CheckCircle2 size={15} color="#10b981" />;
    if (scenarioLabel.includes("Scenario D")) return <ShieldAlert size={15} color="#ec4899" />;
    return <UserCheck size={15} color="#8b5cf6" />;
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
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-primary)" }}>
            Customer Personas
          </h2>
          <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: 600 }}>
            {DEMO_CUSTOMERS.length} Scenarios
          </span>
        </div>
        <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
          Select a verified profile to test truthful graph-grounded reasoning.
        </p>
      </div>

      {/* Persona Search Filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "12px",
        }}
      >
        <Search size={14} color="var(--text-dim)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter persona or scenario..."
          style={{
            background: "none",
            border: "none",
            color: "var(--text-main)",
            fontSize: "12px",
            outline: "none",
            width: "100%",
          }}
          aria-label="Filter customer personas"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {filteredCustomers.map((cust) => {
          const isSelected = selectedCustomer.id === cust.id;
          return (
            <button
              key={cust.id}
              onClick={() => onSelectCustomer(cust)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "11px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: isSelected ? "var(--bg-surface-elevated)" : "rgba(255, 255, 255, 0.015)",
                border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                boxShadow: isSelected ? "0 0 16px rgba(99, 102, 241, 0.18)" : "none",
                cursor: "pointer",
                textAlign: "left",
                position: "relative",
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "12px",
                    bottom: "12px",
                    width: "3px",
                    backgroundColor: "var(--accent-primary)",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  {getScenarioIcon(cust.scenarioLabel)}
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: isSelected ? "var(--text-main)" : "var(--text-muted)" }}>
                    {cust.id}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: "var(--radius-xs)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-dim)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {cust.tier}
                </span>
              </div>

              <div style={{ fontSize: "12px", fontWeight: 600, color: isSelected ? "var(--accent-cyan)" : "var(--text-main)", marginBottom: "3px" }}>
                {cust.name}
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: "1.3" }}>
                {cust.description}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
        <label htmlFor="custom-cust-id" style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
          Custom Customer Lookup:
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
              padding: "7px 10px",
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
              padding: "7px 12px",
              background: "var(--grad-primary)",
              border: "none",
              color: "#ffffff",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Load
          </button>
        </div>
      </div>
    </aside>
  );
};
