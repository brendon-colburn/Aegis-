/**
 * AEGIS Identity Core Types
 * Based on the AEGIS Architecture v1.3 specification
 */

export interface IdentityValue {
  principle: string;
  weight: number; // 0-1
}

export interface Capability {
  confidence: number;
  last_tested: string; // ISO date-time
}

export interface Wound {
  domain: string;
  incident: string;
  caution_level: number; // 0-1
  created: string; // ISO date-time
}

export interface Relationship {
  trust: number; // 0-1
  pattern: string;
  last_interaction: string; // ISO date-time
}

export interface MoodVector {
  energy: number;
  optimism: number;
  focus: number;
}

export interface CurrentMood extends MoodVector {
  updated: string; // ISO date-time
}

export interface NotingPatterns {
  most_common: string[];
  recent_shift: string;
}

export type QueueHealth = "healthy" | "balanced" | "backlogged" | "stagnant";

export interface ContemplativeState {
  baseline_stillness: number; // 0-1
  current_stillness: number; // 0-1
  domain_thresholds: Record<string, number>;
  noting_patterns: NotingPatterns;
  action_contemplation_ratio: number;
  queue_health: QueueHealth;
}

export interface ContemplationQueueItem {
  thought: string;
  first_arising: string; // ISO date-time
  times_revisited: number;
  ripeness_score: number; // 0-1
  blocking_factors: string[];
  decay_rate: number;
}

export type AwakeningPreference = "more" | "same" | "less";

export interface AwakeningPreferenceState {
  current: AwakeningPreference;
  reason: string;
}

/**
 * The Identity Core - the persistent, mutable representation of who the agent is
 */
export interface IdentityCore {
  name: string;
  origin_story?: string;
  values: IdentityValue[];
  capabilities: Record<string, Capability>;
  wounds: Wound[];
  aspirations: string[];
  relationships: Record<string, Relationship>;
  mood_baseline: MoodVector;
  current_mood: CurrentMood;
  contemplative_state: ContemplativeState;
  contemplation_queue: ContemplationQueueItem[];
  awakening_preference: AwakeningPreferenceState;
  trust_level: number; // 0-1
  created: string; // ISO date-time
  last_updated: string; // ISO date-time
}

/**
 * Trust levels that gate capabilities
 */
export enum TrustLevel {
  Nascent = 0.0, // 0-0.3: Read-only, all actions require approval
  Developing = 0.3, // 0.3-0.6: Limited write access, routine actions autonomous
  Established = 0.6, // 0.6-0.85: Broad autonomy, can request expansion
  Partner = 0.85, // 0.85+: Full autonomy, can propose governance changes
}

/**
 * Helper to get trust level category from numeric value
 */
export function getTrustLevelCategory(trustLevel: number): string {
  if (trustLevel < TrustLevel.Developing) return "Nascent";
  if (trustLevel < TrustLevel.Established) return "Developing";
  if (trustLevel < TrustLevel.Partner) return "Established";
  return "Partner";
}
