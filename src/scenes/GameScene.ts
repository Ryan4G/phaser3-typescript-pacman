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
    EVENT_GAME_CHANGEMODE,
    EVENT_GAME_INITED, 
    EVENT_GAME_LEVELUP, 
    EVENT_GAME_OVER, 
    EVENT_GAME_UPDATESCORE, 
    EVENT_PACMAN_HASPOWER,
    EVENT_PACMAN_LOSELIFE,
    EVENT_PACMAN_LOSEPOWER, 
    sceneEvents 
} from '../events/GameEvents';
import { IGhostAIMap } from '../interfaces/IGhostAIMap';
import ILevelInfo from '../interfaces/ILevelInfo';

export default class GameScene extends Phaser.Scene {

    private pacman?: Pacman;
    private cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wallLayer?: Phaser.Tilemaps.TilemapLayer;
    private ghostArray?: Array<Ghost>;
    private ghostAIMap?: IGhostAIMap;
    private _globalTimer?: Phaser.Time.TimerEvent;
    private _frightenedTimer?: Phaser.Time.TimerEvent;
    private _frightenedFlashTimer?: Phaser.Time.TimerEvent;
    private _elapse: number = 0;
    private _modeIdx: number = 0;
    private _lastMode: string = '';

    private _dotsArray?: Array<Phaser.GameObjects.Sprite>;
    private _bigDotsArray?: Array<Phaser.GameObjects.Sprite>;
    private _dotsCount: number = 0;
    private _bigDotsCount: number = 0;

    private _lifeCount: number = 3;
    private _scores: number = 0;
    private _levels: number = 1;

    private _ghostValue: number = 100;

    constructor() {
        super('GameScene');
    }

    init(){
        this.ghostArray = new Array<Ghost>();
        this._dotsCount = 0;
        this._bigDotsCount = 0;
        this._elapse = 0;
        this._modeIdx = 0;
        this._lastMode = '';
        this._dotsArray = new Array<Phaser.GameObjects.Sprite>();
        this._bigDotsArray = new Array<Phaser.GameObjects.Sprite>();
        this._ghostValue = 100;
    }

