import { getOppositeDirection, getOrderedDirections, getPositionOnDirection } from "../interfaces/IGhostAI";
import { GameConfig } from "../configs/GameConfig";
import { IGhost } from "../interfaces/IGhost";
import IPosition from "../interfaces/IPosition";
import { Directions } from "../enums/GameEnums";

const getGhostMovingDirection = (ghost: IGhost, targetPosition: IPosition, wallLayer: Phaser.Tilemaps.TilemapLayer) => {
    
    const containerBody = ghost.physicsBody;

    const pos:IPosition = {
        x: containerBody.position.x + containerBody.width * 0.5, 
        y: containerBody.position.y + containerBody.height * 0.5
    };

    const targetPos = targetPosition;

    const standardPos: IPosition = {
        x: (Math.floor(pos.x / GameConfig.TileWidth) + 0.5) * GameConfig.TileWidth, 
        y: (Math.floor(pos.y / GameConfig.TileHeight) + 0.5) * GameConfig.TileHeight
    };

    const oppositeDir = getOppositeDirection(ghost.currentDirection);
    const orderedDirs = getOrderedDirections((dir) => dir !== oppositeDir);

    let optimismDir = Directions.Idle;
    let optimismDis = -1;

    for(let i = 0; i < orderedDirs.length; i++){

        const dir = orderedDirs[i];
        const stdPos = getPositionOnDirection(standardPos.x, standardPos.y, dir);

        if (wallLayer.getTileAtWorldXY(stdPos.x, stdPos.y)){
            continue;
        }

        const dis = Phaser.Math.Distance.Between(targetPos.x, targetPos.y, stdPos.x, stdPos.y);

        if (optimismDir === Directions.Idle || dis < optimismDis){
            optimismDir = dir;
            optimismDis = dis;
        }
    }

    return optimismDir;
};

const getGhostRandomDirection = (ghost: IGhost, wallLayer: Phaser.Tilemaps.TilemapLayer) => {
    
    const containerBody = ghost.physicsBody;

    const pos:IPosition = {
        x: containerBody.position.x + containerBody.width * 0.5, 
        y: containerBody.position.y + containerBody.height * 0.5
    };

    const standardPos: IPosition = {
        x: (Math.floor(pos.x / GameConfig.TileWidth) + 0.5) * GameConfig.TileWidth, 
        y: (Math.floor(pos.y / GameConfig.TileHeight) + 0.5) * GameConfig.TileHeight
    };

    const oppositeDir = getOppositeDirection(ghost.currentDirection);
    const orderedDirs = getOrderedDirections((dir) => dir !== oppositeDir);

    let randomDirArray: Array<Directions> = [];

    for(let i = 0; i < orderedDirs.length; i++){

        const dir = orderedDirs[i];
        const stdPos = getPositionOnDirection(standardPos.x, standardPos.y, dir);

        if (wallLayer.getTileAtWorldXY(stdPos.x, stdPos.y)){
            continue;
        }

        randomDirArray.push(dir);
    }

    let randomDir = ghost.currentDirection;

    if (randomDirArray.length > 0){
        let idx = Phaser.Math.Between(0, randomDirArray.length - 1);
        randomDir = randomDirArray[idx];
    }
    
    return randomDir;
};

const getGhostRebornDirection = (ghost: IGhost, targetPosition: IPosition, wallLayer: Phaser.Tilemaps.TilemapLayer) => {
    
    const containerBody = ghost.physicsBody;

    const pos:IPosition = {
        x: containerBody.position.x + containerBody.width * 0.5, 
        y: containerBody.position.y + containerBody.height * 0.5
    };

    const targetPos = targetPosition;

    const standardPos: IPosition = {
        x: (Math.floor(pos.x / GameConfig.TileWidth) + 0.5) * GameConfig.TileWidth, 
        y: (Math.floor(pos.y / GameConfig.TileHeight) + 0.5) * GameConfig.TileHeight
    };

    const oppositeDir = getOppositeDirection(ghost.currentDirection);
    const orderedDirs = getOrderedDirections((dir) => dir !== oppositeDir);

    let optimismDir = Directions.Idle;
    let optimismDis = -1;

    let dis = Phaser.Math.Distance.Between(
        standardPos.x - GameConfig.TileWidth * 0.5,
        standardPos.y - GameConfig.TileHeight * 0.5,
        GameConfig.GhostOutX, 
        GameConfig.GhostOutY
    );

    if (dis === 0){
        // ghost back to the door of the ghost room
        optimismDir = Directions.Down;
        return optimismDir;
    }

    dis = Phaser.Math.Distance.Between(
        standardPos.x - GameConfig.TileWidth * 0.5,
        standardPos.y - GameConfig.TileHeight * 0.5,
        GameConfig.GhostOriginX, 
        GameConfig.GhostOriginY
    );

    if (dis === 0){
        optimismDir = Directions.Idle;
        return optimismDir;
    }

    for(let i = 0; i < orderedDirs.length; i++){

        const dir = orderedDirs[i];
        const stdPos = getPositionOnDirection(standardPos.x, standardPos.y, dir);

        if (wallLayer.getTileAtWorldXY(stdPos.x, stdPos.y)){
            continue;
        }

        const dis = Phaser.Math.Distance.Between(targetPos.x, targetPos.y, stdPos.x, stdPos.y);

        if (optimismDir === Directions.Idle || dis < optimismDis){
            optimismDir = dir;
            optimismDis = dis;
        }
    }

    return optimismDir;
};

export {
    getGhostMovingDirection,
    getGhostRandomDirection,
    getGhostRebornDirection
}