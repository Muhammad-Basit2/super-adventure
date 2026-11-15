export class SpecialPlatform extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'falling', frame = 'terrain_grass_horizontal_middle', config = {}) {
    super(scene, x, y, 'tiles', frame);
    this.scene = scene;
    this.platformType = type; // 'falling', 'breakable', 'bouncing', 'oneway'

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    if (type === 'oneway') {
      this.body.checkCollision.down = false;
      this.body.checkCollision.left = false;
      this.body.checkCollision.right = false;
    } else if (type === 'bouncing') {
      this.setTint(0x6ee7b7);
    } else if (type === 'falling') {
      this.setTint(0xfef08a);
    } else if (type === 'breakable') {
      this.setTint(0xfca5a5);
    }

    this.isTriggered = false;
  }

  onPlayerStep(player) {
    if (this.isTriggered) return;

    if (this.platformType === 'bouncing') {
      // Super bounce trampoline
      player.setVelocityY(-760);
      this.scene.sound.play('sfx_jump_high', { volume: 0.6 });

      this.scene.tweens.add({
        targets: this,
        scaleY: 0.6,
        duration: 80,
        yoyo: true
      });
    } else if (this.platformType === 'falling') {
      this.isTriggered = true;
      // Shake warning, then drop
      this.scene.tweens.add({
        targets: this,
        x: this.x + 3,
        duration: 50,
        yoyo: true,
        repeat: 8,
        onComplete: () => {
          this.body.setImmovable(false);
          this.body.setAllowGravity(true);
          this.body.setVelocityY(220);
        }
      });
    } else if (this.platformType === 'breakable') {
      this.isTriggered = true;
      this.scene.tweens.add({
        targets: this,
        alpha: 0.4,
        scale: 0.9,
        duration: 350,
        onComplete: () => {
          this.scene.sound.play('sfx_bump', { volume: 0.5 });
          this.destroy();
        }
      });
    }
  }
}
