/**
 * AEGIS - Autonomous Evolving General Intelligence System
 * Main module exports
 */

// Core agent
export { AegisAgent, type AegisAgentOptions } from "./agent.js";

// Identity subsystem
export {
  type IdentityCore,
  type IdentityValue,
  type Capability,
  type Wound,
  type Relationship,
  type MoodVector,
  type CurrentMood,
  type ContemplativeState,
  type ContemplationQueueItem,
  type AwakeningPreference,
  type AwakeningPreferenceState,
  TrustLevel,
  getTrustLevelCategory,
} from "./identity/types.js";

export {
  IdentityStorage,
  type IdentityStorageOptions,
} from "./identity/storage.js";

// Awakening subsystem
export {
  type AwakeningTriggerType,
  type AwakeningTrigger,
  type AwakeningContext,
  type AwakeningDepth,
  type AwakeningCycleOptions,
  type AwakeningCycleResult,
} from "./awakening/types.js";

// Experience subsystem
export {
  type ExperienceOutcome,
  type AttributionFactor,
  type ExperienceRecord,
  type EvaluatedExperience,
  type IdentityUpdate,
  type ProcessedExperience,
  type ExperienceProcessingOptions,
} from "./experience/types.js";

// Thought subsystem
export {
  type NotingCategory,
  type GeneratedThought,
  type ThoughtGenerationContext,
  type ThoughtGenerationResult,
  type FormattedIdentityContext,
} from "./thought/types.js";

// Contemplation subsystem
export {
  type ReadinessAssessment,
  type ReadinessResult,
  type ContemplativeMetrics,
  type StillnessThresholds,
  type ContemplativeOptions,
} from "./contemplation/types.js";

// Governance subsystem
export {
  type GuardrailType,
  type Guardrail,
  type LawViolationSeverity,
  type Law,
  type ConsequenceType,
  type Consequence,
  type ViolationRecord,
  type GovernanceConfig,
  type GovernanceCheckResult,
} from "./governance/types.js";
