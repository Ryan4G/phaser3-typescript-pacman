import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {

    private pacman?: Phaser.GameObjects.Sprite;

    constructor() {
        super('GameScene');
    }

    create()
    {
        const map = this.make.tilemap({key: 'pacmanJson'});

        const tileSet = map.addTilesetImage('pac-man', 'pacman', 16, 16, 1, 2);

        const wallsLayer = map.createLayer('Walls', tileSet);

        const pacmanLayer = map.createLayer('Pacman', tileSet);
        const ghostsLayer = map.createLayer('Ghosts', tileSet);
        const dotsLayer = map.createLayer('Dots', tileSet);

        this.pacman = pacmanLayer.createFromTiles(13, 0, { key: 'pacman', frame: 12}).pop();
        this.pacman?.setOrigin(0);

    }

    update() {

    }
}
