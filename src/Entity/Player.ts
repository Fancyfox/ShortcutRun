import { Constants } from "../Data/Constants";
import { MiniGameManager } from "../Data/MiniGameManager";
import Vector3 from "../script/Extensions/Vector3";
import GamePage from "../script/Pages/GamePage";
import AudioManager from "../script/Singleton/AudioManager";
import EffectUtil from "../script/Singleton/EffectUtil";
import EventManager from "../script/Singleton/EventManager";
import GameData from "../script/Singleton/GameData";
import GameDefine, { CharacterAnimation, CharacterState, EventName, GameState } from "../script/Singleton/GameDefine";
import Pool from "../script/Singleton/Pool";
import { ShopManager } from "../script/Singleton/ShopManager";
import { StaticDataManager } from "../Tmpl/StaticDataManager";
import RandomUtil from "../Util/RandomUtil";
import { SdkUitl } from "../Util/SdkUitl";
import Camera from "./Camera";
import Charactor from "./Charactor";
import Jumper from "./Jumper";
import Obj from "./Obj";
const speed: number = 0.15;
export default class Player extends Charactor {
    private _point: Laya.Sprite3D;
    private _camera: Laya.Camera;
    private _rotate_speed: number = 0.25;
    /**现在帧数的手指x位置 */
    private curFrameTouchPoint_x: number;
    /**最后一帧的手指X位置 */
    private lastFrameTouchPoint_x: number;
    /**手指移动的x轴距离 */
    private fingerMoveDistance_x: number = 0;

    private isMouseDown: boolean = false;

    private _canPop: boolean = true;
    private _isMoveArrival: boolean = false;

    private _relifePart: Laya.Sprite3D;
    private _plank_prefab: string;

    private _excitedTimer: number = -1;

    private _bigJump: boolean = false;
    private _jumpInitSpeed: number = 1.5;
    private _bigJumpSpeed: number;
    private _bigJmmpG: number = 0.0015;



    constructor() {
        super();
    }

    onAwake() {
        super.onAwake();
        this.player = this.owner as Laya.Sprite3D;
        this.trail = this.player.getChildByName("trail") as Laya.Sprite3D;
        this._point = this.player.getChildByName("point") as Laya.Sprite3D;
        this.blank_point = this.player.getChildByName("plank_point") as Laya.Sprite3D;
        this.animator = this.player.getComponent(Laya.Animator);
        this.playerMove = new Laya.Vector3(0, 0, this.forward_speed);
        this.curFrameTouchPoint_x = 0;
        this.lastFrameTouchPoint_x = 0;
        this.playerRotate = new Laya.Vector3(0, this._rotate_speed, 0);

        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);

