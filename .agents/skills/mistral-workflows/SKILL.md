---
name: mistral-workflows
description: >
  How to create, deploy, and manage production-grade AI workflows using Mistral Studio Workflows.
  Use when building durable LLM pipelines, multi-step orchestration, or human-in-the-loop processes.
  Keywords: Mistral Studio, workflows, @workflow, @activity, Temporal, durable execution, AI orchestration, mistral-workflows-sdk, Workflows API.
user-invocable: true
allowed-tools: [Bash, WebSearch, Read, Write, Grep]
---

# Mistral Workflows Skill

**Use this skill when** you need to:
- Build multi-step LLM pipelines that survive crashes
- Orchestrate AI agents with hand-offs and shared state
- Create human-in-the-loop approval flows
- Replace custom queues/state machines with durable execution
- Schedule recurring AI tasks

Mistral Workflows is a **production-grade orchestration platform** built on [Temporal](https://temporal.io/), offering durability, retries, observability, and hybrid execution (Mistral hosts the orchestrator; you host the workers).

---

## When to Use Workflows

| **Use Workflows** | **Don't Use Workflows** |
|-------------------|--------------------------|
| Multi-step LLM pipelines | Single LLM API calls |
| Long-running processes (minutes to months) | Simple chat completions |
| Human approval/gating required | Stateless transformations |
| Need automatic retries/backoffs | |
| Shared state across agents | |

---

## Core Concepts

| Term | Purpose | Code Example |
|------|---------|--------------|
| **Workflow** | Orchestration logic (deterministic) | `@workflow.define()` (TS) / `@workflow` (Py) |
| **Activity** | Unit of work (side effects) | `@activities.activity()` (TS) / `@activity` (Py) |
| **Execution** | Single run with ID/history | Triggered via API/Studio |
| **Worker** | Process running your code | `mistral-workflows start` |
| **Deployment** | Named worker group | `--deployment my-deployment` |
| **Workflows API** | Orchestrator entry point | `POST /v1/workflows/{name}/execute` |

**Architecture**: Hybrid mode — Mistral hosts the orchestrator (state, history, task dispatch); you host workers (your code) in your environment.

---

## Setup

### 1. Install SDK

#### TypeScript
```bash
npm install @mistralai/workflows-sdk
```

#### Python
```bash
pip install mistral-workflows
```

### 2. Authenticate
Set your Mistral API key:
```bash
# TypeScript
export MISTRAL_API_KEY="your-api-key"

# Python
export MISTRAL_API_KEY="your-api-key"
```

### 3. Verify Installation
```bash
# Check SDK version (TypeScript)
npm list @mistralai/workflows-sdk

# Check SDK version (Python)
pip show mistral-workflows
```

---

## Create a Workflow

### TypeScript Example

#### Define Workflow + Activities
```typescript
// File: src/workflows/reportGenerator.ts
import { workflow, activities } from '@mistralai/workflows-sdk';

// Activity: Unit of work (side effects allowed)
@activities.activity({
  retry: { maximumAttempts: 3 },
})
async function generateReport(topic: string): Promise<string> {
  // Call LLM, APIs, or tools here
  console.log(`Generating report on ${topic}...`);
  // Example: Call Mistral LLM
  // const response = await mistral.chat.complete({...});
  return `Detailed report about ${topic}`;
}

@activities.activity()
async function validateReport(report: string): Promise<boolean> {
  console.log(`Validating report...`);
  return report.length > 10; // Simple validation
}

// Workflow: Orchestration logic (MUST be deterministic)
@workflow.define()
class ReportGeneratorWorkflow {
  @workflow.entrypoint()
  async run(topic: string): Promise<string> {
    // Step 1: Generate report
    const report = await this.generateReport(topic);
    
    // Step 2: Validate
    const isValid = await this.validateReport(report);
    
    if (!isValid) {
      throw new Error("Report validation failed");
    }
    
    return `Success: ${report}`;
  }
}

// Export for worker registration
module.exports = { ReportGeneratorWorkflow };
```

#### Worker Entry Point
```typescript
// File: src/worker.ts
import { Worker } from '@mistralai/workflows-sdk';
import { ReportGeneratorWorkflow } from './workflows/reportGenerator';

const worker = new Worker({
  deploymentName: 'report-generator-deployment',
  workflows: [ReportGeneratorWorkflow],
  activities: [generateReport, validateReport],
});

worker.run().catch(console.error);
```

#### Start the Worker
```bash
# In package.json
{
  "scripts": {
    "start": "ts-node src/worker.ts"
  }
}

# Run
npm start
```

---

### Python Example

#### Define Workflow + Activities
```python
# File: workflows/report_generator.py
from mistral_workflows import workflow, activity

# Activity: Unit of work
@activity
class GenerateReport:
    def run(self, topic: str) -> str:
        print(f"Generating report on {topic}...")
        # Call LLM, APIs, etc.
        return f"Detailed report about {topic}"

@activity
class ValidateReport:
    def run(self, report: str) -> bool:
        print("Validating report...")
        return len(report) > 10

# Workflow: Orchestration logic
@workflow
class ReportGeneratorWorkflow:
    def run(self, topic: str) -> str:
        # Step 1: Generate
        report = yield self.generate_report(topic)
        
        # Step 2: Validate
        is_valid = yield self.validate_report(report)
        
        if not is_valid:
            raise ValueError("Report validation failed")
        
        return f"Success: {report}"
```

#### Worker Entry Point
```python
# File: worker.py
from mistral_workflows import Worker
from workflows.report_generator import ReportGeneratorWorkflow

if __name__ == "__main__":
    worker = Worker(
        deployment_name="report-generator-deployment",
    )
    worker.run()
```

#### Start the Worker
```bash
python worker.py
```

---

## Trigger a Workflow

### Via API
```bash
# TypeScript/Python (same API)
curl -X POST "https://api.mistral.ai/v1/workflows/ReportGeneratorWorkflow/execute" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI trends in 2026"}'
```

### Via Mistral Studio UI
1. Navigate to **Studio > Workflows**
2. Select your workflow
3. Click **Run** and provide inputs via the generated form
4. Watch live execution timeline

### Via Le Chat
Workflows appear as assistants users can invoke in conversations.

---

## Common Patterns

### 1. Human-in-the-Loop Approval
```typescript
@workflow.define()
class ApprovalWorkflow {
  @workflow.entrypoint()
  async run(document: string): Promise<string> {
    // Step 1: Generate summary
    const summary = await this.generateSummary(document);
    
    // Step 2: Request human approval (pauses execution)
    const approved = await this.requestApproval(summary);
    
    if (!approved) {
      return "Rejected by user";
    }
    
    // Step 3: Publish
    return this.publishDocument(document);
  }
  
  @activities.activity()
  async requestApproval(summary: string): Promise<boolean> {
    // Signal workflow to pause; resume via API/Studio
    // Implementation: Use workflow signals or external triggers
    return true; // Placeholder
  }
}
```

### 2. Multi-Agent Orchestration
```typescript
@workflow.define()
class MultiAgentWorkflow {
  @workflow.entrypoint()
  async run(task: string): Promise<string> {
    // Agent 1: Researcher
    const research = await this.researchAgent(task);
    
    // Agent 2: Analyst (uses research output)
    const analysis = await this.analystAgent(research);
    
    // Agent 3: Summarizer
    return this.summarizerAgent(analysis);
  }
}
```

### 3. Fan-Out/Fan-In (Parallel Tasks)
```typescript
@workflow.define()
class FanOutWorkflow {
  @workflow.entrypoint()
  async run(urls: string[]): Promise<string[]> {
    // Fan-out: Process all URLs in parallel
    const promises = urls.map(url => this.fetchAndProcess(url));
    const results = await Promise.all(promises);
    
    // Fan-in: Aggregate results
    return this.aggregateResults(results);
  }
}
```

### 4. Scheduled Workflows
Use Mistral Studio to set up **recurring executions** (cron-style) for workflows like:
- Daily data processing
- Weekly report generation
- Periodic model evaluations

---

## Configuration Options

### Activity Configuration (TypeScript)
```typescript
@activities.activity({
  retry: {
    maximumAttempts: 5,
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
  },
  startToCloseTimeout: '30 seconds',
  scheduleToCloseTimeout: '1 minute',
})
```

### Python
```python
@activity(
    retry_policy=RetryPolicy(
        maximum_attempts=5,
        initial_interval=timedelta(seconds=1),
        maximum_interval=timedelta(minutes=1),
        backoff_coefficient=2,
    ),
    start_to_close_timeout=timedelta(seconds=30),
)
```

---

## Observability

### Event Streaming
Events stream in real-time during execution. View via:
- **Studio UI**: Live execution timeline
- **API**: `GET /v1/workflows/executions/{id}/history`
- **OpenTelemetry**: Native integration for traces

### Key Events
| Event Type | Description |
|------------|-------------|
| `WorkflowExecutionStarted` | Workflow run initiated |
| `ActivityScheduled` | Activity queued |
| `ActivityCompleted` | Activity succeeded |
| `ActivityFailed` | Activity failed (retries apply) |
| `WorkflowExecutionCompleted` | Workflow succeeded |
| `WorkflowExecutionFailed` | Workflow failed |

---

## Deployment

### Local Development
1. Run worker locally:
   ```bash
   # TypeScript
   npm start
   
   # Python
   python worker.py
   ```
2. Trigger via API/Studio
3. Test with sample inputs

### Production Deployment
1. **Containerize** your worker:
   ```dockerfile
   # TypeScript example
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   CMD ["npm", "start"]
   ```
2. **Deploy workers** to your infrastructure (Kubernetes, VMs, etc.)
3. **Scale horizontally**: Add more workers to the same deployment
4. **Monitor**: Use Studio UI or OpenTelemetry

### Environment Variables
```bash
# Required
MISTRAL_API_KEY="your-api-key"

# Optional
MISTRAL_WORKFLOWS_HOST="https://workflows.mistral.ai"  # Default
MISTRAL_DEPLOYMENT_NAME="my-deployment"
```

---

## Security

### Data Encryption
- **Automatic**: SDK encrypts payloads before sending to Mistral
- **At rest**: Mistral stores ciphertext only

### Payload Offloading
For inputs/outputs >2MB:
1. Upload to your storage (S3/GCS/Azure)
2. Pass reference to workflow
3. Mistral stores only the reference

**Configuration**:
```typescript
import { configurePayloadOffloading } from '@mistralai/workflows-sdk';

configurePayloadOffloading({
  storage: {
    type: 's3',
    bucket: 'my-workflow-bucket',
    region: 'us-east-1',
  },
});
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Worker fails to connect | Check `MISTRAL_API_KEY` is set |
| Workflow not found | Verify worker is running and registered |
| Activities stuck | Check retry configuration and timeouts |
| Out of memory | Reduce activity payload size or enable offloading |
| Permission denied | Ensure API key has workflows access |

### Debugging Commands
```bash
# Check worker logs
journalctl -u mistral-worker -f  # Systemd
kubectl logs <pod-name>           # Kubernetes

# List deployments
curl -H "Authorization: Bearer $MISTRAL_API_KEY" \
  https://api.mistral.ai/v1/workflows/deployments

# List workflow executions
curl -H "Authorization: Bearer $MISTRAL_API_KEY" \
  https://api.mistral.ai/v1/workflows/executions

# Get execution details
curl -H "Authorization: Bearer $MISTRAL_API_KEY" \
  https://api.mistral.ai/v1/workflows/executions/{execution-id}/history
```

---

## Verification Checklist

- [ ] SDK installed (`mistral-workflows` or `@mistralai/workflows-sdk`)
- [ ] `MISTRAL_API_KEY` environment variable set
- [ ] Workflow and activity classes defined with decorators
- [ ] Worker process started with correct deployment name
- [ ] Workflow triggered via API/Studio
- [ ] Execution visible in Studio UI with live events
- [ ] Retries work on activity failures
- [ ] Workflow resumes after worker restart

---

## Best Practices

1. **Keep workflows deterministic**: Same input + history = same output
2. **Put side effects in activities**: Never in workflow logic
3. **Use short timeouts**: Activities should fail fast
4. **Leverage retries**: Configure sensible backoff policies
5. **Monitor executions**: Use Studio UI or OpenTelemetry
6. **Test locally first**: Validate workflows before production
7. **Version workflows**: Use semantic versioning for deployment names
8. **Document inputs/outputs**: Clearly specify workflow signatures

---

## Related Skills

- `authoring-skills`: For creating additional agent skills
- `prd-spec-template`: For defining workflow requirements
- `vibe`: For Mistral Vibe CLI integration

---

## Resources

- [Mistral Workflows Docs](https://docs.mistral.ai/studio-api/workflows/getting-started/overview)
- [TypeScript SDK](https://docs.mistral.ai/getting-started/clients)
- [Your First Workflow](https://docs.mistral.ai/studio-api/workflows/getting-started/your_first_workflow)
- [Core Concepts](https://docs.mistral.ai/studio-api/workflows/getting-started/core_concepts)
- [API Reference](https://docs.mistral.ai/api/endpoint/workflows)
- [Temporal Documentation](https://docs.temporal.io/) (underlying orchestrator)
