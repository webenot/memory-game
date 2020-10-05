// Core
import Phaser from 'phaser/dist/phaser.min';

// Game Objects
import { Card } from '../GameObjects/Card';

export class GameScene extends Phaser.Scene {
  constructor (config) {
    super({ key: 'GameScene' });
    this.config = config;
    this.cards = [];
    this.timeout = this.config.timeout;
  }

  preload () {
    this.load.image('bg', 'img/background.png');
    this.load.image('card', 'img/card.png');
    for (const value of this.config.cards) {
      this.load.image(`card${value}`, `img/card${value}.png`);
    }
    this.load.audio('theme', 'sounds/theme.mp3');
    this.load.audio('complete', 'sounds/complete.mp3');
    this.load.audio('success', 'sounds/success.mp3');
    this.load.audio('timeout', 'sounds/timeout.mp3');
    this.load.audio('card', 'sounds/card.mp3');
  }

  create () {
    this.createTimer();
    this.createBackground();
    this.createCards();
    this.createText();
    this.createSounds();
    this.start();
  }

  start () {
    this.openedCard = null;
    this.openedCardsCount = 0;
    this.initCardsPositions();
    this.initCards();
    this.timeout = this.config.timeout;
    this.showCards();
    this.timer.paused = false;
  }

  restart () {
    let count = 0;
    const onCardMoveComplete = () => {
      ++count;
      if (count >= this.cards.length) {
        this.start();
      }
    };
    const maxDelay = this.cards.length * this.config.cardDelay;
    // Когда все карты улетели
    for (let i = 0, length = this.cards.length; i < length; i++) {
      this.cards[i].depth = maxDelay - this.cards[i].position.delay;
      this.cards[i].move({
        x: this.game.canvas.width + this.cards[i].width,
        y: this.game.canvas.height + this.cards[i].height,
        delay: this.cards[i].position.delay,
        callback: onCardMoveComplete,
      });
    }
  }

  initCards () {
    const positions = this.positions.slice();
    Phaser.Utils.Array.Shuffle(positions);
    for (let i = 0, length = this.cards.length; i < length; i++) {
      this.cards[i].init(positions.pop());
    }
  }

  showCards () {
    for (let i = 0, length = this.cards.length; i < length; i++) {
      this.cards[i].depth = this.cards[i].position.delay;
      this.cards[i].move({
        x: this.cards[i].position.x,
        y: this.cards[i].position.y,
        delay: this.cards[i].position.delay,
      });
    }
  }

  createBackground () {
    this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
  }

  createCards () {
    for (const value of this.config.cards) {
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(this, value));
      }
    }

    this.input.on('gameobjectdown', this.onCardClick, this);
  }

  initCardsPositions () {
    const positions = [];

    const cardTexture = this.textures.get('card').getSourceImage();

    const cardWidth = cardTexture.width + 4;
    const cardHeight = cardTexture.height + 4;

    const offsetX = (this.game.canvas.width - cardWidth * this.config.cols) / 2 + cardWidth / 2;
    const offserY = (this.game.canvas.height - cardHeight * this.config.rows) / 2 + cardHeight / 2;

    let index = 0;

    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        positions.push({
          x: offsetX + col * cardWidth,
          y: offserY + row * cardHeight,
          delay: index * this.config.cardDelay,
        });
        index++;
      }
    }

    this.positions = positions;
  }

  createText () {
    this.timeoutText = this.add.text(5, 330, '', {
      font: '36px CurseCasual',
      fill: '#ffffff',
    });
  }

  onTimerTick () {
    this.timeoutText.setText(`Time: ${this.timeout--}`);

    if (this.timeout < 0) {
      this.timer.paused = true;
      this.sounds.timeout.play();
      this.restart();
    }
  }

  createTimer () {
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      loop: true,
      callbackScope: this,
    });
  }

  createSounds () {
    this.sounds = {
      theme: this.sound.add('theme'),
      complete: this.sound.add('complete'),
      success: this.sound.add('success'),
      timeout: this.sound.add('timeout'),
      card: this.sound.add('card'),
    };

    this.sounds.theme.play({
      volume: 0.05,
      loop: true,
    });
  }

  onCardClick (pointer, card) {
    if (card.opened) {
      return false;
    }
    if (this.openedCard) {
      // Уже есть открытая карта
      if (this.openedCard.value === card.value) {
        this.sounds.success.play();
        // Картинки развны - запомнить
        this.openedCard = null;
        this.openedCardsCount++;
      } else {
        // Картинки разные - скрыть предыдущую
        this.openedCard.close();
        this.openedCard = card;
      }
    } else {
      // Еще нет открытых карт
      this.openedCard = card;
    }

    card.open(() => {
      if (this.openedCardsCount === this.config.cards.length) {
        this.timer.paused = false;
        this.sounds.complete.play();
        this.restart();
      }
    });
  }
}
