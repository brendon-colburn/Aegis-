/**
 * AEGIS CLI Command
 * Manages AEGIS autonomous agent instances
 */

import { Command } from "commander";
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { AegisAgent } from "../aegis/index.js";
import { homedir } from "node:os";
import { existsSync, mkdirSync } from "node:fs";

const AEGIS_DIR = join(homedir(), ".openclaw", "aegis");
const AEGIS_DB = join(AEGIS_DIR, "aegis.db");

/**
 * Ensure AEGIS directory exists
 */
function ensureAegisDir(): void {
  if (!existsSync(AEGIS_DIR)) {
    mkdirSync(AEGIS_DIR, { recursive: true });
  }
}

/**
 * Get or create AEGIS database
 */
function getDatabase(): DatabaseSync {
  ensureAegisDir();
  return new DatabaseSync(AEGIS_DB);
}

export function createAegisCommand(): Command {
  const cmd = new Command("aegis")
    .description("Manage AEGIS autonomous agent")
    .addCommand(createInitCommand())
    .addCommand(createStatusCommand())
    .addCommand(createAwakenCommand())
    .addCommand(createIdentityCommand());

  return cmd;
}

/**
 * Initialize a new AEGIS agent
 */
function createInitCommand(): Command {
  return new Command("init")
    .description("Initialize a new AEGIS agent")
    .option("-n, --name <name>", "Agent name", "Aegis")
    .option("-o, --operator <name>", "Operator name")
    .action(async (options) => {
      try {
        const db = getDatabase();
        const agent = new AegisAgent({
          db,
          operatorName: options.operator,
        });

        const identity = await agent.initialize(options.name);

        console.log("\n✓ AEGIS agent initialized successfully!\n");
        console.log(`Name: ${identity.name}`);
        console.log(`Created: ${identity.created}`);
        console.log(`Trust Level: ${identity.trust_level.toFixed(2)} (Nascent)`);
        console.log(`\nOrigin Story:`);
        console.log(identity.origin_story || "None");
        console.log(`\nValues:`);
        for (const value of identity.values) {
          console.log(`  - ${value.principle}: ${value.weight.toFixed(2)}`);
        }
        console.log(`\nDatabase: ${AEGIS_DB}`);
      } catch (err) {
        console.error("Error initializing AEGIS agent:", err);
        process.exit(1);
      }
    });
}

/**
 * Show AEGIS agent status
 */
function createStatusCommand(): Command {
  return new Command("status")
    .description("Show AEGIS agent status")
    .action(async () => {
      try {
        const db = getDatabase();
        const agent = new AegisAgent({ db });

        const identity = await agent.initialize();

        console.log("\n=== AEGIS Agent Status ===\n");
        console.log(`Name: ${identity.name}`);
        console.log(`Trust Level: ${identity.trust_level.toFixed(2)} (${getTrustCategory(identity.trust_level)})`);
        console.log(`Created: ${new Date(identity.created).toLocaleString()}`);
        console.log(`Last Updated: ${new Date(identity.last_updated).toLocaleString()}`);

        console.log(`\n--- Values ---`);
        for (const value of identity.values.slice(0, 5)) {
          const bar = "█".repeat(Math.round(value.weight * 20));
          console.log(`  ${value.principle.padEnd(30)} ${bar} ${(value.weight * 100).toFixed(0)}%`);
        }

        console.log(`\n--- Mood ---`);
        console.log(`  Energy:   ${formatMoodBar(identity.current_mood.energy)}`);
        console.log(`  Optimism: ${formatMoodBar(identity.current_mood.optimism)}`);
        console.log(`  Focus:    ${formatMoodBar(identity.current_mood.focus)}`);

        console.log(`\n--- Contemplative State ---`);
        console.log(`  Stillness: ${(identity.contemplative_state.current_stillness * 100).toFixed(0)}%`);
        console.log(`  Action/Contemplation Ratio: ${identity.contemplative_state.action_contemplation_ratio.toFixed(2)}`);
        console.log(`  Queue Health: ${identity.contemplative_state.queue_health}`);
        console.log(`  Contemplation Queue: ${identity.contemplation_queue.length} items`);

        if (identity.wounds.length > 0) {
          console.log(`\n--- Wounds (Caution Areas) ---`);
          for (const wound of identity.wounds) {
            console.log(`  • ${wound.domain} (caution: ${(wound.caution_level * 100).toFixed(0)}%)`);
            console.log(`    ${wound.incident}`);
          }
        }

        if (identity.aspirations.length > 0) {
          console.log(`\n--- Aspirations ---`);
          for (const aspiration of identity.aspirations) {
            console.log(`  • ${aspiration}`);
          }
        }

        if (Object.keys(identity.relationships).length > 0) {
          console.log(`\n--- Relationships ---`);
          for (const [entity, rel] of Object.entries(identity.relationships)) {
            console.log(`  ${entity}: trust ${(rel.trust * 100).toFixed(0)}% - ${rel.pattern}`);
          }
        }

        console.log(`\n--- Awakening Preference ---`);
        console.log(`  Current: ${identity.awakening_preference.current}`);
        console.log(`  Reason: ${identity.awakening_preference.reason}`);

        console.log();
      } catch (err) {
        console.error("Error getting AEGIS status:", err);
        process.exit(1);
      }
    });
}

