# Mistral Workflows Examples

This file contains **ready-to-use code examples** for common Mistral Workflows patterns. Copy, adapt, and integrate into your projects.

---

## 1. Basic LLM Chain

**Use case**: Sequential LLM calls (e.g., extract → summarize → translate)

### TypeScript
```typescript
// workflows/llmChain.ts
import { workflow, activities } from '@mistralai/workflows-sdk';
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral(process.env.MISTRAL_API_KEY);

@activities.activity()
async function extractData(text: string): Promise<string> {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{
      role: 'user',
      content: `Extract key data points from this text:\n${text}`,
    }],
  });
  return response.choices[0].message.content;
}

@activities.activity()
async function summarize(text: string): Promise<string> {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{
      role: 'user',
      content: `Summarize this in 3 bullet points:\n${text}`,
    }],
  });
  return response.choices[0].message.content;
}

@workflow.define()
class LLMChainWorkflow {
  @workflow.entrypoint()
  async run(inputText: string): Promise<{extracted: string; summary: string}> {
    const extracted = await this.extractData(inputText);
    const summary = await this.summarize(extracted);
    return { extracted, summary };
  }
}
```

### Python
```python
# workflows/llm_chain.py
from mistral_workflows import workflow, activity
from mistralai.client import Mistral

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

@activity
class ExtractData:
    def run(self, text: str) -> str:
        response = client.chat.complete(
            model="mistral-large-latest",
            messages=[{
                "role": "user",
                "content": f"Extract key data points from this text:\n{text}"
            }]
        )
        return response.choices[0].message.content

@activity
class Summarize:
    def run(self, text: str) -> str:
        response = client.chat.complete(
            model="mistral-large-latest",
            messages=[{
                "role": "user",
                "content": f"Summarize this in 3 bullet points:\n{text}"
            }]
        )
        return response.choices[0].message.content

@workflow
class LLMChainWorkflow:
    def run(self, input_text: str) -> dict:
        extracted = yield self.extract_data(input_text)
        summary = yield self.summarize(extracted)
        return {"extracted": extracted, "summary": summary}
```

**Trigger**:
```bash
curl -X POST "https://api.mistral.ai/v1/workflows/LLMChainWorkflow/execute" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -d '{"inputText": "Your long document here..."}'
```

---

## 2. RAG Pipeline with Vector DB

**Use case**: Retrieve-Augment-Generate with external knowledge base

### TypeScript
```typescript
// workflows/ragPipeline.ts
import { workflow, activities } from '@mistralai/workflows-sdk';
import { Mistral } from '@mistralai/mistralai';
import { Pinecone } from '@pinecone-database/pinecone';

const client = new Mistral(process.env.MISTRAL_API_KEY);
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

@activities.activity()
async function embedQuery(query: string): Promise<number[]> {
  // Replace with your embedding model
  const response = await client.embeddings.create({
    model: 'mistral-embed',
    inputs: [query],
  });
  return response.data[0].embedding;
}

@activities.activity()
async function searchVectors(
  indexName: string,
  vector: number[],
  topK: number = 3
): Promise<Array<{id: string; score: number; text: string}>> {
  const index = pinecone.Index(indexName);
  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });
  return results.matches.map(m => ({
    id: m.id,
    score: m.score,
    text: m.metadata?.text || '',
  }));
}

@activities.activity()
async function generateAnswer(
  query: string,
  context: string
): Promise<string> {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{
      role: 'user',
      content: `Answer this question using the following context:\n\nContext:\n${context}\n\nQuestion:\n${query}`,
    }],
  });
  return response.choices[0].message.content;
}

@workflow.define()
class RAGPipelineWorkflow {
  @workflow.entrypoint()
  async run(query: string, indexName: string = 'my-knowledge-base'): Promise<string> {
    // Step 1: Embed the query
    const vector = await this.embedQuery(query);
    
    // Step 2: Search vector DB
    const results = await this.searchVectors(indexName, vector);
    
    // Step 3: Build context from top results
    const context = results.map(r => r.text).join('\n\n');
    
    // Step 4: Generate answer
    return this.generateAnswer(query, context);
  }
}
```

**Environment Variables Needed**:
```bash
MISTRAL_API_KEY="..."
PINECONE_API_KEY="..."
```

---

## 3. Human Approval Flow

**Use case**: Content generation with human review step

