import { Directions, Colors } from "../enums/GameEnums";
import { IGhostAI } from "./IGhostAI";
import IPosition from "./IPosition";

interface IGhost {
    readonly currentDirection: Directions;
    readonly physicsBody: Phaser.Physics.Arcade.Body;
    readonly ghostColor?: Colors;
    readonly lastOptimismPos?: IPosition;
    
    setDebugTargetPosition(x: number, y: number): void;
    setAI(ai: IGhostAI): IGhost;
    enableTargetMarker(enable: boolean): IGhost;

    makeColor(color: Colors): IGhost;
    look(direction: Directions): IGhost;

    preUpdate(t: number, dt: number): void;
};

export{
    IGhost
}