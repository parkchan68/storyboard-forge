import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type ScenarioCharacterInput = {
  name?: unknown;
  positionPose?: unknown;
  faceDescription?: unknown;
  bodyDescription?: unknown;
  wardrobe?: unknown;
  [key: string]: unknown;
};

type GenerateScenarioRequest = {
  project?: unknown;
  scene?: unknown;
  characters?: ScenarioCharacterInput[];
  [key: string]: unknown;
};

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeCharacters(characters: unknown) {
  if (!Array.isArray(characters)) return [];

  return characters.map((character) => {
    const source = character && typeof character === 'object' ? character as ScenarioCharacterInput : {};

    return {
      name: stringValue(source.name),
      positionPose: stringValue(source.positionPose)
    };
  }).filter((character) => character.name.length > 0);
}

function buildScenarioPrompt(payload: GenerateScenarioRequest) {
  const scenarioInput = {
    ...payload,
    characters: sanitizeCharacters(payload.characters)
  };

  return [
    'You are a storyboard scenario writer for a Next.js + TypeScript storyboard app.',
    'Write concise storyboard panels with Korean description fields and English imagePromptEn fields.',
    'Use only the provided name and positionPose for character planning.',
    'Do NOT describe physical appearance of characters in imagePromptEn (no face descriptions, no body build, no hair, no clothing details).',
    'Only describe action, pose, position, and shot framing.',
    'Use character names by themselves — the visual identity is handled separately via reference image attachments.',
    "Example WRONG: 'A tall slim Korean male student with short black hair sits at the desk'",
    "Example RIGHT: 'Kang Jae-hun sits at his desk, looking forward calmly'",
    'Preserve existing production rules such as cast limits, over-the-shoulder distance rules, timing, and shot grammar.',
    'Return valid JSON only.',
    '',
    'Scenario input:',
    JSON.stringify(scenarioInput, null, 2)
  ].join('\n');
}

export async function POST(request: NextRequest) {
  const payload = await request.json() as GenerateScenarioRequest;
  const prompt = buildScenarioPrompt(payload);

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ prompt, characters: sanitizeCharacters(payload.characters) });
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Gemini scenario generation failed', detail: await response.text() }, { status: response.status });
  }

  const result = await response.json();
  return NextResponse.json(result);
}