        this.moveArrivalpointHandler = new Laya.Handler(this, this.moveArrivalpointCallback);

    }

    onStart() {
        super.onStart();
        this.initRay();
        this.playerInfo = {
            name: "你",
            rank: 1,
            player: true
        }
        GameData.playerInfos.push(this.playerInfo);
        this._hideTrail();
    }

    onEnable() {
        EventManager.register(EventName.MINI_GAME_START, this.onGameStart, this);
        EventManager.register(EventName.MINI_GAME_END, this.onGameEnd, this);
        EventManager.register(EventName.PLAYER_RELIFE, this.relifeCallback, this);
    }

    onDisable() {
        EventManager.unRegister(EventName.MINI_GAME_START, this.onGameStart, this);
        EventManager.unRegister(EventName.MINI_GAME_END, this.onGameEnd, this);
        EventManager.unRegister(EventName.PLAYER_RELIFE, this.relifeCallback, this);
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

        // return;
        // console.log(this.player.transform.position.y, "positionY");


        this.rayCast();
        switch (this.animationState) {
            case CharacterAnimation.Planche:
                this._showTrail();
                this._addSpeed();
                this._moveForward();
                if (this.player.transform.localPositionY < 0) {
                    this.player.transform.localPositionY = 0
                }
                break;
            case CharacterAnimation.Carrying:
            case CharacterAnimation.Running:
                this._hideTrail();
                if (!GameData.excited) {
                    this.forward_speed = speed;
                    this.playerMove.setValue(0, 0, this.forward_speed);
                }

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
                    this.clearExcited();
                    let pos: Laya.Vector3 = new Laya.Vector3(this.player.transform.position.x, -0.5, this.player.transform.position.z);
                    EffectUtil.instance.loadEffect("fallEffect", -1, pos).then(res => {
                        res.active = true;
                    });
                    if (GameData.canRelife) {
                        GameData.canRelife = false;
                        MiniGameManager.instance().PauseGame();


                    } else {
                        MiniGameManager.instance().DieGame();
                    }
                }
                break;
            case CharacterAnimation.BigJump:
                this._bigJumpSpeed -= this._bigJmmpG * Laya.timer.delta;
                this.playerMove.y = this._bigJumpSpeed;
                this._moveForward();
                if (this.juageWaterDistance() && this.cube_count <= 0) {
                    AudioManager.instance().playEffect("FallInWater");
                    this.clearExcited();
                    let pos: Laya.Vector3 = new Laya.Vector3(this.player.transform.position.x, -0.5, this.player.transform.position.z);
                    EffectUtil.instance.loadEffect("fallEffect", -1, pos).then(res => {
                        res.active = true;
                    });
                    if (GameData.canRelife) {
                        GameData.canRelife = false;
                        MiniGameManager.instance().PauseGame();


                    } else {
                        MiniGameManager.instance().DieGame();
                    }
                }
                break;
        }

    }

    init(data: any) {
        super.init(data);
        Camera.instance.initPlayerData(this.player, this._point);
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
            case CharacterAnimation.BigJump:
                this._bigJumpSpeed = this._jumpInitSpeed;
                this.playerMove.setValue(0, this._bigJumpSpeed, this.forward_speed);
                break;
            default:
                break;
        }
    }

    private _playAnimation(state: CharacterAnimation) {

        this.animationState = state;
        if (state == CharacterAnimation.Planche) {
            this.animator.speed = 1.5;
        } else {
            this.animator.speed = 1;
        }

        if (state == CharacterAnimation.BigJump) {
            state = CharacterAnimation.Carrying;
        }
        this.animator.play(state);
    }

    private onGameStart() {
        this.forward_speed = speed;
        this.setHandPrefab();

        this.startRay();
        this._hideTrail();
        if (GameData.excited) {
            this.startExcited();
        }
        this.changePlayerState(CharacterAnimation.Running);
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
        if (this.physicsSimulation.rayCast(this.ray_down, this.outInfo, 20)) {
            //console.log("射线检测到了", this.outInfo.collider.owner.name);
            this.refeshState(this.outInfo, this.animationState);
        }

    }

    private refeshState(outInfo: Laya.HitResult, state: CharacterAnimation,) {
        if (!outInfo || !outInfo.succeeded) {
            return;
        }

        let colliderName = this.outInfo.collider.owner.name;

        if (GameData.canRelife) {
            switch (colliderName) {
                case "Turn_45_L":
                case "Turn_45_R":
                case "Turn_45_short_L":
                case "Turn_45_short_R":
                case "Cylinder":
                case "Stright":
                    let part = this.outInfo.collider.owner as Laya.Sprite3D;
                    this.setRelifePart(part);
                    break;
            }
        }


        let point = outInfo.point;
        switch (state) {
            case CharacterAnimation.Planche:
                switch (colliderName) {
                    case "jumper":
                        if (!this._bigJump) {
                            this._bigJump = true;
                            Laya.timer.once(1000, this, () => {
                                this._bigJump = false;
                            })
                        }
                        this.changePlayerState(CharacterAnimation.BigJump);
                        let jumper = this.outInfo.collider.owner as Laya.Sprite3D;
                        let ins = jumper.getComponent(Jumper);
                        if (ins) {
                            ins.playJumpAni();
                        }

                        break;
                    case "arrival":
                        this._moveArrivalPoint(this.outInfo.collider.owner as Laya.Sprite3D)
                        break;
                    case "water":
                        if (this.cube_count > 0) {
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
                    case "Cylinder":
                    case "Stright":
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
                    case "jumper":
                        if (!this._bigJump) {
                            this._bigJump = true;
                            Laya.timer.once(1000, this, () => {
                                this._bigJump = false;
                            })
                        }
                        this.changePlayerState(CharacterAnimation.BigJump);
                        let jumper = this.outInfo.collider.owner as Laya.Sprite3D;
                        let ins = jumper.getComponent(Jumper);
                        if (ins) {
                            ins.playJumpAni();
                        }

                        break;
                    case "arrival":
                        this._moveArrivalPoint(this.outInfo.collider.owner as Laya.Sprite3D)
                        break;
                    case "water":
                        if (this.cube_count > 0) {
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
                        //plank.destroy();

                        break;

                }
                break;
            case CharacterAnimation.BigJump:
                if (this._bigJump) {
                    return;
                }
                switch (colliderName) {
                    case "water":
                        if (this.player.transform.localPositionY < 0 && this.cube_count > 0) {
                            this.player.transform.localPositionY = 0;
                            this.changePlayerState(CharacterAnimation.Planche);
                            return;
                        }
                    case "plank":
                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":
                    case "Cylinder":
                    case "Stright":
                        if (this.juageRoadDistance()) {
                            if (this.cube_count > 0) {
                                this.changePlayerState(CharacterAnimation.Planche);
                            } else {
                                this.changePlayerState(CharacterAnimation.Running);
                            }

                            if (this.player.transform.localPositionY < 0) {
                                this.player.transform.localPositionY = 0;
                            }
                            return;
                        }
                }

            case CharacterAnimation.Jump:

                switch (colliderName) {
                    case "jumper":
                        if (!this._bigJump) {
                            this._bigJump = true;
                            Laya.timer.once(1000, this, () => {
                                this._bigJump = false;
                            })
                        }
                        this.changePlayerState(CharacterAnimation.BigJump);
                        let jumper = this.outInfo.collider.owner as Laya.Sprite3D;
                        let ins = jumper.getComponent(Jumper);
                        if (ins) {
                            ins.playJumpAni();
                        }

                        break;
                    case "arrvial":
                        if (this.juageRoadDistance()) {
                            if (this.player.transform.localPositionY < 1) {
                                this.player.transform.localPositionY = 0;
                            }
                            this._moveArrivalPoint(this.outInfo.collider.owner as Laya.Sprite3D)
                        }
                        break;
                    case "plank":
                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":
                    case "Cylinder":
                    case "Stright":
                        if (this.juageRoadDistance()) {
                            this.changePlayerState(CharacterAnimation.Running);
                            if (this.player.transform.localPositionY < 0) {
                                this.player.transform.localPositionY = 0;
                            }
                        }
                        break;
                    default:
                        if (colliderName.substring(0, 10) == "plank_hand") {
                            if (this.juageBlankDistance(point)) {
                                console.log("judge blank road");
                                this.changePlayerState(CharacterAnimation.Running);
                            }
                        }
                        break;
                    // case "plank_road":

                    //     break;
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

        let cube = Pool.Spawn(this._plank_prefab, this.blank_point, pos);
        let animator = cube.getComponent(Laya.Animator) as Laya.Animator;
        animator.enabled = true;
        animator.play("blank_push");
        let coll = cube.getComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        coll.enabled = false;
        let target_y = cube.transform.localPositionY + 0.2;
        Laya.Tween.from(cube.transform, { localPositionY: target_y }, 0.6);
        cube.transform.rotation = this.blank_point.transform.rotation;
        this.cube_array.push(cube);
        AudioManager.instance().playEffect("Collect");
        SdkUitl.vibrateShort();
        EventManager.dispatchEvent(EventName.PLAYER_PLANK_CHANGE, this.cube_count);
    }

    private _addSpeed() {
        if (GameData.excited) {
            return;
        }

        if (this.forward_speed < speed + 0.15) {
            this.forward_speed += Laya.timer.delta / 1000 * 0.01;
            this.playerMove.setValue(0, 0, this.forward_speed);
        }
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
        //Pool.instance.reversePlankHandCube(cube);
        Pool.RecycleObj(cube, this._plank_prefab);
        let plankRoad = Pool.Spawn(this._plank_prefab, GameData.map, this.player.transform.position.clone())//Pool.instance.getPlank_road(GameData.map, this.player.transform.position.clone())
        plankRoad.transform.rotation = this.player.transform.rotation.clone();
        plankRoad.transform.setWorldLossyScale(Laya.Vector3.one);
        let animator = plankRoad.getComponent(Laya.Animator) as Laya.Animator;
        animator.enabled = false;
        let coll = plankRoad.getComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        coll.enabled = true;
        this._canPop = false;
        Laya.timer.once(200, this, () => {
            this._canPop = true;
        });
        AudioManager.instance().playEffect("Put");
        SdkUitl.vibrateShort();
        EventManager.dispatchEvent(EventName.PLAYER_PLANK_CHANGE, this.cube_count);
    }

    private _clearPlank() {
        Laya.timer.frameLoop(1, this.player, () => {
            if (this.cube_array.length <= 0) {
                Laya.timer.clearAll(this.player);
                return;
            }
            let cube = this.cube_array.pop();
            this.cube_count--;
            Pool.RecycleObj(cube, this._plank_prefab);
        })
    }

    private _throwPlank(cb: Function) {
        if (this.cube_array.length < 0) {
            cb && cb();
            return;
        }

        this.cube_array.map((cube: Laya.Sprite3D, index) => {
            let target_x = RandomUtil.Random(-5, 5)
            let target_z = RandomUtil.Random(3, 10);
            Laya.Tween.to(cube.transform, { localPositionX: target_x / 2, localPositionY: RandomUtil.Random(3, 5), localPositionZ: target_z / 2 }, 500, Laya.Ease.quadIn,
                Laya.Handler.create(this, () => {
                    Laya.Tween.to(cube.transform, { localPositionX: target_x, localPositionY: 0, localPositionZ: target_z }, 500, Laya.Ease.quadIn, Laya.Handler.create(this, () => {
                        if (index === this.cube_array.length - 1) {
                            cb && cb();
                        }
                    }));
                }));
        })
    }

    private _moveArrivalPoint(arrival: Laya.Sprite3D) {
        if (this._isMoveArrival) {
            return;
        }
        if (!arrival) {
            return;
        }
        //this._clearPlank();
        this._throwPlank(() => {
            this._clearPlank();
        })
        this.clearExcited();
        this.changePlayerState(CharacterAnimation.Running)
        let pos = GameData.getArrivalPos();
        this.player.transform.lookAt(pos, Laya.Vector3.up, false, false)
        this._isMoveArrival = true;
        this._clearMoveTween();
        this.charactor_tween.to(this.player.transform, { localPositionX: pos.x, localPositionZ: pos.z }, 500, null, this.moveArrivalpointHandler)
        this._hideTrail();
    }

    private _clearMoveTween() {
        this.charactor_tween.clear();
    }

    private moveArrivalpointCallback() {
        if (GameDefine.gameState == GameState.End) {
            return;
        }
        this.playerInfo.rank = GameData.rank;
        GameData.playRank = this.playerInfo.rank;
        GameData.rank++;
        MiniGameManager.instance().EndGame();

        //如果第一名播放胜利动画 否则播放失败动画
        if (this.playerInfo.rank === 1) {
            AudioManager.instance().playEffect("Win");
            this.changePlayerState(CharacterAnimation.Dance);
        } else {
            AudioManager.instance().playEffect("Fail");
            this.changePlayerState(CharacterAnimation.Defeated);
        }

    }

    private setRelifePart(part: Laya.Sprite3D) {
        if (!this._relifePart) {
            this._relifePart = part;
            return;
        }

        if (this._relifePart != part) {
            this._relifePart = part;
        }
    }

    relifeCallback() {
        if (this._relifePart) {
            let relifePos = this._relifePart.transform.position.clone();
            this.player.transform.position = new Laya.Vector3(relifePos.x, 0, relifePos.z);
            //GameState.
            let target = this._relifePart.getChildAt(0) as Laya.Sprite3D;
            this.player.transform.lookAt(target.transform.position.clone(), Laya.Vector3.up, false, false);
            MiniGameManager.instance().ResumeGame();
            this._hideTrail();
        } else {

        }
    }

    private setHandPrefab() {
        let id = ShopManager.instance().getChoosePlankID();
        let tmpl = StaticDataManager.getPlanksRecord(id);
        this._plank_prefab = tmpl.Prefab;
    }

    private _showTrail() {
        if (!this.trail.active) {
            this.trail.active = true;
        }
    }

    private _hideTrail() {
        if (GameData.excited) {
            return;
        }
        if (this.trail.active) {
            this.trail.active = false;
        }
    }

    private startExcited() {
        this._showTrail();
        this.forward_speed = speed + 0.1;
        this._excitedTimer = setTimeout(() => {
            this.clearExcited();
        }, 10000);
    }

    private clearExcited() {
        if (!GameData.excited) {
            return;
        }

        this.forward_speed = speed;
        GameData.excited = false;
        clearTimeout(this._excitedTimer);
        this._hideTrail();
    }

}