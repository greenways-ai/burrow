import { AIProvider, AIConfig } from './types';
import { KimiProvider } from './kimi';
import { VertexProvider } from './vertex';

export * from './types';
export { KimiProvider } from './kimi';
export { VertexProvider } from './vertex';

export function createAIProvider(config?: AIConfig): AIProvider {
  const provider = config?.provider || (process.env.AI_PROVIDER as 'kimi' | 'vertex') || 'kimi';
  
  switch (provider) {
    case 'kimi':
      const kimiKey = config?.apiKey || process.env.KIMI_API_KEY!;
      const kimiModel = config?.model || process.env.KIMI_MODEL || 'kimi-k2-0711-longcontext';
      return new KimiProvider(kimiKey, kimiModel, config?.options);
      
    case 'vertex':
      const projectId = process.env.VERTEX_PROJECT_ID!;
      const location = process.env.VERTEX_LOCATION || 'us-central1';
      const vertexModel = config?.model || process.env.VERTEX_MODEL || 'gemini-2.0-pro-exp-02-05';
      return new VertexProvider(projectId, location, vertexModel, undefined, config?.options);
      
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
