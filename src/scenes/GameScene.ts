import Phaser from 'phaser';
import { Colors, Directions } from '../enums/GameEnums';
import { createPacManAnims, createGhostsAnims } from '../anims/CreateAnims';
import { debugLayer } from '../tools/debug';
import Ghost from '../sprites/Ghost';
import ScatterAI from '../ai-mode/ScatterAI';
import { GameConfig, GhostAIConfig } from '../configs/GameConfig';
import Pacman from '../sprites/Pacman';
import ChaseAI from '../ai-mode/ChaseAI';
import FrightenedAI from '../ai-mode/FrightenedAI';
import { 
    EVENT_GAME_INITED, 
    EVENT_PACMAN_HASPOWER,
    EVENT_PACMAN_LOSEPOWER, 
    sceneEvents 
} from '../events/GameEvents';
import { IGhostAIMap } from '../interfaces/IGhostAIMap';

export default class GameScene extends Phaser.Scene {

    private pacman?: Pacman;
    private cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wallLayer?: Phaser.Tilemaps.TilemapLayer;
    private ghostArray?: Array<Ghost>;
    private ghostAIMap?: IGhostAIMap;
    private _globalTimer?: Phaser.Time.TimerEvent;
    private _text?: Phaser.GameObjects.Text;
    private _elapse: number = 0;
    private _modeIdx: number = 0;
    private _lastMode: string = '';

    private _dotsCount: number = 0;
    private _bigDotsCount: number = 0;

    constructor() {
        super('GameScene');
        this.ghostArray = new Array<Ghost>();
    }

    create()
    {
        this.scene.launch('GameUIScene');

        createPacManAnims(this.anims);
        createGhostsAnims(this.anims);

        const map = this.make.tilemap({key: 'pacmanJson'});

        const tileSet = map.addTilesetImage('pac-man', 'pacman', 16, 16, 1, 2);

        this.wallLayer = map.createLayer('Walls', tileSet).forEachTile(tile =>{
            tile.tint = 0x3ba3ff;
        }).setCollisionByProperty({ collides: true });

        const dotsLayer = map.createLayer('Dots', tileSet);

        const dots = dotsLayer.createFromTiles(16, -1, { key: 'pacman', frame: 15, origin: 0 })
		dots.forEach(dot => {
            this._dotsCount++;
			this.physics.add.existing(dot);
			(dot.body as Phaser.Physics.Arcade.Body).setCircle(2, 6, 6);
		})
        
        const bigDots = dotsLayer.createFromTiles(18, -1, { key: 'pacman', frame: 17, origin: 0 })
        bigDots.forEach(bigDot => {
            this._bigDotsCount++;

			this.physics.add.existing(bigDot);
			(bigDot.body as Phaser.Physics.Arcade.Body).setCircle(4, 4, 4);

            this.tweens.add({
				targets: bigDot,
				alpha: 0.1,
				duration: 800,
				yoyo: true,
				repeat: -1
			});
		})

        this.pacman = new Pacman(this, 144, 256, undefined, this.wallLayer);

        this.add.existing(this.pacman!);

        (this.pacman!.body as Phaser.Physics.Arcade.Body).setCircle(8);

        this.cursor = this.input.keyboard.createCursorKeys();

        const ghostDatas = map.getLayer('Ghosts').data;
        let color = Colors.Blinky;

        ghostDatas.forEach(tileRow => {
            tileRow.forEach(tile => {
                if (tile.index != -1){
                    const ghost = new Ghost(this, tile.x * tile.width, tile.y * tile.height, undefined, this.wallLayer);
                    ghost.makeColor(color++);

                    this.add.existing(ghost);
                    this.ghostArray?.push(ghost);
                }
            });
        });

        if (!this.ghostArray){
            throw new Error('GHOST NOT INITED!');
        }

        this.ghostAIMap = 
        {
            'blinky': [
                new ScatterAI(0, this.wallLayer.width, this.ghostArray[Colors.Blinky], this.wallLayer),
                new ChaseAI(this.pacman!, this.ghostArray[Colors.Blinky], this.wallLayer),
                new FrightenedAI(this.ghostArray[Colors.Blinky], this.wallLayer)
            ], 
            'clyde': [
                new ScatterAI(0, this.wallLayer.height, this.ghostArray[Colors.Clyde], this.wallLayer),
                new ChaseAI(this.pacman!, this.ghostArray[Colors.Clyde], this.wallLayer),
                new FrightenedAI(this.ghostArray[Colors.Clyde], this.wallLayer)
            ], 
            'inky': [
                new ScatterAI(this.wallLayer.width, this.wallLayer.height, this.ghostArray[Colors.Inky], this.wallLayer),
                new ChaseAI(this.pacman!, this.ghostArray[Colors.Inky], this.wallLayer, this.ghostArray[Colors.Blinky]),
                new FrightenedAI(this.ghostArray[Colors.Inky], this.wallLayer)
            ], 
            'pinky': [
                new ScatterAI(0, 0, this.ghostArray[Colors.Pinky], this.wallLayer),
                new ChaseAI(this.pacman!, this.ghostArray[Colors.Pinky], this.wallLayer),
                new FrightenedAI(this.ghostArray[Colors.Pinky], this.wallLayer)
            ]
        };

        this.physics.add.collider(this.pacman!, this.wallLayer, this.pacman.handlePacmanWallsCollision, undefined, this.pacman);

        this.physics.add.overlap(this.pacman!, dots, (p, d)=>{
            let pacman = p as Pacman;
            let dot = d as Phaser.GameObjects.Sprite;
            pacman.eatDot(dot);
        }, undefined, this);

        this.physics.add.overlap(this.pacman!, bigDots, (p, d)=>{
            let pacman = p as Pacman;
            let bigDot = d as Phaser.GameObjects.Sprite;
            pacman.eatBigDot(bigDot);

            sceneEvents.emit(EVENT_PACMAN_HASPOWER);
            this.setAllGhostAIMode('frightened');
        }, undefined, this);

        this.ghostArray.forEach(go => {

            this.physics.add.overlap(this.pacman!, go, (p, g)=>{
                let pacman = p as Pacman;
                let ghost = g as Ghost;

                if (ghost.isFrightened){
                    ghost.handlePacmanAte();
                }
                else{
                    pacman.handleGhostHited();
                }

            }, undefined, this);
        });

        this.physics.world.setBounds(0, 0, this.wallLayer.width, this.wallLayer.height);
        this.physics.world.pause();

        sceneEvents.once(EVENT_GAME_INITED, ()=>{
            this.physics.world.resume();

            this.createGhostAITimer();

            this.ghostArray![Colors.Pinky].outRoom();
        });

        this._text = this.add.text(this.scale.width - 200, 30, 'MODE:');

        this.cameras.main.setViewport(0, 0, this.wallLayer.width, this.wallLayer.height);
    }

