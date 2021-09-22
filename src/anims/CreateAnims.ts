const createPacManAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create(
        {
            key: 'pacman-move',
            frames: anims.generateFrameNames('pacman', { start: 12, end: 14 }),
            frameRate: 10,
            repeat: -1
        });
};

const createGhostsAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create(
        {
            key: 'ghost-move',
            frames: anims.generateFrameNames('pacman', { start: 6, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
};

export {
    createPacManAnims,
    createGhostsAnims
}