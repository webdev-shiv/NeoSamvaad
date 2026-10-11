import type { ChatResponse } from "../types";
import { getMockResponseForCustomer } from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const REQUEST_TIMEOUT_MS = 8000;

class ApiClient {
  private mockMode: boolean = false;

  constructor() {
    // If explicitly set in environment or running in standalone demo mode
    if (import.meta.env.VITE_USE_MOCK === "true") {
      this.mockMode = true;
    }
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  public setMockMode(enabled: boolean) {
    this.mockMode = enabled;
  }

  public async sendChatMessage(
    customerId: string,
    message: string,
    sessionId: string = "default_session"
  ): Promise<ChatResponse> {
    if (!message || !message.trim()) {
      throw new Error("Cannot send an empty message.");
    }

    if (this.mockMode) {
      // Simulate realistic network delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      return getMockResponseForCustomer(customerId, message);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          message: message.trim(),
          session_id: sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            errMessage = errData.error.message;
          }
        } catch {
          // ignore json parse error on response
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      return this.normalizeChatResponse(data);
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      const errorMessage = err instanceof Error ? err.message : String(err);
      const isAbort = errorMessage.includes("aborted") || errorMessage.includes("timeout");

      // Check if backend is offline and fallback is enabled for smooth dev experience
      if (
        (errorMessage.includes("Failed to fetch") || isAbort) &&
        import.meta.env.VITE_AUTO_FALLBACK_MOCK !== "false"
      ) {
        console.warn(
          `[API Client] Backend at ${API_BASE_URL} unavailable (${errorMessage}). Falling back to explicit Mock/Demo mode.`
        );
        this.mockMode = true;
        await new Promise((resolve) => setTimeout(resolve, 400));
        return getMockResponseForCustomer(customerId, message);
      }

      throw new Error(
        isAbort
          ? `Request timed out after ${REQUEST_TIMEOUT_MS}ms. Member A's backend may be unreachable.`
          : errorMessage
      );
    }
  }

  public async fetchLiveGraph(limit: number = 60): Promise<{
    nodes: Array<{ id: string; label: string; type: string; color?: string; properties?: Record<string, any> }>;
    edges: Array<{ id: string; source: string; target: string; type: string }>;
    total_nodes: number;
    total_edges: number;
    neo4j_connected: boolean;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/graph/live?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch live graph: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Failed to fetch live graph from backend:", err);
      throw err;
    }
  }

  public async reportIssue(data: {
    customer_id: string;
    product_id: string;
    issue_description: string;
    category?: string;
    attempt_method?: string;
    attempt_outcome?: string;
    attempt_notes?: string;
    resolution_status?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/issues/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to report issue: ${response.statusText}`);
    }
    return await response.json();
  }

  private normalizeChatResponse(data: unknown): ChatResponse {
    const raw = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;

    return {
      answer: typeof raw.answer === "string" ? raw.answer : "No response provided by server.",
      evidence: Array.isArray(raw.evidence) ? raw.evidence : [],
      graph_paths: Array.isArray(raw.graph_paths) ? raw.graph_paths : [],
      suggested_next_step:
        typeof raw.suggested_next_step === "string"
          ? raw.suggested_next_step
          : "Review available evidence.",
      uncertainty:
        typeof raw.uncertainty === "string"
          ? raw.uncertainty
          : "Unconfirmed hypothesis.",
      is_mock: Boolean(raw.is_mock),
      confidence_level: (raw.confidence_level as any) || "GROUNDED_HIGH",
    };
  }
}

export const apiService = new ApiClient();

