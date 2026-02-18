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

    // Check if Kimi API key is configured and valid
    const kimiKey = process.env.KIMI_API_KEY;
    let useKimi = false;
    
    if (kimiKey && kimiKey.length > 10 && !kimiKey.includes('your-')) {
      useKimi = true;
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        let kimiFailed = false;

        if (useKimi) {
          try {
            console.log('Creating AI provider...');
            const ai = createAIProvider();

            console.log('Starting Kimi stream...');
            // Stream AI response
            for await (const chunk of ai.stream(messagesForAI, systemPrompt)) {
              fullResponse += chunk;
              const data = JSON.stringify({ content: chunk });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
            console.log('Kimi stream complete, total length:', fullResponse.length);
          } catch (aiError) {
            console.error('Kimi AI error:', aiError);
            kimiFailed = true;
            // Don't throw - fall through to Telegram-only mode
          }
        }

        // If Kimi failed or not configured, use Telegram-only mode
        if (!useKimi || kimiFailed) {
          const fallbackMessage = !useKimi 
            ? "🔒 **Secure Message Forwarded**\n\nYour message has been securely forwarded to our team. Kimi AI is currently unavailable - please check back later or contact support."
            : "🔒 **Secure Message Forwarded**\n\nYour message has been securely forwarded to our team. The AI service is temporarily unavailable - please try again in a few minutes.";
          
          fullResponse = fallbackMessage;
          
          // Stream the fallback message word by word for effect
          const words = fallbackMessage.split(' ');
          for (const word of words) {
            const chunk = word + ' ';
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        // Always send to Telegram (regardless of Kimi success)
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
          // Don't fail the request if Telegram fails
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
