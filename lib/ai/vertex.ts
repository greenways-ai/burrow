import { AIProvider, AIError } from './types';
import { Message } from '@/types';

export class VertexProvider implements AIProvider {
  private apiKey?: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async *stream(messages: Message[], systemPrompt: string): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new AIError('Google API key not configured', 'VERTEX_CONFIG_ERROR');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}`;

    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const body = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        topP: 0.95,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Vertex AI error:', response.status, error);
        throw new AIError(
          `Vertex AI error: ${error}`,
          'VERTEX_API_ERROR',
          response.status
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new AIError('No response body', 'VERTEX_API_ERROR');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === '[{') continue;

          try {
            // Handle streaming JSON format
            const cleanLine = trimmed.replace(/^,/, '').replace(/\]$/, '');
            if (!cleanLine) continue;

            const data = JSON.parse(cleanLine);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield text;
            }
          } catch (e) {
            // Skip malformed JSON lines
            continue;
          }
        }
      }
    } catch (error) {
      if (error instanceof AIError) throw error;
      console.error('Vertex AI streaming error:', error);
      throw new AIError(
        error instanceof Error ? error.message : 'Vertex AI streaming failed',
        'VERTEX_STREAM_ERROR'
      );
    }
  }
}

export function createVertexProvider(): VertexProvider | null {
  const apiKey = process.env.GOOGLE_API_KEY;
  const model = process.env.VERTEX_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    console.log('Vertex AI not configured (missing GOOGLE_API_KEY)');
    return null;
  }

  return new VertexProvider(apiKey, model);
}
