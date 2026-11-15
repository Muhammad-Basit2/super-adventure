// Centralized Save & Persistent Storage System
class SaveManager {
  constructor() {
    this.storageKey = 'super_adventure_save_v1';
    this.defaultData = {
      unlockedLevels: 1,
      completedLevels: [],
      highScore: 0,
      totalCoins: 0,
      settings: {
        masterVolume: 0.8,
        musicVolume: 0.7,
        sfxVolume: 0.9,
        fullscreen: false
      }
    };
    this.data = { ...this.defaultData };
  }

  async init() {
    try {
      if (window.electronAPI && window.electronAPI.loadData) {
        const electronData = await window.electronAPI.loadData();
        if (electronData) {
          this.data = this.mergeWithDefaults(electronData);
          return;
        }
      }
      
      const local = localStorage.getItem(this.storageKey);
      if (local) {
        this.data = this.mergeWithDefaults(JSON.parse(local));
      } else {
        await this.save();
      }
    } catch (err) {
      console.warn('Failed to load save data, using defaults:', err);
      this.data = { ...this.defaultData };
    }
  }

  mergeWithDefaults(loaded) {
    return {
      unlockedLevels: Math.max(1, loaded.unlockedLevels || 1),
      completedLevels: Array.isArray(loaded.completedLevels) ? loaded.completedLevels : [],
      highScore: Math.max(0, loaded.highScore || 0),
      totalCoins: Math.max(0, loaded.totalCoins || 0),
      settings: {
        masterVolume: loaded.settings?.masterVolume ?? 0.8,
        musicVolume: loaded.settings?.musicVolume ?? 0.7,
        sfxVolume: loaded.settings?.sfxVolume ?? 0.9,
        fullscreen: !!loaded.settings?.fullscreen
      }
    };
  }

  async save() {
    try {
      const json = JSON.stringify(this.data);
      localStorage.setItem(this.storageKey, json);
      if (window.electronAPI && window.electronAPI.saveData) {
        await window.electronAPI.saveData(this.data);
      }
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  }

  unlockLevel(levelNum) {
    if (levelNum > this.data.unlockedLevels && levelNum <= 5) {
      this.data.unlockedLevels = levelNum;
    }
    if (!this.data.completedLevels.includes(levelNum - 1) && levelNum > 1) {
      this.data.completedLevels.push(levelNum - 1);
    }
    this.save();
  }

  completeLevel(levelNum, score, coins) {
    if (!this.data.completedLevels.includes(levelNum)) {
      this.data.completedLevels.push(levelNum);
    }
    if (levelNum < 5 && this.data.unlockedLevels < levelNum + 1) {
      this.data.unlockedLevels = levelNum + 1;
    }
    this.data.totalCoins += coins;
    if (score > this.data.highScore) {
      this.data.highScore = score;
    }
    this.save();
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
  }

  async resetProgress() {
    this.data = {
      ...this.defaultData,
      settings: { ...this.data.settings } // preserve audio preferences
    };
    await this.save();
  }
}

export const saveManager = new SaveManager();
