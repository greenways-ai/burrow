import { AIProvider, AIStreamOptions, AIError } from './types';
import { Message } from '@/types';

interface VertexMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class VertexProvider implements AIProvider {
  private projectId: string;
  private location: string;
  private model: string;
  private credentials: string;
  private options: AIStreamOptions;

  constructor(
    projectId: string,
    location: string,
    model: string = 'gemini-2.0-pro-exp-02-05',
    credentialsPath?: string,
    options: AIStreamOptions = {}
  ) {
    this.projectId = projectId;
    this.location = location;
    this.model = model;
    this.credentials = credentialsPath || process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
    this.options = {
      temperature: 0.7,
      maxTokens: 4096,
      ...options,
    };
  }

  async *stream(
    messages: Message[],
    systemPrompt: string
  ): AsyncGenerator<string> {
    // Get access token from credentials
    const accessToken = await this.getAccessToken();
    
    const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:streamGenerateContent`;

    // Format messages for Vertex AI (Gemini format)
    const vertexMessages: VertexMessage[] = [];
    
    // Add system prompt as first user message with special marker
    if (systemPrompt) {
      vertexMessages.push({
        role: 'user',
        parts: [{ text: `[System Instruction: ${systemPrompt}]` }],
      });
      vertexMessages.push({
        role: 'model',
        parts: [{ text: 'Understood.' }],
      });
    }

    for (const message of messages) {
      vertexMessages.push({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        contents: vertexMessages,
        generationConfig: {
          temperature: this.options.temperature,
          maxOutputTokens: this.options.maxTokens,
          topP: this.options.topP,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new AIError(
        `Vertex AI error: ${error}`,
        'VERTEX_API_ERROR',
        response.status
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new AIError('No response body', 'EMPTY_RESPONSE');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const data = JSON.parse(trimmed);
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async getAccessToken(): Promise<string> {
    // In production, use Google Auth library or service account
    // For this implementation, we assume the token is provided via environment
    const token = process.env.VERTEX_ACCESS_TOKEN;
    if (!token) {
      throw new AIError('Vertex access token not configured', 'MISSING_CREDENTIALS');
    }
    return token;
  }
}
