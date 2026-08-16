import type { WordData } from '../types/game';

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  badgeColor: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'random', name: 'Random Surprise', icon: '🎲', description: 'Any wild topic curated dynamically', badgeColor: '#8b5cf6' },
  { id: 'scifi', name: 'Sci-Fi & Cyberpunk', icon: '🤖', description: 'Futuristic tech, space, AI & neon realities', badgeColor: '#06b6d4' },
  { id: 'movies', name: 'Movies & Pop Culture', icon: '🎬', description: 'Blockbusters, iconic characters & cinema', badgeColor: '#f59e0b' },
  { id: 'food', name: 'Food & Gourmet Delicacies', icon: '🍕', description: 'Dishes, spices, desserts & cuisine', badgeColor: '#ef4444' },
  { id: 'gaming', name: 'Video Games & Lore', icon: '🎮', description: 'Consoles, famous titles, items & bosses', badgeColor: '#10b981' },
  { id: 'mythology', name: 'Mythology & Fantasy', icon: '🐉', description: 'Gods, legendary beasts & magic artifacts', badgeColor: '#ec4899' },
  { id: 'landmarks', name: 'World Wonders & Places', icon: '🗽', description: 'Famous monuments, cities & landscapes', badgeColor: '#3b82f6' },
  { id: 'espionage', name: 'Secret Agents & Heists', icon: '🕵️', description: 'Gadgets, spycraft, stealth & undercover ops', badgeColor: '#6366f1' },
  { id: 'nature', name: 'Wildlife & Deep Oceans', icon: '🐙', description: 'Exotic beasts, abyssal wonders & nature', badgeColor: '#14b8a6' },
  { id: 'custom', name: 'Custom AI Prompt', icon: '✨', description: 'Enter any wild theme for Gemini to generate', badgeColor: '#d946ef' },
];

