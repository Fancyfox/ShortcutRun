import GameData, { PlayerInfo } from "../script/Singleton/GameData";
import { CharacterAnimation } from "../script/Singleton/GameDefine";
import Obj from "./Obj";

export default class Charactor extends Obj {
    public player: Laya.Sprite3D;
    public blank_point: Laya.Sprite3D;
    public animator: Laya.Animator;
    public trail:Laya.Sprite3D;
    public playerMove: Laya.Vector3;
    public playerRotate: Laya.Vector3;
    public animationState: CharacterAnimation;
    public playerInfo:PlayerInfo;

    public forward_speed: number = 0.15;
    public down_speed: number = 0.24;
    public cube_count: number = 0;
    public cube_array: Array<Laya.Sprite3D> = [];
    public cube_height: number = 0.16;
    public charactor_tween: Laya.Tween = new Laya.Tween();
    public moveArrivalpointHandler:Laya.Handler;

    //——————————————————射线数据——————————————————————
    /**向下的射线 */
    public ray_down: Laya.Ray;
    /**射线原点 */
    public ray_orign: Laya.Vector3;
    /**射线返回信息 */
    public outInfo: Laya.HitResult;
    /**是否开启射线 */
    public isRayCast: boolean = false;
    /**向下向量 */
    public vec_down: Laya.Vector3;
    public physicsSimulation: Laya.PhysicsSimulation;

   
    onAwake() {
        super.onAwake();
        this.player = this.owner as Laya.Sprite3D;
        this.animator = this.player.getComponent(Laya.Animator);
    }

    onStart() {
        super.onStart();
        this.initScene3d();
    }

    initScene3d() {
        this.physicsSimulation = GameData.scene3d.physicsSimulation;
    }
}
