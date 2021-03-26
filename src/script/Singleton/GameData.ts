import { GameState } from "./GameDefine";

export default class GameData {
    /**当前关卡 */
    public static level: number = 1;
    /**最大关卡数 */
    public static maxLevel: number = 20;
    /**摄像机 */
    public static camera: Laya.Camera;
    /**3d场景 */
    public static scene3d: Laya.Scene3D;
    /**地形 */
    public static map: Laya.Sprite3D;
    /**终点 */
    public static arrival_pos: Laya.Vector3;
    /**金币数量 */
    public static coin: number = 0;
    /**玩家是否移动结束 */
    public static isMoveEnd: boolean = false;

    /**玩家当前皮肤索引 */
    public static playerSkin_index: number = 0;
    /**玩家皮肤最大索引 */
    public static playerSkin_maxindex: number = 5;
    /**玩家皮肤贴图数组 */
    public static playerSkinTex_array: Array<Laya.Texture2D> = [];

    /**公主当前皮肤索引 */
    public static princessSkin_index: number = 0;
    /**公主皮肤最大索引 */
    public static princessSkin_maxindex: number = 5;
    /**公主皮肤贴图数组 */
    public static princessSkinTex_array: Array<Laya.Texture2D> = [];

    /**是否开启震动 */
    public static isShake: boolean = true;

    /**是否显示主界面 */
    public static isShowHome: boolean = false;

    /**提示教程路线数据 */
    public static tipData: any;


    public static player: Laya.Sprite3D;
    public static canRelife: boolean = true;





    public static resetData() {


    }


}