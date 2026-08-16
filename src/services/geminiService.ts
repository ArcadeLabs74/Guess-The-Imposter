import type { WordData } from '../types/game';
import { PRESET_WORDS } from '../data/presetWords';

export class GeminiService {
  private static defaultApiKey: string = '';

  public static setApiKey(key: string) {
    this.defaultApiKey = key.trim();
  }

  public static getApiKey(): string {
    return this.defaultApiKey;
  }

  /**
   * Generates a random Secret Word, Category, and Imposter Hint using Gemini AI API.
   * If no API key or on error, falls back to our curated rich dataset.
   */
  public static async generateWordAndClue(
    categoryChoice: string,
    customPrompt?: string,
    apiKeyOverride?: string
  ): Promise<WordData> {
    const key = apiKeyOverride || this.defaultApiKey;

    if (key) {
      try {
        const topicPrompt =
          categoryChoice === 'custom' && customPrompt
            ? `Category theme: "${customPrompt}"`
            : categoryChoice === 'random'
            ? 'Pick any creative, universally recognizable theme or category (e.g., Sci-Fi, Foods, Cinema, Mythology, Gadgets, Animals, etc.)'
            : `Category: "${categoryChoice}"`;

        const prompt = `You are the game master for a social deduction party game called "Guess the Imposter".
Generate a secret word and a cryptic single clue for the imposter based on this:
${topicPrompt}

Rules:
1. Secret Word: A specific noun or phrase (1-3 words) that crewmates will know.
2. Category: A clear 2-4 word category name.
3. Imposter Clue: A single sentence hint or subtle characteristic that describes the category/concept without naming the secret word directly (the imposter only sees this hint to bluff!).

Return ONLY a valid raw JSON object in this exact format with NO markdown wrapping:
{
  "category": "String",
  "secretWord": "String",
  "imposterHint": "String",
  "description": "Brief 1-sentence flavor text"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 300,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
            if (parsed.secretWord && parsed.imposterHint) {
              return {
                category: parsed.category || 'Special Mystery',
                secretWord: parsed.secretWord,
                imposterHint: parsed.imposterHint,
                description: parsed.description,
              };
            }
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent preset fallback:', err);
      }
    }

    // Fallback: pick from rich preset bank
    return this.getFallbackWord(categoryChoice);
  }

  /**
   * Generates a smart contextual clue for an AI bot player.
   */
  public static async generateBotClue(
    _botName: string,
    role: 'crew' | 'imposter',
    secretWord: string,
    category: string,
    imposterHint: string,
    previousClues: string[],
    apiKeyOverride?: string
  ): Promise<string> {
    const key = apiKeyOverride || this.defaultApiKey;

    if (key) {
      try {
        let roleInstruction = '';
        if (role === 'crew') {
          roleInstruction = `You are a CREWMATE. You KNOW the secret word "${secretWord}" in the category "${category}".
Provide a short, clever 1-sentence clue (4-10 words) that hints you know "${secretWord}" without making it too obvious for the imposter.
DO NOT say the word "${secretWord}". Sound casual, like a player in a game party.`;
        } else {
          roleInstruction = `You are the IMPOSTER! You DO NOT know the secret word. You only know the category "${category}" and this cryptic clue: "${imposterHint}".
Provide a confident, somewhat vague 1-sentence clue (4-10 words) that sounds like you belong to the crew and know the word. Blend in!`;
        }

        const prompt = `Game: Guess the Imposter.
${roleInstruction}
Previous clues given by other players: ${previousClues.length > 0 ? previousClues.join(' | ') : 'None yet (you go first!)'}
Respond with ONLY your clue text, nothing else.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: 60 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            return text.replace(/^"|"$/g, '');
          }
        }
      } catch (err) {
        console.warn('Bot Gemini clue error, using procedural bot generator:', err);
      }
    }

    // Procedural Fallback Bot Clue
    return this.getFallbackBotClue(role, category);
  }

  /**
   * Generates AI debrief commentary / roast at the end of the game
   */
  public static async generateDebrief(
    winner: 'crew' | 'imposter',
    secretWord: string,
    imposters: string[],
    imposterCaught: boolean,
    apiKeyOverride?: string
  ): Promise<string> {
    const key = apiKeyOverride || this.defaultApiKey;
    if (key) {
      try {
        const prompt = `You are the witty, humorous AI host of "Guess the Imposter".
Match Result: ${winner.toUpperCase()} WON!
Secret Word was: "${secretWord}"
Imposters were: ${imposters.join(', ')}
Was imposter voted out? ${imposterCaught ? 'Yes!' : 'No, they fooled everyone!'}

Write a 2-sentence entertaining post-game roast / commentary for the players.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: 100 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) return text.replace(/^"|"$/g, '');
        }
      } catch (e) {
        // ignore
      }
    }

    if (winner === 'crew') {
      return `The Crew saw right through the deception! Outstanding detective work cornering ${imposters.join(', ')} before they could crack "${secretWord}".`;
    } else {
      return `Masterclass in deception! The Imposter completely threw everyone off the scent and stole the victory under the radar.`;
    }
  }

  private static getFallbackWord(categoryChoice: string): WordData {
    let key = categoryChoice;
    const availableKeys = Object.keys(PRESET_WORDS);
    if (categoryChoice === 'random' || !PRESET_WORDS[key]) {
      key = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    }
    const list = PRESET_WORDS[key] || PRESET_WORDS.scifi;
    const selected = list[Math.floor(Math.random() * list.length)];
    return selected;
  }

  private static getFallbackBotClue(
    role: 'crew' | 'imposter',
    category: string
  ): string {
    if (role === 'crew') {
      const crewTemplates = [
        `Definitely something you would expect in ${category}.`,
        `I recognize this from classic encounters!`,
        `Very iconic and recognizable once you look closely.`,
        `Found mainly in memorable stories and special setups.`,
        `Has a distinct purpose that everyone appreciates.`,
        `You cannot mistake its signature look or feel!`,
      ];
      return crewTemplates[Math.floor(Math.random() * crewTemplates.length)];
    } else {
      const imposterTemplates = [
        `It definitely fits the whole ${category} vibe nicely.`,
        `Pretty standard concept if you think about it.`,
        `I have seen this used in plenty of key situations!`,
        `Essential for anyone exploring this category.`,
        `Hard to overlook when you need that specific effect!`,
      ];
      return imposterTemplates[Math.floor(Math.random() * imposterTemplates.length)];
    }
  }
}
