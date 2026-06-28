import { generateCaptionWithGemini } from './gemini.service';

interface ConversationMessage {
  sender: string;
  text: string;
  timestamp: number;
}

interface MemeSuggestion {
  score: number;
  reason: string;
  suggestedMemeType: 'text' | 'image' | 'prompt';
  suggestedCaption?: string;
}

export async function analyzeConversationForMeme(
  messages: ConversationMessage[],
  country: string
): Promise<MemeSuggestion | null> {
  if (!messages || messages.length === 0) return null;

  try {
    const conversationText = messages
      .map(m => `${m.sender}: ${m.text}`)
      .join('\n');

    const prompt = `Analyse cette conversation et dis-moi si elle contient un moment propice à un meme (humour, embarras, ironie, situation absurde, inside joke, etc.).
Réponds UNIQUEMENT au format JSON sans markdown:
{
  "score": <0-100>,
  "reason": "<explication courte en français>",
  "suggestedMemeType": "text" | "image" | "prompt",
  "suggestedCaption": "<une légende de meme pertinente en français>"
}

Contexte culturel: ${country}
Conversation:
${conversationText}`;

    const result = await generateCaptionWithGemini('text', prompt, country, '');
    const text = typeof result === 'string' ? result : '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      score: 50,
      reason: 'Conversation analysée',
      suggestedMemeType: 'text',
      suggestedCaption: text.slice(0, 200),
    };
  } catch {
    return null;
  }
}

export async function batchAnalyzeNotifications(
  notifications: Array<{ title: string; text: string; packageName: string }>,
  country: string
): Promise<MemeSuggestion[]> {
  const results: MemeSuggestion[] = [];

  for (const notif of notifications) {
    if (notif.text && notif.text.length > 10) {
      const result = await analyzeConversationForMeme(
        [{ sender: notif.packageName, text: notif.text, timestamp: Date.now() }],
        country
      );
      if (result && result.score > 60) {
        results.push(result);
      }
    }
  }

  return results;
}
