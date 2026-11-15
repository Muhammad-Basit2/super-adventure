import { audioManager } from '../systems/AudioManager.js';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemies', 'barnacle_attack_rest');
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2.2); // Large intimidating boss
    this.body.setSize(52, 52);
    this.body.setOffset(6, 6);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);

    this.maxHp = 10;
    this.hp = this.maxHp;
    this.phase = 1; // 1 (basic), 2 (faster + bursts), 3 (rage mode)
    this.isDead = false;
    this.isInvulnerable = false;
    this.attackTimer = 0;
    this.fireballs = scene.physics.add.group();

    this.createBossHealthBar();
    this.play('enemy_barnacle_attack');
  }

  createBossHealthBar() {
    const { width } = this.scene.scale;
    this.barContainer = this.scene.add.container(width / 2, 75).setScrollFactor(0).setDepth(150);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRoundedRect(-160, -14, 320, 28, 6);
    bg.lineStyle(2, 0xe11d48, 1);
    bg.strokeRoundedRect(-160, -14, 320, 28, 6);

    this.hpBarFill = this.scene.add.graphics();
    this.updateHpBar();

    const title = this.scene.add.text(0, -25, '⚔️ OVERLORD BARNACLE (FINAL BOSS) ⚔️', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f43f5e'
    }).setOrigin(0.5);

    this.barContainer.add([bg, this.hpBarFill, title]);
  }

  updateHpBar() {
    this.hpBarFill.clear();
    const ratio = Math.max(0, this.hp / this.maxHp);
    const color = this.phase === 3 ? 0xef4444 : (this.phase === 2 ? 0xf59e0b : 0x10b981);
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRoundedRect(-156, -10, 312 * ratio, 20, 4);
  }

  update(player) {
    if (this.isDead || !player) return;

    this.attackTimer += 16.6;
    const attackInterval = this.phase === 3 ? 1200 : (this.phase === 2 ? 1800 : 2500);

    if (this.attackTimer >= attackInterval) {
      this.attackTimer = 0;
      this.launchAttack(player);
    }

    // Clean up fireballs that leave boundary
    this.fireballs.getChildren().forEach(fb => {
      if (fb.x < 0 || fb.x > 4500 || fb.y > 1000) {
        fb.destroy();
      }
    });
  }

  launchAttack(player) {
    if (this.isDead) return;

    // Visual Telegraph: Glow warning before firing
    this.setTint(0xff0055);
    this.scene.time.delayedCall(300, () => {
      if (this.isDead) return;
      this.clearTint();
      audioManager.playSfx('sfx_bump');

      // Shoot projectile toward player
      const fb = this.scene.physics.add.image(this.x - 30, this.y, 'tiles', 'fireball');
      this.fireballs.add(fb);
      fb.body.setAllowGravity(false);
      fb.setScale(1.2);

      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const speed = this.phase === 3 ? 340 : 240;
      this.scene.physics.velocityFromRotation(angle, speed, fb.body.velocity);

      // Phase 3 extra attack: Shoot a high lob fire too
      if (this.phase === 3) {
        const lob = this.scene.physics.add.image(this.x - 30, this.y - 20, 'tiles', 'fireball');
        this.fireballs.add(lob);
        lob.body.setAllowGravity(true);
        lob.setVelocity(-260, -400);
      }
    });
  }

  hit() {
    if (this.isDead || this.isInvulnerable) return false;

    this.hp--;
    this.isInvulnerable = true;
    this.updateHpBar();
    audioManager.playSfx('sfx_hurt');

    // Check Phase Change
    if (this.hp <= 3 && this.phase < 3) {
      this.phase = 3;
      this.scene.cameras.main.shake(300, 0.02);
    } else if (this.hp <= 7 && this.phase < 2) {
      this.phase = 2;
    }

    // Hit flash
    this.scene.tweens.add({
      targets: this,
      tint: 0xffffff,
      alpha: 0.5,
      duration: 80,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.clearTint();
        this.alpha = 1;
        this.isInvulnerable = false;
      }
    });

    if (this.hp <= 0) {
      this.defeat();
      return true;
    }
    return false;
  }

  defeat() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.enable = false;
    audioManager.playSfx('sfx_magic');

    this.fireballs.clear(true, true);
    if (this.barContainer) this.barContainer.destroy();

    // Epic defeat explosions
    for (let i = 0; i < 12; i++) {
      this.scene.time.delayedCall(i * 120, () => {
        const ox = this.x + Phaser.Math.Between(-60, 60);
        const oy = this.y + Phaser.Math.Between(-60, 60);
        const p = this.scene.add.circle(ox, oy, 20, 0xf59e0b, 0.9).setDepth(20);
        this.scene.tweens.add({
          targets: p,
          scale: 2.5,
          alpha: 0,
          duration: 350,
          onComplete: () => p.destroy()
        });
      });
    }

    this.scene.tweens.add({
      targets: this,
      scale: 0.1,
      alpha: 0,
      y: this.y + 50,
      duration: 1600,
      onComplete: () => this.destroy()
    });
  }
}
