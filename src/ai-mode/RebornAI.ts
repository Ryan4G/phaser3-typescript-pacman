import IPosition from "../interfaces/IPosition";
import { getOppositeDirection, getOrderedDirections, getPositionOnDirection, IGhostAI } from "../interfaces/IGhostAI";
import { Directions } from "../enums/GameEnums";
import { GameConfig } from "../configs/GameConfig";
import { IGhost } from "../interfaces/IGhost";
import { getGhostRebornDirection } from "./GhostMovingPosition";

export default class RebornAI implements IGhostAI{
    private _speed: number = 110;
    private _targetPosition: IPosition;
    private _wallsLayer: Phaser.Tilemaps.TilemapLayer;
    private _ghost: IGhost;

    constructor(ghost: IGhost, wallLayer: Phaser.Tilemaps.TilemapLayer, speed?: number){
        this._targetPosition = {
            x: GameConfig.GhostOriginX,
            y: GameConfig.GhostOriginY
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
        return getGhostRebornDirection(this._ghost, this.targetPosition, this._wallsLayer);
    }

    changeSpeed(speed: number){
        this._speed = speed;
    }
}