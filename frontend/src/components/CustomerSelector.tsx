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
    if (!scenarioLabel) return <Users size={15} color="var(--color-neutral-icon)" />;
    if (scenarioLabel.includes("Scenario A")) return <AlertTriangle size={15} color="var(--color-state-error)" />;
    if (scenarioLabel.includes("Scenario B")) return <Key size={15} color="var(--color-secondary)" />;
    if (scenarioLabel.includes("Scenario C")) return <CheckCircle2 size={15} color="var(--color-state-success)" />;
    if (scenarioLabel.includes("Scenario D")) return <ShieldAlert size={15} color="var(--color-accent-2)" />;
    return <UserCheck size={15} color="var(--color-accent-1)" />;
  };

  return (
    <aside
      style={{
        backgroundColor: "var(--color-surface-white)",
        borderRight: "1px solid var(--color-neutral-divider)",
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
          <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-primary)" }}>
            Customer Personas
          </h2>
          <span style={{ fontSize: "11px", color: "var(--color-text-placeholder)", fontWeight: 600 }}>
            {DEMO_CUSTOMERS.length} Scenarios
          </span>
        </div>
        <p style={{ fontSize: "11.5px", color: "var(--color-text-secondary)", lineHeight: "1.4" }}>
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
          backgroundColor: "var(--color-surface-background)",
          border: "1px solid var(--color-neutral-divider)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "12px",
        }}
      >
        <Search size={14} color="var(--color-neutral-icon)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter persona or scenario..."
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-primary)",
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
                backgroundColor: isSelected ? "var(--color-primary-light)" : "var(--color-surface-white)",
                border: isSelected ? "1.5px solid var(--color-primary)" : "1px solid var(--color-neutral-divider)",
                boxShadow: isSelected ? "0 2px 10px rgba(64, 105, 225, 0.15)" : "var(--shadow-sm)",
                cursor: "pointer",
                textAlign: "left",
                position: "relative",
                transition: "all 0.15s ease",
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
                    backgroundColor: "var(--color-primary)",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  {getScenarioIcon(cust.scenarioLabel)}
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: isSelected ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                    {cust.id}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: "var(--radius-xs)",
                    backgroundColor: "var(--color-surface-background)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-neutral-divider)",
                  }}
                >
                  {cust.tier}
                </span>
              </div>

              <div style={{ fontSize: "12px", fontWeight: 600, color: isSelected ? "var(--color-primary-click)" : "var(--color-text-secondary)", marginBottom: "3px" }}>
                {cust.name}
              </div>

              <div style={{ fontSize: "11px", color: "var(--color-text-placeholder)", lineHeight: "1.3" }}>
                {cust.description}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid var(--color-neutral-divider)" }}>
        <label htmlFor="custom-cust-id" style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
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
              backgroundColor: "var(--color-surface-background)",
              border: "1px solid var(--color-neutral-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-primary)",
              fontSize: "12px",
            }}
          />
          <button
            onClick={onApplyCustomId}
            style={{
              padding: "7px 12px",
              background: "var(--color-primary)",
              border: "none",
              color: "#ffffff",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(64, 105, 225, 0.25)",
            }}
          >
            Load
          </button>
        </div>
      </div>
    </aside>
  );
};
