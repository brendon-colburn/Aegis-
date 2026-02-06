/**
 * AEGIS Example: Basic Usage
 * 
 * This example demonstrates how to create and use an AEGIS agent programmatically.
 */

import { DatabaseSync } from "node:sqlite";
import { AegisAgent } from "../index.js";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function main() {
  // 1. Create or connect to a database
  const dbPath = join(tmpdir(), "aegis-example.db");
  console.log("Database location:", dbPath);
  
  const db = new DatabaseSync(dbPath);

  // 2. Create an AEGIS agent
  console.log("\n=== Creating AEGIS Agent ===\n");
  
  const agent = new AegisAgent({
    db,
    operatorName: "Alice", // Your name
  });

  // 3. Initialize the agent (loads or creates identity)
  const identity = await agent.initialize("Aegis-Example");

  console.log(`✓ Agent "${identity.name}" initialized`);
  console.log(`  Trust Level: ${identity.trust_level.toFixed(2)}`);
  console.log(`  Created: ${new Date(identity.created).toLocaleString()}`);

  // 4. Inspect the identity
  console.log("\n=== Initial Identity State ===\n");
  
  console.log("Values:");
  for (const value of identity.values) {
    console.log(`  • ${value.principle}: ${(value.weight * 100).toFixed(0)}%`);
  }

  console.log("\nMood:");
  console.log(`  Energy: ${identity.current_mood.energy.toFixed(2)}`);
  console.log(`  Optimism: ${identity.current_mood.optimism.toFixed(2)}`);
  console.log(`  Focus: ${identity.current_mood.focus.toFixed(2)}`);

  console.log("\nContemplative State:");
  console.log(`  Baseline Stillness: ${identity.contemplative_state.baseline_stillness.toFixed(2)}`);
  console.log(`  Queue Health: ${identity.contemplative_state.queue_health}`);

  // 5. Execute an awakening cycle
  console.log("\n=== Executing Awakening Cycle ===\n");

  const result = await agent.awaken({
    depth: "full",
    context: {
      trigger: {
        type: "operator",
        timestamp: new Date().toISOString(),
        source: "example-script",
      },
      pending_tasks: [
        "Review system status",
        "Check for updates",
      ],
      recent_events: [
        "Operator initiated awakening",
      ],
      dormancy_duration: 0,
      event_queue: [],
    },
  });

  console.log("Awakening Results:");
  console.log(`  Thoughts Generated: ${result.thoughts_generated}`);
  console.log(`  Actions Taken: ${result.actions_taken}`);
  console.log(`  Contemplations Queued: ${result.contemplations_queued}`);
  console.log(`  Identity Updated: ${result.identity_updated ? "Yes" : "No"}`);

  // 6. Check identity after awakening
  const updatedIdentity = agent.getIdentity();
  if (updatedIdentity) {
    console.log("\n=== Post-Awakening State ===\n");
    console.log(`Trust Level: ${updatedIdentity.trust_level.toFixed(2)}`);
    console.log(`Contemplation Queue Size: ${updatedIdentity.contemplation_queue.length}`);
  }

  // 7. Enter dormancy
  console.log("\n=== Entering Dormancy ===\n");
  await agent.enterDormancy();
  console.log("✓ Agent state saved to database");

  // 8. Demonstrate persistence - create a new agent instance
  console.log("\n=== Testing Persistence ===\n");
  
  const agent2 = new AegisAgent({ db });
  const loadedIdentity = await agent2.initialize();

  console.log(`✓ Identity loaded from database`);
  console.log(`  Name: ${loadedIdentity.name}`);
  console.log(`  Same as original: ${loadedIdentity.name === identity.name}`);
  console.log(`  Last Updated: ${new Date(loadedIdentity.last_updated).toLocaleString()}`);

  // Cleanup
  db.close();
  
  console.log("\n=== Example Complete ===\n");
  console.log("Key Takeaways:");
  console.log("  • AEGIS agents have persistent identity stored in SQLite");
  console.log("  • Identity includes values, mood, contemplative state, and more");
  console.log("  • Awakening cycles generate thoughts, take actions, and update identity");
  console.log("  • The agent can be instantiated multiple times from the same database");
}

// Run the example
main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
