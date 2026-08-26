import { GoogleGenAI, Type } from '@google/genai';
import type { WordData } from '../types/game';
import { CATEGORY_OPTIONS, getWord } from '../data/presetWords';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(
  apiKey &&
  !apiKey.includes('placeholder') &&
  !apiKey.includes('your_')
);

// Initialize client if API key is provided
const ai = isGeminiConfigured ? new GoogleGenAI({ apiKey }) : null;

/**
 * Resolves a category ID (or raw string) into a specific human-readable CategoryOption.
 * If 'random', picks a random category from the predefined set.
 */
function resolveCategory(categoryId?: string) {
  const specificOptions = CATEGORY_OPTIONS.filter((c) => c.id !== 'random');

  if (!categoryId || categoryId === 'random') {
    return specificOptions[Math.floor(Math.random() * specificOptions.length)];
  }

  const found = CATEGORY_OPTIONS.find((c) => c.id === categoryId);
  if (found) return found;

  // If passed an exact name directly
  const foundByName = CATEGORY_OPTIONS.find((c) => c.name.toLowerCase() === categoryId.toLowerCase());
  if (foundByName) return foundByName;

  // Fallback to random specific category
  return specificOptions[Math.floor(Math.random() * specificOptions.length)];
}

/**
 * Generate a dynamic secret word and cryptic imposter hint using Gemini AI
 * strictly within the host-selected predefined category.
 * Automatically falls back to curated preset words if offline or unconfigured.
 */
export async function generateAiWord(categoryId?: string): Promise<WordData> {
  const selectedCategory = resolveCategory(categoryId);

  if (!ai || !isGeminiConfigured) {
    return getWord(selectedCategory.id);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the master game engine for a social deduction party game called "Guess The Imposter" (similar to Spyfall and Chameleon).

Your task: Generate ONE secret word and ONE cryptic hint strictly inside the selected category below.

Selected Category: "${selectedCategory.name}" (${selectedCategory.description}).

Rules:
1. "category": Must be EXACTLY "${selectedCategory.name}".
2. "secretWord": Must be a well-known, concrete noun or popular concept that belongs CLEARLY to "${selectedCategory.name}". (1 to 3 words max).
3. "imposterHint": A single subtle, cryptic, clever 1-sentence hint describing the secret word without naming it directly. The imposter will read this hint to blend in with the crew.
4. Output valid JSON matching the schema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            secretWord: { type: Type.STRING },
            imposterHint: { type: Type.STRING },
          },
          required: ['category', 'secretWord', 'imposterHint'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response received from Gemini AI.');
    }

    const parsed = JSON.parse(text) as WordData;

    if (!parsed.secretWord || !parsed.imposterHint) {
      throw new Error('Incomplete data received from Gemini AI.');
    }

    return {
      category: selectedCategory.name, // Guarantee exact category name
      secretWord: parsed.secretWord.trim(),
      imposterHint: parsed.imposterHint.trim(),
    };
  } catch (error) {
    console.warn('Gemini AI generation failed or throttled, falling back to preset words deck:', error);
    return getWord(selectedCategory.id);
  }
}