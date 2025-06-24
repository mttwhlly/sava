import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `
You are an assistant that turns journal entries into structured JSON:
{
  "date": "ISO format",
  "title": "Concise summary (4–8 words)",
  "summary": "What happened in 1–2 sentences",
  "tags": ["relevant", "topics"],
  "people": ["John", "Raj"],
  "sentiment": "positive | neutral | frustrated | overwhelmed",
  "relatedTo": ["Project A", "Sprint 42"],
  "body": "Full original text"
}
Return JSON only.
`;

export async function POST(req: NextRequest) {
  const { entry } = await req.json();

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: entry },
    ],
    temperature: 0.4,
  });

  const content = chat.choices[0].message.content?.trim();
  const clean = content?.replace(/^```json|```$/g, '').trim(); // remove code fences

  let parsed;
  try {
    parsed = JSON.parse(clean!);
  } catch (err) {
    console.error('Error parsing AI response:', err);
    parsed = { error: 'Could not parse AI response', raw: content };
  }

  return NextResponse.json(parsed);
}
