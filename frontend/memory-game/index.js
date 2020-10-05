// Core
import Phaser from 'phaser/dist/phaser.min';

// Scenes
import { GameScene } from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'memory',
  rows: 2,
  cols: 5,
  background: 'blue',
  cards: [ 1, 2, 3, 4, 5 ],
  timeout: 30,
  cardDelay: 150,
};

const scene = new GameScene(config);

config.scene = scene;

new Phaser.Game(config);
