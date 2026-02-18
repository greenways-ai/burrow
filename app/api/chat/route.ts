import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendToTelegram } from '@/lib/telegram';

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

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        // Send confirmation message
        const confirmationMessage = "✅ **Message Received**\n\nYour message has been forwarded securely. An agent will review and respond shortly.";
        
        // Stream word by word for effect
        const words = confirmationMessage.split(' ');
        for (const word of words) {
          const chunk = word + ' ';
          const data = JSON.stringify({ content: chunk });
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 15));
        }

        // Send to Telegram
        try {
          await sendToTelegram({
            userMessage: message,
            aiResponse: '[Forwarded to Telegram - awaiting human response]',
            walletAddress: walletAddress || 'unknown',
            timestamp: Date.now(),
          });
          console.log('Message forwarded to Telegram');
        } catch (telegramError) {
          console.error('Telegram send error:', telegramError);
          // Send error to user if Telegram fails
          const errorData = JSON.stringify({ 
            error: 'Failed to forward message. Please try again.' 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
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
