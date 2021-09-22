import Phaser from "phaser";
import GameConfig from "../configs/GameConfig";
import IPosition from "../interfaces/IPosition";
import { Colors, Directions } from "../enums/GameEnums";
import { IGhost } from "../interfaces/IGhost";
import { IGhostAI } from "../interfaces/IGhostAI";

export default class Ghost extends Phaser.GameObjects.Container implements IGhost{
    
    private _currentDirection: Directions = Directions.Left;

    private _ghostBody: Phaser.GameObjects.Sprite;
    private _ghostPupils: Phaser.GameObjects.Image;
    private _aimode?: IGhostAI;
    private _ghostColor?: Colors;
    private _targetPosShow?: Phaser.GameObjects.Rectangle;
    private _lastOptimismPos?: IPosition;
    private _wallLayer?: Phaser.Tilemaps.TilemapLayer;

    constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[],
        wallLayer?: Phaser.Tilemaps.TilemapLayer){
        super(scene, x, y ,children);

        this._wallLayer = wallLayer;

        this._ghostBody = scene.add.sprite(8, 8, 'pacman', 6);
        //this._ghostBody.setScale(0.9);
        this._ghostBody.play('ghost-move');

        //scene.physics.add.existing(this._ghostBody);

        //(this._ghostBody.body as Phaser.Physics.Arcade.Body).setCircle(8);

        const ghostEyes = scene.add.image(8, 8, 'pacman', 8);
        this._ghostPupils = scene.add.image(8, 8, 'pacman', 9);

        this.add(this._ghostBody);
        this.add(ghostEyes);
        this.add(this._ghostPupils);

        this.look(Directions.Idle);

        scene.physics.add.existing(this);
        
        this.physicsBody.setCircle(8);

        this._targetPosShow = scene.add.rectangle(0, 0, 5, 5, this.ghostColor ? this.ghostColor : 0xff0000);
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

    setAI(ai: IGhostAI){
        this._aimode = ai;

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

        if (!containerBody || !this._aimode){
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

        if(containerBody.position.x < 0){
            this.setPosition(this._wallLayer!.width, this.y);
        }

        if(containerBody.position.x > this._wallLayer!.width){
            this.setPosition(0, this.y);
        }
        
        if (Math.abs(pos.x - standardPos.x) > 1 || Math.abs(pos.y - standardPos.y) > 1){
            return;
        }

        if (this._lastOptimismPos?.x === standardPos.x && this._lastOptimismPos.y === standardPos.y){
            return;
        }
        
        let speed = this._aimode.speed;
        let optimismDir = this._aimode.pickDirection();

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
                break;
            }
        }

        this._currentDirection = optimismDir;
        this._lastOptimismPos = standardPos;
    }
}