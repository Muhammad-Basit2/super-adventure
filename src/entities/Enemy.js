import { audioManager } from '../systems/AudioManager.js';

// Mapping from level data type strings to actual animation keys
const ANIM_MAP = {
  walking_snail: 'enemy_snail',
  walking: 'enemy_slime',
  flying: 'enemy_bee',
  flying_buzz: 'enemy_fly',
  strong: 'enemy_fire_slime',
  walking_mouse: 'enemy_mouse',
  boss_turret: 'enemy_barnacle'
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'walking', config = {}) {
    let textureFrame = 'slime_normal_walk_a';

    if (type === 'walking_snail') textureFrame = 'snail_walk_a';
    else if (type === 'flying') textureFrame = 'bee_a';
    else if (type === 'flying_buzz') textureFrame = 'fly_a';
    else if (type === 'strong') textureFrame = 'slime_fire_walk_a';
    else if (type === 'walking_mouse') textureFrame = 'mouse_walk_a';
    else if (type === 'boss_turret') textureFrame = 'barnacle_attack_rest';

    super(scene, x, y, 'enemies', textureFrame);
    this.scene = scene;
    this.enemyType = type;
    
    // Get the base anim key from mapping
    const mapKey = ANIM_MAP[type] || 'enemy_slime';
    this.animBase = mapKey;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = config.speed || (type === 'flying' || type === 'flying_buzz' ? 90 : (type === 'walking_mouse' ? 140 : 65));
    this.moveRange = config.range || 140;
    this.startX = x;
    this.startY = y;
    this.direction = config.startDirection || -1;
    this.hp = config.hp || (type === 'strong' ? 2 : (type === 'boss_turret' ? 4 : 1));
    this.isDead = false;
    this.hurtTimer = 0;

    // Hitbox setup based on frame size
    const fW = this.frame?.width || 64;
    const fH = this.frame?.height || 64;
    this.body.setSize(fW * 0.65, fH * 0.75);
    this.body.setOffset(fW * 0.18, fH * 0.12);

    if (type === 'flying' || type === 'flying_buzz' || type === 'boss_turret') {
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.flyTime = 0;
    } else {
      this.body.setCollideWorldBounds(true);
      this.body.setBounce(0, 0);
      this.body.setMaxVelocity(180, 600);
    }

    // Start playing walk animation using mapped key
    this.play(`${this.animBase}_walk`, true);
    this.updateFacing();
  }

  update(time, delta) {
    if (this.isDead) return;

    // Hurt state timer - skip update during hurt frames
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      return;
    }

    if (this.enemyType === 'flying' || this.enemyType === 'flying_buzz') {
      this.flyTime += 0.05;
      this.x += this.direction * (this.speed * 0.016);
      this.y = this.startY + Math.sin(this.flyTime) * 35;

      if (Math.abs(this.x - this.startX) > this.moveRange) {
        this.direction *= -1;
        this.updateFacing();
      }

      // Keep fly animation playing
      const flyAnim = this.enemyType === 'flying' ? 'enemy_bee_fly' : 'enemy_fly_buzz';
      if (!this.anims.currentAnim?.key.includes('fly')) {
        this.play(flyAnim, true);
      }
    } else if (this.enemyType === 'boss_turret') {
      this.setVelocity(0, 0);
      // Play attack anim periodically
      if (time % 1500 < 32) {
        this.play(`${this.animBase}_attack`, true);
      }
    } else {
      // Ground enemies
      this.setVelocityX(this.direction * this.speed);
      
      // Force walk animation each frame to prevent freezing
      this.play(`${this.animBase}_walk`, true);

      // Edge detection using physics point query
      const aheadX = this.x + this.direction * 24;
      const groundPoint = this.scene.add.circle(aheadX, this.y + 28, 4, 0xff0000, 0).setVisible(false);
      const hasGround = this.scene.physics.overlap(groundPoint, this.scene.platforms, null, null, this);
      groundPoint.destroy();

      const isBlocked = this.body.blocked.left || this.body.blocked.right;

      if (Math.abs(this.x - this.startX) > this.moveRange || isBlocked || !hasGround) {
        this.direction *= -1;
        this.updateFacing();
      }
    }
  }

  updateFacing() {
    this.setFlipX(this.direction > 0);
  }

  hit() {
    if (this.isDead) return true;
    this.hp--;
    this.hurtTimer = 500;

    if (this.hp <= 0) {
      this.defeat();
      return true;
    } else {
      audioManager.playSfx('sfx_bump');
      this.clearTint();
      this.tint = 0xff4444;
      return false;
    }
  }

  defeat() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.enable = false;
    this.stop();
    audioManager.playSfx('sfx_disappear');

    // Death particles explosion
    for (let i = 0; i < 10; i++) {
      const p = this.scene.add.circle(this.x, this.y, Phaser.Math.Between(4, 9), 0xffaa00, 0.9).setDepth(20);
      const angle = (Phaser.Math.Between(0, 359)) * Math.PI / 180;
      const dist = Phaser.Math.Between(30, 65);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * dist,
        y: p.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 450,
        onComplete: () => p.destroy()
      });
    }

    // Squash and fade out
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.05,
      scaleX: 1.8,
      alpha: 0,
      y: this.y + 20,
      duration: 320,
      ease: 'Back.easeIn',
      onComplete: () => this.destroy()
    });
  }
}

