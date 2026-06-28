let TelegramBotModule: any = null;

async function getTelegramBot(): Promise<any> {
  if (!TelegramBotModule) {
    TelegramBotModule = await import('node-telegram-bot-api');
  }
  return TelegramBotModule.default || TelegramBotModule;
}

export const readMessages = async (bot: any, chatId: string, limit: number = 20): Promise<any[]> => {
  const updates = await bot.getUpdates({ limit });
  return updates
    .filter((u: any) => u.message?.chat.id.toString() === chatId && u.message?.text)
    .map((u: any) => ({
      messageId: u.message?.message_id,
      text: u.message?.text,
      from: u.message?.from?.first_name || 'Inconnu',
      date: u.message?.date,
    }));
};

export const sendImageToChat = async (bot: any, chatId: string, imageBuffer: Buffer, caption?: string): Promise<number> => {
  const sent = await bot.sendPhoto(chatId, imageBuffer, { caption: caption || '' });
  return sent.message_id;
};
