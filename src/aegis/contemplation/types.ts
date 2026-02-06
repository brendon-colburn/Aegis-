/**
 * AEGIS Contemplative System Types
 * Implements wisdom of non-action through readiness assessment
 */

import type { GeneratedThought, NotingCategory } from "../thought/types.js";

/**
 * Dimensions for assessing thought readiness
 */
export interface ReadinessAssessment {
  information_sufficiency: number; // 0-1: Do we have enough info?
  mood_alignment: number; // 0-1: Is emotional state conducive?
  reversibility: number; // 0-1: How easy to undo if wrong?
  time_pressure: number; // 0-1: Cost of waiting another cycle?
  pattern_recognition: number; // 0-1: Historical benefit of waiting?
  felt_sense: number; // 0-1: Does something feel unresolved?
  overall_readiness: number; // 0-1: Computed overall score
}

/**
 * Result of readiness assessment
 */
export interface ReadinessResult {
  ready: boolean;
  assessment: ReadinessAssessment;
  reasoning: string;
  recommended_action: "act" | "contemplate" | "gather_info" | "wait_for_mood";
}

/**
 * Metrics tracking contemplative health
 */
export interface ContemplativeMetrics {
  action_contemplation_ratio: number; // Thoughts -> Actions vs Queue
  average_queue_residence_time: number; // Hours in queue before resolution
  ripeness_accuracy: number; // % of actions that were well-timed
  regret_rate: number; // % of actions that should have waited longer
  premature_action_rate: number; // % of contemplations that went too long
}

/**
 * Domain-specific stillness configuration
 */
export interface StillnessThresholds {
  financial: number; // Default 0.85
  communication: number; // Default 0.75
  research: number; // Default 0.4
  routine: number; // Default 0.2
  [key: string]: number;
}

/**
 * Options for contemplative assessment
 */
export interface ContemplativeOptions {
  domain?: string; // Domain of the thought (affects threshold)
  current_mood: {
    energy: number;
    optimism: number;
    focus: number;
  };
  wounds?: string[]; // Relevant wound domains that increase caution
}