### TypeScript (with Signals)
```typescript
// workflows/contentApproval.ts
import { workflow, activities, signals } from '@mistralai/workflows-sdk';

// Signal to resume workflow after approval
const approvalSignal = signals.create<void>('approval-received');
const rejectionSignal = signals.create<{reason: string}>('rejection-received');

@activities.activity()
async function generateContent(prompt: string): Promise<string> {
  // Generate content using LLM
  return `Generated content for: ${prompt}`;
}

@activities.activity()
async function saveContent(content: string): Promise<string> {
  // Save to database, CMS, etc.
  console.log(`Saving content: ${content}`);
  return 'content-123'; // Return ID
}

@workflow.define()
class ContentApprovalWorkflow {
  approvalReceived = approvalSignal;
  rejectionReceived = rejectionSignal;

  @workflow.entrypoint()
  async run(prompt: string): Promise<{status: string; content?: string; reason?: string}> {
    // Step 1: Generate content
    const content = await this.generateContent(prompt);
    
    // Step 2: Wait for human approval (pauses here)
    const signal = await this.waitForSignal();
    
    if (signal === this.approvalReceived) {
      // Approved: save and continue
      const contentId = await this.saveContent(content);
      return { status: 'approved', content };
    } else if (signal === this.rejectionReceived) {
      // Rejected: capture reason
      const { reason } = this.rejectionReceived.args;
      return { status: 'rejected', reason };
    }
    
    throw new Error('Unexpected signal');
  }
  
  @workflow.signal()
  async waitForSignal(): Promise<any> {
    return await this.waitForSignals([
      this.approvalReceived,
      this.rejectionReceived,
    ]);
  }
}
```

**Trigger Approval via API**:
```bash
# Approve
curl -X POST "https://api.mistral.ai/v1/workflows/executions/{execution-id}/signal" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -d '{"signalName": "approval-received"}'

# Reject
curl -X POST "https://api.mistral.ai/v1/workflows/executions/{execution-id}/signal" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -d '{"signalName": "rejection-received", "args": {"reason": "Needs revision"}}'
```

---

## 4. Parallel Data Processing

**Use case**: Process multiple files/URLs concurrently

### TypeScript
```typescript
// workflows/parallelProcessor.ts
import { workflow, activities } from '@mistralai/workflows-sdk';

@activities.activity({ concurrencyLimit: 10 })
async function processItem(item: {id: string; url: string}): Promise<{id: string; result: string}> {
  // Simulate processing (e.g., scrape, analyze, transform)
  console.log(`Processing ${item.id}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: item.id, result: `Processed ${item.url}` };
}

@workflow.define()
class ParallelProcessorWorkflow {
  @workflow.entrypoint()
  async run(items: Array<{id: string; url: string}>): Promise<Array<{id: string; result: string}>> {
    // Process all items in parallel
    const promises = items.map(item => this.processItem(item));
    return await Promise.all(promises);
  }
}
```

### Python
```python
# workflows/parallel_processor.py
from mistral_workflows import workflow, activity
from typing import List

@activity
class ProcessItem:
    def run(self, item: dict) -> dict:
        print(f"Processing {item['id']}...")
        import time
        time.sleep(1)  # Simulate work
        return {"id": item["id"], "result": f"Processed {item['url']}"}

@workflow
class ParallelProcessorWorkflow:
    def run(self, items: List[dict]) -> List[dict]:
        # Process all items in parallel
        results = []
        for item in items:
            results.append(yield self.process_item(item))
        return results
```

**Note**: Python uses `yield` which processes sequentially. For true parallelism, use TypeScript or structure as fan-out/fan-in with external coordination.

---

## 5. Error Handling & Retries

**Use case**: Robust workflows with custom retry logic

### TypeScript
```typescript
// workflows/robustWorkflow.ts
import { workflow, activities } from '@mistralai/workflows-sdk';

