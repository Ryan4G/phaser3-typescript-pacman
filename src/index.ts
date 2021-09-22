import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 308,
	height: 352,
    backgroundColor: '#7d7d7d',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		}
	},
	zoom: 2,
	scene: [PreloadScene, GameScene]
}

export default new Phaser.Game(config)
