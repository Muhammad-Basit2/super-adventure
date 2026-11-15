import { LEVEL_DEFINITIONS as part1 } from './LevelDataPart1.js';
import { LEVEL_DEFINITIONS_PART2 as part2 } from './LevelDataPart2.js';

export const LEVEL_DEFINITIONS = {
  ...part1,
  ...part2,
  5: {
    number: 5,
    title: 'Dark Castle',
    bgKey: 'background_color_desert',
    cloudKey: null,
    theme: 'castle',
    tilePrefix: 'terrain_stone',
    playerColor: 'pink',
    levelWidth: 4400,
    levelHeight: 900,
    spawn: { x: 120, y: 680 },
    exit: { x: 4200, y: 680 },
    platforms: [
      { x: 0, y: 768, w: 600, h: 132 },
      { x: 220, y: 600, w: 180, h: 48 },
      { x: 440, y: 470, w: 200, h: 48 },

      { x: 780, y: 768, w: 600, h: 132 },
      { x: 860, y: 570, w: 180, h: 48 },
      { x: 1120, y: 450, w: 220, h: 48 },
      // Castle parapet secret
      { x: 1060, y: 300, w: 160, h: 48 },

      { x: 1600, y: 768, w: 650, h: 132 },
      { x: 1720, y: 580, w: 180, h: 48 },
      { x: 1980, y: 460, w: 220, h: 48 },
      { x: 2250, y: 360, w: 180, h: 48 },

      { x: 2500, y: 768, w: 600, h: 132 },
      { x: 2600, y: 570, w: 200, h: 48 },
      { x: 2880, y: 450, w: 220, h: 48 },

      // Boss Arena Grand Hall
      { x: 3300, y: 768, w: 1100, h: 132 },
      { x: 3450, y: 580, w: 200, h: 48 },
      { x: 3800, y: 580, w: 200, h: 48 }
    ],
    specialPlatforms: [
      { x: 680, y: 660, type: 'bouncing' },
      { x: 1480, y: 650, type: 'falling' },
      { x: 2380, y: 640, type: 'breakable' }
    ],
    movingPlatforms: [
      { x: 1460, y: 510, distance: 110, duration: 2100 },
      { x: 2360, y: 510, distance: 110, duration: 2000, vertical: true }
    ],
    spikes: [
      { x: 690, y: 880 },
      { x: 1490, y: 880 },
      { x: 2390, y: 880 },
      { x: 960, y: 752 },
      { x: 1820, y: 752 },
      { x: 2700, y: 752 }
    ],
    enemies: [
      { type: 'strong', x: 360, y: 720, range: 120 },
      { type: 'flying_buzz', x: 500, y: 390, range: 130 },
      { type: 'strong', x: 960, y: 720, range: 130 },
      { type: 'flying', x: 1180, y: 380, range: 120 },
      { type: 'strong', x: 1800, y: 720, range: 140 },
      { type: 'flying_buzz', x: 2050, y: 390, range: 130 },
      { type: 'strong', x: 2680, y: 720, range: 130 }
    ],
    hasBoss: true,
    bossSpawn: { x: 3950, y: 660 },
    collectibles: [
      { type: 'powerup_shield', x: 240, y: 540 },
      { type: 'gem_red', x: 460, y: 410 },
      { type: 'powerup_speed', x: 880, y: 510 },
      // Parapet treasure
      { type: 'life', x: 1100, y: 240 },
      { type: 'gem_red', x: 1140, y: 240 },
      { type: 'powerup_jump', x: 1740, y: 520 },
      { type: 'powerup_shield', x: 2620, y: 510 },
      { type: 'gem_blue', x: 2900, y: 390 },
      { type: 'coin', x: 3350, y: 700 }
    ],
    checkpoint: { x: 2100, y: 720 }
  }
};

