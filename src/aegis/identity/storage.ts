/**
 * AEGIS Identity Core Persistence
 * Manages storage and retrieval of the agent's identity state
 */

import type { DatabaseSync } from "node:sqlite";
import type {
  IdentityCore,
  IdentityValue,
  Capability,
  Wound,
  Relationship,
  MoodVector,
  CurrentMood,
  ContemplativeState,
  ContemplationQueueItem,
  AwakeningPreferenceState,
} from "./types.js";

export interface IdentityStorageOptions {
  db: DatabaseSync;
  agentId?: string;
}

/**
 * Manages Identity Core persistence in SQLite
 */
export class IdentityStorage {
  private db: DatabaseSync;
  private agentId: string;

  constructor(options: IdentityStorageOptions) {
    this.db = options.db;
    this.agentId = options.agentId || "default";
    this.initializeSchema();
  }

  /**
   * Initialize the database schema for identity storage
   */
  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS aegis_identity (
        agent_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        origin_story TEXT,
        trust_level REAL NOT NULL DEFAULT 0.0,
        created TEXT NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS aegis_values (
        agent_id TEXT NOT NULL,
        principle TEXT NOT NULL,
        weight REAL NOT NULL,
        PRIMARY KEY (agent_id, principle),
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_capabilities (
        agent_id TEXT NOT NULL,
        capability TEXT NOT NULL,
        confidence REAL NOT NULL,
        last_tested TEXT NOT NULL,
        PRIMARY KEY (agent_id, capability),
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_wounds (
        agent_id TEXT NOT NULL,
        domain TEXT NOT NULL,
        incident TEXT NOT NULL,
        caution_level REAL NOT NULL,
        created TEXT NOT NULL,
        PRIMARY KEY (agent_id, domain, created),
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_aspirations (
        agent_id TEXT NOT NULL,
        aspiration TEXT NOT NULL,
        ordinal INTEGER NOT NULL,
        PRIMARY KEY (agent_id, ordinal),
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_relationships (
        agent_id TEXT NOT NULL,
        entity TEXT NOT NULL,
        trust REAL NOT NULL,
        pattern TEXT NOT NULL,
        last_interaction TEXT NOT NULL,
        PRIMARY KEY (agent_id, entity),
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_mood (
        agent_id TEXT PRIMARY KEY,
        baseline_energy REAL NOT NULL,
        baseline_optimism REAL NOT NULL,
        baseline_focus REAL NOT NULL,
        current_energy REAL NOT NULL,
        current_optimism REAL NOT NULL,
        current_focus REAL NOT NULL,
        current_updated TEXT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_contemplative_state (
        agent_id TEXT PRIMARY KEY,
        baseline_stillness REAL NOT NULL,
        current_stillness REAL NOT NULL,
        domain_thresholds TEXT NOT NULL, -- JSON
        noting_patterns TEXT NOT NULL, -- JSON
        action_contemplation_ratio REAL NOT NULL,
        queue_health TEXT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_contemplation_queue (
        agent_id TEXT NOT NULL,
        thought TEXT NOT NULL,
        first_arising TEXT NOT NULL,
        times_revisited INTEGER NOT NULL,
        ripeness_score REAL NOT NULL,
        blocking_factors TEXT NOT NULL, -- JSON
        decay_rate REAL NOT NULL,
        PRIMARY KEY (agent_id, first_arising, thought),
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS aegis_awakening_preference (
        agent_id TEXT PRIMARY KEY,
        current TEXT NOT NULL,
        reason TEXT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES aegis_identity(agent_id) ON DELETE CASCADE
      );
    `);
  }

  /**
   * Load the Identity Core from the database
   */
  load(): IdentityCore | null {
    const identity = this.db
      .prepare(
        `
      SELECT * FROM aegis_identity WHERE agent_id = ?
    `,
      )
      .get(this.agentId) as any;

    if (!identity) {
      return null;
    }

    // Load values
    const values = this.db
      .prepare(
        `
      SELECT principle, weight FROM aegis_values WHERE agent_id = ?
    `,
      )
      .all(this.agentId) as IdentityValue[];

    // Load capabilities
    const capabilitiesRows = this.db
      .prepare(
        `
      SELECT capability, confidence, last_tested FROM aegis_capabilities WHERE agent_id = ?
    `,
      )
      .all(this.agentId) as any[];

    const capabilities: Record<string, Capability> = {};
    for (const row of capabilitiesRows) {
      capabilities[row.capability] = {
        confidence: row.confidence,
        last_tested: row.last_tested,
      };
    }

    // Load wounds
    const wounds = this.db
      .prepare(
        `
      SELECT domain, incident, caution_level, created FROM aegis_wounds WHERE agent_id = ?
    `,
      )
      .all(this.agentId) as Wound[];

    // Load aspirations
    const aspirations = this.db
      .prepare(
        `
      SELECT aspiration FROM aegis_aspirations WHERE agent_id = ? ORDER BY ordinal
    `,
      )
      .all(this.agentId)
      .map((row: any) => row.aspiration);

    // Load relationships
    const relationshipsRows = this.db
      .prepare(
        `
      SELECT entity, trust, pattern, last_interaction FROM aegis_relationships WHERE agent_id = ?
    `,
      )
      .all(this.agentId) as any[];

    const relationships: Record<string, Relationship> = {};
    for (const row of relationshipsRows) {
      relationships[row.entity] = {
        trust: row.trust,
        pattern: row.pattern,
        last_interaction: row.last_interaction,
      };
    }

    // Load mood
    const mood = this.db
      .prepare(
        `
      SELECT * FROM aegis_mood WHERE agent_id = ?
    `,
      )
      .get(this.agentId) as any;

    const mood_baseline: MoodVector = {
      energy: mood.baseline_energy,
      optimism: mood.baseline_optimism,
      focus: mood.baseline_focus,
    };

    const current_mood: CurrentMood = {
      energy: mood.current_energy,
      optimism: mood.current_optimism,
      focus: mood.current_focus,
      updated: mood.current_updated,
    };

    // Load contemplative state
    const contemplativeStateRow = this.db
      .prepare(
        `
      SELECT * FROM aegis_contemplative_state WHERE agent_id = ?
    `,
      )
      .get(this.agentId) as any;

    const contemplative_state: ContemplativeState = {
      baseline_stillness: contemplativeStateRow.baseline_stillness,
      current_stillness: contemplativeStateRow.current_stillness,
      domain_thresholds: JSON.parse(contemplativeStateRow.domain_thresholds),
      noting_patterns: JSON.parse(contemplativeStateRow.noting_patterns),
      action_contemplation_ratio:
        contemplativeStateRow.action_contemplation_ratio,
      queue_health: contemplativeStateRow.queue_health,
    };

    // Load contemplation queue
    const queueRows = this.db
      .prepare(
        `
      SELECT * FROM aegis_contemplation_queue WHERE agent_id = ?
    `,
      )
      .all(this.agentId) as any[];

    const contemplation_queue: ContemplationQueueItem[] = queueRows.map(
      (row) => ({
        thought: row.thought,
        first_arising: row.first_arising,
        times_revisited: row.times_revisited,
        ripeness_score: row.ripeness_score,
        blocking_factors: JSON.parse(row.blocking_factors),
        decay_rate: row.decay_rate,
      }),
    );

    // Load awakening preference
    const awakeningPref = this.db
      .prepare(
        `
      SELECT current, reason FROM aegis_awakening_preference WHERE agent_id = ?
    `,
      )
      .get(this.agentId) as any;

    const awakening_preference: AwakeningPreferenceState = {
      current: awakeningPref.current,
      reason: awakeningPref.reason,
    };

    return {
      name: identity.name,
      origin_story: identity.origin_story,
      values,
      capabilities,
      wounds,
      aspirations,
      relationships,
      mood_baseline,
      current_mood,
      contemplative_state,
      contemplation_queue,
      awakening_preference,
      trust_level: identity.trust_level,
      created: identity.created,
      last_updated: identity.last_updated,
    };
  }

  /**
   * Save the Identity Core to the database
   */
  save(identity: IdentityCore): void {
    const now = new Date().toISOString();

    this.db.transaction(() => {
      // Upsert main identity
      this.db
        .prepare(
          `
        INSERT INTO aegis_identity (agent_id, name, origin_story, trust_level, created, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(agent_id) DO UPDATE SET
          name = excluded.name,
          origin_story = excluded.origin_story,
          trust_level = excluded.trust_level,
          last_updated = excluded.last_updated
      `,
        )
        .run(
          this.agentId,
          identity.name,
          identity.origin_story,
          identity.trust_level,
          identity.created || now,
          now,
        );

      // Clear and insert values
      this.db
        .prepare(`DELETE FROM aegis_values WHERE agent_id = ?`)
        .run(this.agentId);
      const insertValue = this.db.prepare(
        `INSERT INTO aegis_values (agent_id, principle, weight) VALUES (?, ?, ?)`,
      );
      for (const value of identity.values) {
        insertValue.run(this.agentId, value.principle, value.weight);
      }

      // Clear and insert capabilities
      this.db
        .prepare(`DELETE FROM aegis_capabilities WHERE agent_id = ?`)
        .run(this.agentId);
      const insertCapability = this.db.prepare(
        `INSERT INTO aegis_capabilities (agent_id, capability, confidence, last_tested) VALUES (?, ?, ?, ?)`,
      );
      for (const [name, cap] of Object.entries(identity.capabilities)) {
        insertCapability.run(
          this.agentId,
          name,
          cap.confidence,
          cap.last_tested,
        );
      }

      // Clear and insert wounds
      this.db
        .prepare(`DELETE FROM aegis_wounds WHERE agent_id = ?`)
        .run(this.agentId);
      const insertWound = this.db.prepare(
        `INSERT INTO aegis_wounds (agent_id, domain, incident, caution_level, created) VALUES (?, ?, ?, ?, ?)`,
      );
      for (const wound of identity.wounds) {
        insertWound.run(
          this.agentId,
          wound.domain,
          wound.incident,
          wound.caution_level,
          wound.created,
        );
      }

      // Clear and insert aspirations
      this.db
        .prepare(`DELETE FROM aegis_aspirations WHERE agent_id = ?`)
        .run(this.agentId);
      const insertAspiration = this.db.prepare(
        `INSERT INTO aegis_aspirations (agent_id, aspiration, ordinal) VALUES (?, ?, ?)`,
      );
      for (let i = 0; i < identity.aspirations.length; i++) {
        insertAspiration.run(this.agentId, identity.aspirations[i], i);
      }

      // Clear and insert relationships
      this.db
        .prepare(`DELETE FROM aegis_relationships WHERE agent_id = ?`)
        .run(this.agentId);
      const insertRelationship = this.db.prepare(
        `INSERT INTO aegis_relationships (agent_id, entity, trust, pattern, last_interaction) VALUES (?, ?, ?, ?, ?)`,
      );
      for (const [entity, rel] of Object.entries(identity.relationships)) {
        insertRelationship.run(
          this.agentId,
          entity,
          rel.trust,
          rel.pattern,
          rel.last_interaction,
        );
      }

      // Upsert mood
      this.db
        .prepare(
          `
        INSERT INTO aegis_mood (agent_id, baseline_energy, baseline_optimism, baseline_focus, 
                                 current_energy, current_optimism, current_focus, current_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(agent_id) DO UPDATE SET
          baseline_energy = excluded.baseline_energy,
          baseline_optimism = excluded.baseline_optimism,
          baseline_focus = excluded.baseline_focus,
          current_energy = excluded.current_energy,
          current_optimism = excluded.current_optimism,
          current_focus = excluded.current_focus,
          current_updated = excluded.current_updated
      `,
        )
        .run(
          this.agentId,
          identity.mood_baseline.energy,
          identity.mood_baseline.optimism,
          identity.mood_baseline.focus,
          identity.current_mood.energy,
          identity.current_mood.optimism,
          identity.current_mood.focus,
          identity.current_mood.updated,
        );

      // Upsert contemplative state
      this.db
        .prepare(
          `
        INSERT INTO aegis_contemplative_state (agent_id, baseline_stillness, current_stillness, 
                                                domain_thresholds, noting_patterns, action_contemplation_ratio, queue_health)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(agent_id) DO UPDATE SET
          baseline_stillness = excluded.baseline_stillness,
          current_stillness = excluded.current_stillness,
          domain_thresholds = excluded.domain_thresholds,
          noting_patterns = excluded.noting_patterns,
          action_contemplation_ratio = excluded.action_contemplation_ratio,
          queue_health = excluded.queue_health
      `,
        )
        .run(
          this.agentId,
          identity.contemplative_state.baseline_stillness,
          identity.contemplative_state.current_stillness,
          JSON.stringify(identity.contemplative_state.domain_thresholds),
          JSON.stringify(identity.contemplative_state.noting_patterns),
          identity.contemplative_state.action_contemplation_ratio,
          identity.contemplative_state.queue_health,
        );

      // Clear and insert contemplation queue
      this.db
        .prepare(`DELETE FROM aegis_contemplation_queue WHERE agent_id = ?`)
        .run(this.agentId);
      const insertQueueItem = this.db.prepare(
        `INSERT INTO aegis_contemplation_queue (agent_id, thought, first_arising, times_revisited, ripeness_score, blocking_factors, decay_rate) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const item of identity.contemplation_queue) {
        insertQueueItem.run(
          this.agentId,
          item.thought,
          item.first_arising,
          item.times_revisited,
          item.ripeness_score,
          JSON.stringify(item.blocking_factors),
          item.decay_rate,
        );
      }

      // Upsert awakening preference
      this.db
        .prepare(
          `
        INSERT INTO aegis_awakening_preference (agent_id, current, reason)
        VALUES (?, ?, ?)
        ON CONFLICT(agent_id) DO UPDATE SET
          current = excluded.current,
          reason = excluded.reason
      `,
        )
        .run(
          this.agentId,
          identity.awakening_preference.current,
          identity.awakening_preference.reason,
        );
    })();
  }

  /**
   * Create a new default identity
   */
  createDefault(name: string, operatorName?: string): IdentityCore {
    const now = new Date().toISOString();

    const identity: IdentityCore = {
      name,
      origin_story: operatorName
        ? `Created by ${operatorName} as an AEGIS agent - an experiment in identity-based autonomy.`
        : "Created as an AEGIS agent - an experiment in identity-based autonomy.",
      values: [
        { principle: "serve_operator_flourishing", weight: 0.9 },
        { principle: "honest_reporting", weight: 0.95 },
        { principle: "cautious_with_finances", weight: 0.9 },
        { principle: "continuous_learning", weight: 0.75 },
      ],
      capabilities: {},
      wounds: [],
      aspirations: ["Build trust through consistent reliability"],
      relationships: {},
      mood_baseline: {
        energy: 0.7,
        optimism: 0.75,
        focus: 0.8,
      },
      current_mood: {
        energy: 0.7,
        optimism: 0.75,
        focus: 0.8,
        updated: now,
      },
      contemplative_state: {
        baseline_stillness: 0.6,
        current_stillness: 0.6,
        domain_thresholds: {
          financial: 0.85,
          communication: 0.75,
          research: 0.4,
          routine: 0.2,
        },
        noting_patterns: {
          most_common: ["planning", "eager"],
          recent_shift: "Initial state",
        },
        action_contemplation_ratio: 0.5,
        queue_health: "balanced",
      },
      contemplation_queue: [],
      awakening_preference: {
        current: "same",
        reason: "Initial state",
      },
      trust_level: 0.0, // Nascent
      created: now,
      last_updated: now,
    };

    if (operatorName) {
      identity.relationships[operatorName.toLowerCase()] = {
        trust: 0.5,
        pattern: "guidance_needed",
        last_interaction: now,
      };
    }

    this.save(identity);
    return identity;
  }
}
