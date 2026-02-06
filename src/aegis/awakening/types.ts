/**
 * AEGIS Awakening System Types
 * Manages awakening cycles and triggers
 */

export type AwakeningTriggerType =
  | "scheduled" // Cron-based awakening
  | "event" // Webhook from monitored services
  | "operator" // Direct message from operator
  | "self-requested"; // Agent requested earlier awakening

export interface AwakeningTrigger {
  type: AwakeningTriggerType;
  timestamp: string; // ISO date-time
  source?: string; // e.g., "cron", "webhook:email", "operator:brendon"
  data?: any; // Additional context for the awakening
}

export interface AwakeningContext {
  trigger: AwakeningTrigger;
  pending_tasks: string[];
  recent_events: string[];
  dormancy_duration: number; // milliseconds
  event_queue: any[]; // Accumulated events during dormancy
}

export type AwakeningDepth = "light" | "full";

export interface AwakeningCycleOptions {
  depth: AwakeningDepth;
  context: AwakeningContext;
}

/**
 * Result of an awakening cycle
 */
export interface AwakeningCycleResult {
  thoughts_generated: number;
  actions_taken: number;
  contemplations_queued: number;
  identity_updated: boolean;
  next_awakening_preference?: {
    when: string; // ISO date-time or relative time
    conditions?: string[];
  };
}
