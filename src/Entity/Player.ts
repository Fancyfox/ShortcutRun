import { MiniGameManager } from "../Data/MiniGameManager";
import Vector3 from "../script/Extensions/Vector3";
import AudioManager from "../script/Singleton/AudioManager";
import EventManager from "../script/Singleton/EventManager";
import GameData from "../script/Singleton/GameData";
import GameDefine, { CharacterAnimation, CharacterState, EventName, GameState } from "../script/Singleton/GameDefine";
import Pool from "../script/Singleton/Pool";
import Camera from "./Camera";
import Charactor from "./Charactor";
import Obj from "./Obj";

export default class Player extends Charactor {
    private _point: Laya.Sprite3D;
    private _camera: Laya.Camera;
    private _rotate_speed: number = 0.35;
    /**现在帧数的手指x位置 */
    private curFrameTouchPoint_x: number;
    /**最后一帧的手指X位置 */
    private lastFrameTouchPoint_x: number;
    /**手指移动的x轴距离 */
    private fingerMoveDistance_x: number = 0;

    private isMouseDown: boolean = false;

    private _canPop: boolean = true;



    constructor() {
        super();
    }

    onAwake() {
        super.onAwake();
        this.player = this.owner as Laya.Sprite3D;
        this._point = this.player.getChildByName("point") as Laya.Sprite3D;
        this.blank_point = this.player.getChildByName("plank_point") as Laya.Sprite3D;
        this.animator = this.player.getComponent(Laya.Animator);
        console.log(this.animator, "animatro");

        this.playerMove = new Laya.Vector3(0, 0, this.forward_speed);
        this.curFrameTouchPoint_x = 0;
        this.lastFrameTouchPoint_x = 0;
        this.playerRotate = new Laya.Vector3(0, this._rotate_speed, 0);

        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
    }

    onStart() {
        super.onStart();
        this.initRay();
    }

    onEnable() {
        EventManager.register(EventName.MINI_GAME_START, this.onGameStart, this);
        EventManager.register(EventName.MINI_GAME_END, this.onGameEnd, this);
    }

    onDisable() {
        EventManager.unRegister(EventName.MINI_GAME_START, this.onGameStart, this);
        EventManager.unRegister(EventName.MINI_GAME_END, this.onGameEnd, this);
    }




    mouseDown() {
        if (GameDefine.gameState != GameState.Playing) {
            return;
        }

        if (this.isMouseDown) {
            return;
        }

        this.isMouseDown = true;
        this.curFrameTouchPoint_x = Laya.MouseManager.instance.mouseX;
        this.lastFrameTouchPoint_x = Laya.MouseManager.instance.mouseX;
    }
    mouseMove() {
        if (GameDefine.gameState != GameState.Playing) {
            return;
        }

        if (!this.isMouseDown) {
            return;
        }

        this.curFrameTouchPoint_x = Laya.MouseManager.instance.mouseX;
        this.fingerMoveDistance_x = this.curFrameTouchPoint_x - this.lastFrameTouchPoint_x;
        if (this.fingerMoveDistance_x > 0) {
            this.playerRotate.setValue(0, -this._rotate_speed * Laya.timer.delta / 1000 * this.fingerMoveDistance_x, 0);
            this.player.transform.rotate(this.playerRotate, true);
        } else if (this.fingerMoveDistance_x < 0) {
            this.playerRotate.setValue(0, -this._rotate_speed * Laya.timer.delta / 1000 * this.fingerMoveDistance_x, 0);
            this.player.transform.rotate(this.playerRotate, true);
        }

        this.lastFrameTouchPoint_x = this.curFrameTouchPoint_x;
    }

    mouseUp() {
        if (GameDefine.gameState != GameState.Playing) {
            return;
        }

        if (this.isMouseDown) {
            this.isMouseDown = false;
        }
    }



    onUpdate() {


        if (Laya.timer.delta > 100) {
            return;
        }


        if (GameDefine.gameState != GameState.Playing) {
            return;
        }
        // console.log(this.player.transform.position.y, "positionY");
        this.rayCast();
        switch (this.animationState) {
            case CharacterAnimation.Planche:
            case CharacterAnimation.Carrying:
            case CharacterAnimation.Running:
                this._moveForward();
                if (this.player.transform.localPositionY < 0) {
                    this.player.transform.localPositionY = 0
                }
                break;
            case CharacterAnimation.Jump:
                this.playerMove.y -= this._decreaseDownspeed();
                this._moveForward();
                if (this.juageWaterDistance()) {
                    AudioManager.instance().playEffect("FallInWater");
                    MiniGameManager.instance().EndGame();
                }
                break;
        }

    }

    init(data: any) {
        super.init(data);
        Camera.instance.initPlayerData(this.player, this._point);
        console.log(this.player.transform.position.y, "positionY");
        this.changePlayerState(CharacterAnimation.Idel);
        this.cube_count = 0;
        this._canPop = true;
    }

    public initCamera(camera: Laya.Camera) {
        this._camera = camera;
        this.player = this.owner as Laya.Sprite3D;
        this.player.addChild(camera);
        let point = this.player.getChildByName("point") as Laya.Sprite3D;
        this._camera.transform.position = point.transform.position;
        this._camera.transform.lookAt(this.player.transform.position, Laya.Vector3.up);
    }

    private _moveForward() {
        this.player.transform.translate(this.playerMove, true);
    }

    private _decreaseDownspeed() {
        return Laya.timer.delta / 1000 * 0.8;
    }

