import Phaser from 'phaser';
import { GameConfig } from '~configs/GameConfig';
import GamePad from '../tools/GamePad';
import { 
    EVENT_GAME_INITED, 
    EVENT_PACMAN_HASPOWER,
    EVENT_PACMAN_LOSEPOWER, 
    EVENT_GHOST_ATE,
    sceneEvents, 
    EVENT_GHOST_REST,
    EVENT_GAME_LEVELUP,
    EVENT_GAME_CHANGEMODE,
    EVENT_PACMAN_LOSELIFE,
    EVENT_GAME_OVER,
    EVENT_GAME_UPDATESCORE
} from '../events/GameEvents';
import GameScene from './GameScene';

export default class GameUIScene extends Phaser.Scene {

    private _currMode?: string;
    private _noticeText?: Phaser.GameObjects.Text;
    private _modeText?: Phaser.GameObjects.Text;
    private _lives?:number = 3;
    private _scores?:number = 0;
    private _levels?: number = 1;
    private _gamePad?: GamePad;
    private _gameScene?: GameScene;

    constructor() {
        super('GameUIScene');
    }

    create(leveInfo?: {init: boolean, levels: number})
    {
        console.log(leveInfo);
        this._noticeText = this.add.text(
            GameConfig.GhostOriginX - 24, 
            this.scale.height * 0.5,
            'READY!',
            {
                color: '#ffce44',
                fontSize: '18px',
                fontStyle: 'italic'
            });

        this._modeText = this.add.text(
            this.scale.width - 160,
            0,
            `
            Mode: \n 
            \n\n
            Scores: \n
            \n\n
            Lives: \n
            ${this._lives} \n\n 
            `,
            {
                color: '#ffffff',
                fontSize: '12px',
            }
        );

        const audioSprite = this.sound.addAudioSprite('bgm');

        if (!leveInfo || leveInfo.init){
            audioSprite.once('play', () =>
            {
                this.time.addEvent({
                    delay: 4200,
                    callback: ()=>{
                        this._noticeText?.setVisible(false);

                        sceneEvents.emit(EVENT_GAME_INITED);

                        audioSprite.play('level0');
                    },
                    callbackScope: this
                });
            }, this);
            
            audioSprite.play('openning');
        }
        else{
            this._levels = leveInfo.levels;

            this._noticeText?.setVisible(false);

            this.time.addEvent({
                delay: 4200,
                callback: ()=>{
                    sceneEvents.emit(EVENT_GAME_INITED);
                },
                callbackScope: this
            });
            
            audioSprite.play('level0');
        }

        sceneEvents.on(EVENT_PACMAN_HASPOWER, ()=>{
            audioSprite.play('frightened');
        });
        
        sceneEvents.on(EVENT_PACMAN_LOSEPOWER, ()=>{
            audioSprite.play('level0');
        });

        sceneEvents.on(EVENT_GHOST_ATE, ()=>{
            audioSprite.play('ghost back');
        });

        sceneEvents.on(EVENT_GHOST_REST, ()=>{
            if (this._currMode === 'frightened'){
                audioSprite.play('frightened');
            }
            else{
                audioSprite.play('level0');
            }
        });

        sceneEvents.on(EVENT_GAME_LEVELUP, ()=>{
            audioSprite.play('level up');
        });

        sceneEvents.on(EVENT_GAME_CHANGEMODE, (mode: string)=>{
            this._currMode = mode;
        });

        sceneEvents.on(EVENT_PACMAN_LOSELIFE, (lives: number)=>{
            this.sound.stopAll();
            this._lives = Math.max(0, lives);
        });
        
        sceneEvents.on(EVENT_GAME_OVER, ()=>{
            this._noticeText?.setPosition(GameConfig.GhostOriginX - 38, this.scale.height * 0.5);
            this._noticeText?.setText('GAME OVER');
            this._noticeText?.setVisible(true);
        });
                
        sceneEvents.on(EVENT_GAME_UPDATESCORE, (scores: number)=>{
            this._scores = scores;
        });
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(EVENT_PACMAN_HASPOWER);
            sceneEvents.off(EVENT_PACMAN_LOSEPOWER);
            sceneEvents.off(EVENT_GHOST_ATE);
            sceneEvents.off(EVENT_GHOST_REST);
            sceneEvents.off(EVENT_GAME_LEVELUP);
            sceneEvents.off(EVENT_GAME_CHANGEMODE);
            sceneEvents.off(EVENT_PACMAN_LOSELIFE);
            sceneEvents.off(EVENT_GAME_OVER);
            sceneEvents.off(EVENT_GAME_UPDATESCORE);
        }); 

        this._gamePad = new GamePad(
            this, 
            this.scale.width - 72,
            this.scale.height - 80,
            undefined, 24, 18);
        
        this.add.existing(this._gamePad);

        this._gameScene = this.scene.get('GameScene') as GameScene;
    }

    update() {
        this._modeText?.setText(
            `
            Mode: \n 
            ${this._currMode ? this._currMode : ''} \n\n
            Scores: \n
            ${this._scores} \n\n
            Lives: \n
            ${this._lives} \n\n 
            Levels: \n
            ${this._levels} \n\n 
            `
        );

        if (this._gameScene && this._gamePad){
            this._gameScene.setExternalDirections(this._gamePad.currentDirections);
        }
    }
}
