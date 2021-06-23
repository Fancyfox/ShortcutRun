import Quaternion from "../script/Extensions/Quaternion";
import EffectUtil from "../script/Singleton/EffectUtil";
import EventManager from "../script/Singleton/EventManager";
import GameData from "../script/Singleton/GameData";
import GameDefine, { CharacterAnimation, EventName, GameState } from "../script/Singleton/GameDefine";
import Pool from "../script/Singleton/Pool";
import { StaticDataManager } from "../Tmpl/StaticDataManager";
import RandomUtil from "../Util/RandomUtil";
import Camera from "./Camera";
import Charactor from "./Charactor";

const speed: number = 0.15;

export default class Enemy extends Charactor {

    private _left: Laya.Sprite3D;
    private _right: Laya.Sprite3D;
    private _canPop: boolean = true;
    private _rotate_speed: number = 4;
    private _isMoveArrival: boolean = false;

    private ray_right_down: Laya.Ray;
    private ray_right_orign: Laya.Vector3;
    private outInfo_right: Laya.HitResult;

    private ray_left_down: Laya.Ray;
    private ray_left_orign: Laya.Vector3;
    private outInfo_left: Laya.HitResult;

    private _point: Laya.Sprite3D;

    private _die: boolean = false;
    private _toArrival: boolean = false;
    private _final: boolean = false;
    private _toRight: boolean = false;

    private _part: Laya.Sprite3D;
    private _plank_prefab: string;

    /**敌人移动路径点 */
    private path_array: any;
    private targetArray: Laya.Vector3[] = [];
    private targetIndex: number = 1;
    private _toTarget: boolean = false;
    private targetPos: Laya.Vector3;

    constructor() {
        super();
    }

    onAwake() {
        super.onAwake();
        this.player = this.owner as Laya.Sprite3D;
        this.trail = this.player.getChildByName("trail") as Laya.Sprite3D;
        this.animator = this.player.getComponent(Laya.Animator);
        this.blank_point = this.player.getChildByName("plank_point") as Laya.Sprite3D;
        this._left = this.player.getChildByName("left") as Laya.Sprite3D;
        this._right = this.player.getChildByName("right") as Laya.Sprite3D;
        this.playerMove = new Laya.Vector3(0, 0, this.forward_speed);
        this.playerRotate = new Laya.Vector3(0, this._rotate_speed, 0);
        this._point = this.player.getChildByName("point") as Laya.Sprite3D;
        this.moveArrivalpointHandler = new Laya.Handler(this, this.moveArrivalpointCallback);

    }

    onStart() {
        super.onStart();
        this.initRay();
        this.playerInfo = {
            name: GameData.getName(),
            rank: 1,
            player: false
        }
        GameData.playerInfos.push(this.playerInfo);
        this._hideTrail();
    }

    onEnable() {
        EventManager.register(EventName.MINI_GAME_START, this.onGameStart, this);
        EventManager.register(EventName.MINI_GAME_END, this.onGameEnd, this);
    }

    onDisable() {
        EventManager.unRegister(EventName.MINI_GAME_START, this.onGameStart, this);
        EventManager.unRegister(EventName.MINI_GAME_END, this.onGameEnd, this);
    }

    init(data: any) {
        super.init(data);
        this.changePlayerState(CharacterAnimation.Idel);
        //Camera.instance.initPlayerData(this.player, this._point);
        this.cube_count = 0;
        this._canPop = true;
        this._die = false;
        this._toArrival = false;
        this._final = false;
        // this._toTarget = true;
        this.path_array = data.pathArray;
        if (this.path_array) {
            for (let i = 0; i < this.path_array.length; i++) {
                let vec = new Laya.Vector3().fromArray(this.path_array[i]);
                this.targetArray.push(vec);
            }
        }
        // this.targetPos = this.targetArray[this.targetIndex];

    }