    private changePlayerState(state: CharacterAnimation) {
        if (this.animationState == state) {
            return;
        }
        this._playAnimation(state);
        switch (state) {
            case CharacterAnimation.Planche:
            case CharacterAnimation.Carrying:
            case CharacterAnimation.Running:
                this.playerMove.setValue(0, 0, this.forward_speed);
                break;
            case CharacterAnimation.Jump:
                this.playerMove.setValue(0, this.down_speed, this.forward_speed)
                break;
            case CharacterAnimation.Idel:
                this.playerMove.setValue(0, 0, 0);
                break;
            default:
                break;
        }
    }

    private _playAnimation(state: CharacterAnimation) {

        this.animationState = state;
        this.animator.play(state);
    }

    private onGameStart() {
        this.changePlayerState(CharacterAnimation.Running)
        this.startRay();
    }

    private onGameEnd() {
        this.changePlayerState(CharacterAnimation.Falling);
    }

    private initRay() {
        this.ray_orign = this.player.transform.position.clone();
        this.ray_down = new Laya.Ray(this.ray_orign, Laya.Vector3.down);
        this.outInfo = new Laya.HitResult();
    }

    private startRay() {
        this.isRayCast = true;
    }

    private rayCast() {
        if (!this.physicsSimulation) {
            return;
        }
        if (!this.isRayCast) {
            return;
        }
        let pos = this.player.transform.position;
        this.ray_orign.setValue(pos.x, pos.y + 5, pos.z);
        if (this.physicsSimulation.rayCast(this.ray_down, this.outInfo, 10)) {
            console.log("射线检测到了", this.outInfo.collider.owner.name);
            this.refeshState(this.outInfo, this.animationState);
        }

    }

    private refeshState(outInfo: Laya.HitResult, state: CharacterAnimation,) {
        if (!outInfo || !outInfo.succeeded) {
            return;
        }
        let colliderName = this.outInfo.collider.owner.name;
        let point = outInfo.point;
        switch (state) {
            case CharacterAnimation.Planche:
                switch (colliderName) {
                    case "water":
                        if (this.cube_count > 0) {
                            console.log("pop blank");

                            this._popPlankToRoad();
                            this.changePlayerState(CharacterAnimation.Planche);
                        } else {
                            this.changePlayerState(CharacterAnimation.Jump);
                            AudioManager.instance().playEffect("Jump");
                        }
                        break;
                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":
                    // case "plank_road":
                    case "plank":
                        if (this.cube_count > 0) {
                            this.changePlayerState(CharacterAnimation.Carrying);
                        } else {
                            this.changePlayerState(CharacterAnimation.Running);
                        }
                        break;
                }
                break;
            case CharacterAnimation.Carrying:
            case CharacterAnimation.Running:
                switch (colliderName) {
                    case "water":
                        if (this.cube_count > 0) {
                            console.log("pop blank");

                            this._popPlankToRoad();
                            this.changePlayerState(CharacterAnimation.Planche);
                        } else {
                            this.changePlayerState(CharacterAnimation.Jump);
                            AudioManager.instance().playEffect("Jump");
                        }
                        break;
                    case "plank":
                        console.log("plank");
                        this._addPlankToPlayer();
                        this.changePlayerState(CharacterAnimation.Carrying);
                        let plank = outInfo.collider.owner as Laya.Sprite;
                        plank.removeSelf();
                        plank.destroy();

                        break;

                }
                break;
            case CharacterAnimation.Jump:
                switch (colliderName) {

                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":
                        if (this.juageRoadDistance()) {
                            console.log("judge");
                            this.changePlayerState(CharacterAnimation.Running);
                            if (this.player.transform.localPositionY < 0) {
                                this.player.transform.localPositionY = 0;
                            }
                        }
                        break;
                    case "plank_road":
                        if (this.juageBlankDistance(point)) {
                            console.log("judge blank road");
                            this.changePlayerState(CharacterAnimation.Running);
                        }
                        break;
                }
                break;
        }
    }

    private juageWaterDistance() {
        return this.player.transform.localPositionY <= -2.3
    }

    private juageRoadDistance() {
        return this.player.transform.localPositionY <= 0
    }

    private juageBlankDistance(point: Laya.Vector3) {
        let distance_y = this.player.transform.localPositionY - point.y;
        return distance_y <= 0.05;
    }

    private _addPlankToPlayer() {
        this.cube_count++;
        let pos = new Laya.Vector3();
        if (this.cube_array.length > 0) {
            let lastcube = this.cube_array[this.cube_array.length - 1];
            pos.setValue(lastcube.transform.position.x, lastcube.transform.position.y + this.cube_height, lastcube.transform.position.z);

        } else {
            pos = this.blank_point.transform.position.clone();
        }
        let cube = Pool.instance.getPlank_hand(this.blank_point, pos);
        cube.transform.rotation = this.blank_point.transform.rotation;
        //cube.active = true;
        this.cube_array.push(cube);
        AudioManager.instance().playEffect("Collect")
    }

    private _popPlankToRoad() {
        if (!this._canPop) {
            return;
        }

        if (this.cube_array.length <= 0) {
            return;
        }


        let cube = this.cube_array.pop();
        this.cube_count--;
        Pool.instance.reversePlankHandCube(cube);

        let plankRoad = Pool.instance.getPlank_road(GameData.map, this.player.transform.position.clone())
        plankRoad.transform.rotation = this.player.transform.rotation.clone();
        plankRoad.transform.setWorldLossyScale(Laya.Vector3.one);
        this._canPop = false;
        Laya.timer.once(200, this, () => {
            this._canPop = true;
        });
        AudioManager.instance().playEffect("Put");
    }

}