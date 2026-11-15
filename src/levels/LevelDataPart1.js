export const LEVEL_DEFINITIONS = {
  1: {
  "number": 1,
  "title": "Green Forest",
  "bgKey": "background_color_trees",
  "cloudKey": "background_clouds",
  "theme": "forest",
  "tilePrefix": "terrain_grass",
  "playerColor": "green",
  "levelWidth": 4000,
  "levelHeight": 900,
  "spawn": {
    "x": 100,
    "y": 680
  },
  "exit": {
    "x": 3800,
    "y": 680
  },
  "platforms": [
    {
      "x": 0,
      "y": 768,
      "w": 500,
      "h": 132
    },
    {
      "x": 150,
      "y": 640,
      "w": 128,
      "h": 48
    },
    {
      "x": 320,
      "y": 520,
      "w": 128,
      "h": 48
    },
    {
      "x": 550,
      "y": 768,
      "w": 400,
      "h": 132
    },
    {
      "x": 680,
      "y": 600,
      "w": 128,
      "h": 48
    },
    {
      "x": 880,
      "y": 500,
      "w": 128,
      "h": 48
    },
    {
      "x": 1050,
      "y": 768,
      "w": 600,
      "h": 132
    },
    {
      "x": 1150,
      "y": 600,
      "w": 160,
      "h": 48
    },
    {
      "x": 1400,
      "y": 480,
      "w": 160,
      "h": 48
    },
    {
      "x": 1350,
      "y": 350,
      "w": 128,
      "h": 48
    },
    {
      "x": 1700,
      "y": 768,
      "w": 300,
      "h": 132
    },
    {
      "x": 1800,
      "y": 600,
      "w": 96,
      "h": 48
    },
    {
      "x": 1950,
      "y": 480,
      "w": 96,
      "h": 48
    },
    {
      "x": 2100,
      "y": 360,
      "w": 128,
      "h": 48
    },
    {
      "x": 2300,
      "y": 768,
      "w": 800,
      "h": 132
    },
    {
      "x": 2450,
      "y": 600,
      "w": 192,
      "h": 48
    },
    {
      "x": 2750,
      "y": 480,
      "w": 160,
      "h": 48
    },
    {
      "x": 2900,
      "y": 350,
      "w": 128,
      "h": 48
    },
    {
      "x": 3200,
      "y": 768,
      "w": 800,
      "h": 132
    },
    {
      "x": 3350,
      "y": 600,
      "w": 160,
      "h": 48
    },
    {
      "x": 3550,
      "y": 500,
      "w": 128,
      "h": 48
    }
  ],
  "specialPlatforms": [
    {
      "x": 1000,
      "y": 700,
      "type": "bouncing"
    },
    {
      "x": 2200,
      "y": 700,
      "type": "falling"
    }
  ],
  "movingPlatforms": [
    {
      "x": 1650,
      "y": 550,
      "distance": 120,
      "duration": 2600
    },
    {
      "x": 3100,
      "y": 550,
      "distance": 100,
      "duration": 2400,
      "vertical": true
    }
  ],
  "spikes": [
    {
      "x": 550,
      "y": 880
    },
    {
      "x": 2150,
      "y": 880
    },
    {
      "x": 2950,
      "y": 752
    }
  ],
  "enemies": [
    {
      "type": "walking_snail",
      "x": 250,
      "y": 720,
      "range": 100
    },
    {
      "type": "walking",
      "x": 600,
      "y": 720,
      "range": 120
    },
    {
      "type": "flying",
      "x": 1400,
      "y": 400,
      "range": 80
    },
    {
      "type": "walking_mouse",
      "x": 2400,
      "y": 720,
      "range": 130
    },
    {
      "type": "strong",
      "x": 3400,
      "y": 720,
      "range": 110
    }
  ],
  "collectibles": [
    {
      "type": "coin",
      "x": 100,
      "y": 700
    },
    {
      "type": "coin",
      "x": 140,
      "y": 700
    },
    {
      "type": "gem_blue",
      "x": 340,
      "y": 460
    },
    {
      "type": "powerup_speed",
      "x": 1370,
      "y": 290
    },
    {
      "type": "coin",
      "x": 1420,
      "y": 420
    },
    {
      "type": "life",
      "x": 2920,
      "y": 290
    },
    {
      "type": "powerup_shield",
      "x": 2770,
      "y": 420
    },
    {
      "type": "coin",
      "x": 3370,
      "y": 540
    },
    {
      "type": "gem_red",
      "x": 3570,
      "y": 440
    }
  ],
  "checkpoint": {
    "x": 2350,
    "y": 720
  }
},
  2: {
  "number": 2,
  "title": "Dark Cave",
  "bgKey": "background_color_mushrooms",
  "cloudKey": null,
  "theme": "cave",
  "tilePrefix": "terrain_purple",
  "playerColor": "purple",
  "levelWidth": 4400,
  "levelHeight": 900,
  "spawn": {
    "x": 100,
    "y": 680
  },
  "exit": {
    "x": 4200,
    "y": 680
  },
  "platforms": [
    {
      "x": 0,
      "y": 768,
      "w": 400,
      "h": 132
    },
    {
      "x": 100,
      "y": 620,
      "w": 128,
      "h": 48
    },
    {
      "x": 280,
      "y": 500,
      "w": 128,
      "h": 48
    },
    {
      "x": 500,
      "y": 768,
      "w": 300,
      "h": 132
    },
    {
      "x": 600,
      "y": 580,
      "w": 96,
      "h": 48
    },
    {
      "x": 750,
      "y": 460,
      "w": 96,
      "h": 48
    },
    {
      "x": 900,
      "y": 768,
      "w": 500,
      "h": 132
    },
    {
      "x": 1000,
      "y": 600,
      "w": 160,
      "h": 48
    },
    {
      "x": 1200,
      "y": 480,
      "w": 160,
      "h": 48
    },
    {
      "x": 1100,
      "y": 340,
      "w": 128,
      "h": 48
    },
    {
      "x": 1500,
      "y": 768,
      "w": 200,
      "h": 132
    },
    {
      "x": 1600,
      "y": 600,
      "w": 96,
      "h": 48
    },
    {
      "x": 1750,
      "y": 480,
      "w": 96,
      "h": 48
    },
    {
      "x": 1900,
      "y": 360,
      "w": 128,
      "h": 48
    },
    {
      "x": 2100,
      "y": 768,
      "w": 700,
      "h": 132
    },
    {
      "x": 2250,
      "y": 600,
      "w": 192,
      "h": 48
    },
    {
      "x": 2550,
      "y": 480,
      "w": 160,
      "h": 48
    },
    {
      "x": 2450,
      "y": 340,
      "w": 128,
      "h": 48
    },
    {
      "x": 2900,
      "y": 768,
      "w": 600,
      "h": 132
    },
    {
      "x": 3050,
      "y": 600,
      "w": 160,
      "h": 48
    },
    {
      "x": 3300,
      "y": 480,
      "w": 128,
      "h": 48
    },
    {
      "x": 3500,
      "y": 768,
      "w": 900,
      "h": 132
    },
    {
      "x": 3700,
      "y": 600,
      "w": 160,
      "h": 48
    },
    {
      "x": 3950,
      "y": 500,
      "w": 128,
      "h": 48
    }
  ],
  "specialPlatforms": [
    {
      "x": 800,
      "y": 700,
      "type": "bouncing"
    },
    {
      "x": 1850,
      "y": 700,
      "type": "falling"
    },
    {
      "x": 2850,
      "y": 700,
      "type": "breakable"
    }
  ],
  "movingPlatforms": [
    {
      "x": 1400,
      "y": 550,
      "distance": 100,
      "duration": 2200
    },
    {
      "x": 2800,
      "y": 550,
      "distance": 120,
      "duration": 2400
    },
    {
      "x": 3400,
      "y": 650,
      "distance": 80,
      "duration": 2000,
      "vertical": true
    }
  ],
  "spikes": [
    {
      "x": 500,
      "y": 880
    },
    {
      "x": 1550,
      "y": 880
    },
    {
      "x": 2750,
      "y": 752
    },
    {
      "x": 3450,
      "y": 752
    }
  ],
  "enemies": [
    {
      "type": "flying_buzz",
      "x": 300,
      "y": 450,
      "range": 100
    },
    {
      "type": "walking_mouse",
      "x": 550,
      "y": 720,
      "range": 110
    },
    {
      "type": "flying_buzz",
      "x": 1050,
      "y": 400,
      "range": 120
    },
    {
      "type": "walking",
      "x": 1200,
      "y": 720,
      "range": 130
    },
    {
      "type": "strong",
      "x": 2200,
      "y": 720,
      "range": 140
    },
    {
      "type": "flying",
      "x": 2600,
      "y": 380,
      "range": 100
    },
    {
      "type": "strong",
      "x": 3600,
      "y": 720,
      "range": 130
    },
    {
      "type": "walking_mouse",
      "x": 3800,
      "y": 720,
      "range": 110
    }
  ],
  "collectibles": [
    {
      "type": "coin",
      "x": 120,
      "y": 700
    },
    {
      "type": "gem_blue",
      "x": 620,
      "y": 520
    },
    {
      "type": "powerup_jump",
      "x": 1120,
      "y": 280
    },
    {
      "type": "coin",
      "x": 1220,
      "y": 420
    },
    {
      "type": "life",
      "x": 2470,
      "y": 280
    },
    {
      "type": "powerup_shield",
      "x": 2570,
      "y": 420
    },
    {
      "type": "gem_red",
      "x": 3070,
      "y": 540
    },
    {
      "type": "coin",
      "x": 3720,
      "y": 540
    },
    {
      "type": "gem_blue",
      "x": 3970,
      "y": 440
    }
  ],
  "checkpoint": {
    "x": 2150,
    "y": 720
  }
}
};