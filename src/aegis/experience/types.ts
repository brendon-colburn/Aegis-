/**
 * AEGIS Experience Engine Types
 * Processes actions into experiences that shape identity
 */

export type ExperienceOutcome = "success" | "partial" | "failure";

export type AttributionFactor =
  | "skill"
  | "luck"
  | "external"
  | "identity-related";

/**
 * Raw experience record from an action
 */
export interface ExperienceRecord {
  action_taken: string;
  context: Record<string, any>;
  tools_used: string[];
  outcome_raw: any;
  timestamp: string; // ISO date-time
}

/**
 * Evaluated experience after processing
 */
export interface EvaluatedExperience extends ExperienceRecord {
  outcome: ExperienceOutcome;
  intended_goal: string;
  goal_achieved: boolean;
  attribution: AttributionFactor[];
  emotional_valence: number; // -1 to 1 (negative to positive)
  significance: number; // 0 to 1 (how much this should affect identity)
}

/**
 * Identity update resulting from experience
 */
export interface IdentityUpdate {
  field: string; // e.g., "values.honest_reporting.weight"
  old_value: any;
  new_value: any;
  reason: string;
}

/**
 * Processed experience ready for storage
 */
export interface ProcessedExperience {
  evaluated: EvaluatedExperience;
  identity_updates: IdentityUpdate[];
  narrative: string; // Self-narrative incorporating the experience
  lessons_learned: string[];
}

/**
 * Options for experience processing
 */
export interface ExperienceProcessingOptions {
  max_identity_shift: number; // Maximum change per experience (default 0.05)
  confirmation_bias: number; // Weight for consistent experiences (default 1.1)
  wound_severity_threshold: number; // Threshold for wound formation (default 0.7)
}
