import type { WordData } from '../types/game';

export interface CategoryOption {
  id: string;
  name: string;
  description: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'random', name: 'Random Mix', description: 'A surprise pick from every deck' },
  { id: 'food', name: 'Food & Drinks', description: 'Dishes, snacks and flavours' },
  { id: 'movies', name: 'Movies & TV', description: 'Films, shows and characters' },
  { id: 'places', name: 'Places', description: 'Cities, landmarks and countries' },
  { id: 'animals', name: 'Animals', description: 'Wildlife big and small' },
  { id: 'gaming', name: 'Video Games', description: 'Consoles, items and icons' },
  { id: 'sports', name: 'Sports', description: 'Games, gear and events' },
  { id: 'everyday', name: 'Everyday Objects', description: 'Things you see daily' },
];

export const PRESET_WORDS: Record<string, WordData[]> = {
  food: [
    { category: 'Food & Drinks', secretWord: 'Sushi', imposterHint: 'A rolled dish that pairs vinegared rice with fresh fish.' },
    { category: 'Food & Drinks', secretWord: 'Espresso', imposterHint: 'A small, intense coffee shot crowned with golden crema.' },
    { category: 'Food & Drinks', secretWord: 'Pancakes', imposterHint: 'A stacked breakfast favourite finished with syrup.' },
    { category: 'Food & Drinks', secretWord: 'Guacamole', imposterHint: 'A mashed green dip served with tortilla chips.' },
    { category: 'Food & Drinks', secretWord: 'Croissant', imposterHint: 'A flaky, buttery French pastry best eaten warm.' },
    { category: 'Food & Drinks', secretWord: 'Milkshake', imposterHint: 'A thick blended drink sipped through a straw.' },
    { category: 'Food & Drinks', secretWord: 'Popcorn', imposterHint: 'The essential crunchy snack at the cinema.' },
    { category: 'Food & Drinks', secretWord: 'Barbecue', imposterHint: 'Slow-cooked over smoky coals and slathered in sauce.' },
  ],
  movies: [
    { category: 'Movies & TV', secretWord: 'Titanic', imposterHint: 'A doomed ocean liner at the centre of a blockbuster romance.' },
    { category: 'Movies & TV', secretWord: 'Superhero', imposterHint: 'Wears a cape and hides behind a secret identity.' },
    { category: 'Movies & TV', secretWord: 'Sitcom', imposterHint: 'A comedy series filmed mostly on one living-room set.' },
    { category: 'Movies & TV', secretWord: 'Red Carpet', imposterHint: 'Stars pose for photographers along this famous walkway.' },
    { category: 'Movies & TV', secretWord: 'Stunt Double', imposterHint: 'Performs the dangerous scenes so the star does not have to.' },
    { category: 'Movies & TV', secretWord: 'Popcorn Bucket', imposterHint: 'You smuggle this into the theatre instead of buying theirs.' },
    { category: 'Movies & TV', secretWord: 'Director', imposterHint: 'Shouts "action" and "cut" between takes.' },
    { category: 'Movies & TV', secretWord: 'Cartoon', imposterHint: 'Drawn frame by frame rather than filmed live.' },
  ],
  places: [
    { category: 'Places', secretWord: 'Eiffel Tower', imposterHint: 'An iron lattice tower that defines the Paris skyline.' },
    { category: 'Places', secretWord: 'Great Wall of China', imposterHint: 'A stone fortification winding thousands of kilometres.' },
    { category: 'Places', secretWord: 'Pyramids of Giza', imposterHint: 'Ancient desert tombs built for the pharaohs.' },
    { category: 'Places', secretWord: 'Venice', imposterHint: 'Gondolas glide down streets made of water here.' },
    { category: 'Places', secretWord: 'Times Square', imposterHint: 'Blazing billboards light up this busy New York plaza.' },
    { category: 'Places', secretWord: 'Sahara Desert', imposterHint: 'The largest hot expanse of sand dunes on Earth.' },
    { category: 'Places', secretWord: 'Mount Everest', imposterHint: 'The highest point climbers can reach on the planet.' },
    { category: 'Places', secretWord: 'Colosseum', imposterHint: 'Gladiators once fought inside this Roman amphitheatre.' },
  ],
  animals: [
    { category: 'Animals', secretWord: 'Chameleon', imposterHint: 'A reptile that changes colour and moves each eye separately.' },
    { category: 'Animals', secretWord: 'Penguin', imposterHint: 'A bird in a tuxedo suit that would rather swim than fly.' },
    { category: 'Animals', secretWord: 'Octopus', imposterHint: 'Eight clever arms squeeze through the smallest gaps.' },
    { category: 'Animals', secretWord: 'Kangaroo', imposterHint: 'Carries its joey in a pouch and travels by hopping.' },
    { category: 'Animals', secretWord: 'Owl', imposterHint: 'A silent night hunter that can turn its head almost fully around.' },
    { category: 'Animals', secretWord: 'Dolphin', imposterHint: 'A playful marine mammal that clicks and whistles.' },
    { category: 'Animals', secretWord: 'Cheetah', imposterHint: 'Built for speed, it is the fastest sprinter on land.' },
    { category: 'Animals', secretWord: 'Sloth', imposterHint: 'Hangs upside down and moves in extreme slow motion.' },
  ],
  gaming: [
    { category: 'Video Games', secretWord: 'Health Potion', imposterHint: 'A red bottle that restores your hit points instantly.' },
    { category: 'Video Games', secretWord: 'Respawn Point', imposterHint: 'Where you reappear after losing a life.' },
    { category: 'Video Games', secretWord: 'Final Boss', imposterHint: 'The ultimate showdown waiting at the end of the game.' },
    { category: 'Video Games', secretWord: 'Side Quest', imposterHint: 'An optional detour before continuing the main story.' },
    { category: 'Video Games', secretWord: 'Speedrun', imposterHint: 'Finishing the whole game as fast as humanly possible.' },
    { category: 'Video Games', secretWord: 'Loot Box', imposterHint: 'A mystery container with random rewards inside.' },
    { category: 'Video Games', secretWord: 'Game Over', imposterHint: 'The two dreaded words when your last life runs out.' },
    { category: 'Video Games', secretWord: 'Power-Up', imposterHint: 'Grab this glowing item for a temporary boost.' },
  ],
  sports: [
    { category: 'Sports', secretWord: 'Penalty Kick', imposterHint: 'One shooter against the keeper from twelve yards out.' },
    { category: 'Sports', secretWord: 'Marathon', imposterHint: 'Exactly 42.2 kilometres of pure endurance.' },
    { category: 'Sports', secretWord: 'Slam Dunk', imposterHint: 'Force the ball straight down through the hoop.' },
    { category: 'Sports', secretWord: 'Tennis Court', imposterHint: 'Rallies bounce across the net on this rectangle.' },
    { category: 'Sports', secretWord: 'Goalkeeper', imposterHint: 'The only player allowed to use their hands.' },
    { category: 'Sports', secretWord: 'Photo Finish', imposterHint: 'Judges check the camera because two racers were too close to call.' },
    { category: 'Sports', secretWord: 'Referee', imposterHint: 'Blows the whistle and hands out yellow cards.' },
    { category: 'Sports', secretWord: 'Hat-Trick', imposterHint: 'Three scores by the same player in one match.' },
  ],
  everyday: [
    { category: 'Everyday Objects', secretWord: 'Umbrella', imposterHint: 'You carry it folded, then open it when the sky opens.' },
    { category: 'Everyday Objects', secretWord: 'Alarm Clock', imposterHint: 'It rings early each morning and everyone resents it.' },
    { category: 'Everyday Objects', secretWord: 'Toothbrush', imposterHint: 'Twice a day it fights plaque in front of the mirror.' },
    { category: 'Everyday Objects', secretWord: 'Backpack', imposterHint: 'Swing it over both shoulders and carry your day inside it.' },
    { category: 'Everyday Objects', secretWord: 'Mirror', imposterHint: 'Shows your reflection but remembers nothing.' },
    { category: 'Everyday Objects', secretWord: 'Doorbell', imposterHint: 'Press it and someone knows you have arrived.' },
    { category: 'Everyday Objects', secretWord: 'Scissors', imposterHint: 'Two blades working together to make the cut.' },
    { category: 'Everyday Objects', secretWord: 'Headphones', imposterHint: 'Your private concert nobody else can hear.' },
  ],
};

export function getWord(categoryId: string): WordData {
  if (categoryId !== 'random' && PRESET_WORDS[categoryId]) {
    const list = PRESET_WORDS[categoryId];
    return list[Math.floor(Math.random() * list.length)];
  }
  const allLists = Object.values(PRESET_WORDS);
  const list = allLists[Math.floor(Math.random() * allLists.length)];
  return list[Math.floor(Math.random() * list.length)];
}

export const PLAYER_COLORS = [
  '#6366F1',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#84CC16',
  '#06B6D4',
  '#A855F7',
];
