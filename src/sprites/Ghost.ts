import Phaser, { DOWN } from "phaser";
import { GameConfig } from "../configs/GameConfig";
import IPosition from "../interfaces/IPosition";
import { Colors, Directions } from "../enums/GameEnums";
import { IGhost } from "../interfaces/IGhost";
import { getOppositeDirection, IGhostAI } from "../interfaces/IGhostAI";
import FrightenedAI from "../ai-mode/FrightenedAI";
import ScatterAI from "../ai-mode/ScatterAI";
import { EVENT_GHOST_ATE, EVENT_GHOST_REST, EVENT_PACMAN_HASPOWER, sceneEvents } from "../events/GameEvents";
import RebornAI from "../ai-mode/RebornAI";

export default class Ghost extends Phaser.GameObjects.Container implements IGhost{
    
    private _currentDirection: Directions = Directions.Left;

    private _ghostBody: Phaser.GameObjects.Sprite;
    private _ghostEyes: Phaser.GameObjects.Image;
    private _ghostPupils: Phaser.GameObjects.Image;
    private _aimode?: IGhostAI;
    private _ghostColor?: Colors;
    private _targetPosShow?: Phaser.GameObjects.Rectangle;
    private _lastOptimismPos?: IPosition;
    private _wallLayer?: Phaser.Tilemaps.TilemapLayer;
    private _isAte?: boolean = false;
    private _isFrozen?: boolean = true;
    private _tempAiMode?: IGhostAI;

    constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[],
        wallLayer?: Phaser.Tilemaps.TilemapLayer){
        super(scene, x, y ,children);

        this._wallLayer = wallLayer;

        this._ghostBody = scene.add.sprite(8, 8, 'pacman', 6);
        //this._ghostBody.setScale(0.9);
        this._ghostBody.play('ghost-move');

        //scene.physics.add.existing(this._ghostBody);

        //(this._ghostBody.body as Phaser.Physics.Arcade.Body).setCircle(8);

        this._ghostEyes = scene.add.image(8, 8, 'pacman', 8);
        this._ghostPupils = scene.add.image(8, 8, 'pacman', 9);

        this.add(this._ghostBody);
        this.add(this._ghostEyes);
        this.add(this._ghostPupils);

        this.look(Directions.Idle);

        scene.physics.add.existing(this);
        
        this.physicsBody.setCircle(8);

        this._targetPosShow = scene.add.rectangle(0, 0, 5, 5, this.ghostColor ? this.ghostColor : 0xff0000);

        this.enableDebugTargetPosition(false);
    }
    
    get currentDirection(){
        return this._currentDirection;
    }

    get physicsBody(){
        return this.body as Phaser.Physics.Arcade.Body;
    }

    get ghostColor(){
        return this._ghostColor;
    }

    get lastOptimismPos(){
        return this._lastOptimismPos;
    }

    get isFrightened(){
        return this._aimode instanceof FrightenedAI || this._aimode instanceof RebornAI;
    }

    get isAte(){
        return this._isAte;
    }

    get isFrozen(){
        return this._isFrozen;
    }

    setDebugTargetPosition(x: number, y: number){
        if (this._targetPosShow){
            let color = 0xff0000;
            if (this._ghostColor === Colors.Clyde){
                color = 0xff9200;
            }
            else if (this._ghostColor === Colors.Inky){
                color = 0x00ffd2;
            }
            else if (this._ghostColor === Colors.Pinky){
                color = 0xff58bf;
            }
            else {
                color = 0xff0000;
            }
            this._targetPosShow.setPosition(x, y);
            this._targetPosShow.fillColor = color;
        }
    }

    enableDebugTargetPosition(val: boolean){
        if (this._targetPosShow){
            this._targetPosShow.setVisible(val);
        }
    }

    setAI(ai: IGhostAI){

        // the rebornai is playing, but change ai-mode right now, it will store in temp
        if (this._aimode instanceof RebornAI && this._isAte)
        {
            this._tempAiMode = ai;
        }
        else
        {
            // the rebornai instead the normal ai-mode, when rebornai completed, should replace it before
            if (!(ai instanceof RebornAI) && !(ai instanceof FrightenedAI)){
                this._tempAiMode = ai;
            }

            if (this._aimode && ai !== this._aimode){
                this._currentDirection = getOppositeDirection(this._currentDirection);
            }

            this._aimode = ai;

            if (this._aimode instanceof FrightenedAI){
                this._ghostBody.clearTint();
                this._ghostEyes.setVisible(false);
                this._ghostPupils.setVisible(false);
                this._ghostBody.play('ghost-frightened');
            }
            else{
                this.makeColor(this._ghostColor!);
                this._ghostEyes.setVisible(true);
                this._ghostPupils.setVisible(true);
                this._ghostBody.play('ghost-move');
            }
        }

        return this;
    }

    enableTargetMarker(enable: boolean){
        return this;
    }

    makeColor(color: Colors){
        switch(color){
            case Colors.Blinky:{
                this._ghostBody.setTint(0xff0000);
                break;
            }
            case Colors.Clyde:{
                this._ghostBody.setTint(0xff9200);
                break;
            }
            case Colors.Inky:{
                this._ghostBody.setTint(0x00ffd2);
                break;
            }
            case Colors.Pinky:{
                this._ghostBody.setTint(0xff58bf);
                break;
            }
            default:{
                break;
            }
        }

        this._ghostColor = color;
        return this;
    }
    
    look(direction: Directions){

        let x = 8, y = 8;
        switch(direction){
            case Directions.Left:{
                this._ghostPupils.setPosition(x - 1, y);
                break;
            }
            case Directions.Right:{
                this._ghostPupils.setPosition(x + 1, y);
                break;
            }
            case Directions.Up:{
                this._ghostPupils.setPosition(x, y - 2);
                break;
            }
            case Directions.Down:{
                this._ghostPupils.setPosition(x, y + 1);
                break;
            }
            case Directions.Idle:{
                this._ghostPupils.setPosition(x, y);
                break;
            }
        }
        return this;
    }

    preUpdate(t: number, dt: number){
        const containerBody = this.physicsBody;

        if (!containerBody || !this._aimode || this._isFrozen){
            return;
        }

        const pos:IPosition = {
            x: containerBody.position.x + containerBody.width * 0.5, 
            y: containerBody.position.y + containerBody.height * 0.5
        };

        const standardPos: IPosition = {
            x: (Math.floor(pos.x / GameConfig.TileWidth) + 0.5) * GameConfig.TileWidth, 
            y: (Math.floor(pos.y / GameConfig.TileHeight) + 0.5) * GameConfig.TileHeight
        };

        this.scene.physics.world.wrapObject(this);

        if (!this.scene.physics.world.bounds.contains(pos.x, pos.y)){
            return;
        }
        
        if (Math.abs(pos.x - standardPos.x) > 2 || Math.abs(pos.y - standardPos.y) > 2){
            return;
        }

        if (this._lastOptimismPos?.x === standardPos.x && this._lastOptimismPos.y === standardPos.y){
            return;
        }
        
        // fix the ghost position, better view
        this.setPosition(standardPos.x - GameConfig.TileWidth * 0.5, standardPos.y - GameConfig.TileHeight * 0.5);

        let speed = this._aimode.speed;
        let optimismDir = this._aimode.pickDirection();

        if (this._isAte && optimismDir == Directions.Idle){            
            containerBody.setVelocity(0, 0);
            this._currentDirection = Directions.Up;
            this._lastOptimismPos = standardPos;
            this.resetGhostAppearance();
            return;
        }

        this.look(optimismDir);

        switch(optimismDir){
            case Directions.Left:{
                containerBody.setVelocity(-speed, 0);
                break;
            }
            case Directions.Right:{
                containerBody.setVelocity(speed, 0);
                break;
            }
            case Directions.Up:{
                containerBody.setVelocity(0, -speed);
                break;
            }
            case Directions.Down:{
                containerBody.setVelocity(0, speed);
                break;
            }
            default:{
                containerBody.setVelocity(0, 0);
                break;
            }
        }

        this._currentDirection = optimismDir;
        this._lastOptimismPos = standardPos;
    }
    
    handlePacmanAte(){
        if (this._isAte){
            return;
        }

        this.scene.sound.playAudioSprite('sfx', `ghost ate`);

        this._isAte = true;

        this._ghostBody.setVisible(false);

        this._isFrozen = true;
        
        this.scene.time.delayedCall(
            300,
            () => {
                this._isFrozen = false;
        
                this.setAI(new RebornAI(this, this._wallLayer!));

                sceneEvents.emit(EVENT_GHOST_ATE);
            }
        )
    }

    outRoom(){
        if (this._isFrozen){

            //console.log(this.ghostColor, this._aimode, this._tempAiMode);

            if (this._aimode instanceof RebornAI && this._tempAiMode){
                this.setAI(this._tempAiMode);
            }

            if (this.x === GameConfig.GhostOutX && this.y === GameConfig.GhostOutY){
                this._isFrozen = false;
                return;
            }
            
            if(this.x !== GameConfig.GhostOriginX){
                this.scene.tweens.add({
                    targets: this,
                    x: GameConfig.GhostOutX,
                    duration: 800,
                    onComplete: () => {
                        
                        this.scene.tweens.add({
                            targets: this,
                            y: GameConfig.GhostOutY,
                            duration: 800,
                            onComplete: () => {
                                this._isFrozen = false;
                            },
                            onCompleteScope: this
                        });

                    },
                    onCompleteScope: this
                });
            }
            else{
                this.scene.tweens.add({
                    targets: this,
                    y: GameConfig.GhostOutY,
                    duration: 800,
                    onComplete: () => {

                        this._isFrozen = false;
                    },
                    onCompleteScope: this
                });
            }
        }
    }

    setMovingPause(){
        this._isFrozen = true;
        this._ghostBody.anims.pause();
        this.physicsBody.setVelocity(0, 0);
    }
    
    setGhostFlash(){
        if (this.isFrightened){
            this._ghostBody.play('ghost-frightened-flash');
        }
    }

    private resetGhostAppearance(){
        this._isAte = false;
        this._isFrozen = true;
        
        this.makeColor(this._ghostColor!);
        this._ghostBody.setVisible(true);
        this._ghostBody.play('ghost-move');
            
        if (this._tempAiMode){
            this.setAI(this._tempAiMode);
        }   

        //console.log(this.ghostColor, 'resetGhost', this._isFrozen);

        sceneEvents.emit(EVENT_GHOST_REST);

        this.scene.time.delayedCall(500, ()=>{
            this.outRoom();         
        });
    }
}