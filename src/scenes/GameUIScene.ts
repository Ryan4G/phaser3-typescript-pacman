import Phaser from 'phaser';
import { 
    EVENT_GAME_INITED, 
    EVENT_PACMAN_HASPOWER,
    EVENT_PACMAN_LOSEPOWER, 
    EVENT_GHOST_ATE,
    sceneEvents 
} from '../events/GameEvents';

export default class GameUIScene extends Phaser.Scene {

    private _text?: Phaser.GameObjects.Text;

    constructor() {
        super('GameUIScene');
    }

    create()
    {
        this._text = this.add.text(
            this.scale.width * 0.4, this.scale.height * 0.5,
            'READY!',
            {
                color: '#ffce44',
                fontSize: '18px',
                fontStyle: 'italic'
            });

        const audioSprite = this.sound.addAudioSprite('bgm');

        audioSprite.once('play', () =>
        {
            //text.setText('Play sprite');
            this.time.addEvent({
                delay: 1200,
                callback: ()=>{
                    this._text?.setVisible(false);

                    sceneEvents.emit(EVENT_GAME_INITED);

                    audioSprite.play('level0');
                },
                callbackScope: this
            });
        }, this);

        audioSprite.play('openning');

        sceneEvents.on(EVENT_PACMAN_HASPOWER, ()=>{
            audioSprite.play('frightened');
        });
        
        sceneEvents.on(EVENT_PACMAN_LOSEPOWER, ()=>{
            audioSprite.play('level0');
        });

        sceneEvents.on(EVENT_GHOST_ATE, ()=>{
            audioSprite.play('ghost back');
        });
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(EVENT_PACMAN_HASPOWER);
            sceneEvents.off(EVENT_PACMAN_LOSEPOWER);
            sceneEvents.off(EVENT_GHOST_ATE);
        }); 
    }

    update() {

    }
}
