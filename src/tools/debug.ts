import Phaser from "phaser";
const debugLayer = (layer: Phaser.Tilemaps.TilemapLayer, scene: Phaser.Scene)=>{
    const debugGraphics = scene.add.graphics().setAlpha(0.7);

    layer.renderDebug(debugGraphics,
        {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48),
            faceColor: new Phaser.Display.Color(48, 39, 37)
        });
}

export {
    debugLayer
};