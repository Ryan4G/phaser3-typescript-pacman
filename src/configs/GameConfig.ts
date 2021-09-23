const GameConfig = {
    TileWidth: 16,
    TileHeight: 16,
    GhostOutX: 144,
    GhostOutY: 128,
    GhostOriginX: 144, 
    GhostOriginY: 160
};

const GhostAIConfig = {
    modes: [
        { 
            type: 'scatter',
            during: 7000
        },
        { 
            type: 'chase',
            during: 20000
        },
        { 
            type: 'scatter',
            during: 7000
        },
        { 
            type: 'chase',
            during: 20000
        },
        { 
            type: 'scatter',
            during: 5000
        },
        { 
            type: 'chase',
            during: 20000
        },
        { 
            type: 'scatter',
            during: 5000
        },
        { 
            type: 'chase',
            during: -1
        },
    ],
    frightened: 8000
};

export {
    GameConfig,
    GhostAIConfig
}