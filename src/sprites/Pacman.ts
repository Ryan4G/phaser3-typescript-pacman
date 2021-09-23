import Phaser from "phaser";
import { getPositionOnDirection } from "../interfaces/IGhostAI";
import { Directions } from "../enums/GameEnums";
import IPosition from "../interfaces/IPosition";
import { GameConfig } from "../configs/GameConfig";

export default class Pacman extends Phaser.GameObjects.Container{
    private _currentDirection: Directions = Directions.Left;
    private _nextDirection: Directions = Directions.Left;
    private _wallLayer?: Phaser.Tilemaps.TilemapLayer;
    private _debugPos?: Phaser.GameObjects.Rectangle;
    private _pacman: Phaser.GameObjects.Sprite;
    private _eatSFXIdx: number = 0;

    constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[],
        wallLayer?: Phaser.Tilemaps.TilemapLayer){
        super(scene, x, y, children);

        this._wallLayer = wallLayer;

        this._pacman = scene.add.sprite(8, 8, 'pacman', 12);
        this._pacman.play('pacman-move');

        this.add(this._pacman);

        scene.physics.add.existing(this);
        
        this.physicsBody.setCircle(8);

        //this._debugPos = scene.add.rectangle(0, 0, 5, 5, 0x000);
    }

    get currentDirection(){
        return this._currentDirection;
    }

    get physicsBody(){
        return this.body as Phaser.Physics.Arcade.Body;
    }

    eatDot(dot: Phaser.GameObjects.Sprite){
        this.scene.sound.playAudioSprite('sfx', `eat${this._eatSFXIdx}`);
        this._eatSFXIdx = this._eatSFXIdx === 0 ? 1 : 0;
        dot.destroy(true);
    }

    eatBigDot(bigDot: Phaser.GameObjects.Sprite){
        this.scene.sound.playAudioSprite('sfx', `eat${this._eatSFXIdx}`);
        this._eatSFXIdx = this._eatSFXIdx === 0 ? 1 : 0;
        bigDot.destroy(true);
    }

    preUpdate(d: number, dt: number){
        const containerBody = this.physicsBody;

        if (!containerBody || !this._wallLayer){
            return;
        }

        const currPos:IPosition = {
            x: containerBody.position.x + containerBody.width * 0.5, 
            y: containerBody.position.y + containerBody.height * 0.5
        };

        const standardPos: IPosition = {
            x: (Math.floor(currPos.x / GameConfig.TileWidth) + 0.5) * GameConfig.TileWidth, 
            y: (Math.floor(currPos.y / GameConfig.TileHeight) + 0.5) * GameConfig.TileHeight
        };

        // if(containerBody.position.x < 0){
        //     this.setPosition(this._wallLayer.width, this.y);
        // }

        // if(containerBody.position.x > this._wallLayer.width){
        //     this.setPosition(0, this.y);
        // }
        
        this.scene.physics.world.wrapObject(this);

        if (!this.scene.physics.world.bounds.contains(currPos.x, currPos.y)){
            return;
        }

        if (Math.abs(currPos.x - standardPos.x) > 1 || Math.abs(currPos.y - standardPos.y) > 1){
            return;
        }

        let speed = 50;
        
        const pos = getPositionOnDirection(currPos.x, currPos.y, this._nextDirection);
        //this._debugPos?.setPosition(pos.x, pos.y);
                
        if (this._wallLayer.getTileAtWorldXY(pos.x, pos.y)){
            return;
        }

        if (this._currentDirection !== this._nextDirection){
            // fix the pacman position, easier to through the path
            this.setPosition(standardPos.x - GameConfig.TileWidth * 0.5, standardPos.y - GameConfig.TileHeight * 0.5);
        }

        if (this._pacman.anims.isPaused){
            this._pacman.anims.resume();
        }

        switch(this._nextDirection){
            case Directions.Left:{
                containerBody.setVelocity(-speed, 0);
                this._pacman.scaleX = 1;
                this._pacman.setRotation(0);
                break;
            }
            case Directions.Right:{
                containerBody.setVelocity(speed, 0);
                this._pacman.scaleX = -1;
                this._pacman.setRotation(0);
                break;
            }
            case Directions.Up:{
                containerBody.setVelocity(0, -speed);

                if (this._pacman.scaleX === 1){
                    this._pacman.setRotation(Math.PI * 0.5);
                }
                else{
                    this._pacman.setRotation(-Math.PI * 0.5);
                }

                break;
            }
            case Directions.Down:{
                containerBody.setVelocity(0, speed);

                if (this._pacman.scaleX === 1){
                    this._pacman.setRotation(-Math.PI * 0.5);
                }
                else{
                    this._pacman.setRotation(Math.PI * 0.5);
                }

                break;
            }
            default:
                {
                    containerBody.setVelocity(0, 0);
                    this._pacman.setRotation(0);
                    break;
                }
        }

        this._currentDirection = this._nextDirection;
    }

    update(cursor: Phaser.Types.Input.Keyboard.CursorKeys){
        const containerBody = this.physicsBody;

        if (!containerBody || !this._wallLayer){
            return;
        }

        if (cursor.left.isDown){
            this._nextDirection = Directions.Left;
        }
        else if (cursor.right.isDown){
            this._nextDirection = Directions.Right;
        }
        else if (cursor.up.isDown){
            this._nextDirection = Directions.Up;
        }
        else if (cursor.down.isDown){
            this._nextDirection = Directions.Down;
        }
    }

    destroy(fromScene?: boolean){
        super.destroy(fromScene);
    }

    handlePacmanWallsCollision(){
        if (this._pacman.anims.isPlaying){
            this._pacman.anims.pause();
        }
    }

    handleGhostHited(){
        //this.destroy(true);
    }
}