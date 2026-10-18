import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { extractReasoningMiddleware, generateText, Output, wrapLanguageModel } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { z } from 'zod';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  fetch: expoFetch as unknown as typeof globalThis.fetch,
  supportsStructuredOutputs: true,
  headers: { 'X-OpenRouter-Title': 'rn-app' },
});

export const ROLES = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'particle',
  'conjunction',
  'grammar_phrase',
  'other',
] as const;

export type Role = (typeof ROLES)[number];

const schema = z.object({
  translation: z.string(),
  chunks: z.array(
    z.object({
      text: z.string(),
      reading: z.array(z.object({ text: z.string(), furi: z.string().optional() })),
      role: z.enum(ROLES),
      meaning: z.object({ in_context: z.string(), dictionary: z.string() }).optional(),
      grammar: z
        .object({
          dictionary_form: z.string().optional(),
          conjugation: z.string().optional(),
          explanation: z.string().optional(),
          implication: z.string().optional(),
        })
        .optional(),
    }),
  ),
});

export type Analysis = z.infer<typeof schema>;
export type Chunk = Analysis['chunks'][number];

const instructions = `You analyze a Japanese sentence into chunks by grammar function.
- translation: natural English meaning of the whole sentence.
- A newline in the input is its own chunk: text "\\n", role other, reading [{"text":"\\n"}].
- Output only the final JSON. No reasoning, no <think> text, no commentary.
- Chunks, concatenated in order, must equal the input sentence exactly (including punctuation).
- role: noun, verb, adjective, adverb, particle, conjunction, grammar_phrase (e.g. たびに, うちに, たところ), other.
- A verb chunk includes its auxiliaries (しています is one chunk); explain the conjugation parts in grammar.conjugation and give grammar.dictionary_form.
- Adjectives: also give grammar.dictionary_form / conjugation when inflected.
- Particles, conjunctions and grammar_phrase must ALWAYS be explained: grammar.explanation = the grammar pattern or what it means in general; grammar.implication = what it implies in the context of this sentence.
- meaning (in_context, dictionary; English): only for words with lexical meaning. Omit for particles, conjunctions and grammar_phrase.
- reading: furigana segments whose texts concatenate to the chunk text. Furigana is ONLY for words containing kanji (kanji-only, or kanji + okurigana). Put furi (hiragana) only on the run of kanji; compounds are one segment (勉強 -> furi べんきょう); okurigana is a separate segment without furi (食べる -> {食, furi た}, {べる}). Words written purely in hiragana or katakana (は, です, コーヒー, ください) get a single segment with NO furi. Never put furi on hiragana, katakana, or punctuation, and never use katakana in furi.
Example reading for 勉強しています。: [{"text":"勉強","furi":"べんきょう"},{"text":"しています。"}]`;

export const MODELS = ['~deepseek/deepseek-v4-flash-latest', 'qwen/qwen3.7-flash'] as const;
export type ModelId = (typeof MODELS)[number];

async function remainingCredits(): Promise<number | undefined> {
  try {
    const res = await expoFetch('https://openrouter.ai/api/v1/credits', {
      headers: { Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}` },
    });
    const { data } = await res.json();
    return data.total_credits - data.total_usage;
  } catch {
    return undefined;
  }
}

export async function analyzeSentence(sentence: string, modelId: ModelId): Promise<{ analysis: Analysis; stats: string }> {
  const result = await generateText({
    model: wrapLanguageModel({
      model: openrouter(modelId),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    reasoning: 'none',
    providerOptions: { openrouter: { usage: { include: true } } },
    output: Output.object({ schema }),
    system: instructions,
    prompt: sentence,
  });
  console.log('[llm] raw output:', result.text);
  console.log('[llm] raw response body:', JSON.stringify(result.response.body));

  const { inputTokens, outputTokens, totalTokens } = result.usage;
  const cost = (result.response.body as { usage?: { cost?: number } } | undefined)?.usage?.cost;
  const credits = await remainingCredits();
  const usd = (n?: number) => (n === undefined ? 'n/a' : `$${n.toFixed(6)}`);
  const stats = [
    `tokens: (in ${inputTokens ?? '?'}, out ${outputTokens ?? '?'}, total ${totalTokens ?? '?'})`,
    `cost: ${usd(cost)} (remaining: ${usd(credits)})`,
    `model: ${modelId}`,
  ].join('\n');
  console.log('[llm]', stats);
  return { analysis: result.output, stats };
}
