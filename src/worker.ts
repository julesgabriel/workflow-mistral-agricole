import { Worker } from '@mistralai/workflows-sdk';
import { VineAiWorkflow } from './workflows/vineai.workflow';

const worker = new Worker({
  deploymentName: 'vineai-deployment',
  workflows: [VineAiWorkflow],
});

worker.run().catch(console.error);
