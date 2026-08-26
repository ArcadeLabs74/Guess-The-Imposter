import type { WordData } from '../types/game';

export interface CategoryOption {
  id: string;
  name: string;
  description: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'random', name: 'Random Mix', description: 'Surprise pick from any category' },
  { id: 'food', name: 'Food & Drinks', description: 'Dishes, snacks, street food and flavours' },
  { id: 'movies', name: 'Movies & TV', description: 'Films, shows, cinematic icons and tropes' },
  { id: 'places', name: 'World Places', description: 'Famous cities, landmarks and wonders' },
  { id: 'animals', name: 'Animals & Wildlife', description: 'Creatures of land, sea and air' },
  { id: 'gaming', name: 'Video Games', description: 'Gaming icons, items, consoles and quests' },
  { id: 'sports', name: 'Sports & Fitness', description: 'Athletic events, gear, rules and stadiums' },
  { id: 'everyday', name: 'Everyday Objects', description: 'Common household items, gadgets and tools' },
  { id: 'professions', name: 'Professions & Jobs', description: 'Careers, emergency roles and trades' },
  { id: 'superheroes', name: 'Superheroes & Comics', description: 'Caped heroes, supervillains and powers' },
  { id: 'mythology', name: 'Mythology & Legends', description: 'Gods, mythical beasts and ancient lore' },
  { id: 'music', name: 'Music & Instruments', description: 'Instruments, sound gear and genres' },
  { id: 'scifi', name: 'Tech & Sci-Fi', description: 'Future gadgets, AI, cyberpunk and space' },
  { id: 'anime', name: 'Anime & Cartoons', description: 'Animated classics, series and characters' },
  { id: 'history', name: 'History & Eras', description: 'Ancient civilizations, dynasties and relics' },
  { id: 'nature', name: 'Nature & Space', description: 'Cosmic bodies, weather phenomena and biomes' },
];

