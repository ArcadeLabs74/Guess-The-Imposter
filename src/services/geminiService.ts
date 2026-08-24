import { GoogleGenAI, Type } from '@google/genai';
import type { WordData } from '../types/game';
import { getWord } from '../data/presetWords';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(
  apiKey &&
  !apiKey.includes('placeholder') &&
  !apiKey.includes('your_')
);

// Initialize client if API key is provided
const ai = isGeminiConfigured ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generate a dynamic secret word, category, and cryptic imposter hint using Gemini AI.
 * Automatically falls back to curated preset words if offline or unconfigured.
 */
export async function generateAiWord(categoryPrompt?: string): Promise<WordData> {
  if (!ai || !isGeminiConfigured) {
    return getWord(categoryPrompt || 'random');
  }

  try {
    const promptTheme = categoryPrompt && categoryPrompt !== 'random'
      ? `Specific Category: "${categoryPrompt}"`
      : 'Any creative, fun, and universally recognizable theme (e.g. Science, Space, Cooking, Cinema, Mythology, Gaming, Cyberpunk, Travel)';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a fun, clever secret word and a cryptic hint for a "Guess the Imposter" social deduction game.
${promptTheme}.

Requirements:
1. "secretWord": A specific, well-known noun or concept in this category.
2. "imposterHint": A single subtle, cryptic hint describing the word without naming it directly.
3. "category": The exact category name.`,
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

    if (!parsed.secretWord || !parsed.imposterHint || !parsed.category) {
      throw new Error('Incomplete data received from Gemini AI.');
    }

    return {
      category: parsed.category.trim(),
      secretWord: parsed.secretWord.trim(),
      imposterHint: parsed.imposterHint.trim(),
    };
  } catch (error) {
    console.warn('Gemini AI generation failed or throttled, falling back to preset words deck:', error);
    return getWord(categoryPrompt || 'random');
  }
}