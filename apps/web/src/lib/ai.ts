import { logger } from '@/lib/logger';

type AIMessage = { role: 'system' | 'user' | 'assistant'; content: unknown };

interface AIProvider {
  key: string | undefined;
  url: string;
  model: string;
  extraBody?: Record<string, unknown>;
}

const PROVIDERS: AIProvider[] = [
  { key: process.env.OPENAI_API_KEY, url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  { key: process.env.GROQ_API_KEY, url: 'https://api.groq.com/openai/v1/chat/completions', model: 'openai/gpt-oss-120b', extraBody: { reasoning_effort: 'low' } },
];

export function aiConfigured(): boolean {
  return PROVIDERS.some((p) => p.key);
}

export async function aiChat(
  messages: AIMessage[],
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<string | null> {
  for (const provider of PROVIDERS) {
    if (!provider.key) continue;
    try {
      const res = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          max_tokens: opts.maxTokens ?? 800,
          temperature: opts.temperature ?? 0.7,
          ...(provider.extraBody || {}),
        }),
      });
      if (!res.ok) {
        logger.error(`AI provider ${provider.url} respondeu ${res.status}`);
        continue;
      }
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content || '';
      if (text.trim()) return text.trim();
    } catch (err) {
      logger.error('AI provider falhou:', err);
    }
  }
  return null;
}