    create(levelInfo?: ILevelInfo)
    {
        console.log(levelInfo);

        this._levels = levelInfo?.levels ? levelInfo?.levels : 1;

        let info = { init: levelInfo?.levels === undefined, levels: this._levels };
        this.scene.launch('GameUIScene', info);

        createPacManAnims(this.anims);
        createGhostsAnims(this.anims);

        const map = this.make.tilemap({key: 'pacmanJson'});

        const tileSet = map.addTilesetImage('pac-man', 'pacman', 16, 16, 1, 2);

        this.wallLayer = map.createLayer('Walls', tileSet).forEachTile(tile =>{
            tile.tint = 0x3ba3ff;
        }).setCollisionByProperty({ collides: true });

        const dotsLayer = map.createLayer('Dots', tileSet);

        this._dotsArray = dotsLayer.createFromTiles(16, -1, { key: 'pacman', frame: 15, origin: 0 });
        this._dotsArray.forEach(dot => {
            let skip = false;

            if (levelInfo?.dotsData && !levelInfo.newLevel){

                skip = levelInfo.dotsData.indexOf(`${dot.x},${dot.y}`) === -1;
            }

            if (!skip){
                this._dotsCount++;
                this.physics.add.existing(dot);
                (dot.body as Phaser.Physics.Arcade.Body).setCircle(2, 6, 6);
            }
            else{
                dot.destroy(true);
            }
        });

        this._bigDotsArray = dotsLayer.createFromTiles(18, -1, { key: 'pacman', frame: 17, origin: 0 });
        this._bigDotsArray.forEach(bigDot => {
            let skip = false;

            if (levelInfo?.bigDotsData && !levelInfo.newLevel){

                skip = levelInfo.bigDotsData.indexOf(`${bigDot.x},${bigDot.y}`) === -1;
            }

            if (!skip){
                
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
            }
            else{
                bigDot.destroy(true);
            }
        });

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
                new ScatterAI(this.wallLayer.width, 0, this.ghostArray[Colors.Blinky], this.wallLayer),
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

        this.physics.add.overlap(this.pacman!, this._dotsArray, (p, d)=>{
            let pacman = p as Pacman;
            let dot = d as Phaser.GameObjects.Sprite;
            pacman.eatDot(dot);
            this.updateGameScore(10);
            
            --this._dotsCount;

            this.checkGameLevelUp();
        }, undefined, this);

        this.physics.add.overlap(this.pacman!, this._bigDotsArray, (p, d)=>{
            let pacman = p as Pacman;
            let bigDot = d as Phaser.GameObjects.Sprite;
            pacman.eatBigDot(bigDot);
            this.updateGameScore(50);
            
            --this._bigDotsCount;

            let levelUp = this.checkGameLevelUp();

            if(!levelUp){
                
                sceneEvents.emit(EVENT_PACMAN_HASPOWER);

                this.setAllGhostAIMode('frightened');
            }
        }, undefined, this);

        this.physics.add.overlap(this.pacman!, this.ghostArray!, (p, g)=>{
            let pacman = p as Pacman;
            let ghost = g as Ghost;

            if (ghost.isFrightened){
                if (!ghost.isAte){
                    
                    ghost.handlePacmanAte();

                    this._ghostValue *= 2;

                    const scoreText= this.add.text(ghost.x, ghost.y, `${this._ghostValue}`, {color: '#00ff00'});

                    this.time.delayedCall(500, ()=>{
                        scoreText.destroy(true);
                        this.updateGameScore(this._ghostValue);
                    });
                }
            }
            else{
                sceneEvents.emit(EVENT_PACMAN_LOSELIFE, --this._lifeCount);  
                pacman.handleGhostHited();
                this.pauseGameWorld();

                if (this._lifeCount >= 0){
                    this.time.delayedCall(
                        3000,
                        () => {
                            this.restartGameWorld();
                        }
                    );
                }
                else{
                    this.time.delayedCall(
                        3000,
                        () => {
                            sceneEvents.emit(EVENT_GAME_OVER);
                        }
                    );
                }
            }

        }, (p, g) => {
            let pacman = p as Pacman;
            let ghost = g as Ghost;

            return pacman.canPacmanOverlapGhost(ghost);
        }, this);

        this.physics.world.setBounds(0, 0, this.wallLayer.width, this.wallLayer.height);
        this.physics.world.pause();

        sceneEvents.on(EVENT_GAME_INITED, ()=>{
            this.physics.world.resume();

            this.createGhostAITimer();
            this.initGhostOutRoom();
            
            this.updateGameScore(0);
        });

        this.cameras.main.setViewport(0, 0, this.wallLayer.width, this.wallLayer.height);
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(EVENT_GAME_INITED);
            this._globalTimer?.remove();
            this._frightenedTimer?.remove();
            this._frightenedFlashTimer?.remove();
        }); 
    }

    update() {
        if (!this.cursor || !this.pacman || this.physics.world.isPaused){
            return;
        }

        this.pacman.update(this.cursor);
    }

    private createGhostAITimer(){
        
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

    private setAllGhostAIMode(mode: string){
        if (!this.ghostArray || !this.ghostAIMap || !this._globalTimer){
            return;
        }

        sceneEvents.emit(EVENT_GAME_CHANGEMODE, mode.toUpperCase());
        
        if (mode === 'frightened'){
            this._globalTimer.paused = true;

            let remain = GhostAIConfig.frightened;
            let flashRemain = remain * 0.7;
            this._ghostValue = 100;

            if (!this._frightenedTimer){

                this._frightenedFlashTimer = this.time.delayedCall(
                    flashRemain,
                    () => {
                        this.ghostArray!.forEach(ghost => {
                            ghost.setGhostFlash();
                        });
                    }
                );

                this._frightenedTimer = this.time.delayedCall(
                    remain,
                    () => {

                        this.setAllGhostAIMode(this._lastMode);

                        sceneEvents.emit(EVENT_PACMAN_LOSEPOWER);
                        this._globalTimer!.paused = false;

                    }, undefined, this);
            }
            else{

                if (!this._frightenedTimer.hasDispatched){
                    remain += remain - this._frightenedTimer.getElapsed();
                    flashRemain = remain * 0.7;
                }
                
                this._frightenedTimer.remove();
                this._frightenedFlashTimer?.remove();

                this._frightenedFlashTimer = this.time.delayedCall(
                    flashRemain,
                    () => {
                        this.ghostArray!.forEach(ghost => {
                            ghost.setGhostFlash();
                        });
                    }
                );

                this._frightenedTimer = this.time.delayedCall(
                    remain,
                    () => {

                        this.setAllGhostAIMode(this._lastMode);

                        sceneEvents.emit(EVENT_PACMAN_LOSEPOWER);
                        this._globalTimer!.paused = false;

                    }, undefined, this);
                
            }
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

    private initGhostOutRoom(){
        this.ghostArray![Colors.Blinky]?.outRoom();

        this.time.delayedCall(
            1000,
            () => {
                this.ghostArray![Colors.Pinky]?.outRoom();
            }
        );

        this.time.delayedCall(
            15000,
            () => {
                this.ghostArray![Colors.Inky]?.outRoom();
            }
        );

        this.time.delayedCall(
            25000,
            () => {
                this.ghostArray![Colors.Clyde]?.outRoom();
            }
        );
    }

    private checkGameLevelUp(): boolean{
        if (this._dotsCount + this._bigDotsCount <= 0){
            sceneEvents.emit(EVENT_GAME_LEVELUP);
            this.pauseGameWorld();

            this.time.delayedCall(
                6000,
                ()=>{
                    this.restartGameWorld(true);
                }
            )

            return true;
        }

        return false;
    }

    private pauseGameWorld(){
        
        this.physics.world.pause();
        this.pacman?.setMovingPause();
        this.ghostArray?.forEach(g => {
            g.setMovingPause();
        });
        this._globalTimer?.remove();
        this._frightenedTimer?.remove();
        this._frightenedFlashTimer?.remove();
    }

    private restartGameWorld(newLevel: boolean = false){

        let levelInfo: ILevelInfo = {
            levels: this._levels,
            dotsData: [],
            bigDotsData: [],
            newLevel: false
        };

        if (!newLevel){
            this._dotsArray?.forEach(dot => {
                if (dot.visible){
                    levelInfo.dotsData.push(`${dot.x},${dot.y}`);                
                }
            });
            
            this._bigDotsArray?.forEach(bigDot => {
                if (bigDot.visible){
                    levelInfo.bigDotsData.push(`${bigDot.x},${bigDot.y}`);
                }
            });
        }
        else{
            levelInfo.levels = this._levels + 1;
            levelInfo.newLevel = true;
        }

        this.scene.restart(levelInfo);
    }

    private updateGameScore(score: number){
        this._scores += score;
        sceneEvents.emit(EVENT_GAME_UPDATESCORE, this._scores);
    }
}
