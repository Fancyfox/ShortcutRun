import { GameState } from "./GameDefine";

export interface PlayerInfo {
    name: string,
    rank: number,
    player: boolean
}

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
    /**终点坐标数组 */
    public static arrival_pos_array: Array<Laya.Vector3> = [];
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
    /**跑道贴图数组 */
    public static roadTex_map = new Map<string, Laya.Texture2D>();

    /**是否开启震动 */
    public static isShake: boolean = true;

    /**是否显示主界面 */
    public static isShowHome: boolean = false;

    /**名字库 */
    public static name_array: Array<string> = [];


    public static player: Laya.Sprite3D;
    public static canRelife: boolean = true;
    public static rank: number = 1;
    public static rewardCoin: number = 0;
    public static playRank: number = 1;

    public static playerInfos: PlayerInfo[] = [];



    public static getArrivalPos(): Laya.Vector3 {
        console.log(this.arrival_pos_array, "arrival pos array");

        if (this.arrival_pos_array.length <= 0) {
            return null;
        } else {
            return this.arrival_pos_array.pop();
        }
    }

    public static resetData() {
        this.arrival_pos_array.length = 0;
        this.playerInfos.length = 0;
        this.rank = 1;
        this.playRank = 1;
        this.rewardCoin = 0;
        this.canRelife = true;
    }

    /**名字库 */
    public static RandomName() {
        var arr = ["凄美如画", "土豆沙", "茕茕孑立", " 追风逐月", "剑舞琴扬", "天涯为客", "静候缘来", "慕雪剑心", "慕血十三",
            "小天使", "泡泡龙", "tina", "for_love", "花菲", "可儿", "非想", "开元", "杰克", "大朋友", "尓蕞紾貴", "大棒", "灵兰若梦", "锦瑟幽心", "冰城", "文远", "阿红", "都是辣鸡", "蛰伏",
            "柯", "天涯", "森舟", "似曾相识", "可可妈", "醉红尘", "莲波仙子", "bibe", "小棉", "金色", "卖了一个世界", "袭夜风", "一颗海藻", "wei", "獨留記憶:", "HGC、", "车♀神",
            "吥丶可能", "额滴个神", "窈窕", "梦入晚花", "爲愛鼓掌", "雨", "落樱纷飞", "马猴烧酒", "向阳花", "白衣少年", "幸运烟雨", "斗宗强者", "三师公", "步步为赢", "苍了微凉", "枫林晚", "卡哇伊",
            "乘风破~", "欧豆豆", "史迪仔", "斯給妳", "积灰石台", "此夜此月", "干净月光", "故人长安", "崖山一夜", "山河故人", "干净利落", "给我盘ta", "古道西风", "十里桃花", "话在心里", "G.I钟",
            "黑凤梨~", "几度几分", "尽揽风月", "静待花开", "孤海微凉", "淮南柚香", "格桑花", "闰土与猹", "蓝涩雨蝶", "兔女郎", "会飞的鱼", "佛剑分说", "两小无猜",
            "也总", "安得广厦", "焚琴煮鹤", "青阳", "钢炼", "笑在眉眼", "我是雨师..", "我是演员", "青梅煮马", "瘦马淡雾", "小仙女", "狗骑兔子", "醉酒当歌",
            "晴天飞雪", "破~伤风", "卧龙跃马", "一场惊鸿", "biu,爽", "寒光冷照", "失心疯", "雨伞风听", "新鲜感觉", "如之奈何", "君子剑", "烈酒入喉", "杂修", "剑指天涯", "山中老人", "时辰的错",
            "救赎乀", "夜雨沧皮", "醉饮千山", "不离不弃", "莫山主", "冷战思维", "猪头帝", "单相思", "猪头少年", "红袖依然", "独角戏", "冬去春来", "冰轮", "乱了头发", "天国比雕",
            "锁心神笔", "留级生", "有烟无伤", "疯狂游戏", "小奶狗", "余温余情", "joe", "好人卡", "三刀流", "贰零壹玖", "朱颜华发", "万人敌", "死肥宅", "竹楼醉酒", "仅仅喜欢", "甲方",
            "人心所向", "韩晓飞", "如你所愿", "冷漾船舷", "又是一年", "周扒皮", "君莫笑", "飞刀", "四月绿", "心安如梦", "流沙", "烟云浮华", "弃总", "走路草", "追忆流年"]
        return arr;
    }

    /**随机获取名称 */
    public static getName(): string {
        let name: string;
        let ran = Math.floor(Math.random() * (GameData.name_array.length));
        name = GameData.name_array.splice(ran, 1)[0];
        return name;
    }


}