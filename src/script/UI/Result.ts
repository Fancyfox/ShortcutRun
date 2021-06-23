import { CharactorManager } from "../../Data/CharactorManager";
import { Constants } from "../../Data/Constants";
import { MiniGameManager } from "../../Data/MiniGameManager";
import { SdkUitl } from "../../Util/SdkUitl";
import GamePage from "../Pages/GamePage";
import AudioManager from "../Singleton/AudioManager";
import ES from "../Singleton/ES";
import EventManager from "../Singleton/EventManager";
import GameData from "../Singleton/GameData";
import GameDefine, { EventName } from "../Singleton/GameDefine";
import GameManager from "../Singleton/GameManager";
import GameRecorderManager from "../Singleton/GameRecorderManager";
import RankItem from "./Compoments/RankItem";
import { PanelBase } from "./PanelBase";

export default class Result extends PanelBase {
    public static instance: Result = null;
    private _result: Laya.Image;
    private _uiBox: Laya.Box;
    private _videoBtn: Laya.Button;
    private _shareBtn: Laya.Button;
    private _directBtn: Laya.Button;
    private _recordBtn: Laya.Button;
    private _ranks: Laya.Sprite;
    private _youRankLabel: Laya.Label;
    private _recordLabel: Laya.Label;
    public onShowEnd: Function = this.setRankItem


    constructor() {
        super();
        Result.instance = this;
    }

    onAwake() {
        this._result = this.owner as Laya.Image;
        this._uiBox = this._result.getChildAt(0) as Laya.Box;
        this._videoBtn = this._uiBox.getChildByName("VideoBtn") as Laya.Button;
        this._shareBtn = this._uiBox.getChildByName("ShareBtn") as Laya.Button;
        this._directBtn = this._uiBox.getChildByName("DirectBtn") as Laya.Button;
        this._recordBtn = this._uiBox.getChildByName("RecordBtn") as Laya.Button;
        this._recordLabel = this._recordBtn.getChildByName("RecordLabel") as Laya.Label;
        this._ranks = this._uiBox.getChildByName("Ranks") as Laya.Sprite;
        this._youRankLabel = this._uiBox.getChildByName("RankBack").getChildByName("YouRankBack") as Laya.Label;

        this._videoBtn.on(Laya.Event.CLICK, this, this.getVideoReward);
        this._shareBtn.on(Laya.Event.CLICK, this, this.getRewardByShare);
        this._directBtn.on(Laya.Event.CLICK, this, this.getDirectReward);
        this._recordBtn.on(Laya.Event.CLICK, this, this.shareRecord);
    }

    onStart() {

    }

    show() {
        super.show();
        //this.setRankItem();
        this._refreshYouRankLabel();
        SdkUitl.showBanner();
        SdkUitl.stopGameRecord();
        if (Laya.Browser.window.tt) {

            this._shareBtn.visible = false;
            this._recordBtn.visible = true;
            if (GameRecorderManager.instance().canShowReward()) {
                this._recordLabel.text = "三倍领取";
                this._recordBtn.centerX = -185;
                this._recordBtn.centerY = 300;
                this._recordBtn.scale(1, 1);
                this._videoBtn.visible = false;
            } else {
                this._recordLabel.text = "分享录屏";
                this._recordBtn.centerX = 0;
                this._recordBtn.centerY = 150;
                this._recordBtn.scale(0.8, 0.8);
                this._videoBtn.visible = true;
            }
        } else {
            this._videoBtn.visible = true;
            this._shareBtn.visible = false;
            this._recordBtn.visible = false;
        }

        if (MiniGameManager.instance().getSceneLevel() % 3 == 0) {
            SdkUitl.showInterstitialAd();
        }
        
    }

    hide() {
        super.hide();
        SdkUitl.hideBanner();
    }

