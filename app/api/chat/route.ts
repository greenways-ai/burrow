import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createAIProvider } from '@/lib/ai';
import { sendToTelegram } from '@/lib/telegram';
import { Message } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, encryptedMessages, walletAddress } = body;

    console.log('Chat API called with message:', message?.substring(0, 50));

    if (!message) {
      return Response.json(
        { error: 'Missing message' },
        { status: 400 }
      );
    }

    // Check if Kimi API key is configured
    const kimiKey = process.env.KIMI_API_KEY;
    if (!kimiKey) {
      console.error('KIMI_API_KEY not configured');
      return Response.json(
        { error: 'AI provider not configured' },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();

    // Get active system prompt
    let systemPrompt = 'You are a helpful AI assistant.';
    try {
      const { data: promptData } = await supabase
        .rpc('get_active_system_prompt');
      if (promptData) systemPrompt = promptData;
    } catch (e) {
      console.log('Using default system prompt');
    }

    // Create message for AI
    const messagesForAI: Message[] = [
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      },
    ];

    console.log('Creating AI provider...');
    // Create AI provider
    const ai = createAIProvider();

    // Collect full response for Telegram
    let fullResponse = '';

    console.log('Starting stream...');
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream AI response
          for await (const chunk of ai.stream(messagesForAI, systemPrompt)) {
            fullResponse += chunk;
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }

          console.log('Stream complete, total length:', fullResponse.length);
          
          // Send to Telegram after stream completes
          await sendToTelegram({
            userMessage: message,
            aiResponse: fullResponse,
            walletAddress: walletAddress || 'unknown',
            timestamp: Date.now(),
          });
          
          // Send done signal
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Streaming error';
          const data = JSON.stringify({ error: errorMsg });
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
