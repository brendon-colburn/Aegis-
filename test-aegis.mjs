/**
 * Simple test for AEGIS agent
 */

import { DatabaseSync } from "node:sqlite";
import { AegisAgent } from "../src/aegis/index.js";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function testAegis() {
  const testDb = join(tmpdir(), "aegis-test.db");
  console.log(`Creating test database at: ${testDb}`);

  const db = new DatabaseSync(testDb);

  console.log("\n1. Creating AEGIS agent...");
  const agent = new AegisAgent({
    db,
    operatorName: "TestOperator",
  });

  console.log("2. Initializing agent...");
  const identity = await agent.initialize("TestAegis");

  console.log("\n✓ Agent initialized successfully!");
  console.log(`  Name: ${identity.name}`);
  console.log(`  Trust Level: ${identity.trust_level}`);
  console.log(`  Values: ${identity.values.length}`);
  console.log(`  Relationships: ${Object.keys(identity.relationships).length}`);

  console.log("\n3. Loading identity from database...");
  const agent2 = new AegisAgent({ db });
  const loadedIdentity = await agent2.initialize();

  console.log("✓ Identity loaded successfully!");
  console.log(`  Name: ${loadedIdentity.name}`);
  console.log(`  Same name: ${loadedIdentity.name === identity.name}`);

  console.log("\n4. Testing awakening cycle...");
  const result = await agent2.awaken({
    depth: "full",
    context: {
      trigger: {
        type: "operator",
        timestamp: new Date().toISOString(),
        source: "test",
      },
      pending_tasks: ["Test task 1", "Test task 2"],
      recent_events: [],
      dormancy_duration: 0,
      event_queue: [],
    },
  });

  console.log("✓ Awakening complete!");
  console.log(`  Thoughts: ${result.thoughts_generated}`);
  console.log(`  Actions: ${result.actions_taken}`);
  console.log(`  Contemplations: ${result.contemplations_queued}`);

  console.log("\n5. Entering dormancy...");
  await agent2.enterDormancy();

  console.log("\n✅ All tests passed!");

  db.close();
}

testAegis().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
