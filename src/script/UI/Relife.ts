import { Constants } from "../../Data/Constants";
import { MiniGameManager } from "../../Data/MiniGameManager";
import Player from "../../Entity/Player";
import { SdkUitl } from "../../Util/SdkUitl";
import GamePage from "../Pages/GamePage";
import AudioManager from "../Singleton/AudioManager";
import ES from "../Singleton/ES";
import EventManager from "../Singleton/EventManager";
import GameData from "../Singleton/GameData";
import { EventName } from "../Singleton/GameDefine";
import GameManager from "../Singleton/GameManager";
import { PanelBase, UITYpes } from "./PanelBase";


export default class Relife extends PanelBase {
    public static instance: Relife = null;
    private _relife: Laya.Image;
    private _uiBox: Laya.Box;
    private _relifeBtn: Laya.Button;
    private _shareBtn: Laya.Button;
    private _restartBtn: Laya.Button;
    private _title: Laya.Image;
    private _timerImg: Laya.Image;
    public type: UITYpes = UITYpes.PANEL;

    private _time: number = 5;

    constructor() {
        super();
        Relife.instance = this;
    }

    onAwake() {
        this._relife = this.owner as Laya.Image;
        this._uiBox = this._relife.getChildAt(0) as Laya.Box;
        this._relifeBtn = this._uiBox.getChildByName("RelifeBtn") as Laya.Button;
        this._restartBtn = this._uiBox.getChildByName("AgainBtn") as Laya.Button;
        this._shareBtn = this._uiBox.getChildByName("ShareBtn") as Laya.Button;
        this._title = this._uiBox.getChildByName("Title") as Laya.Image;
        this._timerImg = this._uiBox.getChildByName("Timer") as Laya.Image;

        this._relifeBtn.on(Laya.Event.CLICK, this, this.playerRelfie.bind(this));
        this._shareBtn.on(Laya.Event.CLICK, this, this.relifeByShare.bind(this));
        this._restartBtn.on(Laya.Event.CLICK, this, this.playAgain.bind(this));

    }

    onEnable() {
        
    }

    onDisable() {
        //this._relifeBtn.offAll();
        //this._shareBtn.offAll();
    }

    show(type: number = 0) {
        super.show();
        
        switch (type) {
            case 0:
                this._relifeBtn.visible = true;
                //this._shareBtn.visible = true;
                this._restartBtn.visible = true;
                this._title.visible = false;
                this.showCountdown();
                break;
            case 1:
                this._timerImg.visible = false;
                this._relifeBtn.visible = false;
               // this._shareBtn.visible = false;
                this._restartBtn.visible = true;
                this._title.visible = true;
                break;
        }
        SdkUitl.showBanner();
        SdkUitl.stopGameRecord();
    }

    hide() {
        super.hide();
        SdkUitl.hideBanner();
    }

    private playerRelfie() {
        AudioManager.instance().playEffect("Click");
        SdkUitl.showVideoRewardAd(()=>{
            Laya.timer.clear(this, this._refreshCountdown);
            GamePage.instance.hidePage(Constants.UIPage.relife, () => {
                GamePage.instance.showPage(Constants.UIPage.playing, () => {
                    EventManager.dispatchEvent(EventName.PLAYER_RELIFE);
                    SdkUitl.startGameRecord();
                })
            })
        },()=>{
            SdkUitl.ShowToast("只有观看完毕才可获取奖励哦~");
        })
        
    }

    private relifeByShare() {
        AudioManager.instance().playEffect("Click");
        SdkUitl.share(false, () => {
            Laya.timer.clear(this, this._refreshCountdown);
            GamePage.instance.hidePage(Constants.UIPage.relife, () => {
                GamePage.instance.showPage(Constants.UIPage.playing, () => {
                    EventManager.dispatchEvent(EventName.PLAYER_RELIFE)
                })
            })
        }, () => {
            SdkUitl.ShowToast("分享失败~");
        })
    }

    private playAgain() {
        AudioManager.instance().playEffect("Click");
        Laya.timer.clear(this, this._refreshCountdown);
        GamePage.instance.hidePage(Constants.UIPage.relife, () => {
            ES.instance.event(ES.on_clear_scene);
            GamePage.instance.showPage(Constants.UIPage.loading);
            let level = Math.floor(MiniGameManager.instance().getSceneLevel() / 3) + 1;
            level = level % 7 == 0 ? 1 : level % 7;
            GameManager.instance().loadLevel(level).then(() => {
                console.log('init scene complete');
                GamePage.instance.hidePage(Constants.UIPage.loading, () => {
                    GamePage.instance.showPage(Constants.UIPage.home, null);
                    GamePage.instance.showPage(Constants.UIPage.info, null, true, true,true);
                });
            });
        })
    }

    private showCountdown() {
        this._time = 5;
        this._timerImg.skin = "textures/d5.png";
        this._timerImg.visible = true;
        this._relifeBtn.visible = true;
       // this._shareBtn.visible = true;
        Laya.timer.loop(1000, this, this._refreshCountdown)
    }

    private _refreshCountdown() {
        if (this._time > 0) {
            this._time--;
        }

        if (this._time === 0) {
            this._timerImg.visible = false;
             this._relifeBtn.visible = false;
            //this._shareBtn.visible = false;
            Laya.timer.clear(this, this._refreshCountdown);
            return;
        }
        this._timerImg.skin = `textures/d${this._time}.png`;
    }
}