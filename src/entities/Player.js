import { audioManager } from '../systems/AudioManager.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, charColor = 'green') {
    super(scene, x, y, 'characters', `character_${charColor}_idle`);
    this.scene = scene;
    this.charColor = charColor;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(54, 94);
    this.body.setOffset(37, 34);
    this.body.setMaxVelocity(420, 900);

    this.moveSpeed = 270;
    this.acceleration = 1200;
    this.drag = 900;
    this.body.setDragX(this.drag);
    this.jumpForce = -580;
    this.maxJumps = 2;
    this.jumpsLeft = this.maxJumps;

    this.coyoteTimeMax = 150;
    this.coyoteTimer = 0;
    this.jumpBufferMax = 160;
    this.jumpBufferTimer = 0;
    this.wasOnGround = false;

    this.isFacingLeft = false;
    this.isDead = false;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;

    this.powerups = { speedBoost: 0, superJump: 0, shield: 0 };

    this.shieldGfx = scene.add.circle(x, y, 55, 0x4fc3f7, 0.4);
    this.shieldGfx.setStrokeStyle(3, 0x00e5ff);
    this.shieldGfx.setVisible(false);
    this.shieldGfx.setDepth(15);

    this.play(`player_${this.charColor}_idle`);
  }

  update(cursors, keys, delta = 16.6) {
    if (this.isDead) return;

    const onGround = this.body.blocked.down || this.body.touching.down;

    if (this.shieldGfx.visible) {
      this.shieldGfx.setPosition(this.x, this.y);
    }

    if (onGround) {
      this.coyoteTimer = this.coyoteTimeMax;
      this.jumpsLeft = this.maxJumps;
      if (!this.wasOnGround && this.body.velocity.y >= 0) {
        this.createLandingDust();
      }
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }
    this.wasOnGround = onGround;

    if (this.powerups.speedBoost > 0) {
      this.powerups.speedBoost = Math.max(0, this.powerups.speedBoost - delta);
    }
    if (this.powerups.superJump > 0) {
      this.powerups.superJump = Math.max(0, this.powerups.superJump - delta);
    }
    if (this.powerups.shield > 0) {
      this.powerups.shield = Math.max(0, this.powerups.shield - delta);
      if (this.powerups.shield === 0) this.shieldGfx.setVisible(false);
    }

    const targetSpeed = this.powerups.speedBoost > 0 ? this.moveSpeed * 1.5 : this.moveSpeed;
    const baseJump = this.powerups.superJump > 0 ? this.jumpForce * 1.25 : this.jumpForce;

    const leftDown = cursors.left.isDown || keys.A.isDown;
    const rightDown = cursors.right.isDown || keys.D.isDown;

    if (leftDown) {
      this.setAccelerationX(-this.acceleration);
      this.setFlipX(true);
      this.isFacingLeft = true;
      if (onGround) this.play(`player_${this.charColor}_walk`, true);
    } else if (rightDown) {
      this.setAccelerationX(this.acceleration);
      this.setFlipX(false);
      this.isFacingLeft = false;
      if (onGround) this.play(`player_${this.charColor}_walk`, true);
    } else {
      this.setAccelerationX(0);
      if (onGround && Math.abs(this.body.velocity.x) < 20) {
        this.play(`player_${this.charColor}_idle`, true);
      }
    }

    if (Math.abs(this.body.velocity.x) > targetSpeed) {
      this.setVelocityX(Math.sign(this.body.velocity.x) * targetSpeed);
    }

    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(cursors.up) ||
                            Phaser.Input.Keyboard.JustDown(keys.SPACE) ||
                            Phaser.Input.Keyboard.JustDown(keys.W);

    if (jumpJustPressed) {
      this.jumpBufferTimer = this.jumpBufferMax;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    if (this.jumpBufferTimer > 0) {
      if (onGround || this.coyoteTimer > 0) {
        this.executeJump(baseJump);
        this.jumpsLeft = this.maxJumps - 1;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
      } else if (this.jumpsLeft > 0) {
        this.executeJump(baseJump * 0.95);
        this.jumpsLeft--;
        this.jumpBufferTimer = 0;
        this.createDoubleJumpParticles();
        audioManager.playSfx('sfx_jump_high');
      }
    }

    const jumpHeld = cursors.up.isDown || keys.SPACE.isDown || keys.W.isDown;
    if (!jumpHeld && this.body.velocity.y < -200) {
      this.setVelocityY(this.body.velocity.y * 0.55);
    }

    if (!onGround) {
      this.play(`player_${this.charColor}_jump`, true);
    }

    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      this.alpha = Math.floor(Date.now() / 80) % 2 === 0 ? 0.25 : 1;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.alpha = 1;
      }
    }
  }

  executeJump(jumpVelocity) {
    this.setVelocityY(jumpVelocity);
    audioManager.playSfx('sfx_jump');
    this.play(`player_${this.charColor}_jump`);
    this.createJumpDust();
  }

  createJumpDust() {
    for (let i = 0; i < 4; i++) {
      const p = this.scene.add.circle(this.x + (i - 1.5) * 8, this.y + 45, 6, 0xffffff, 0.7).setDepth(10);
      this.scene.tweens.add({
        targets: p,
        y: this.y + 55,
        alpha: 0,
        scale: 0.2,
        duration: 260,
        onComplete: () => p.destroy()
      });
    }
  }

  createLandingDust() {
    for (let i = -1; i <= 1; i += 2) {
      const p = this.scene.add.circle(this.x + i * 14, this.y + 44, 7, 0xffffff, 0.6).setDepth(10);
      this.scene.tweens.add({
        targets: p,
        x: this.x + i * 30,
        scaleX: 1.6,
        scaleY: 0.4,
        alpha: 0,
        duration: 200,
        onComplete: () => p.destroy()
      });
    }
  }

  createDoubleJumpParticles() {
    const p = this.scene.add.circle(this.x, this.y + 35, 12, 0xffffff, 0.8);
    this.scene.tweens.add({
      targets: p,
      scaleX: 2.5,
      scaleY: 0.5,
      alpha: 0,
      duration: 250,
      onComplete: () => p.destroy()
    });
  }

  takeDamage() {
    if (this.isDead || this.isInvulnerable) return false;

    if (this.powerups.shield > 0) {
      this.powerups.shield = 0;
      this.shieldGfx.setVisible(false);
      audioManager.playSfx('sfx_bump');
      this.scene.cameras.main.shake(120, 0.01);
      return false;
    }

    this.isInvulnerable = true;
    this.invulnerableTimer = 1500;
    audioManager.playSfx('sfx_hurt');
    this.play(`player_${this.charColor}_hit`);
    this.setVelocityY(-300);
    this.setVelocityX(this.isFacingLeft ? 200 : -200);
    this.scene.cameras.main.shake(200, 0.015);
    return true;
  }

  applyPowerUp(type, durationMs = 8000) {
    audioManager.playSfx('sfx_magic');
    if (type === 'speed') this.powerups.speedBoost = durationMs;
    else if (type === 'jump') this.powerups.superJump = durationMs;
    else if (type === 'shield') {
      this.powerups.shield = durationMs;
      this.shieldGfx.setVisible(true);
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.shieldGfx.setVisible(false);
    this.setVelocity(0, -500);
    this.body.checkCollision.none = true;
    this.play(`player_${this.charColor}_hit`);
    audioManager.playSfx('sfx_disappear');

    this.scene.tweens.add({
      targets: this,
      angle: 180,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeIn'
    });
  }

  destroy(fromScene) {
    if (this.shieldGfx) this.shieldGfx.destroy();
    super.destroy(fromScene);
  }
}
