import { saveManager } from '../systems/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  init(data) {
    this.returnScene = data.returnScene || 'MenuScene';
  }

  create() {
    const { width, height } = this.scale;
    audioManager.init(this);

    // Overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

    // Dialog card
    const card = this.add.graphics();
    card.fillStyle(0x1a202c, 0.98);
    card.fillRoundedRect(width / 2 - 260, height / 2 - 250, 520, 500, 16);
    card.lineStyle(2, 0x4fd1c5, 1);
    card.strokeRoundedRect(width / 2 - 260, height / 2 - 250, 520, 500, 16);

    this.add.text(width / 2, height / 2 - 210, 'SETTINGS', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5);

    // Controls explanation
    this.add.text(width / 2, height / 2 - 160, 'Movement: [A/D] / [Arrows]  •  Jump: [SPACE / W]  •  Pause: [ESC]', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '13px',
      color: '#a0aec0'
    }).setOrigin(0.5);

    // Sliders / Controls
    let currentY = height / 2 - 110;

    // Master Volume
    this.createSlider(width / 2, currentY, 'Master Volume', saveManager.data.settings.masterVolume, (val) => {
      saveManager.updateSettings({ masterVolume: val });
    });

    currentY += 65;
    // Music Volume
    this.createSlider(width / 2, currentY, 'Music Volume', saveManager.data.settings.musicVolume, (val) => {
      saveManager.updateSettings({ musicVolume: val });
    });

    currentY += 65;
    // SFX Volume
    this.createSlider(width / 2, currentY, 'Sound Effects Volume', saveManager.data.settings.sfxVolume, (val) => {
      saveManager.updateSettings({ sfxVolume: val });
      audioManager.playSfx('sfx_select');
    });

    currentY += 65;
    // Fullscreen Toggle
    this.createToggle(width / 2, currentY, 'Fullscreen Display', saveManager.data.settings.fullscreen, async (checked) => {
      saveManager.updateSettings({ fullscreen: checked });
      if (window.electronAPI && window.electronAPI.toggleFullscreen) {
        await window.electronAPI.toggleFullscreen();
      } else {
        if (!this.scale.isFullscreen) {
          this.scale.startFullscreen();
        } else {
          this.scale.stopFullscreen();
        }
      }
    });

    currentY += 65;
    // Reset Data
    this.createButton(width / 2, currentY, 'RESET ALL SAVE DATA', '#e53e3e', async () => {
      await saveManager.resetProgress();
      audioManager.playSfx('sfx_bump');
      this.add.text(width / 2, currentY + 30, 'Save Data Reset!', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '14px',
        color: '#e53e3e'
      }).setOrigin(0.5);
    });

    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + 205, 'CLOSE SETTINGS', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#4fd1c5'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#ffd166'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#4fd1c5'));
    closeBtn.on('pointerdown', () => {
      audioManager.playSfx('sfx_select');
      this.scene.stop();
    });
  }

  createSlider(x, y, label, initialVal, onChange) {
    const left = x - 180;
    const right = x + 180;
    const width = 360;

    this.add.text(left, y - 18, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '15px',
      color: '#e2e8f0'
    });

    const valText = this.add.text(right, y - 18, `${Math.round(initialVal * 100)}%`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(1, 0);

    const track = this.add.rectangle(x, y + 8, width, 8, 0x4a5568);
    const fill = this.add.rectangle(left + (width * initialVal) / 2, y + 8, width * initialVal, 8, 0x319795);
    const thumb = this.add.circle(left + width * initialVal, y + 8, 10, 0xffffff)
      .setInteractive({ useHandCursor: true, draggable: true });

    this.input.setDraggable(thumb);

    thumb.on('drag', (pointer, dragX) => {
      const clampedX = Phaser.Math.Clamp(dragX, left, right);
      thumb.x = clampedX;
      const ratio = (clampedX - left) / width;
      fill.width = clampedX - left;
      fill.x = left + fill.width / 2;
      valText.setText(`${Math.round(ratio * 100)}%`);
      onChange(ratio);
    });
  }

  createToggle(x, y, label, initialChecked, onToggle) {
    const left = x - 180;
    let checked = initialChecked;

    this.add.text(left, y, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#e2e8f0'
    }).setOrigin(0, 0.5);

    const toggleBox = this.add.rectangle(x + 150, y, 50, 26, checked ? 0x319795 : 0x4a5568)
      .setInteractive({ useHandCursor: true });
    const toggleThumb = this.add.circle(checked ? x + 162 : x + 138, y, 10, 0xffffff);

    toggleBox.on('pointerdown', () => {
      checked = !checked;
      toggleBox.fillColor = checked ? 0x319795 : 0x4a5568;
      toggleThumb.x = checked ? x + 162 : x + 138;
      audioManager.playSfx('sfx_select');
      onToggle(checked);
    });
  }

  createButton(x, y, label, color, callback) {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: color
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setAlpha(0.7));
    btn.on('pointerout', () => btn.setAlpha(1));
    btn.on('pointerdown', callback);
  }
}