    update() {
        if (!this.cursor || !this.pacman){
            return;
        }

        this.pacman.update(this.cursor);
    }

    createGhostAITimer(){
        
        if (!this.ghostArray){
            return;
        }


        this._globalTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                
                let currMode = GhostAIConfig.modes[this._modeIdx];

                this._elapse++;

                if (currMode && this._elapse * 1000 >= currMode.during){
                    this._elapse = 0;
                    currMode = GhostAIConfig.modes[++this._modeIdx];

                    if (currMode){
                        this.setAllGhostAIMode(currMode.type);
                    }
                }
            },
            callbackScope: this,
            loop: true
        });

        let currMode = GhostAIConfig.modes[this._modeIdx];
        if (currMode){
            this.setAllGhostAIMode(currMode.type);
        }
    }

    setAllGhostAIMode(mode: string){
        if (!this.ghostArray || !this.ghostAIMap || !this._globalTimer){
            return;
        }

        this._text?.setText(`MODE: ${mode.toUpperCase()}`);

        if (mode === 'frightened'){
            this._globalTimer.paused = true;

            this.time.delayedCall(
                GhostAIConfig.frightened,
                () => {

                    this.setAllGhostAIMode(this._lastMode);

                    sceneEvents.emit(EVENT_PACMAN_LOSEPOWER);
                    this._globalTimer!.paused = false;

                }, undefined, this);
        }
        else{
            this._lastMode = mode;
        }

        this.ghostArray!.forEach(ghost => {
            let color = Colors[ghost.ghostColor!].toLowerCase();
            let modeIdx = 0;

            if (mode === 'scatter'){
                modeIdx = 0;
            }
            else if (mode === 'chase'){
                modeIdx = 1;
            }
            else if (mode === 'frightened'){
                modeIdx = 2;
            }

            let modeAI = this.ghostAIMap![color][modeIdx];
            ghost.setAI(modeAI);
        });
    }
}
