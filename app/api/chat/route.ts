import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createAIProvider } from '@/lib/ai';
import { sendToTelegram } from '@/lib/telegram';
import { Message } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, walletAddress } = body;

    console.log('Chat API called with message:', message?.substring(0, 50));

    if (!message) {
      return Response.json(
        { error: 'Missing message' },
        { status: 400 }
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

    // Try to create AI provider (Vertex)
    const ai = createAIProvider();
    
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        let aiFailed = false;

        if (ai) {
          try {
            console.log('Starting AI stream...');
            const messagesForAI: Message[] = [
              {
                id: crypto.randomUUID(),
                role: 'user',
                content: message,
                timestamp: Date.now(),
              },
            ];

            // Stream AI response
            for await (const chunk of ai.stream(messagesForAI, systemPrompt)) {
              fullResponse += chunk;
              const data = JSON.stringify({ content: chunk });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
            console.log('AI stream complete, length:', fullResponse.length);
          } catch (aiError) {
            console.error('AI error:', aiError);
            aiFailed = true;
          }
        }

        // If AI failed or not configured, use fallback
        if (!ai || aiFailed) {
          const fallbackMessage = aiFailed
            ? "⚠️ **AI Service Unavailable**\n\nYour message has been forwarded to our team via Telegram. We'll respond shortly."
            : "✅ **Message Received**\n\nYour message has been forwarded securely to our team. An agent will review and respond shortly.";
          
          fullResponse = fallbackMessage;
          
          // Stream fallback message
          const words = fallbackMessage.split(' ');
          for (const word of words) {
            const chunk = word + ' ';
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 15));
          }
        }

        // Send to Telegram
        try {
          await sendToTelegram({
            userMessage: message,
            aiResponse: fullResponse,
            walletAddress: walletAddress || 'unknown',
            timestamp: Date.now(),
          });
          console.log('Message forwarded to Telegram');
        } catch (telegramError) {
          console.error('Telegram send error:', telegramError);
        }
        
        // Send done signal
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
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
