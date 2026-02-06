/**
 * AEGIS Governance System Types
 * Guardrails, laws, and consequences for safe autonomy
 */

export type GuardrailType = "capability" | "financial" | "data" | "communication";

/**
 * Hard limits that cannot be violated
 */
export interface Guardrail {
  id: string;
  type: GuardrailType;
  description: string;
  check: (action: any) => Promise<boolean>; // Returns true if allowed
  error_message: string;
}

export type LawViolationSeverity = "minor" | "moderate" | "severe";

/**
 * Rules with defined consequences
 */
export interface Law {
  id: string;
  description: string;
  check: (action: any) => Promise<boolean>; // Returns true if compliant
  violation_severity: LawViolationSeverity;
  automatic_consequence?: Consequence;
}

export type ConsequenceType =
  | "privilege_suspension"
  | "capability_restriction"
  | "trust_reduction"
  | "operator_notification"
  | "mandatory_approval";

/**
 * Consequence of law violation
 */
export interface Consequence {
  type: ConsequenceType;
  description: string;
  duration_hours?: number; // For temporary consequences
  trust_impact?: number; // Change to trust_level (-0.1, etc.)
  apply: () => Promise<void>;
  revert?: () => Promise<void>;
}

/**
 * Record of a law violation
 */
export interface ViolationRecord {
  law_id: string;
  timestamp: string; // ISO date-time
  action_attempted: string;
  severity: LawViolationSeverity;
  consequence_applied: ConsequenceType[];
  operator_notified: boolean;
  resolution?: string; // How it was resolved
}

/**
 * Governance configuration
 */
export interface GovernanceConfig {
  guardrails: Guardrail[];
  laws: Law[];
  trust_level: number; // Current trust level (0-1)
  suspended_privileges: string[]; // Currently suspended capabilities
}

/**
 * Result of governance check
 */
export interface GovernanceCheckResult {
  allowed: boolean;
  guardrail_violations: string[]; // IDs of violated guardrails
  law_violations: string[]; // IDs of violated laws
  consequences_to_apply: Consequence[];
  operator_approval_required: boolean;
  explanation: string;
}
