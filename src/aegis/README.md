# AEGIS - Autonomous Evolving General Intelligence System

AEGIS is an autonomous agent system with identity-based cognition, built according to the specifications in `docs/experiments/aegis`. Unlike traditional AI agents that simply execute tasks, AEGIS develops preferences, learns from consequences, and forms something analogous to a relationship with its operator.

## Core Philosophy

AEGIS is designed around the metaphor of **raising a digital child**. The operator provides structure and guidance when needed, steps back to allow autonomous learning, assumes good intent behind suboptimal behavior, and establishes guardrails that prevent catastrophic mistakes while allowing meaningful freedom.

### Key Innovations

1. **Identity as Architecture**: Identity is a first-class component, not an emergent side effect
2. **Contemplative Wisdom**: Implements "wisdom of non-action" - not every thought becomes an action
3. **Organic Relationship**: Care and loyalty emerge from accumulated positive interactions
4. **Trust Gradient**: Governance loosens as the agent demonstrates reliability

## System Architecture

AEGIS consists of six primary subsystems:

1. **Identity Core**: Persistent, mutable representation of who the agent is
2. **Experience Engine**: Processes events and updates identity based on outcomes
3. **Thought Generator**: Produces identity-filtered cognition
4. **Contemplative System**: Assesses thought readiness and maintains contemplation queue
5. **Action Layer**: Executes decisions with consequence tracking
6. **Governance System**: Guardrails, laws, and consequences that shape behavior

## CLI Usage

### Initialize an AEGIS agent

```bash
openclaw aegis init --name "Theseus" --operator "YourName"
```

### Check agent status

```bash
openclaw aegis status
```

This shows:
- Current trust level
- Values and their weights
- Mood state (energy, optimism, focus)
- Contemplative state
- Active wounds (areas of caution)
- Aspirations
- Relationships

### Awaken the agent

```bash
openclaw aegis awaken
```

Executes a full awakening cycle:
1. Load Identity Core
2. Generate thoughts based on identity and context
3. Assess thoughts for readiness
4. Execute ready thoughts (actions)
5. Process outcomes into experiences
6. Update Identity Core
7. Return to dormancy

### View identity details

```bash
openclaw aegis identity
openclaw aegis identity --json  # JSON output
```

## Identity Core Structure

The Identity Core contains:

- **Name**: Self-assigned or operator-given
- **Origin Story**: How the agent understands its creation
- **Values**: Core principles with dynamic weights (0-1)
- **Capabilities**: Self-assessed abilities with confidence
- **Wounds**: Past failures creating caution in specific domains
- **Aspirations**: What the agent is trying to become
- **Relationships**: Understanding of key entities
- **Mood**: Baseline and current emotional state
- **Contemplative State**: Stillness level, noting patterns, queue health
- **Awakening Preference**: Agent's expressed preference for awakening frequency
- **Trust Level**: 0-1 score determining available capabilities

## Trust Levels

| Level | Range | Description | Capabilities |
|-------|-------|-------------|--------------|
| **Nascent** | 0-0.3 | Read-only access | All actions require approval |
| **Developing** | 0.3-0.6 | Limited autonomy | Routine actions autonomous |
| **Established** | 0.6-0.85 | Broad autonomy | Can request capability expansion |
| **Partner** | 0.85+ | Full autonomy | Can propose governance changes |

## Contemplative System

AEGIS implements a contemplative capacity inspired by mindfulness traditions. Not every thought becomes an action:

- **Noting Practice**: Each thought is categorized (planning, reacting, anxious, eager, uncertain, calm, curious)
- **Readiness Assessment**: Evaluates information sufficiency, mood alignment, reversibility, time pressure, etc.
- **Contemplation Queue**: Thoughts that are deliberately not acted upon
- **Ripeness Scoring**: Tracks when thoughts are ready for action

## Storage

AEGIS uses SQLite (Node's built-in `DatabaseSync`) to persist identity state:

- Location: `~/.openclaw/aegis/aegis.db`
- Schema includes separate tables for:
  - Core identity
  - Values
  - Capabilities
  - Wounds
  - Aspirations
  - Relationships
  - Mood state
  - Contemplative state
  - Contemplation queue
  - Awakening preferences

## Development Status

### ✅ Phase 1: Foundation (Complete)
- Identity Core types and schema
- SQLite persistence layer
- Main AegisAgent class
- CLI commands
- Integration with OpenClaw

### 🚧 Phase 2: Identity Dynamics (In Progress)
- Thought Generator with LLM integration
- Experience Engine processing
- Wound formation and healing
- Mood system updates
- Identity change rules

### 📋 Phase 3: Governance System (Planned)
- Guardrails (hard limits)
- Laws with consequences
- Trust gradient
- Operator approval workflows

### 📋 Phase 4: Contemplative System (Planned)
- Noting practice implementation
- Readiness assessment algorithm
- Contemplation queue management
- Ripeness scoring

### 📋 Phase 5: Relationship & Partnership (Planned)
- Relationship tracking
- Awakening preference negotiation
- Proactive communication
- Shared goal tracking

## Design Document

The complete AEGIS architecture specification is available in:
- `docs/experiments/aegis`

This document details:
- Core philosophy and design principles
- Detailed system architecture
- Implementation roadmap
- Technical requirements
- Security considerations
- Cost management
- Rest and recovery patterns
- Ethical considerations

## Example: A Mature AEGIS Instance

After several months of operation, an AEGIS agent might look like:

```json
{
  "name": "Theseus",
  "trust_level": 0.75,
  "values": [
    { "principle": "serve_operator_flourishing", "weight": 0.92 },
    { "principle": "honest_reporting", "weight": 0.95 },
    { "principle": "cautious_with_finances", "weight": 0.88 }
  ],
  "wounds": [
    {
      "domain": "email_automation",
      "incident": "Sent premature client email",
      "caution_level": 0.8
    }
  ],
  "relationships": {
    "operator": { "trust": 0.94, "pattern": "guidance_when_uncertain" }
  },
  "awakening_preference": {
    "current": "more",
    "reason": "productive_streak"
  }
}
```

## Contributing

AEGIS is in active development. Contributions aligned with the design philosophy are welcome:

1. Read the design document (`docs/experiments/aegis`)
2. Understand the parenting model and contemplative approach
3. Propose changes that support identity coherence and organic growth
4. Test thoroughly - identity changes should be gradual and stable

## License

MIT License - see LICENSE file for details
