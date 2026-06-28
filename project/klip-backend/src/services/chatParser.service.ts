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
    let matched = false;
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
        matched = true;
        break;
      }
    }
  }

  // Fallback for raw, unstructured copypastas of shape "Name: Message" without timestamps
  if (messages.length === 0) {
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        const sender = line.substring(0, colonIdx).trim();
        const text = line.substring(colonIdx + 1).trim();
        if (sender && text && !sender.includes(' ') && !sender.match(/\d/)) { // simple checks for a name
          participants.add(sender);
          messages.push({
            sender,
            text,
            timestamp: new Date(),
          });
        }
      }
    }
  }

  // Final fallback: treat the whole content as a single raw prompt message
  if (messages.length === 0) {
    participants.add('Auteur');
    messages.push({
      sender: 'Auteur',
      text: content.trim(),
      timestamp: new Date(),
    });
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