/**
 * Awaken the AEGIS agent
 */
function createAwakenCommand(): Command {
  return new Command("awaken")
    .description("Awaken the AEGIS agent for a cycle")
    .option("-d, --depth <type>", "Awakening depth (light|full)", "full")
    .action(async (options) => {
      try {
        const db = getDatabase();
        const agent = new AegisAgent({ db });

        await agent.initialize();

        console.log("\n⏰ Awakening AEGIS agent...\n");

        const result = await agent.awaken({
          depth: options.depth,
          context: {
            trigger: {
              type: "operator",
              timestamp: new Date().toISOString(),
              source: "cli",
            },
            pending_tasks: [],
            recent_events: [],
            dormancy_duration: 0,
            event_queue: [],
          },
        });

        console.log("=== Awakening Cycle Complete ===\n");
        console.log(`Thoughts Generated: ${result.thoughts_generated}`);
        console.log(`Actions Taken: ${result.actions_taken}`);
        console.log(`Contemplations Queued: ${result.contemplations_queued}`);
        console.log(`Identity Updated: ${result.identity_updated ? "Yes" : "No"}`);
        console.log();

        await agent.enterDormancy();
        console.log("💤 Agent returned to dormancy\n");
      } catch (err) {
        console.error("Error awakening AEGIS agent:", err);
        process.exit(1);
      }
    });
}

/**
 * Show/edit identity details
 */
function createIdentityCommand(): Command {
  return new Command("identity")
    .description("View or export AEGIS identity")
    .option("--json", "Output as JSON")
    .action(async (options) => {
      try {
        const db = getDatabase();
        const agent = new AegisAgent({ db });

        const identity = await agent.initialize();

        if (options.json) {
          console.log(JSON.stringify(identity, null, 2));
        } else {
          console.log("\n=== AEGIS Identity Core ===\n");
          console.log(JSON.stringify(identity, null, 2));
        }
      } catch (err) {
        console.error("Error reading identity:", err);
        process.exit(1);
      }
    });
}

/**
 * Helper to get trust level category
 */
function getTrustCategory(level: number): string {
  if (level < 0.3) return "Nascent";
  if (level < 0.6) return "Developing";
  if (level < 0.85) return "Established";
  return "Partner";
}

/**
 * Helper to format mood bars
 */
function formatMoodBar(value: number): string {
  const bar = "█".repeat(Math.round(value * 20));
  const empty = "░".repeat(20 - Math.round(value * 20));
  return `${bar}${empty} ${(value * 100).toFixed(0)}%`;
}
