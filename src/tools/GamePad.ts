import Phaser from "phaser";
import IDirections from "../interfaces/IDirections";

export default class GamePad extends Phaser.GameObjects.Container{

    private _joySticks?: { [key: string]: Phaser.GameObjects.Rectangle } = {};

    private _currentJoyStick?: string;

    private _currentDirections: IDirections;
    
    /**
     * 
     * @param scene The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param x The horizontal position of this Game Object in the world. Default 0.
     * @param y The vertical position of this Game Object in the world. Default 0.
     * @param children An optional array of Game Objects to add to this Container.
     */
    constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[],
        stickWidth?: number, stickHeight?: number){
        super(scene, x, y, children);

        if (!stickWidth){
            stickWidth = 80;
        }
        
        if (!stickHeight){
            stickHeight = 50;
        }

        this._currentDirections = {
            left: false,
            right: false,
            up: false,
            down: false
        };

        this._currentJoyStick = 'idle';

        // up-stick
        this._joySticks!['up'] = this.scene.add.rectangle(stickWidth, 0, stickHeight, stickWidth, 0xffffff)
            .setOrigin(0).setInteractive();
        // down-stick
        this._joySticks!['down'] = this.scene.add.rectangle(stickWidth, stickWidth + stickHeight, stickHeight, stickWidth, 0xffffff)
            .setOrigin(0).setInteractive();
        // left-stick
        this._joySticks!['left'] = this.scene.add.rectangle(0, stickWidth, stickWidth, stickHeight, 0xffffff)
            .setOrigin(0).setInteractive();
        // right-stick
        this._joySticks!['right'] = this.scene.add.rectangle(stickWidth + stickHeight, stickWidth, stickWidth, stickHeight, 0xffffff)
            .setOrigin(0).setInteractive();

        this.initJoySticksEvent();
    }

    get currentDirections(){

        this._currentDirections = {
            left: false,
            right: false,
            up: false,
            down: false
        };

        const stick = this._currentJoyStick;

        if (stick !== 'idle'){
            if (stick == 'left'){
                this._currentDirections.left = true;
            }
            else if (stick == 'right'){
                this._currentDirections.right = true;
            }
            else if (stick == 'up'){
                this._currentDirections.up = true;
            }
            else if (stick == 'down'){
                this._currentDirections.down = true;
            }
        }

        return this._currentDirections;
    }

    private initJoySticksEvent(){
        if (!this._joySticks){
            return;
        }

        const joyStickNames = Object.keys(this._joySticks!);
        for(let i = 0; i < joyStickNames.length; i++){
            const stick = joyStickNames[i];

            this._joySticks[stick].on('pointerdown', ()=>{
                this._joySticks![stick].setAlpha(0.6);
                this._currentJoyStick = stick;
            }, this);

            this._joySticks[stick].on('pointerup', ()=>{
                this._joySticks![stick].setAlpha(1);
                this._currentJoyStick = 'idle';
            }, this);

            this.add(this._joySticks[stick]);
        }
    }
}