    onUpdate() {
        if (Laya.timer.delta > 100) {
            return;
        }

        if (GameDefine.gameState == GameState.None || GameDefine.gameState == GameState.Ready) {
            return;
        }

        if (this._die) {
            return;
        }
        if (this._final) {
            return;
        }



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
                this.forward_speed = speed;
                this.playerMove.setValue(0, 0, this.forward_speed);
                this._moveForward();
                if (this.player.transform.localPositionY < 0) {
                    this.player.transform.localPositionY = 0
                }
                break;
            case CharacterAnimation.Jump:
                this.playerMove.y -= this._decreaseDownspeed();
                this._moveForward();
                if (this.juageWaterDistance()) {
                    this.enemyDie();
                    let pos: Laya.Vector3 = new Laya.Vector3(this.player.transform.position.x, -0.5, this.player.transform.position.z);
                    EffectUtil.instance.loadEffect("fallEffect", -1, pos).then(res => {
                        res.active = true;
                    });
                }
                break;
        }
    }

    private enemyDie() {
        if (!this._die) {
            this._die = true;
        }
    }

    private onGameStart() {
        this._die = false;
        this._toArrival = false;
        this._final = false;
        this._toRight = false;
        this.setPlankPrefab();
        this.forward_speed = speed;
        this.changePlayerState(CharacterAnimation.Running)



        this.startRay();
        this._hideTrail();
    }

    private onGameEnd() {
        if (this._final) {
            return;
        }

        this.playerInfo.rank = GameData.rank;
        GameData.rank++;
        // this.changePlayerState(CharacterAnimation.Falling);
    }

    private startRay() {
        this.isRayCast = true;
    }

    private initRay() {
        this.ray_orign = this.player.transform.position.clone();
        this.ray_down = new Laya.Ray(this.ray_orign, Laya.Vector3.down);
        this.outInfo = new Laya.HitResult();

        this.ray_left_orign = this._left.transform.position.clone();
        this.ray_left_down = new Laya.Ray(this.ray_left_orign, Laya.Vector3.down);
        this.outInfo_left = new Laya.HitResult();

        this.ray_right_orign = this._right.transform.position.clone();
        this.ray_right_down = new Laya.Ray(this.ray_right_orign, Laya.Vector3.down);
        this.outInfo_right = new Laya.HitResult();
    }
    private _temp_vec3: Laya.Vector3 = new Laya.Vector3(0, 0, 0);
    private _forward:Laya.Vector3 = new Laya.Vector3(0,0,0);
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
            //射线检测到了
            this.refreshState(this.outInfo, this.animationState);
        }
        if (this._toTarget && this.targetPos) {
            this.player.transform.lookAt(this.targetPos, Laya.Vector3.up, false, false);
            return;
        }

        if (this._toArrival) {
            this.player.transform.lookAt(GameData.arrival_pos, Laya.Vector3.up, false, false);
            return;
        }

        if (this._toRight) {
            this._toRight = false;
            this._rotateToRight();
        }


        //如果两边都检测到了实物 直走
        if (this.rayLeftCast() && this.rayRigtCast()) {
            //console.log("move up");
            return;
        }

        if (this.rayLeftCast()) {
            this._rotate(-1);
            // console.log("ray left");

            return;
        }

        if (this.rayRigtCast()) {
            this._rotate(1);
            // console.log("ray right");
            return;
        }
    }

    private refreshState(outInfo: Laya.HitResult, state: CharacterAnimation) {
        if (!outInfo || !outInfo.succeeded) {
            return;
        }

        let colliderName = this.outInfo.collider.owner.name;
        let point = outInfo.point;
        // console.log(colliderName, "colliderName");

        switch (state) {
            case CharacterAnimation.Planche:
                this._showTrail();
                switch (colliderName) {
                    case "arrival":
                        this._moveArrivalPoint(this.outInfo.collider.owner as Laya.Sprite3D)
                        break;
                    case "water":
                        if (this.cube_count > 0) {
                            // console.log("pop blank enemy");

                            this._popPlankToRoad();
                            this.changePlayerState(CharacterAnimation.Planche);
                        } else {
                            this.changePlayerState(CharacterAnimation.Jump);

                        }
                        break;
                    case "Cylinder":
                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":

                    case "Stright":
                    case "plank":
                        if (!this._toRight) {
                            this._toRight = true;
                            this._part = this.outInfo.collider.owner as Laya.Sprite3D;
                        }

                        if (this.cube_count > 0) {
                            this.changePlayerState(CharacterAnimation.Carrying);
                        } else {
                            this.changePlayerState(CharacterAnimation.Running);
                        }

                        if (this._toArrival) {
                            this._toArrival = false;
                        }
                        this._rotateToRight();
                        break;
                }
                break;
            case CharacterAnimation.Carrying:
            case CharacterAnimation.Running:
                this._hideTrail();
                this.forward_speed = speed;
                this.playerMove.setValue(0, 0, this.forward_speed);
                switch (colliderName) {
                    case "arrival":
                        this._moveArrivalPoint(this.outInfo.collider.owner as Laya.Sprite3D)
                        break;
                    case "water":
                        if (this.cube_count > 0) {
                            // if (!this._toArrival) {
                            //     this._toArrival = true;
                            // }
                            this._popPlankToRoad();
                            this.changePlayerState(CharacterAnimation.Planche);
                        } else {
                            this.changePlayerState(CharacterAnimation.Jump);

                        }
                        break;
                    case "plank":
                        this._addPlankToEnemy();
                        this.changePlayerState(CharacterAnimation.Carrying);
                        let plank = outInfo.collider.owner as Laya.Sprite;
                        plank.removeSelf();
                        // plank.destroy();

                        break;
                    default:
                        break;

                }
                break;
            case CharacterAnimation.Jump:
                switch (colliderName) {
                    case "arrvial":
                        if (this.juageRoadDistance()) {
                            if (this.player.transform.localPositionY < 0) {
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
                            if (!this._toRight) {
                                this._toRight = true;
                                this._part = this.outInfo.collider.owner as Laya.Sprite3D;
                            }
                            if (this._toArrival) {
                                this._toArrival = false;
                            }
                            this._rotateToRight();
                            this.changePlayerState(CharacterAnimation.Running);
                            if (this.player.transform.localPositionY < 0) {
                                this.player.transform.localPositionY = 0;
                            }
                        }
                        break;
                    default:
                        if (colliderName.substring(0, 10) == "plank_hand") {
                            if (this.juageBlankDistance(point)) {
                                this.changePlayerState(CharacterAnimation.Running);
                            }
                        }
                        break;
                }
                break;
        }
    }

    private juageRoadDistance() {
        return this.player.transform.localPositionY <= 0
    }

    private juageBlankDistance(point: Laya.Vector3) {
        let distance_y = this.player.transform.localPositionY - point.y;
        return distance_y <= 0.05;
    }

    private juageWaterDistance() {
        return this.player.transform.localPositionY <= -2.3
    }

    private juageToArrival() {
        if (this._toArrival) {
            return;
        }

        if (this.cube_count > RandomUtil.RandomInteger(12, 16)) {
            this._toArrival = true;
            Laya.timer.once(1000, this, () => {
                this._toArrival = false;
            })
        }
    }


    private rayLeftCast(): boolean {
        if (!this.physicsSimulation || !this.isRayCast) {
            return false;
        }
        let pos = this._left.transform.position;
        this.ray_left_orign.setValue(pos.x, pos.y, pos.z);
        if (this.physicsSimulation.rayCast(this.ray_left_down, this.outInfo_left, 20)) {
            let colliderName = this.outInfo_left.collider.owner.name;
            switch (colliderName) {
                case "water":
                    return false;
                case "Turn_45_L":
                case "Turn_45_R":
                case "Turn_45_short_L":
                case "Turn_45_short_R":
                case "plank":
                case "arrival":
                case "Cylinder":
                case "Stright":
                    return true;
            }
        }

        return false;
    }

    private rayRigtCast(): boolean {
        if (!this.physicsSimulation || !this.isRayCast) {
            return false;
        }

        let pos = this._right.transform.position;
        this.ray_right_orign.setValue(pos.x, pos.y, pos.z);
        if (this.physicsSimulation.rayCast(this.ray_right_down, this.outInfo_right, 20)) {
            let colliderName = this.outInfo_right.collider.owner.name;
            switch (colliderName) {
                case "water":
                    return false;
                case "Turn_45_L":
                case "Turn_45_R":
                case "Turn_45_short_L":
                case "Turn_45_short_R":
                case "plank":
                case "arrival":
                case "Cylinder":
                case "Stright":
                    return true;
            }
        }

        return false;
    }

    private qua: Laya.Quaternion = new Laya.Quaternion();
    private _rotateToRight() {
        if (!this._part) {
            return;
        }
        let target = this._part.getChildAt(0) as Laya.Sprite3D;
        if (!target) {
            return;
        }
        let targetVec = new Laya.Vector3(target.transform.position.x,0,target.transform.position.z)
        this.player.transform.lookAt(targetVec, Laya.Vector3.up, false, false);
    }

    private _moveForward() {
        this.player.transform.translate(this.playerMove, true);
    }

    private _decreaseDownspeed() {
        return Laya.timer.delta / 1000 * 0.8;
    }

    private _rotate(dir: number) {
        this.playerRotate.setValue(0, -this._rotate_speed * dir * Laya.timer.delta / 1000, 0);
        this.player.transform.rotate(this.playerRotate, true);
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
        if (state == CharacterAnimation.Planche) {
            this.animator.speed = 1.5;
        } else {
            this.animator.speed = 1;
        }
        this.animator.play(state);
    }

    private _addPlankToEnemy() {
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
        if (this.path_array)
            if (this.path_array && this.targetIndex < this.targetArray.length) {
                this._jungeToTarget();
                return;
            }
        this.juageToArrival();
    }

    private _jungeToTarget() {
        if (this._toTarget) {
            return;
        }

        if (this.cube_count > RandomUtil.RandomInteger(6, 7)) {
            this._toTarget = true;
            this.targetPos = this.targetArray[this.targetIndex];
            Laya.timer.once(1000, this, () => {
                this.targetIndex++;
                this._toTarget = false;
            })
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
        Pool.RecycleObj(cube, this._plank_prefab);

        let plankRoad = Pool.Spawn(this._plank_prefab, GameData.map, this.player.transform.position.clone());
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
    }
    private _addSpeed() {

        if (this.forward_speed < speed + 0.15) {
            this.forward_speed += Laya.timer.delta / 1000 * 0.01;
            this.playerMove.setValue(0, 0, this.forward_speed);
        }
    }
    private _clearPlank() {
        Laya.timer.frameLoop(1, this.player, () => {
            if (this.cube_array.length <= 0) {
                Laya.timer.clearAll(this.player);
                return;
            }
            let cube = this.cube_array.pop();
            this.cube_count--;
            //Pool.instance.reversePlankHandCube(cube);
            Pool.RecycleObj(cube, this._plank_prefab);
        })
    }

    private _moveArrivalPoint(arrival: Laya.Sprite3D) {
        if (this._isMoveArrival) {
            return;
        }
        if (!arrival) {
            return;
        }
        this._clearPlank();
        this._hideTrail();
        this.changePlayerState(CharacterAnimation.Running)
        let pos = GameData.getArrivalPos();
        this._isMoveArrival = true;
        this._clearMoveTween();
        this.player.transform.lookAt(pos, Laya.Vector3.up, false, false);
        this.charactor_tween.to(this.player.transform, { localPositionX: pos.x, localPositionZ: pos.z }, 500, null, this.moveArrivalpointHandler)

    }

    private _clearMoveTween() {
        this.charactor_tween.clear();
    }

    private moveArrivalpointCallback() {
        //如果第一名播放胜利动画 否则播放失败动画

        if (this._final) {
            return;
        }
        this.playerInfo.rank = GameData.rank;
        GameData.rank++;
        this._final = true;
        if (this.playerInfo.rank === 1) {
            this.changePlayerState(CharacterAnimation.Dance);
        } else {
            this.changePlayerState(CharacterAnimation.Defeated);
        }

    }

    private setPlankPrefab() {
        let tmpls = StaticDataManager.getPlanksRecord();
        let keys = Object.keys(tmpls);
        this._plank_prefab = tmpls[keys[Math.floor(Math.random() * keys.length)]].Prefab;
    }

    private _showTrail() {
        if (!this.trail.active) {
            this.trail.active = true;
        }
    }

    private _hideTrail() {
        if (this.trail.active) {
            this.trail.active = false;
        }
    }
}