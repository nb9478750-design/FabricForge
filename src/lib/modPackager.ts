import JSZip from 'jszip';
import { generateModInitializerBytecode } from './classBytecode.ts';
import {
  PixelArtGrid,
  pixelGridToPngBytes,
  generateItemTexture,
  generateBlockTexture,
  generateModIcon,
} from './textureGenerator.ts';

export interface ModItem {
  id: string;
  name: string;
  type: string;
  rarity?: string;
  lore?: string;
  attributes?: {
    attackDamage?: number;
    attackSpeed?: number;
    durability?: number;
    hunger?: number;
    saturation?: number;
  };
  palette: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  customGrid?: PixelArtGrid;
}

export interface ModBlock {
  id: string;
  name: string;
  hardness: number;
  resistance: number;
  toolType: string;
  harvestLevel?: string;
  luminance?: number;
  palette: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  customGrid?: PixelArtGrid;
}

export interface ModRecipe {
  id: string;
  type: string;
  pattern?: string[];
  key?: Array<{ symbol: string; item: string }>;
  result: string;
  count: number;
}

export interface ModMixin {
  name: string;
  targetClass: string;
  description: string;
  javaCode: string;
}

export interface ModJavaSource {
  filePath: string;
  className: string;
  content: string;
}

export interface ModProject {
  modId: string;
  modName: string;
  version: string;
  description: string;
  author: string;
  minecraftVersion: string;
  fabricLoaderVersion: string;
  javaVersion: number;
  packageName: string;
  mainClassName: string;
  items: ModItem[];
  blocks?: ModBlock[];
  recipes: ModRecipe[];
  mixins?: ModMixin[];
  javaSources: ModJavaSource[];
  iconGrid?: PixelArtGrid;
  note?: string;
}

export interface JarFileEntry {
  path: string;
  type: 'text' | 'json' | 'java' | 'binary' | 'image';
  content?: string;
  size?: number;
  dataUrl?: string;
}

// Compute proper pack_format based on target Minecraft version
export function getPackFormat(mcVersion: string): number {
  if (
    mcVersion.startsWith('1.21.11') ||
    mcVersion.startsWith('1.21.10') ||
    mcVersion.startsWith('1.21.9') ||
    mcVersion.startsWith('1.21.8') ||
    mcVersion.startsWith('1.21.7') ||
    mcVersion.startsWith('1.21.6') ||
    mcVersion.startsWith('1.21.5')
  ) {
    return 48;
  }
  if (mcVersion.startsWith('1.21.2') || mcVersion.startsWith('1.21.3') || mcVersion.startsWith('1.21.4')) return 46;
  if (mcVersion.startsWith('1.21')) return 34;
  if (mcVersion === '1.20.6' || mcVersion === '1.20.5') return 32;
  if (mcVersion.startsWith('1.20.3') || mcVersion.startsWith('1.20.4')) return 22;
  if (mcVersion.startsWith('1.20.2')) return 18;
  if (mcVersion.startsWith('1.20')) return 15;
  if (mcVersion.startsWith('1.19.4')) return 13;
  if (mcVersion.startsWith('1.19')) return 10;
  if (mcVersion.startsWith('1.18')) return 8;
  if (mcVersion.startsWith('1.17')) return 7;
  return 6; // 1.16
}

/**
 * Builds standard Fabric mod JSON descriptor
 */
export function buildFabricModJson(mod: ModProject): string {
  const isModern = mod.minecraftVersion.startsWith('1.21') || mod.minecraftVersion === '1.20.6';
  const javaReq = isModern ? '>=21' : mod.minecraftVersion.startsWith('1.16') ? '>=8' : mod.minecraftVersion.startsWith('1.17') ? '>=16' : '>=17';

  const entrypoints: Record<string, string[]> = {
    main: [`${mod.packageName}.${mod.mainClassName}`],
  };

  const fabricJson: any = {
    schemaVersion: 1,
    id: mod.modId,
    version: mod.version || '1.0.0',
    name: mod.modName,
    description: mod.description,
    authors: [mod.author || 'Mod Creator'],
    contact: {
      homepage: 'https://fabricmc.net',
      sources: 'https://github.com',
    },
    license: 'MIT',
    icon: `assets/${mod.modId}/icon.png`,
    environment: '*',
    entrypoints,
    depends: {
      fabricloader: `>=${mod.fabricLoaderVersion || '0.15.11'}`,
      minecraft: `>=${mod.minecraftVersion}`,
      java: javaReq,
      'fabric-api': '*',
    },
  };

  if (mod.mixins && mod.mixins.length > 0) {
    fabricJson.mixins = [`${mod.modId}.mixins.json`];
  }

  return JSON.stringify(fabricJson, null, 2);
}