    private shareRecord() {
        if (!SdkUitl.canReleaseGameRecord()) {
            return;
        }

        if (GameRecorderManager.instance().canShowReward()) {
            SdkUitl.releaseGameRecord(() => {
                let startPos = new Laya.Vector2(this._recordBtn.x, this._recordBtn.y)
                GamePage.instance.showPage(Constants.UIPage.coinEffect, null, startPos, () => {
                    EventManager.dispatchEvent(EventName.ADD_MOENY);
                }, 10, GamePage.instance.getCoinPrefab());
                this._getReward(3);
                this.nextLevel();
                this._recordBtn.visible = false;
                SdkUitl.ShowToast("录屏分享成功，获得三倍奖励~");
            },()=>{
                SdkUitl.ShowToast("录屏分享失败");
            })
        } else {
            SdkUitl.releaseGameRecord(() => {
                SdkUitl.ShowToast("录屏分享成功~");
            },()=>{
                SdkUitl.ShowToast("录屏分享失败");
            })
        }

    }

    private getVideoReward() {
        AudioManager.instance().playEffect("Click");
        SdkUitl.showVideoRewardAd(() => {
            SdkUitl.ShowToast("恭喜获得三倍奖励~");
            let startPos = new Laya.Vector2(this._videoBtn.x, this._videoBtn.y)
            GamePage.instance.showPage(Constants.UIPage.coinEffect, null, startPos, () => {
                EventManager.dispatchEvent(EventName.ADD_MOENY)
            }, 10, GamePage.instance.getCoinPrefab());
            this._getReward(3);
            this.nextLevel();
        }, () => {
            SdkUitl.ShowToast("只有观看完毕才可获取奖励哦~");
        })

    }

    private getDirectReward() {
        AudioManager.instance().playEffect("Click");
        let startPos = new Laya.Vector2(this._directBtn.x, this._directBtn.y)
        GamePage.instance.showPage(Constants.UIPage.coinEffect, null, startPos, () => {
            EventManager.dispatchEvent(EventName.ADD_MOENY);
        }, 10, GamePage.instance.getCoinPrefab());
        this._getReward();
        this.nextLevel();
    }

    private nextLevel() {

        MiniGameManager.instance().nextLevel();
        let level = Math.floor(MiniGameManager.instance().getSceneLevel() / 3) + 1;
        level = level % 7 == 0 ? 1 : level % 7;
        GamePage.instance.hidePage(Constants.UIPage.result, () => {
            ES.instance.event(ES.on_clear_scene);
            GamePage.instance.showPage(Constants.UIPage.loading);
            GameManager.instance().loadLevel(level).then(() => {
                GamePage.instance.hidePage(Constants.UIPage.loading, () => {
                    GamePage.instance.showPage(Constants.UIPage.home);
                    GamePage.instance.showPage(Constants.UIPage.info, null, true, true,true);
                });

            })
        })

    }

    private setRankItem() {
        for (let i = 0; i < this._ranks.numChildren; i++) {
            let playerData;
            GameData.playerInfos.map(data => {
                if (data.rank - 1 == i) {
                    playerData = data;
                }
            })
            const comp = this._ranks.getChildAt(i).getComponent(RankItem);
            comp.setData && comp.setData(playerData);

        }
    }

    private _getReward(rate: number = 1) {
        let rewardCoin = GameData.rewardCoin * rate;
        CharactorManager.instance().addMoney(rewardCoin, true);
    }

    private _refreshYouRankLabel() {
        let rank = GameData.playRank;
        switch (rank) {
            case 1:
                this._youRankLabel.text = "第一名";
                break;
            case 2:
                this._youRankLabel.text = "第二名";
                break;
            case 3:
                this._youRankLabel.text = "第三名";
                break;
            case 4:
                this._youRankLabel.text = "第四名";
                break;

        }
    }

    private getRewardByShare() {
        AudioManager.instance().playEffect("Click");
        SdkUitl.share(false, () => {
            SdkUitl.ShowToast("分享成功，获得三倍金币奖励！！！");
            this._getReward(3);
            this.nextLevel();
        }, () => {
            SdkUitl.ShowToast("分享失败，请分享到不同的群~");
        })
    }


}