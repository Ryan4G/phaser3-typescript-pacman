import IPosition from "../interfaces/IPosition";
import { getOppositeDirection, getOrderedDirections, getPositionOnDirection, IGhostAI } from "../interfaces/IGhostAI";
import { Colors, Directions } from "../enums/GameEnums";
import { GameConfig } from "../configs/GameConfig";
import { IGhost } from "../interfaces/IGhost";
import Pacman from "../sprites/Pacman";
import { getGhostMovingDirection } from "./GhostMovingPosition";

export default class ChaseAI implements IGhostAI{
    private _speed: number = 40;
    private _targetPosition?: IPosition;
    private _wallsLayer: Phaser.Tilemaps.TilemapLayer;
    private _ghost: IGhost;
    private _assistGhost?: IGhost;
    private _pacman: Pacman;

    constructor(pacman: Pacman, ghost: IGhost, wallLayer: Phaser.Tilemaps.TilemapLayer, assistGhost?: IGhost, speed?: number){
        this._ghost = ghost;
        this._wallsLayer = wallLayer;
        this._pacman = pacman;
        this._assistGhost = assistGhost;

        if (speed){
            this._speed = speed;
        }
    }

    get speed(){
        return this._speed;
    }

    get targetPosition(){
        const pacman_body = this._pacman.body as Phaser.Physics.Arcade.Body;
        const color = this._ghost.ghostColor;

        
        this._targetPosition = { 
            x: pacman_body.position.x + pacman_body.width * 0.5, 
            y: pacman_body.position.y + pacman_body.height * 0.5 
        };
        
        if (color === Colors.Pinky){
            const dir = this._pacman.currentDirection;
            const front4Pos = getPositionOnDirection(this._targetPosition.x, this._targetPosition.y, dir, 4);
            this._targetPosition = { x: front4Pos.x, y: front4Pos.y };
        }
        else if (color === Colors.Inky && this._assistGhost){
            const dir = this._pacman.currentDirection;
            const assistBody = this._assistGhost.physicsBody;
            const front2Pos = getPositionOnDirection(this._targetPosition.x, this._targetPosition.y, dir, 2);

            const {disx, disy} = {
                disx: front2Pos.x - assistBody.position.x - assistBody.width * 0.5, 
                disy: front2Pos.y - assistBody.position.y - assistBody.width * 0.5
            }

            this._targetPosition = { 
                x: front2Pos.x + disx, 
                y: front2Pos.y + disy 
            };
        }
        else if (color === Colors.Clyde){
            const dis = Phaser.Math.Distance.Between(
                this._ghost.physicsBody.position.x, 
                this._ghost.physicsBody.position.y,
                pacman_body.position.x,
                pacman_body.position.y
            );

            if (dis > 8 * GameConfig.TileWidth){
                this._targetPosition = {x:0, y: this._wallsLayer.height};
            }
        }

        this._ghost.setDebugTargetPosition(this._targetPosition.x, this._targetPosition.y);

        return this._targetPosition;
    }
    
    pickDirection(){
        return getGhostMovingDirection(this._ghost, this.targetPosition, this._wallsLayer);
    }
    
    changeSpeed(speed: number){
        this._speed = speed;
    }
}