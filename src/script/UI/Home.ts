import { CharactorManager } from "../../Data/CharactorManager";
import { Constants } from "../../Data/Constants";
import { MiniGameManager } from "../../Data/MiniGameManager";
import { SdkUitl } from "../../Util/SdkUitl";
import Vector2 from "../Extensions/Vector2";
import GamePage from "../Pages/GamePage";
import AudioManager from "../Singleton/AudioManager";
import EventManager from "../Singleton/EventManager";
import GameData from "../Singleton/GameData";
import GameDefine, { EventName, GameState } from "../Singleton/GameDefine";
import { PanelBase, UITYpes } from "./PanelBase";

export default class Home extends PanelBase {

    public static instance: Home = null
    private _homeUI: Laya.Image;
    private _uiBox: Laya.Box;
    private _startBtn: Laya.Button;
    private _shareBtn: Laya.Button;
    private _shopBtn: Laya.Button;
    private _settingBtn: Laya.Button;
    private _videoBtn: Laya.Button;
    public type: UITYpes = UITYpes.PANEL;

    private _startPosY:number;


    constructor() {
        super();
        Home.instance = this;
    }

    onAwake() {
        this._homeUI = this.owner as Laya.Image;
        this._uiBox = this._homeUI.getChildAt(0) as Laya.Box;
        this._startBtn = this._uiBox.getChildByName("StartBtn") as Laya.Button;
        this._shareBtn = this._uiBox.getChildByName("ShareBtn") as Laya.Button;
        this._shopBtn = this._uiBox.getChildByName("ShopBtn") as Laya.Button;
        this._settingBtn = this._uiBox.getChildByName("SettingBtn") as Laya.Button;
        this._videoBtn = this._uiBox.getChildByName("VideoBtn") as Laya.Button;

        this._startBtn.on(Laya.Event.CLICK, this, this.startGame)
        this._shopBtn.on(Laya.Event.CLICK, this, this.showShopView);
        this._shareBtn.on(Laya.Event.CLICK, this, this.ShareGame);
        this._settingBtn.on(Laya.Event.CLICK, this, this.showSettingPage);
        this._videoBtn.on(Laya.Event.CLICK, this, this.addSpeed);

        this._startPosY = this._startBtn.y;
    }

    onStart() {

    }

    show(...args: any[]) {
        super.show();
        SdkUitl.showBanner();
        if (Laya.Browser.window.tt) {
            this._shareBtn.visible = false;
        }

        if(SdkUitl.isLongHeight()){
            this._startBtn.y = this._startPosY +150;
        }
    }

    hide() {
        super.hide();
        SdkUitl.hideBanner();
    }

    onEnable() {

    }

    onDisable() {
        //this._startBtn.offAll();
        // this._shopBtn.offAll();
        //this._shareBtn.offAll();
        //this._settingBtn.offAll();
    }



    private startGame() {
        if (GameDefine.gameState != GameState.Playing) {
            AudioManager.instance().playEffect("Click");
            MiniGameManager.instance().StartGame();
            GamePage.instance.hidePage(Constants.UIPage.info);
            GamePage.instance.hidePage(Constants.UIPage.home, () => {
                GamePage.instance.showPage(Constants.UIPage.playing);
                SdkUitl.startGameRecord();
            });

        }
    }

    private showShopView() {
        AudioManager.instance().playEffect("Click");
        GamePage.instance.hidePage(Constants.UIPage.home, () => {
            GamePage.instance.showPage(Constants.UIPage.shop)
        });
        //GamePage.instance.showPage(Constants.UIPage.shop)
    }

    private ShareGame() {
        AudioManager.instance().playEffect("Click");
        SdkUitl.share(false, () => {
            SdkUitl.ShowToast("分享成功，获得100金币！")
            CharactorManager.instance().addMoney(100, true);
            let startPos = new Laya.Vector2(this._shareBtn.x, this._shareBtn.y);
            GamePage.instance.showPage(Constants.UIPage.coinEffect, null, startPos, () => {
                EventManager.dispatchEvent(EventName.ADD_MOENY);
            }, 10, GamePage.instance.getCoinPrefab());
        }, () => {
            SdkUitl.ShowToast("分享失败，请分享到不同的群")
        })

    }

    private showSettingPage() {
        AudioManager.instance().playEffect("Click");
        GamePage.instance.showPage(Constants.UIPage.setting)
    }

    private addSpeed() {
        AudioManager.instance().playEffect("Click");
        SdkUitl.showVideoRewardAd(() => {
            GameData.excited = true;
            SdkUitl.ShowToast("恭喜获得开局10秒加速~");
        }, () => {
            SdkUitl.ShowToast("只有观看完毕才可获取奖励哦~");
        })
    }
}