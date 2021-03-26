export enum GameState {
    None,
    Ready,
    PreviewMap,
    Playing,
    Pause,
    End
}

export enum CharacterState {
    None,
    Idle,
    Run,
    Die,
    Win
}

export enum CharacterAnimation {
    Idel = "idle",
    Running = "running",
    Falling = "falling",
    Escalade = "escalade",
    Back = "back",
    Carrying = "carrying",
    Jump = "jump",
    Planche = "planche",
    Defeated = "defeated",
    Dance = "dance"
}
export enum EventName {
    MINI_GAME_START = 'mini-game-start',
    MINI_GAME_END = 'mini-game-end',
    MINI_GAME_RELIFE = 'mini-game-relife',

    PLAYER_RELIFE = 'player-relife'
}


export default class GameDefine {
    /**最大关卡数 */
    public static maxLevel: number = 50
    public static prefabRoot: string = 'subPackage/sub1/LayaScene_main/Conventional/';
    public static levelRoot: string = 'subPackage/sub1/LayaScene_main/remote/levels/'
    public static scenePath: string = "subPackage/sub1/LayaScene_main/Conventional/main.ls";
    public static wordTexPath: string = 'subPackage/LayaScene_main/tex/';
    public static soundPath: string = 'subPackage/LayaScene_main/sounds/';
    /**人物皮肤贴图路径 */
    public static skinTexPath = 'subPackage/LayaScene_main/skins/';
    public static dataPath: string = "data/";
    public static preload = [
        "character_base.lh",
        "water.lh",
        "plank_hand.lh",
        "plank_road.lh",
        "Turn_45_L.lh",
        "Turn_45_R.lh",
        "Turn_45_short_L.lh",
        "Turn_45_short_R.lh",
        "cube.lh",
        "arrival.lh",
        "fallEffect.lh",
        "planks.lh",
        "enemy.lh"

    ]

    public static sounds = [

    ]





    public static bgms = [
        "bgm.mp3"
    ]


    public static gameState: GameState = GameState.None;
    public static playerState: CharacterState = CharacterState.None;
    public static CollisionGroup_Obs: number = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3;
}