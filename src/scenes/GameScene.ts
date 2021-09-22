import Phaser from 'phaser';
import { Colors, Directions } from '../enums/GameEnums';
import { createPacManAnims, createGhostsAnims } from '../anims/CreateAnims';
import { debugLayer } from '../tools/debug';
import Ghost from '../sprites/Ghost';
import ScatterAI from '../ai-mode/ScatterAI';
import GameConfig from '~configs/GameConfig';
import Pacman from '../sprites/Pacman';
import ChaseAI from '../ai-mode/ChaseAI';

export default class GameScene extends Phaser.Scene {

    private pacman?: Pacman;
    private cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wallLayer?: Phaser.Tilemaps.TilemapLayer;

    constructor() {
        super('GameScene');
    }

    create()
    {
        createPacManAnims(this.anims);
        createGhostsAnims(this.anims);

        const map = this.make.tilemap({key: 'pacmanJson'});

        const tileSet = map.addTilesetImage('pac-man', 'pacman', 16, 16, 1, 2);

        this.wallLayer = map.createLayer('Walls', tileSet).forEachTile(tile =>{
            tile.tint = 0x3ba3ff;
        }).setCollisionByProperty({ collides: true });

        //debugLayer(this.wallLayer, this);
        
        //const pacmanLayer = map.createLayer('Pacman', tileSet);
        //const ghostsLayer = map.createLayer('Ghosts', tileSet);
        //const dotsLayer = map.createLayer('Dots', tileSet);

        this.pacman = new Pacman(this, 144, 256, undefined, this.wallLayer);

        this.add.existing(this.pacman!);

        (this.pacman!.body as Phaser.Physics.Arcade.Body).setCircle(8);

        this.physics.add.collider(this.pacman!, this.wallLayer);

        this.cursor = this.input.keyboard.createCursorKeys();

        const blinky = new Ghost(this, 144, 128, undefined, this.wallLayer);
        blinky.makeColor(Colors.Blinky);
        //blinky.setAI(new ScatterAI(0, this.wallLayer.width, blinky, this.wallLayer));
        blinky.setAI(new ChaseAI(this.pacman!, blinky, this.wallLayer));

        const clyde = new Ghost(this, 144, 128, undefined, this.wallLayer);
        clyde.makeColor(Colors.Clyde);
        // clyde.setAI(new ScatterAI(0, this.wallLayer.height, clyde, this.wallLayer));  
        clyde.setAI(new ChaseAI(this.pacman!, clyde, this.wallLayer));
        
        const inky = new Ghost(this, 144, 128, undefined, this.wallLayer);
        inky.makeColor(Colors.Inky);
        // inky.setAI(new ScatterAI(this.wallLayer.width, this.wallLayer.height, inky, this.wallLayer));
        inky.setAI(new ChaseAI(this.pacman!, inky, this.wallLayer, blinky));
        
        const pinky = new Ghost(this, 144, 128, undefined, this.wallLayer);
        pinky.makeColor(Colors.Pinky);
        // pinky.setAI(new ScatterAI(0, 0, pinky, this.wallLayer));
        pinky.setAI(new ChaseAI(this.pacman!, pinky, this.wallLayer));

        this.add.existing(blinky);
        this.add.existing(clyde);
        this.add.existing(inky);
        this.add.existing(pinky);
        //this.debugPos = this.add.rectangle(144, 128, 5, 5, 0x000000);

    }

    update() {
        if (!this.cursor || !this.pacman){
            return;
        }

        this.pacman.update(this.cursor);
    }
}