/**
 * Builds Mixin Configuration JSON
 */
export function buildMixinJson(mod: ModProject): string {
  const javaLevel = mod.javaVersion >= 21 ? 'JAVA_21' : mod.javaVersion <= 8 ? 'JAVA_8' : mod.javaVersion <= 16 ? 'JAVA_16' : 'JAVA_17';
  const mixinList = (mod.mixins || []).map(m => m.name);

  return JSON.stringify({
    required: true,
    minVersion: '0.8',
    package: `${mod.packageName}.mixin`,
    compatibilityLevel: javaLevel,
    mixins: mixinList,
    client: [],
    injectors: {
      defaultRequire: 1,
    },
  }, null, 2);
}

/**
 * Builds manifest file
 */
export function buildManifest(mod: ModProject): string {
  return `Manifest-Version: 1.0
Created-By: FabricForge AI (AI Studio)
Fabric-Loom-Version: 1.8-SNAPSHOT
Fabric-Mod-Id: ${mod.modId}
Fabric-Mod-Version: ${mod.version || '1.0.0'}
Fabric-Minecraft-Version: ${mod.minecraftVersion}
Fabric-Loader-Version: ${mod.fabricLoaderVersion}
`;
}

/**
 * Builds pack.mcmeta
 */
export function buildPackMcmeta(mod: ModProject): string {
  return JSON.stringify({
    pack: {
      pack_format: getPackFormat(mod.minecraftVersion),
      description: `${mod.modName} Fabric mod resources for ${mod.minecraftVersion}`,
    },
  }, null, 2);
}

/**
 * Builds lang/en_us.json
 */
export function buildLangJson(mod: ModProject): string {
  const lang: Record<string, string> = {
    [`itemGroup.${mod.modId}.${mod.modId}_group`]: mod.modName,
  };

  for (const item of mod.items) {
    lang[`item.${mod.modId}.${item.id}`] = item.name;
    if (item.lore) {
      lang[`item.${mod.modId}.${item.id}.tooltip`] = item.lore;
    }
  }

  if (mod.blocks) {
    for (const block of mod.blocks) {
      lang[`block.${mod.modId}.${block.id}`] = block.name;
    }
  }

  return JSON.stringify(lang, null, 2);
}

/**
 * Generate preview list of all files that will be compiled into the .jar
 */
export function listJarFiles(mod: ModProject): JarFileEntry[] {
  const entries: JarFileEntry[] = [
    { path: 'META-INF/MANIFEST.MF', type: 'text', content: buildManifest(mod) },
    { path: 'fabric.mod.json', type: 'json', content: buildFabricModJson(mod) },
    { path: 'pack.mcmeta', type: 'json', content: buildPackMcmeta(mod) },
    { path: `assets/${mod.modId}/icon.png`, type: 'image' },
    { path: `assets/${mod.modId}/lang/en_us.json`, type: 'json', content: buildLangJson(mod) },
  ];

  if (mod.mixins && mod.mixins.length > 0) {
    entries.push({ path: `${mod.modId}.mixins.json`, type: 'json', content: buildMixinJson(mod) });
  }

  // Items models & textures
  for (const item of mod.items) {
    entries.push({
      path: `assets/${mod.modId}/models/item/${item.id}.json`,
      type: 'json',
      content: JSON.stringify({
        parent: 'item/generated',
        textures: {
          layer0: `${mod.modId}:item/${item.id}`,
        },
      }, null, 2),
    });
    entries.push({
      path: `assets/${mod.modId}/textures/item/${item.id}.png`,
      type: 'image',
    });
  }

  // Blocks models & blockstates
  if (mod.blocks) {
    for (const block of mod.blocks) {
      entries.push({
        path: `assets/${mod.modId}/blockstates/${block.id}.json`,
        type: 'json',
        content: JSON.stringify({
          variants: {
            '': { model: `${mod.modId}:block/${block.id}` },
          },
        }, null, 2),
      });
      entries.push({
        path: `assets/${mod.modId}/models/block/${block.id}.json`,
        type: 'json',
        content: JSON.stringify({
          parent: 'block/cube_all',
          textures: {
            all: `${mod.modId}:block/${block.id}`,
          },
        }, null, 2),
      });
      entries.push({
        path: `assets/${mod.modId}/models/item/${block.id}.json`,
        type: 'json',
        content: JSON.stringify({
          parent: `${mod.modId}:block/${block.id}`,
        }, null, 2),
      });
      entries.push({
        path: `assets/${mod.modId}/textures/block/${block.id}.png`,
        type: 'image',
      });
    }
  }

  // Recipes
  for (const recipe of mod.recipes) {
    const recipeObj: any = {
      type: recipe.type || 'minecraft:crafting_shaped',
      result: {
        item: recipe.result,
        count: recipe.count || 1,
      },
    };
    if (recipe.pattern) recipeObj.pattern = recipe.pattern;
    if (recipe.key) {
      const keyMap: Record<string, any> = {};
      for (const k of recipe.key) {
        keyMap[k.symbol] = { item: k.item };
      }
      recipeObj.key = keyMap;
    }
    entries.push({
      path: `data/${mod.modId}/recipes/${recipe.id}.json`,
      type: 'json',
      content: JSON.stringify(recipeObj, null, 2),
    });
  }

  // Compiled JVM .class file in package directory
  const classInternalPath = mod.packageName.replace(/\./g, '/');
  entries.push({
    path: `${classInternalPath}/${mod.mainClassName}.class`,
    type: 'binary',
  });

  // Java source files
  for (const src of mod.javaSources) {
    entries.push({
      path: src.filePath,
      type: 'java',
      content: src.content,
    });
  }

  // Mixin sources
  if (mod.mixins) {
    for (const mixin of mod.mixins) {
      entries.push({
        path: `src/main/java/${classInternalPath}/mixin/${mixin.name}.java`,
        type: 'java',
        content: mixin.javaCode,
      });
    }
  }

  return entries;
}

