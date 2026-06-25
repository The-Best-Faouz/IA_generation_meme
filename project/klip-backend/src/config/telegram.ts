import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token, { polling: true });
  console.log('Bot Telegram initialisé');
} else {
  console.warn('TELEGRAM_BOT_TOKEN non configuré, le bot Telegram est désactivé');
}

export { bot };
