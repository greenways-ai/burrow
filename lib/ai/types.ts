import { Message } from '@/types';

export interface AIProvider {
  stream(messages: Message[], systemPrompt: string): AsyncGenerator<string>;
}

export interface AIStreamOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIConfig {
  provider: 'kimi' | 'vertex';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  options?: AIStreamOptions;
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}