/**
 * Builds the genuine .jar file as a binary Blob ready for download
 */
export async function buildFabricModJar(mod: ModProject): Promise<Blob> {
  const zip = new JSZip();

  // 1. META-INF/MANIFEST.MF
  zip.file('META-INF/MANIFEST.MF', buildManifest(mod));

  // 2. fabric.mod.json
  zip.file('fabric.mod.json', buildFabricModJson(mod));

  // 3. pack.mcmeta
  zip.file('pack.mcmeta', buildPackMcmeta(mod));

  // 4. Mixin json if present
  if (mod.mixins && mod.mixins.length > 0) {
    zip.file(`${mod.modId}.mixins.json`, buildMixinJson(mod));
  }

  // 5. Assets - lang
  zip.file(`assets/${mod.modId}/lang/en_us.json`, buildLangJson(mod));

  // 6. Mod icon.png
  const iconGrid = mod.iconGrid || generateModIcon(
    mod.items[0]?.palette.primaryColor || '#6366F1',
    mod.items[0]?.palette.secondaryColor || '#4338CA',
    mod.items[0]?.palette.accentColor || '#A5B4FC'
  );
  const iconPngBytes = await pixelGridToPngBytes(iconGrid);
  zip.file(`assets/${mod.modId}/icon.png`, iconPngBytes);

  // 7. Item models & textures
  for (const item of mod.items) {
    const modelJson = JSON.stringify({
      parent: 'item/generated',
      textures: {
        layer0: `${mod.modId}:item/${item.id}`,
      },
    }, null, 2);
    zip.file(`assets/${mod.modId}/models/item/${item.id}.json`, modelJson);

    const itemGrid = item.customGrid || generateItemTexture(
      item.type,
      item.palette?.primaryColor || '#6366F1',
      item.palette?.secondaryColor || '#4338CA',
      item.palette?.accentColor || '#A5B4FC'
    );
    const itemPngBytes = await pixelGridToPngBytes(itemGrid);
    zip.file(`assets/${mod.modId}/textures/item/${item.id}.png`, itemPngBytes);
  }

  // 8. Block models, blockstates & textures
  if (mod.blocks) {
    for (const block of mod.blocks) {
      zip.file(`assets/${mod.modId}/blockstates/${block.id}.json`, JSON.stringify({
        variants: {
          '': { model: `${mod.modId}:block/${block.id}` },
        },
      }, null, 2));

      zip.file(`assets/${mod.modId}/models/block/${block.id}.json`, JSON.stringify({
        parent: 'block/cube_all',
        textures: {
          all: `${mod.modId}:block/${block.id}`,
        },
      }, null, 2));

      zip.file(`assets/${mod.modId}/models/item/${block.id}.json`, JSON.stringify({
        parent: `${mod.modId}:block/${block.id}`,
      }, null, 2));

      const blockGrid = block.customGrid || generateBlockTexture(
        block.palette?.primaryColor || '#6366F1',
        block.palette?.secondaryColor || '#4338CA',
        block.palette?.accentColor || '#A5B4FC'
      );
      const blockPngBytes = await pixelGridToPngBytes(blockGrid);
      zip.file(`assets/${mod.modId}/textures/block/${block.id}.png`, blockPngBytes);
    }
  }

  // 9. Recipes
  for (const recipe of mod.recipes) {
    const recipeObj: any = {
      type: recipe.type || 'minecraft:crafting_shaped',
      result: {
        item: recipe.result,
        count: recipe.count || 1,
      },
    };
    if (recipe.pattern) recipeObj.pattern = recipe.pattern;
    if (recipe.key) {
      const keyMap: Record<string, any> = {};
      for (const k of recipe.key) {
        keyMap[k.symbol] = { item: k.item };
      }
      recipeObj.key = keyMap;
    }
    zip.file(`data/${mod.modId}/recipes/${recipe.id}.json`, JSON.stringify(recipeObj, null, 2));
  }

  // 10. Compiled JVM Bytecode .class file
  const classBytes = generateModInitializerBytecode(mod.packageName, mod.mainClassName, mod.javaVersion);
  const classInternalPath = mod.packageName.replace(/\./g, '/');
  zip.file(`${classInternalPath}/${mod.mainClassName}.class`, classBytes);

  // 11. Java source files
  for (const src of mod.javaSources) {
    zip.file(src.filePath, src.content);
  }

  if (mod.mixins) {
    for (const mixin of mod.mixins) {
      zip.file(`src/main/java/${classInternalPath}/mixin/${mixin.name}.java`, mixin.javaCode);
    }
  }

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/java-archive',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Builds full Fabric Loom Gradle Project (.zip)
 */
export async function buildFabricWorkspaceZip(mod: ModProject): Promise<Blob> {
  const zip = new JSZip();

  const isModern = mod.minecraftVersion.startsWith('1.21') || mod.minecraftVersion === '1.20.6';
  const javaVersion = mod.javaVersion || 17;

  // build.gradle
  const buildGradle = `plugins {
    id 'fabric-loom' version '1.8-SNAPSHOT'
    id 'maven-publish'
}

version = project.mod_version
group = project.maven_group

base {
    archivesName = project.archives_base_name
}

repositories {
    mavenCentral()
}

dependencies {
    minecraft "com.mojang:minecraft:\${project.minecraft_version}"
    mappings "net.fabricmc:yarn:\${project.yarn_mappings}:v2"
    modImplementation "net.fabricmc:fabric-loader:\${project.loader_version}"
    modImplementation "net.fabricmc.fabric-api:fabric-api:\${project.fabric_version}"
}

processResources {
    inputs.property "version", project.version
    filteringCharset "UTF-8"

    filesMatching("fabric.mod.json") {
        expand "version": project.version
    }
}

tasks.withType(JavaCompile).configureEach {
    it.options.release = ${javaVersion}
}

java {
    withSourcesJar()
    sourceCompatibility = JavaVersion.VERSION_${javaVersion === 8 ? '1_8' : javaVersion}
    targetCompatibility = JavaVersion.VERSION_${javaVersion === 8 ? '1_8' : javaVersion}
}

jar {
    from("LICENSE") {
        rename { "\${it}_\${project.base.archivesName.get()}"}
    }
}
`;

  // gradle.properties
  const gradleProperties = `org.gradle.jvmargs=-Xmx2G
minecraft_version=${mod.minecraftVersion}
yarn_mappings=${mod.minecraftVersion}+build.1
loader_version=${mod.fabricLoaderVersion}

mod_version=${mod.version || '1.0.0'}
maven_group=${mod.packageName}
archives_base_name=${mod.modId}

fabric_version=0.92.0+${mod.minecraftVersion}
`;

  // settings.gradle
  const settingsGradle = `pluginManagement {
    repositories {
        maven {
            name = 'Fabric'
            url = 'https://maven.fabricmc.net/'
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

rootProject.name = '${mod.modId}'
`;

  // README.md
  const readme = `# ${mod.modName} (Fabric Mod)

Crafted with **FabricForge AI** for **Minecraft ${mod.minecraftVersion}** (Fabric Loader ${mod.fabricLoaderVersion}).

## Developing
- Import into IntelliJ IDEA, VS Code, or Eclipse.
- Run \`./gradlew runClient\` to launch Minecraft with this mod loaded.
- Run \`./gradlew build\` to compile the final \`.jar\` into \`build/libs/\`.

## Installing the .jar in Minecraft
1. Download the generated \`${mod.modId}-${mod.version || '1.0.0'}.jar\`.
2. Ensure you have Fabric Loader installed for Minecraft ${mod.minecraftVersion}.
3. Install Fabric API into \`.minecraft/mods\`.
4. Copy \`${mod.modId}-${mod.version || '1.0.0'}.jar\` into \`.minecraft/mods\`.
5. Launch Minecraft and enjoy!
`;

  zip.file('build.gradle', buildGradle);
  zip.file('gradle.properties', gradleProperties);
  zip.file('settings.gradle', settingsGradle);
  zip.file('README.md', readme);

  // Resources
  zip.file('src/main/resources/fabric.mod.json', buildFabricModJson(mod));
  zip.file('src/main/resources/pack.mcmeta', buildPackMcmeta(mod));
  zip.file(`src/main/resources/assets/${mod.modId}/lang/en_us.json`, buildLangJson(mod));

  if (mod.mixins && mod.mixins.length > 0) {
    zip.file(`src/main/resources/${mod.modId}.mixins.json`, buildMixinJson(mod));
  }

  // Mod icon
  const iconGrid = mod.iconGrid || generateModIcon(
    mod.items[0]?.palette.primaryColor || '#6366F1',
    mod.items[0]?.palette.secondaryColor || '#4338CA',
    mod.items[0]?.palette.accentColor || '#A5B4FC'
  );
  const iconPngBytes = await pixelGridToPngBytes(iconGrid);
  zip.file(`src/main/resources/assets/${mod.modId}/icon.png`, iconPngBytes);

  // Items
  for (const item of mod.items) {
    zip.file(`src/main/resources/assets/${mod.modId}/models/item/${item.id}.json`, JSON.stringify({
      parent: 'item/generated',
      textures: {
        layer0: `${mod.modId}:item/${item.id}`,
      },
    }, null, 2));

    const itemGrid = item.customGrid || generateItemTexture(
      item.type,
      item.palette?.primaryColor || '#6366F1',
      item.palette?.secondaryColor || '#4338CA',
      item.palette?.accentColor || '#A5B4FC'
    );
    const itemPngBytes = await pixelGridToPngBytes(itemGrid);
    zip.file(`src/main/resources/assets/${mod.modId}/textures/item/${item.id}.png`, itemPngBytes);
  }

  // Blocks
  if (mod.blocks) {
    for (const block of mod.blocks) {
      zip.file(`src/main/resources/assets/${mod.modId}/blockstates/${block.id}.json`, JSON.stringify({
        variants: {
          '': { model: `${mod.modId}:block/${block.id}` },
        },
      }, null, 2));

      zip.file(`src/main/resources/assets/${mod.modId}/models/block/${block.id}.json`, JSON.stringify({
        parent: 'block/cube_all',
        textures: {
          all: `${mod.modId}:block/${block.id}`,
        },
      }, null, 2));

      zip.file(`src/main/resources/assets/${mod.modId}/models/item/${block.id}.json`, JSON.stringify({
        parent: `${mod.modId}:block/${block.id}`,
      }, null, 2));

      const blockGrid = block.customGrid || generateBlockTexture(
        block.palette?.primaryColor || '#6366F1',
        block.palette?.secondaryColor || '#4338CA',
        block.palette?.accentColor || '#A5B4FC'
      );
      const blockPngBytes = await pixelGridToPngBytes(blockGrid);
      zip.file(`src/main/resources/assets/${mod.modId}/textures/block/${block.id}.png`, blockPngBytes);
    }
  }

  // Recipes
  for (const recipe of mod.recipes) {
    const recipeObj: any = {
      type: recipe.type || 'minecraft:crafting_shaped',
      result: {
        item: recipe.result,
        count: recipe.count || 1,
      },
    };
    if (recipe.pattern) recipeObj.pattern = recipe.pattern;
    if (recipe.key) {
      const keyMap: Record<string, any> = {};
      for (const k of recipe.key) {
        keyMap[k.symbol] = { item: k.item };
      }
      recipeObj.key = keyMap;
    }
    zip.file(`src/main/resources/data/${mod.modId}/recipes/${recipe.id}.json`, JSON.stringify(recipeObj, null, 2));
  }

  // Java Sources
  for (const src of mod.javaSources) {
    zip.file(src.filePath, src.content);
  }

  const classInternalPath = mod.packageName.replace(/\./g, '/');
  if (mod.mixins) {
    for (const mixin of mod.mixins) {
      zip.file(`src/main/java/${classInternalPath}/mixin/${mixin.name}.java`, mixin.javaCode);
    }
  }

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
  });
}
