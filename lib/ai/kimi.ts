import { AIProvider, AIStreamOptions, AIError } from './types';
import { Message } from '@/types';

interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class KimiProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private options: AIStreamOptions;

  constructor(
    apiKey: string,
    model: string = 'kimi-k2-0711-longcontext',
    options: AIStreamOptions = {}
  ) {
    this.apiKey = apiKey;
    this.model = model;
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
    const url = 'https://api.moonshot.cn/v1/chat/completions';

    // Format messages for Kimi API
    const kimiMessages: KimiMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m): KimiMessage => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    console.log('Kimi API call:', {
      url,
      model: this.model,
      messageCount: kimiMessages.length,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: kimiMessages,
        stream: true,
        temperature: this.options.temperature,
        max_tokens: this.options.maxTokens,
        top_p: this.options.topP,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Kimi API error:', response.status, error);
      throw new AIError(
        `Kimi API error: ${error}`,
        'KIMI_API_ERROR',
        response.status
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new AIError('No response body', 'EMPTY_RESPONSE');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            
            // Handle different response formats
            const content = data.choices?.[0]?.delta?.content || 
                           data.choices?.[0]?.text ||
                           data.delta?.content;
                           
            if (content && typeof content === 'string') {
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
}
