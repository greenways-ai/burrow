// Telegram Bot API integration for forwarding chat messages

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Your personal chat ID with the bot
const TELEGRAM_ENABLED = process.env.TELEGRAM_ENABLED === 'true';

export interface TelegramMessage {
  userMessage: string;
  aiResponse?: string;
  walletAddress?: string;
  timestamp: number;
}

/**
 * Send a message to Telegram bot
 */
export async function sendToTelegram(message: TelegramMessage): Promise<void> {
  if (!TELEGRAM_ENABLED || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram integration disabled or not configured');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const text = formatTelegramMessage(message);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
    } else {
      console.log('Message forwarded to Telegram successfully');
    }
  } catch (error) {
    console.error('Failed to send to Telegram:', error);
  }
}

/**
 * Format the message for Telegram
 */
function formatTelegramMessage(message: TelegramMessage): string {
  const timestamp = new Date(message.timestamp).toLocaleString();
  const wallet = message.walletAddress 
    ? `\`${message.walletAddress.slice(0, 6)}...${message.walletAddress.slice(-4)}\`` 
    : 'Unknown';

  let text = `🔐 *Burrow Chat Message*\n\n`;
  text += `👤 *Wallet:* ${wallet}\n`;
  text += `🕐 *Time:* ${timestamp}\n\n`;
  text += `💬 *User:*\n${escapeMarkdown(message.userMessage)}\n\n`;

  if (message.aiResponse) {
    // Truncate long responses for Telegram
    const truncatedResponse = message.aiResponse.length > 500 
      ? message.aiResponse.slice(0, 500) + '...' 
      : message.aiResponse;
    text += `🤖 *AI Response:*\n${escapeMarkdown(truncatedResponse)}`;
  }

  return text;
}

/**
 * Escape Markdown special characters
 */
function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}

/**
 * Test Telegram connection
 */
export async function testTelegramConnection(): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('TELEGRAM_BOT_TOKEN not set');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.ok) {
      console.log('Telegram bot connected:', data.result.username);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Telegram connection test failed:', error);
    return false;
  }
}
