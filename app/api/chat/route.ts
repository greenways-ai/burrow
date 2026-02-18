import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createAIProvider } from '@/lib/ai';
import { Message } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, encryptedMessages } = body;

    if (!message || !encryptedMessages) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get active system prompt
    const { data: promptData } = await supabase
      .rpc('get_active_system_prompt');
    
    const systemPrompt = promptData || 'You are a helpful assistant.';

    // Get messages from encrypted data (for context)
    // In production, you might want to limit context window here
    let previousMessages: Message[] = [];
    try {
      const encryptedArray = JSON.parse(encryptedMessages);
      // We can't decrypt on server - this is client-side encrypted
      // Instead, we'll just use the current message
      // The client will handle maintaining full context
    } catch (e) {
      // Ignore parse errors
    }

    // Create message for AI
    const messagesForAI: Message[] = [
      ...previousMessages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      },
    ];

    // Create AI provider
    const ai = createAIProvider();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let conversationIdToSend = conversationId;

          // Create new conversation if needed
          if (!conversationIdToSend) {
            // We'll create it on client after streaming completes
            // For now, just indicate it's a new conversation
          }

          // Stream AI response
          for await (const chunk of ai.stream(messagesForAI, systemPrompt)) {
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }

          // Send done signal
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
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
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