export const PRESET_WORDS: Record<string, WordData[]> = {
  food: [
    { category: 'Food & Drinks', secretWord: 'Sushi', imposterHint: 'A rolled delicacy pairing seasoned rice with fresh seafood.' },
    { category: 'Food & Drinks', secretWord: 'Espresso', imposterHint: 'A concentrated shot of roasted beans topped with golden crema.' },
    { category: 'Food & Drinks', secretWord: 'Pancakes', imposterHint: 'A flat breakfast stack made on a griddle and drowned in sweet syrup.' },
    { category: 'Food & Drinks', secretWord: 'Guacamole', imposterHint: 'A creamy mashed green dip served with tortilla chips.' },
    { category: 'Food & Drinks', secretWord: 'Croissant', imposterHint: 'A flaky, crescent-shaped butter pastry baked golden.' },
    { category: 'Food & Drinks', secretWord: 'Barbecue', imposterHint: 'Meat slow-cooked over smoky coals and glazed in tangy sauce.' },
  ],
  movies: [
    { category: 'Movies & TV', secretWord: 'Titanic', imposterHint: 'A doomed passenger ship at the center of a historic blockbuster romance.' },
    { category: 'Movies & TV', secretWord: 'Superhero', imposterHint: 'Wears a mask and fights evil while protecting a secret identity.' },
    { category: 'Movies & TV', secretWord: 'Sitcom', imposterHint: 'A television comedy usually centered around an ensemble in familiar living spaces.' },
    { category: 'Movies & TV', secretWord: 'Director', imposterHint: 'The vision behind the camera calling "Action!" and "Cut!".' },
    { category: 'Movies & TV', secretWord: 'Stunt Double', imposterHint: 'Performs the dangerous leaps and crashes on behalf of the lead actor.' },
  ],
  places: [
    { category: 'World Places', secretWord: 'Eiffel Tower', imposterHint: 'An iconic wrought-iron lattice monument defining the Parisian skyline.' },
    { category: 'World Places', secretWord: 'Great Wall of China', imposterHint: 'An ancient defensive stone barrier stretching thousands of kilometers across mountains.' },
    { category: 'World Places', secretWord: 'Pyramids of Giza', imposterHint: 'Monumental geometric stone tombs built under desert skies for pharaohs.' },
    { category: 'World Places', secretWord: 'Venice', imposterHint: 'A historic city connected by canals and gondolas instead of asphalt roads.' },
    { category: 'World Places', secretWord: 'Colosseum', imposterHint: 'An ancient elliptical amphitheatre where gladiators once contested.' },
  ],
  animals: [
    { category: 'Animals & Wildlife', secretWord: 'Chameleon', imposterHint: 'A stealthy reptile capable of shifting shades to blend with foliage.' },
    { category: 'Animals & Wildlife', secretWord: 'Penguin', imposterHint: 'A tuxedo-feathered polar bird that excels at swimming rather than flight.' },
    { category: 'Animals & Wildlife', secretWord: 'Octopus', imposterHint: 'A marine creature with eight flexible arms and clever camouflage.' },
    { category: 'Animals & Wildlife', secretWord: 'Kangaroo', imposterHint: 'An Australian marsupial that carries its young in a pouch and hops across plains.' },
    { category: 'Animals & Wildlife', secretWord: 'Cheetah', imposterHint: 'A spotted feline engineered for world-class acceleration across the savannah.' },
  ],
  gaming: [
    { category: 'Video Games', secretWord: 'Health Potion', imposterHint: 'A magical red elixir consumed mid-battle to replenish hit points.' },
    { category: 'Video Games', secretWord: 'Final Boss', imposterHint: 'The climactic powerhouse adversary awaiting at the climax of the dungeon.' },
    { category: 'Video Games', secretWord: 'Respawn Point', imposterHint: 'The designated checkpoint where defeated characters materialize again.' },
    { category: 'Video Games', secretWord: 'Speedrun', imposterHint: 'A competitive playstyle dedicated to clearing the entire title in minimal time.' },
    { category: 'Video Games', secretWord: 'Loot Box', imposterHint: 'A mystery container holding randomized gear and cosmetics.' },
  ],
  sports: [
    { category: 'Sports & Fitness', secretWord: 'Penalty Kick', imposterHint: 'A high-pressure one-on-one duel against the goalkeeper from 12 yards.' },
    { category: 'Sports & Fitness', secretWord: 'Marathon', imposterHint: 'A grueling road race spanning exactly 42.195 kilometers.' },
    { category: 'Sports & Fitness', secretWord: 'Slam Dunk', imposterHint: 'An explosive aerial jump slamming the ball directly through the hoop.' },
    { category: 'Sports & Fitness', secretWord: 'Referee', imposterHint: 'An official on the pitch blowing the whistle and enforcing regulations.' },
    { category: 'Sports & Fitness', secretWord: 'Photo Finish', imposterHint: 'Camera review required when contenders cross the line within milliseconds.' },
  ],
  everyday: [
    { category: 'Everyday Objects', secretWord: 'Umbrella', imposterHint: 'A collapsible canopy extended when raindrops begin descending.' },
    { category: 'Everyday Objects', secretWord: 'Alarm Clock', imposterHint: 'A morning timepiece known for buzzing insistently at early dawn.' },
    { category: 'Everyday Objects', secretWord: 'Headphones', imposterHint: 'Personal acoustic drivers worn over ears for private listening.' },
    { category: 'Everyday Objects', secretWord: 'Backpack', imposterHint: 'A dual-strap zippered bag carried on shoulders to haul daily essentials.' },
    { category: 'Everyday Objects', secretWord: 'Mirror', imposterHint: 'A reflective glass surface displaying the viewer facing it.' },
  ],
  professions: [
    { category: 'Professions & Jobs', secretWord: 'Astronaut', imposterHint: 'A trained specialist suited up for orbital research outside Earth atmosphere.' },
    { category: 'Professions & Jobs', secretWord: 'Detective', imposterHint: 'An investigator who sifts through evidence and interrogates suspects to solve crimes.' },
    { category: 'Professions & Jobs', secretWord: 'Surgeon', imposterHint: 'A medical doctor performing delicate operations under bright operating lights.' },
    { category: 'Professions & Jobs', secretWord: 'Architect', imposterHint: 'A designer drafting structural blueprints before buildings are constructed.' },
    { category: 'Professions & Jobs', secretWord: 'Chef', imposterHint: 'The culinary mastermind directing the kitchen pass in a bustling restaurant.' },
  ],
  superheroes: [
    { category: 'Superheroes & Comics', secretWord: 'Batmobile', imposterHint: 'An armored gadget-laden vehicle cruising nighttime vigilante alleys.' },
    { category: 'Superheroes & Comics', secretWord: 'Kryptonite', imposterHint: 'A glowing extraterrestrial mineral capable of weakening the man of steel.' },
    { category: 'Superheroes & Comics', secretWord: 'Spider-Sense', imposterHint: 'An instinctual tingling warning of incoming danger before it strikes.' },
    { category: 'Superheroes & Comics', secretWord: 'Secret Identity', imposterHint: 'The civilian persona kept hidden from the public to protect loved ones.' },
  ],
  mythology: [
    { category: 'Mythology & Legends', secretWord: 'Excalibur', imposterHint: 'A legendary blade embedded in stone, destined only for the rightful king.' },
    { category: 'Mythology & Legends', secretWord: 'Medusa', imposterHint: 'A serpent-haired gorgon whose direct gaze petrifies onlookers into stone.' },
    { category: 'Mythology & Legends', secretWord: 'Phoenix', imposterHint: 'A mythical avian creature that combusts into flames and re-emerges from ash.' },
    { category: 'Mythology & Legends', secretWord: 'Trojan Horse', imposterHint: 'A hollow wooden offering concealing soldiers to breach fortified city gates.' },
  ],
  music: [
    { category: 'Music & Instruments', secretWord: 'Electric Guitar', imposterHint: 'A six-stringed amplified instrument central to rock solos.' },
    { category: 'Music & Instruments', secretWord: 'Synthesizer', imposterHint: 'An electronic keyboard that sculpts waveforms into retro and modern pads.' },
    { category: 'Music & Instruments', secretWord: 'Vinyl Record', imposterHint: 'A grooved spinning disc read by a needle to reproduce analogue warmth.' },
    { category: 'Music & Instruments', secretWord: 'Conductor', imposterHint: 'Waves a baton to guide the tempo and dynamics of a grand orchestra.' },
  ],
  scifi: [
    { category: 'Tech & Sci-Fi', secretWord: 'Artificial Intelligence', imposterHint: 'Neural networks processing algorithms to simulate cognitive reasoning.' },
    { category: 'Tech & Sci-Fi', secretWord: 'Teleporter', imposterHint: 'A futuristic chamber deconstructing matter to reconstruct it instantly miles away.' },
    { category: 'Tech & Sci-Fi', secretWord: 'Hologram', imposterHint: 'A three-dimensional light projection floating freely in mid-air.' },
    { category: 'Tech & Sci-Fi', secretWord: 'Cyborg', imposterHint: 'A cybernetically enhanced individual blending organic tissue with robotic parts.' },
  ],
  anime: [
    { category: 'Anime & Cartoons', secretWord: 'Kamehameha', imposterHint: 'A trademark concentrated blue energy beam launched from cupped hands.' },
    { category: 'Anime & Cartoons', secretWord: 'Pokeball', imposterHint: 'A red-and-white spherical capsule used to capture and deploy pocket monsters.' },
    { category: 'Anime & Cartoons', secretWord: 'Ninja Headband', imposterHint: 'A cloth headpiece with an engraved metal village crest tied across the forehead.' },
    { category: 'Anime & Cartoons', secretWord: 'Mecha Robot', imposterHint: 'A colossal piloted humanoid machine battling across futuristic cityscapes.' },
  ],
  history: [
    { category: 'History & Eras', secretWord: 'Samurai', imposterHint: 'An honorable warrior bound by bushido code and wielding twin steel swords.' },
    { category: 'History & Eras', secretWord: 'Viking Longship', imposterHint: 'A shallow-draft wooden vessel with carved dragon prows built for coastal raids.' },
    { category: 'History & Eras', secretWord: 'Renaissance', imposterHint: 'A cultural rebirth of arts, sciences and humanism blooming across Europe.' },
    { category: 'History & Eras', secretWord: 'Pharaoh', imposterHint: 'The crowned divine monarch ruling ancient Egypt beside the Nile.' },
  ],
  nature: [
    { category: 'Nature & Space', secretWord: 'Northern Lights', imposterHint: 'Luminescent green and violet auroras dancing across polar night skies.' },
    { category: 'Nature & Space', secretWord: 'Black Hole', imposterHint: 'A celestial gravitational singularity from which not even light can escape.' },
    { category: 'Nature & Space', secretWord: 'Volcano', imposterHint: 'A geological vent in the Earth crust erupting molten magma and ash.' },
    { category: 'Nature & Space', secretWord: 'Solar Eclipse', imposterHint: 'When the moon aligns between Earth and Sun, casting total shadow over daylight.' },
  ],
};

/**
 * Fallback preset word getter for a specific category ID or random pick
 */
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
