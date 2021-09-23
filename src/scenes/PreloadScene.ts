import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    preload()
    {
        this.load.spritesheet('pacman', 'assets/tilemap/pac-man-extruded.png',
        {
            frameWidth: 16,
            frameHeight: 16,
            margin: 1,
            spacing: 2,
            startFrame: 0
        });
        
        this.load.tilemapTiledJSON('pacmanJson', 'assets/tilemap/pac-man.json');

        this.load.audioSprite('sfx', 'assets/sounds/pacman_regular.json', 'assets/sounds/pacman_regular.mp3');
        this.load.audioSprite('bgm', 'assets/sounds/pacman_looped.json', 'assets/sounds/pacman_looped.mp3');
    }

    create()
    {
        
        this.scene.start('GameScene');
    
    }

    update() {

    }
}
