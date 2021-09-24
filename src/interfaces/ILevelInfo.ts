import IPosition from "./IPosition";

interface ILevelInfo{
    levels: number;
    dotsData: Array<string>;
    bigDotsData: Array<string>;
    newLevel: boolean;
}

export default ILevelInfo;