import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene'
import GameUIScene from './scenes/GameUIScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 380,
	height: 352,
    backgroundColor: '#7d7d7d',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: false
		}
	},
	zoom: 2,
	scene: [PreloadScene, GameScene, GameUIScene]
}

export default new Phaser.Game(config)
