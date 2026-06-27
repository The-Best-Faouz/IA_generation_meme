interface ParsedMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

interface ParsedChat {
  title: string;
  messages: ParsedMessage[];
  participants: string[];
}

export function parseWhatsAppChat(content: string): ParsedChat {
  const lines = content.split('\n').filter(l => l.trim());
  const messages: ParsedMessage[] = [];
  const participants = new Set<string>();

  const patterns = [
    /\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:AM|PM)?\]?\s*([^:]+):\s*(.+)/,
    /(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.+)/,
    /(\d{4}-\d{2}-\d{2}),?\s*(\d{2}:\d{2})\s*-\s*([^:]+):\s*(.+)/,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, , , sender, text] = match;
        const cleanSender = sender.trim();
        participants.add(cleanSender);
        messages.push({
          sender: cleanSender,
          text: text.trim(),
          timestamp: new Date(),
        });
        break;
      }
    }
  }

  const title = participants.size > 0
    ? Array.from(participants).slice(0, 3).join(', ')
    : 'Conversation importée';

  return { title, messages, participants: Array.from(participants) };
}

export function extractMediaReferences(content: string): string[] {
  const mediaPattern = /<Media omitted>|<image omitted>|<video omitted>|<audio omitted>|<sticker omitted>|<attached: [^>]+>/gi;
  return content.match(mediaPattern) || [];
}

export function conversationStats(messages: ParsedMessage[]) {
  const perPerson: Record<string, number> = {};
  let totalWords = 0;

  for (const msg of messages) {
    perPerson[msg.sender] = (perPerson[msg.sender] || 0) + 1;
    totalWords += msg.text.split(/\s+/).length;
  }

  return {
    totalMessages: messages.length,
    totalWords,
    messagesPerPerson: perPerson,
  };
}
