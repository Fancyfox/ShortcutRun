import { Constants } from "../../Data/Constants";
import { MiniGameManager } from "../../Data/MiniGameManager";
import GamePage from "../Pages/GamePage";
import GameData from "../Singleton/GameData";
import GameDefine, { GameState } from "../Singleton/GameDefine";
import { PanelBase, UITYpes } from "./PanelBase";

export default class Home extends PanelBase {

    public static instance: Home = null
    private _homeUI: Laya.Image;
    private _uiBox: Laya.Box;
    private _startBtn: Laya.Button;
    public type: UITYpes = UITYpes.PANEL;


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

    show(...args:any[]) {
        super.show();
    }

    hide() {
        super.hide();
    }

    onEnable() {
        this._startBtn.on(Laya.Event.CLICK, null, this.startGame.bind(this))
    }

    onDisable() {
        this._startBtn.off(Laya.Event.CLICK, null, this.startGame.bind(this));
    }



    private startGame() {
        if (GameDefine.gameState != GameState.Playing) {
            MiniGameManager.instance().StartGame();
            GamePage.instance.hidePage(Constants.UIPage.home, () => {
                GamePage.instance.showPage(Constants.UIPage.playing)
            });

        }
    }
}