@activities.activity({
  retry: {
    maximumAttempts: 5,
    initialInterval: '1s',
    maximumInterval: '30s',
    backoffCoefficient: 2,
  },
  startToCloseTimeout: '2m',
})
async function unreliableAPICall(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API failed with status ${response.status}`);
  }
  return response.json();
}

@workflow.define()
class RobustWorkflow {
  @workflow.entrypoint()
  async run(url: string): Promise<{data: any; attempts: number}> {
    let attempts = 0;
    
    try {
      const data = await this.unreliableAPICall(url);
      return { data, attempts: attempts + 1 };
    } catch (error) {
      attempts++;
      if (attempts >= 5) {
        throw new Error(`Failed after ${attempts} attempts: ${error.message}`);
      }
      // Exponential backoff (handled by activity retry config)
      throw error; // Will be retried by Temporal
    }
  }
}
```

---

## 6. Chaining Workflows

**Use case**: Invoke one workflow from another

### TypeScript
```typescript
// workflows/parentWorkflow.ts
import { workflow, activities } from '@mistralai/workflows-sdk';

@workflow.define()
class ChildWorkflow {
  @workflow.entrypoint()
  async run(input: string): Promise<string> {
    return `Child processed: ${input}`;
  }
}

@workflow.define()
class ParentWorkflow {
  @workflow.entrypoint()
  async run(input: string): Promise<{childResult: string; parentResult: string}> {
    // Start child workflow
    const childExecution = await this.startWorkflow(ChildWorkflow, { input });
    
    // Wait for child to complete
    const childResult = await childExecution.result();
    
    // Continue parent logic
    const parentResult = `Parent processed: ${childResult}`;
    
    return { childResult, parentResult };
  }
}
```

**Note**: Child workflows run in the same execution context and share the same durability guarantees.

---

## 7. Dynamic Workflow Selection

**Use case**: Choose workflow path based on input

### TypeScript
```typescript
// workflows/dynamicRouter.ts
import { workflow, activities } from '@mistralai/workflows-sdk';

@activities.activity()
async function classifyInput(text: string): Promise<'image' | 'text' | 'audio'> {
  // Use LLM to classify
  if (text.includes('http') && text.includes('.jpg')) return 'image';
  if (text.includes('http') && text.includes('.mp3')) return 'audio';
  return 'text';
}

@workflow.define()
class ImageProcessingWorkflow {
  @workflow.entrypoint()
  async run(url: string): Promise<string> {
    return `Processed image: ${url}`;
  }
}

@workflow.define()
class TextProcessingWorkflow {
  @workflow.entrypoint()
  async run(text: string): Promise<string> {
    return `Processed text: ${text}`;
  }
}

@workflow.define()
class DynamicRouterWorkflow {
  @workflow.entrypoint()
  async run(input: string): Promise<string> {
    const type = await this.classifyInput(input);
    
    switch (type) {
      case 'image':
        return this.startWorkflow(ImageProcessingWorkflow, { url: input }).result();
      case 'text':
        return this.startWorkflow(TextProcessingWorkflow, { text: input }).result();
      default:
        return `Unsupported type: ${type}`;
    }
  }
}
```

---

## 8. Scheduled Workflow (Cron)

**Use case**: Recurring tasks (e.g., daily reports)

Scheduled workflows are configured via **Mistral Studio UI**:

1. Deploy your workflow worker
2. In Studio > Workflows:
   - Select your workflow
   - Click **Schedule**
   - Set cron expression (e.g., `0 9 * * *` for daily at 9 AM)
   - Configure inputs
3. Studio manages the recurring triggers

**Example Workflow for Scheduling**:
```typescript
@workflow.define()
class DailyReportWorkflow {
  @workflow.entrypoint()
  async run(): Promise<string> {
    // This runs daily at scheduled time
    const date = new Date().toISOString();
    const report = await this.generateDailyReport(date);
    await this.emailReport(report);
    return `Daily report generated for ${date}`;
  }
  
  @activities.activity()
  async generateDailyReport(date: string): Promise<string> {
    // Generate report logic
    return `Report data for ${date}`;
  }
  
  @activities.activity()
  async emailReport(report: string): Promise<void> {
    // Send email with report
  }
}
```

**Cron Examples**:
| Schedule | Cron Expression |
|----------|-----------------|
| Every hour | `0 * * * *` |
| Daily at 9 AM | `0 9 * * *` |
| Weekly on Monday | `0 0 * * 1` |
| Monthly on 1st | `0 0 1 * *` |

---

## 9. Workflow with External API Calls

**Use case**: Integrate with third-party services

### TypeScript
```typescript
// workflows/apiIntegration.ts
import { workflow, activities } from '@mistralai/workflows-sdk';

@activities.activity()
async function fetchWeather(city: string): Promise<{temp: number; condition: string}> {
  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
  );
  const data = await response.json();
  return {
    temp: data.current.temp_c,
    condition: data.current.condition.text,
  };
}

@activities.activity()
async function logToSlack(message: string): Promise<void> {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({ text: message }),
  });
}

@workflow.define()
class WeatherAlertWorkflow {
  @workflow.entrypoint()
  async run(city: string, threshold: number = 30): Promise<string> {
    const weather = await this.fetchWeather(city);
    
    if (weather.temp > threshold) {
      await this.logToSlack(
        `🌡️ High temperature alert! ${city}: ${weather.temp}°C (${weather.condition})`
      );
      return `Alert sent for ${city}`;
    }
    
    return `Normal weather in ${city}: ${weather.temp}°C`;
  }
}
```

---

## 10. Workflow Testing

### TypeScript Test Example (using Jest)
```typescript
// workflows/reportGenerator.test.ts
import { TestWorkflowEnvironment } from '@mistralai/workflows-sdk/testing';
import { ReportGeneratorWorkflow } from './reportGenerator';

describe('ReportGeneratorWorkflow', () => {
  let env: TestWorkflowEnvironment;

  beforeAll(async () => {
    env = await TestWorkflowEnvironment.create();
  });

  afterAll(async () => {
    await env.teardown();
  });

  it('should generate and validate report', async () => {
    const result = await env.runWorkflow(
      ReportGeneratorWorkflow,
      { topic: 'Test Topic' }
    );
    
    expect(result).toContain('Test Topic');
  });

  it('should fail on invalid report', async () => {
    // Mock validateReport to return false
    env.mockActivity('validateReport', async () => false);
    
    await expect(
      env.runWorkflow(ReportGeneratorWorkflow, { topic: 'Test' })
    ).rejects.toThrow('Report validation failed');
  });
});
```

### Python Test Example (using pytest)
```python
# tests/test_report_generator.py
from mistral_workflows.testing import WorkflowTestEnvironment
from workflows.report_generator import ReportGeneratorWorkflow

def test_report_generator():
    env = WorkflowTestEnvironment()
    
    result = env.run_workflow(
        ReportGeneratorWorkflow,
        input={"topic": "Test Topic"}
    )
    
    assert "Test Topic" in result
    env.teardown()

def test_validation_failure():
    env = WorkflowTestEnvironment()
    
    # Mock activity to fail
    env.mock_activity("validate_report", lambda *args: False)
    
    with pytest.raises(ValueError, match="Report validation failed"):
        env.run_workflow(ReportGeneratorWorkflow, input={"topic": "Test"})
    
    env.teardown()
```

---

## 11. Workflow with File I/O

**Use case**: Read/process/write files

### TypeScript
```typescript
// workflows/fileProcessor.ts
import { workflow, activities } from '@mistralai/workflows-sdk';
import * as fs from 'fs/promises';
import * as path from 'path';

@activities.activity()
async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

@activities.activity()
async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}

@activities.activity()
async function processContent(content: string): Promise<string> {
  // Process content (e.g., with LLM)
  return content.toUpperCase();
}

@workflow.define()
class FileProcessorWorkflow {
  @workflow.entrypoint()
  async run(inputPath: string, outputPath: string): Promise<{bytesProcessed: number}> {
    // Read file
    const content = await this.readFile(inputPath);
    
    // Process content
    const processed = await this.processContent(content);
    
    // Write output
    await this.writeFile(outputPath, processed);
    
    return { bytesProcessed: processed.length };
  }
}
```

**Note**: For large files (>2MB), use payload offloading to external storage.

---

## 12. Workflow with Database Operations

**Use case**: Store/retrieve data from PostgreSQL

### TypeScript
```typescript
// workflows/dbWorkflow.ts
import { workflow, activities } from '@mistralai/workflows-sdk';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

@activities.activity()
async function getUser(userId: string): Promise<{id: string; name: string; email: string} | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}

@activities.activity()
async function createOrder(userId: string, items: string[]): Promise<string> {
  const result = await pool.query(
    'INSERT INTO orders (user_id, items) VALUES ($1, $2) RETURNING id',
    [userId, JSON.stringify(items)]
  );
  return result.rows[0].id;
}

@workflow.define()
class OrderWorkflow {
  @workflow.entrypoint()
  async run(userId: string, items: string[]): Promise<{orderId: string; userEmail: string}> {
    // Get user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Create order
    const orderId = await this.createOrder(userId, items);
    
    return { orderId, userEmail: user.email };
  }
}
```

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Start worker (TS) | `npm start` |
| Start worker (Py) | `python worker.py` |
| List deployments | `curl -H "Authorization: Bearer $API_KEY" https://api.mistral.ai/v1/workflows/deployments` |
| List executions | `curl -H "Authorization: Bearer $API_KEY" https://api.mistral.ai/v1/workflows/executions` |
| Get execution history | `curl -H "Authorization: Bearer $API_KEY" https://api.mistral.ai/v1/workflows/executions/{id}/history` |
| Trigger workflow | `curl -X POST https://api.mistral.ai/v1/workflows/{WorkflowName}/execute -H "Authorization: Bearer $API_KEY" -d '{"param": "value"}'` |
| Signal workflow | `curl -X POST https://api.mistral.ai/v1/workflows/executions/{id}/signal -H "Authorization: Bearer $API_KEY" -d '{"signalName": "signal-name", "args": {}}'` |
