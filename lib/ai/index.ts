import { AIProvider, AIConfig } from './types';
import { VertexProvider } from './vertex';

export * from './types';
export { VertexProvider } from './vertex';

export function createAIProvider(config?: AIConfig): AIProvider | null {
  const provider = config?.provider || (process.env.AI_PROVIDER as 'vertex' | 'none') || 'none';
  
  switch (provider) {
    case 'vertex':
      const apiKey = config?.apiKey || process.env.GOOGLE_API_KEY;
      const model = config?.model || process.env.VERTEX_MODEL || 'gemini-1.5-flash';
      if (!apiKey) {
        console.log('Vertex AI not configured - missing GOOGLE_API_KEY');
        return null;
      }
      return new VertexProvider(apiKey, model);
      
    default:
      console.log('No AI provider configured, using Telegram fallback');
      return null;
  }
}
