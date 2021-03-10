import { MiniGameManager } from "../../Data/MiniGameManager";
import GameData from "../Singleton/GameData";
import GameDefine, { GameState } from "../Singleton/GameDefine";

export default class Home extends Laya.Script {
    public static instance: Home = null
    private _homeUI: Laya.Image;
    private _uiBox: Laya.Box;
    private _startBtn: Laya.Button;


    constructor() {
        super();
        Home.instance = this;
    }

    onAwake() {
        this._homeUI = this.owner as Laya.Image;
        this._uiBox = this._homeUI.getChildAt(0) as Laya.Box;
        this._startBtn = this._uiBox.getChildByName("StartBtn") as Laya.Button;
        // console.log(this._startBtn,"this._startBtn");

        //this._startBtn.on(Laya.Event.CLICK, null, this.startGame.bind(this))
    }

    onEnable() {
        this._startBtn.on(Laya.Event.CLICK, null, this.startGame.bind(this))
    }

    onDisable() {
        this._startBtn.off(Laya.Event.CLICK, null, this.startGame.bind(this));
    }

    private close() {
     this._uiBox.removeSelf();
    }


    private startGame() {
        if (GameDefine.gameState != GameState.Playing) {
            MiniGameManager.instance().StartGame();
            this.close();
        }
    }
}