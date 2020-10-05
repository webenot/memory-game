// Core
import Phaser from 'phaser/dist/phaser.min';

export class Card extends Phaser.GameObjects.Sprite {
  constructor (scene, value) {
    super(scene, 0, 0, 'card');
    this.scene = scene;
    this.value = value;
    this.scene.add.existing(this);
    this.opened = false;

    this.setInteractive();
  }

  init (position) {
    this.position = position;
    this.close();
    this.setPosition(-this.width, -this.height);
  }

  move (params) {
    this.scene.tweens.add({
      duration: this.scene.config.cardDelay,
      x: params.x,
      y: params.y,
      ease: 'Linear',
      delay: params.delay,
      targets: this,
      onComplete: () => {
        if (params.callback) {
          params.callback();
        }
      },
    });
  }

  open (callback) {
    this.opened = true;
    this.flip(callback);
  }

  close () {
    if (this.opened) {
      this.opened = false;
      this.flip();
    }
  }

  flip (callback) {
    this.scene.sounds.card.play();
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      ease: 'Linear',
      duration: this.scene.config.cardDelay,
      onComplete: () => {
        this.show(callback);
      },
    });
  }

  show (callback) {
    const texture = this.opened ? `card${this.value}` : 'card';
    this.setTexture(texture);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      ease: 'Linear',
      duration: this.scene.config.cardDelay,
      onComplete: () => {
        if (callback) {
          callback();
        }
      },
    });
  }
}
