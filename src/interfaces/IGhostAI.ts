import GameConfig from "../configs/GameConfig";
import { Directions } from "../enums/GameEnums"
import IPosition from "./IPosition";

interface IGhostAI {
    readonly speed: number;
    readonly targetPosition: IPosition;

    pickDirection(): Directions;
};

const getOrderedDirections = (filter?: (dir: Directions) => boolean) => {
    const dirs = [Directions.Up, Directions.Left, Directions.Down, Directions.Right];

    if (!filter){
        return dirs;
    }

    return dirs.filter(filter);
};

const getOppositeDirection = (dir: Directions) => {
    let opDir = Directions.Idle;

    switch(dir){
        case Directions.Left:{
            opDir = Directions.Right;
            break;
        }
        case Directions.Right:{
            opDir = Directions.Left;
            break;
        }
        case Directions.Up:{
            opDir = Directions.Down;
            break;
        }
        case Directions.Down:{
            opDir = Directions.Up;
            break;
        }
        default:
            {
                break;
            }
    }

    return opDir;
};

const getPositionOnDirection = (x: number, y: number, dir: Directions, tileCount: number = 1): IPosition => {
    let pos: IPosition = {x, y};

    switch(dir){
        case Directions.Left:{
            pos.x -= GameConfig.TileWidth * tileCount;
            break;
        }
        case Directions.Right:{
            pos.x += GameConfig.TileWidth * tileCount;
            break;
        }
        case Directions.Up:{
            pos.y -= GameConfig.TileHeight * tileCount;
            break;
        }
        case Directions.Down:{
            pos.y += GameConfig.TileHeight * tileCount;
            break;
        }
        default:{
            break;
        }
    }

    return pos;
}
export{
    IGhostAI,
    getOrderedDirections,
    getOppositeDirection,
    getPositionOnDirection
}