export interface PresetMod {
  title: string;
  category: string;
  tag: string;
  recommendedMc: string;
  description: string;
  prompt: string;
  color: string;
}

export const MOD_PRESETS: PresetMod[] = [
  {
    title: 'Netherite Katana & Soul Dagger',
    category: 'Combat & Weapons',
    tag: '1.20.1 Golden Modding',
    recommendedMc: '1.20.1',
    description: 'Blisteringly fast dual-wield weapons forged with Soul Sand and Netherite scraps.',
    prompt: 'Create a Netherite Katana and Soul Dagger mod. The Katana has high attack speed (2.2), moderate damage (8), and causes lingering soul fire on hit. The Soul Dagger deals extra backstab damage and grants a short speed burst. Include custom crafting recipes combining soul sand, netherite scraps, and blaze rods, with dark obsidian and soul flame cyan palettes.',
    color: '#06B6D4',
  },
  {
    title: 'Void Walker Boots & Ender Wings',
    category: 'Armor & Mobility',
    tag: '1.21.11 Latest',
    recommendedMc: '1.21.11',
    description: 'End-game mobility gear granting double-jump, void immunity, and glider boosters.',
    prompt: 'Create a Void Walker gear mod for Minecraft 1.21.11 with Void Walker Boots and Ender Wings. The boots protect the player from falling into the void by teleporting them back up, and the wings provide a rechargeable gliding thrust when sneaking in mid-air. Include crafting with Chorus Fruit, Ender Pearls, and Netherite.',
    color: '#8B5CF6',
  },
  {
    title: 'Auto-Smelting Emerald Tools',
    category: 'Mining & Tools',
    tag: '1.20.4 Popular',
    recommendedMc: '1.20.4',
    description: 'Emerald-infused pickaxe, axe, and shovel that automatically smelt mined ores and logs.',
    prompt: 'Create an Auto-Smelt Emerald Tools mod. Adds an Emerald Pickaxe, Emerald Axe, and Emerald Ore block. When mining iron or gold ore with the pickaxe, it automatically drops cooked ingots with flame particle effects. When cutting trees with the axe, it yields charcoal. Uses rich emerald green and fiery gold accent textures.',
    color: '#10B981',
  },
  {
    title: 'Mystic Runes & Arcane Tablets',
    category: 'Magic & Lore',
    tag: '1.19.2 Wild Update',
    recommendedMc: '1.19.2',
    description: 'Ancient stone tablets that cast elemental spells (lightning storm, frost nova, healing spring).',
    prompt: 'Create an Arcane Spell Runes mod. Adds 3 spell tablets: Lightning Rune (calls thunderstorm lightning bolt on targeted entity), Frost Rune (freezes enemies in a block of ice for 4 seconds), and Vitality Rune (heals player and nearby allies). Also adds Ancient Rune Ore found deep underground with purple glowing crystal textures.',
    color: '#EC4899',
  },
  {
    title: 'Reinforced Netherite Safe & Vault',
    category: 'Storage & Utility',
    tag: '1.16.5 Nether Classic',
    recommendedMc: '1.16.5',
    description: 'Blast-proof, explosion-resistant secure vault chest with a custom lock key system.',
    prompt: 'Create a Reinforced Netherite Safe mod for Minecraft 1.16.5. Adds a Blast-Proof Safe block that is completely immune to TNT and Creeper explosions, and can only be opened with a crafted Keycard. Include recipes using Netherite Ingots, Obsidian, and Iron Bars.',
    color: '#F59E0B',
  },
  {
    title: 'Solar Infused Scythe & Crop Reaper',
    category: 'Farming & Combat',
    tag: '1.21.1 Recommended',
    recommendedMc: '1.21.1',
    description: 'Cleaves through entire wheat fields in a single swing and sets undead mobs ablaze.',
    prompt: 'Create a Solar Scythe mod for Minecraft 1.21.1. Adds the Solar Scythe: a wide-sweeping weapon that harvests a 3x3 area of crops instantly and replants seeds. In combat, it deals bonus radiant damage against zombies and skeletons during daytime.',
    color: '#EAB308',
  },
];
