import IPosition from "../interfaces/IPosition";
import { getOppositeDirection, getOrderedDirections, getPositionOnDirection, IGhostAI } from "../interfaces/IGhostAI";
import { Directions } from "../enums/GameEnums";
import { GameConfig } from "../configs/GameConfig";
import { IGhost } from "../interfaces/IGhost";
import { getGhostMovingDirection } from "./GhostMovingPosition";

export default class ScatterAI implements IGhostAI{
    private _speed: number = 40;
    private _targetPosition: IPosition;
    private _wallsLayer: Phaser.Tilemaps.TilemapLayer;
    private _ghost: IGhost;

    constructor(targetX: number, targetY: number, ghost: IGhost, wallLayer: Phaser.Tilemaps.TilemapLayer, speed?: number){
        this._targetPosition = {
            x: targetX,
            y: targetY
        };

        this._ghost = ghost;
        this._wallsLayer = wallLayer;

        if (speed){
            this._speed = speed;
        }
    }

    get speed(){
        return this._speed;
    }

    get targetPosition(){
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