export const PRESET_WORDS: Record<string, WordData[]> = {
  scifi: [
    {
      category: 'Sci-Fi & Cyberpunk',
      secretWord: 'Cybernetic Arm',
      imposterHint: 'An artificial prosthetic upgrade featuring high-tech titanium and neural links.',
    },
    {
      category: 'Sci-Fi & Cyberpunk',
      secretWord: 'Wormhole',
      imposterHint: 'A theoretical passage through space-time creating shortcuts across galaxies.',
    },
    {
      category: 'Sci-Fi & Cyberpunk',
      secretWord: 'Lightsaber',
      imposterHint: 'An elegant glowing plasma weapon wielded in duels across the stars.',
    },
    {
      category: 'Sci-Fi & Cyberpunk',
      secretWord: 'Time Machine',
      imposterHint: 'A device capable of traveling backward or forward into chronological eras.',
    },
    {
      category: 'Sci-Fi & Cyberpunk',
      secretWord: 'Hologram',
      imposterHint: 'A 3D projection made purely out of modulated light beams.',
    },
    {
      category: 'Sci-Fi & Cyberpunk',
      secretWord: 'Nanobots',
      imposterHint: 'Microscopic automated machines capable of molecular repair and swarm behavior.',
    },
  ],
  movies: [
    {
      category: 'Movies & Pop Culture',
      secretWord: 'Popcorn',
      imposterHint: 'A hot, buttery puffed snack essential for watching films in a theater.',
    },
    {
      category: 'Movies & Pop Culture',
      secretWord: 'Titanic',
      imposterHint: 'A historic doomed luxury passenger liner that collided with an iceberg.',
    },
    {
      category: 'Movies & Pop Culture',
      secretWord: 'Red Carpet',
      imposterHint: 'A formal pathway walked by celebrities and movie stars during award premieres.',
    },
    {
      category: 'Movies & Pop Culture',
      secretWord: 'Stunt Double',
      imposterHint: 'A trained professional performing dangerous action scenes in place of the lead actor.',
    },
    {
      category: 'Movies & Pop Culture',
      secretWord: 'Oscar Trophy',
      imposterHint: 'A prestigious golden statuette awarded for outstanding cinematic excellence.',
    },
  ],
  food: [
    {
      category: 'Food & Gourmet Delicacies',
      secretWord: 'Sushi',
      imposterHint: 'A traditional Japanese dish with vinegared rice and raw fish.',
    },
    {
      category: 'Food & Gourmet Delicacies',
      secretWord: 'Espresso',
      imposterHint: 'A concentrated, bold dark coffee shot with a layer of golden crema.',
    },
    {
      category: 'Food & Gourmet Delicacies',
      secretWord: 'Tiramisu',
      imposterHint: 'A decadent coffee-flavored Italian dessert layered with mascarpone cheese and cocoa.',
    },
    {
      category: 'Food & Gourmet Delicacies',
      secretWord: 'Saffron',
      imposterHint: 'An intensely prized crimson spice harvested by hand from crocus flowers.',
    },
    {
      category: 'Food & Gourmet Delicacies',
      secretWord: 'Croissant',
      imposterHint: 'A flaky, buttery crescent-shaped French pastry with crispy golden layers.',
    },
  ],
  gaming: [
    {
      category: 'Video Games & Lore',
      secretWord: 'Health Potion',
      imposterHint: 'A red bottled liquid consumed to instantly restore hit points.',
    },
    {
      category: 'Video Games & Lore',
      secretWord: 'Respawn Point',
      imposterHint: 'A designated location where defeated characters regenerate back into the match.',
    },
    {
      category: 'Video Games & Lore',
      secretWord: 'Loot Box',
      imposterHint: 'A virtual mystery container containing randomized skins or gear of varying rarity.',
    },
    {
      category: 'Video Games & Lore',
      secretWord: 'Final Boss',
      imposterHint: 'The ultimate climax adversary encountered at the conclusion of an adventure.',
    },
    {
      category: 'Video Games & Lore',
      secretWord: 'Speedrun',
      imposterHint: 'A playstyle dedicated to completing a game as quickly as possible with glitches or mastery.',
    },
  ],
  mythology: [
    {
      category: 'Mythology & Fantasy',
      secretWord: 'Phoenix',
      imposterHint: 'A mythical avian creature associated with fire that is reborn from its own ashes.',
    },
    {
      category: 'Mythology & Fantasy',
      secretWord: 'Excalibur',
      imposterHint: 'A legendary magical sword bestowed by the Lady of the Lake to King Arthur.',
    },
    {
      category: 'Mythology & Fantasy',
      secretWord: 'Medusa',
      imposterHint: 'A gorgon with living venomous snakes for hair whose gaze turns mortals to stone.',
    },
    {
      category: 'Mythology & Fantasy',
      secretWord: 'Minotaur',
      imposterHint: 'A terrifying beast with the body of a man and the head of a bull trapped inside a labyrinth.',
    },
    {
      category: 'Mythology & Fantasy',
      secretWord: 'Kraken',
      imposterHint: 'A colossal multi-tentacled sea monster capable of pulling entire sailing ships into the abyss.',
    },
  ],
  landmarks: [
    {
      category: 'World Wonders & Places',
      secretWord: 'Eiffel Tower',
      imposterHint: 'An iconic wrought-iron lattice tower standing tall on the Champ de Mars in Paris.',
    },
    {
      category: 'World Wonders & Places',
      secretWord: 'Great Wall of China',
      imposterHint: 'An ancient massive stone fortification winding thousands of kilometers across mountains.',
    },
    {
      category: 'World Wonders & Places',
      secretWord: 'Pyramids of Giza',
      imposterHint: 'Monumental ancient stone tombs built under the blazing desert sun for pharaohs.',
    },
    {
      category: 'World Wonders & Places',
      secretWord: 'Colosseum',
      imposterHint: 'A majestic oval amphitheater in central Rome that hosted gladiatorial combats.',
    },
    {
      category: 'World Wonders & Places',
      secretWord: 'Taj Mahal',
      imposterHint: 'An ivory-white marble mausoleum on the south bank of the Yamuna river.',
    },
  ],
  espionage: [
    {
      category: 'Secret Agents & Heists',
      secretWord: 'Laser Wire',
      imposterHint: 'An invisible or glowing security beam system designed to trip alarms when breached.',
    },
    {
      category: 'Secret Agents & Heists',
      secretWord: 'Disguise Kit',
      imposterHint: 'A collection of wigs, fake mustaches, and costumes used to assume false identities.',
    },
    {
      category: 'Secret Agents & Heists',
      secretWord: 'Smoke Grenade',
      imposterHint: 'A canister that discharges a dense screen of smoke to conceal tactical escapes.',
    },
    {
      category: 'Secret Agents & Heists',
      secretWord: 'Safe Cracker',
      imposterHint: 'A stealthy specialist or electronic stethoscope used to manipulate combination vaults.',
    },
  ],
  nature: [
    {
      category: 'Wildlife & Deep Oceans',
      secretWord: 'Chameleon',
      imposterHint: 'A specialized reptile known for changing colors and moving its eyes independently.',
    },
    {
      category: 'Wildlife & Deep Oceans',
      secretWord: 'Anglerfish',
      imposterHint: 'A deep-sea predator equipped with a bioluminescent dorsal lure dangling in the dark.',
    },
    {
      category: 'Wildlife & Deep Oceans',
      secretWord: 'Electric Eel',
      imposterHint: 'An aquatic knifefish capable of discharging hundreds of volts of electrical shock.',
    },
    {
      category: 'Wildlife & Deep Oceans',
      secretWord: 'Giant Sequoia',
      imposterHint: 'One of the most massive ancient trees on Earth, towering high in coastal forests.',
    },
  ],
};

export const BOT_NAMES = [
  { name: 'NeonCipher', avatar: '🤖', color: '#06b6d4' },
  { name: 'ViperX', avatar: '🐍', color: '#10b981' },
  { name: 'NovaFlux', avatar: '⚡', color: '#f59e0b' },
  { name: 'ShadowByte', avatar: '🕵️', color: '#8b5cf6' },
  { name: 'RubyRebel', avatar: '💎', color: '#ec4899' },
  { name: 'BlazeCore', avatar: '🔥', color: '#ef4444' },
  { name: 'Zenith', avatar: '🌌', color: '#3b82f6' },
  { name: 'GlitchPhantom', avatar: '👾', color: '#14b8a6' },
];

export const AVATAR_OPTIONS = [
  '🤖', '🕵️', '🐱', '🦊', '🚀', '⚡', '🎭', '👾', '👑', '💎', '🔥', '🐉', '🐙', '🛸', '🎯', '🛡️'
];

export const COLOR_PALETTE = [
  '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#14b8a6', '#d946ef', '#f97316'
];
