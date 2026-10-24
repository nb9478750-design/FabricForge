import { ModProject } from './modPackager.ts';

export function createFallbackModProject(
  prompt: string,
  mcVersion: string = '1.21.11',
  fabricVersion: string = '0.16.14',
  rawName?: string,
  rawId?: string,
  author: string = 'Minecraft Modder'
): ModProject {
  const sanitizedPrompt = prompt.trim();
  
  // Extract custom nouns/features from prompt to make it tailored to the user's description
  const words = sanitizedPrompt.split(/[\s,.-]+/);
  const capitalWords = words.filter(w => w.length > 2 && w[0] === w[0].toUpperCase() && w !== 'A' && w !== 'The' && w !== 'And');
  
  const modTitle = rawName || (capitalWords.length >= 2 ? `${capitalWords[0]} ${capitalWords[1]}` : (sanitizedPrompt.length > 25 ? sanitizedPrompt.slice(0, 25) + ' Mod' : sanitizedPrompt || 'Custom Fabric Mod'));
  const modId = rawId || modTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20) || 'custom_mod';
  const packageName = `com.example.${modId}`;
  const mainClassName = modTitle.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('').replace(/[^a-zA-Z0-9]/g, '') + 'Mod';

  const isModern = mcVersion.startsWith('1.21') || mcVersion === '1.20.6' || mcVersion === '1.20.5';
  const javaVersion = isModern ? 21 : (mcVersion.startsWith('1.16') ? 8 : (mcVersion.startsWith('1.17') ? 16 : 17));
  const idSnippet = isModern ? `Identifier.of(MOD_ID, "%ID%")` : `new Identifier(MOD_ID, "%ID%")`;

  // Color theme detection based on prompt keywords
  const pLower = sanitizedPrompt.toLowerCase();
  let primaryColor = '#6366F1';
  let secondaryColor = '#4338CA';
  let accentColor = '#A5B4FC';

  if (pLower.includes('ruby') || pLower.includes('fire') || pLower.includes('red') || pLower.includes('blood') || pLower.includes('dragon')) {
    primaryColor = '#E11D48'; secondaryColor = '#9F1239'; accentColor = '#FECDD3';
  } else if (pLower.includes('emerald') || pLower.includes('green') || pLower.includes('nature') || pLower.includes('poison') || pLower.includes('forest')) {
    primaryColor = '#10B981'; secondaryColor = '#047857'; accentColor = '#A7F3D0';
  } else if (pLower.includes('ice') || pLower.includes('frost') || pLower.includes('diamond') || pLower.includes('cyan') || pLower.includes('water')) {
    primaryColor = '#06B6D4'; secondaryColor = '#0E7490'; accentColor = '#67E8F9';
  } else if (pLower.includes('void') || pLower.includes('ender') || pLower.includes('purple') || pLower.includes('magic') || pLower.includes('shadow')) {
    primaryColor = '#8B5CF6'; secondaryColor = '#6D28D9'; accentColor = '#DDD6FE';
  } else if (pLower.includes('gold') || pLower.includes('sun') || pLower.includes('solar') || pLower.includes('yellow') || pLower.includes('light')) {
    primaryColor = '#F59E0B'; secondaryColor = '#B45309'; accentColor = '#FDE68A';
  } else if (pLower.includes('netherite') || pLower.includes('dark') || pLower.includes('obsidian') || pLower.includes('black') || pLower.includes('shadow')) {
    primaryColor = '#334155'; secondaryColor = '#0F172A'; accentColor = '#94A3B8';
  }

  // Generate tailored items based on prompt description
  const item1Id = `${modId}_item_1`;
  const item2Id = `${modId}_item_2`;
  const blockId = `${modId}_ore`;

  const item1Name = capitalWords[0] ? `${capitalWords[0]} Gem` : `${modTitle} Core`;
  const item2Name = capitalWords[1] ? `${capitalWords[1]}` : `${modTitle} Blade`;

  const items = [
    {
      id: item1Id,
      name: item1Name,
      type: 'generic',
      rarity: 'RARE',
      lore: `Crafted from prompt description: "${sanitizedPrompt}"`,
      attributes: { attackDamage: 3, durability: 600 },
      palette: { primaryColor: accentColor, secondaryColor: primaryColor, accentColor: '#FFFFFF' }
    },
    {
      id: item2Id,
      name: item2Name,
      type: pLower.includes('pickaxe') ? 'pickaxe' : (pLower.includes('axe') ? 'axe' : 'weapon'),
      rarity: 'EPIC',
      lore: `Powerful custom gear tailored for Minecraft ${mcVersion}.`,
      attributes: { attackDamage: 9.5, attackSpeed: 1.8, durability: 2000 },
      palette: { primaryColor, secondaryColor, accentColor }
    }
  ];

  const blocks = [
    {
      id: blockId,
      name: `${modTitle} Ore`,
      hardness: 4.5,
      resistance: 6.0,
      toolType: 'pickaxe',
      harvestLevel: 'diamond',
      luminance: 5,
      palette: { primaryColor: '#1E293B', secondaryColor: '#0F172A', accentColor: primaryColor }
    }
  ];

  const recipes = [
    {
      id: `${modId}_recipe_main`,
      type: 'minecraft:crafting_shaped',
      pattern: [' C ', ' C ', ' S '],
      key: [
        { symbol: 'C', item: `${modId}:${item1Id}` },
        { symbol: 'S', item: 'minecraft:stick' }
      ],
      result: `${modId}:${item2Id}`,
      count: 1
    }
  ];

  const javaSource = `package ${packageName};

import net.fabricmc.api.ModInitializer;
import net.minecraft.item.Item;
import net.minecraft.item.SwordItem;
import net.minecraft.item.ToolMaterials;
import net.minecraft.util.Identifier;
import net.minecraft.util.registry.Registry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ${mainClassName} implements ModInitializer {
    public static final String MOD_ID = "${modId}";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    // Custom Mod Items tailored to: "${sanitizedPrompt}"
    public static final Item ITEM_1 = new Item(new Item.Settings());
    public static final Item ITEM_2 = new SwordItem(ToolMaterials.NETHERITE, 7, -2.4f, new Item.Settings());

    @Override
    public void onInitialize() {
        LOGGER.info("Initializing {} for Minecraft {}!", "${modTitle}", "${mcVersion}");

        // Register custom items into Minecraft registry
        Registry.register(Registry.ITEM, ${idSnippet.replace('%ID%', item1Id)}, ITEM_1);
        Registry.register(Registry.ITEM, ${idSnippet.replace('%ID%', item2Id)}, ITEM_2);

        LOGGER.info("{} items registered successfully!", "${modTitle}");
    }
}
`;

  return {
    modId,
    modName: modTitle,
    version: '1.0.0',
    description: `A customized Fabric mod adding ${modTitle} features for Minecraft ${mcVersion}. Inspired by prompt: "${sanitizedPrompt}"`,
    author,
    minecraftVersion: mcVersion,
    fabricLoaderVersion: fabricVersion,
    javaVersion,
    packageName,
    mainClassName,
    items,
    blocks,
    recipes,
    mixins: [
      {
        name: 'PlayerEntityMixin',
        targetClass: 'net.minecraft.entity.player.PlayerEntity',
        description: 'Applies special custom mod effects when player ticks',
        javaCode: `package ${packageName}.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import net.minecraft.entity.player.PlayerEntity;

@Mixin(PlayerEntity.class)
public class PlayerEntityMixin {
    @Inject(method = "tick", at = @At("HEAD"))
    private void onTick(CallbackInfo ci) {
        // Custom tick logic for ${modTitle}
    }
}
`
      }
    ],
    javaSources: [
      {
        filePath: `src/main/java/${packageName.replace(/\./g, '/')}/${mainClassName}.java`,
        className: mainClassName,
        content: javaSource
      }
    ]
  };
}
