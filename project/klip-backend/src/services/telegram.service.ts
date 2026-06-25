import TelegramBot from 'node-telegram-bot-api';

export const readMessages = async (bot: TelegramBot, chatId: string, limit: number = 20): Promise<any[]> => {
  const updates = await bot.getUpdates({ limit });
  return updates
    .filter((u) => u.message?.chat.id.toString() === chatId && u.message?.text)
    .map((u) => ({
      messageId: u.message?.message_id,
      text: u.message?.text,
      from: u.message?.from?.first_name || 'Inconnu',
      date: u.message?.date,
    }));
};

export const sendImageToChat = async (bot: TelegramBot, chatId: string, imageBuffer: Buffer, caption?: string): Promise<number> => {
  const sent = await bot.sendPhoto(chatId, imageBuffer, { caption: caption || '' });
  return sent.message_id;
};
