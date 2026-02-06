/**
 * AEGIS Thought Generator Types
 * Identity-filtered cognition during awakening cycles
 */

export type NotingCategory =
  | "planning"
  | "reacting"
  | "anxious"
  | "eager"
  | "uncertain"
  | "calm"
  | "curious";

/**
 * A thought generated during an awakening cycle
 */
export interface GeneratedThought {
  content: string;
  noting: NotingCategory; // Mindfulness noting of thought quality
  identity_coherence: number; // How well this aligns with identity (0-1)
  strategic_value: number; // Estimated value of acting on this (0-1)
  mood_influenced: boolean; // Whether current mood affected this thought
  timestamp: string; // ISO date-time
}

/**
 * Context for thought generation
 */
export interface ThoughtGenerationContext {
  pending_tasks: string[];
  recent_events: string[];
  dormancy_duration: number;
  operator_status?: string; // e.g., "available", "weekend", "pto"
}

/**
 * Result of thought generation
 */
export interface ThoughtGenerationResult {
  thoughts: GeneratedThought[];
  noting_summary: Record<NotingCategory, number>; // Count per category
  average_coherence: number;
  mood_impact: string; // Description of how mood shaped thoughts
}

/**
 * Formatted identity context for LLM prompt
 */
export interface FormattedIdentityContext {
  name: string;
  origin_story: string;
  values_formatted: string;
  capabilities_formatted: string;
  wounds_formatted: string;
  aspirations_formatted: string;
  relationship_summary: string;
  current_mood: string;
}
