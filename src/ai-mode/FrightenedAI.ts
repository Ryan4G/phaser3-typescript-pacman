import IPosition from "../interfaces/IPosition";
import { getOppositeDirection, getOrderedDirections, getPositionOnDirection, IGhostAI } from "../interfaces/IGhostAI";
import { Directions } from "../enums/GameEnums";
import { GameConfig } from "../configs/GameConfig";
import { IGhost } from "../interfaces/IGhost";
import { getGhostMovingDirection, getGhostRandomDirection } from "./GhostMovingPosition";

export default class FrightenedAI implements IGhostAI{
    private _speed: number = 30;
    private _targetPosition: IPosition;
    private _wallsLayer: Phaser.Tilemaps.TilemapLayer;
    private _ghost: IGhost;

    constructor(ghost: IGhost, wallLayer: Phaser.Tilemaps.TilemapLayer, speed?: number){
        this._targetPosition = {
            x: 0,
            y: 0
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
        return this._targetPosition;
    }

    pickDirection(){
        return getGhostRandomDirection(this._ghost, this._wallsLayer);
    }
    
    changeSpeed(speed: number){
        this._speed = speed;
    }
}