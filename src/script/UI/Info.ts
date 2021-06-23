import { CharactorManager, PlayerTitle } from "../../Data/CharactorManager";
import { MiniGameManager } from "../../Data/MiniGameManager";
import EventManager from "../Singleton/EventManager";
import GameData from "../Singleton/GameData";
import { EventName } from "../Singleton/GameDefine";
import { PanelBase } from "./PanelBase";
import Shop from "./Shop";
import AudioManager from "../Singleton/AudioManager";
import { SdkUitl } from "../../Util/SdkUitl";

export default class Info extends PanelBase {
    public static instance: Info = null;
    private _info: Laya.Image;
    private _uiBox: Laya.Box;
    private _levelInfoBack: Laya.Image;
    private _levelProgressBack: Laya.Image;
    private _progressItems: Laya.Image[] = [];
    private _curLabel: Laya.Label;
    private _nextLabel: Laya.Label;
    private _coinInfo: Laya.Image;
    private _titleBack: Laya.Image;
    private _titleImage: Laya.Image;
    private _titleSeal: Laya.Image;

    public onShowEnd: Function = this.showEndCallBack;

    private _startPosY:number = 0;

    constructor() {
        super();
        Info.instance = this;
    }

    onAwake() {
        this._info = this.owner as Laya.Image;
        this._uiBox = this._info.getChildAt(0) as Laya.Box;
        this._levelInfoBack = this._uiBox.getChildByName("LevelInfoBack") as Laya.Image;
        this._levelProgressBack = this._levelInfoBack.getChildByName("LevelProgressBack") as Laya.Image;
        for (let i = 0; i < this._levelProgressBack.numChildren; i++) {
            this._progressItems[i] = this._levelProgressBack.getChildAt(i) as Laya.Image;
        }

        this._coinInfo = this._uiBox.getChildByName("CoinInfo") as Laya.Image;
        this._curLabel = this._levelInfoBack.getChildByName("CurBack").getChildAt(0) as Laya.Label;
        this._nextLabel = this._levelInfoBack.getChildByName("NextBack").getChildAt(0) as Laya.Label;

        this._titleBack = this._uiBox.getChildByName("TitleBack") as Laya.Image;
        this._titleImage = this._titleBack.getChildByName("Title") as Laya.Image;
        this._titleSeal = this._titleBack.getChildByName("Seal") as Laya.Image;

        EventManager.register(EventName.CHANGE_TITLE, this._titleChanged, this);
        this._startPosY = this._titleBack.y;
    }

    onStart() {
        if(SdkUitl.isLongHeight()){
            this._titleBack.y = this._startPosY +150;
        }
    }

    show(coin, level, title, result = false) {
        super.show();
        CharactorManager.instance().setPlayerTitle();
        this._refreshTitle(title);
        this._refreshCoinUI(coin);
        this._refreshLevelInfoUI(level, result);

        
    }

    hide() {
        super.hide();
        Laya.Tween.clearAll(this._titleSeal);
        Laya.Tween.clearAll(this._titleImage);
        this._titleSeal.scale(1, 1);
        this._titleImage.scale(1, 1);
    }

    public getCoinInfoPos() {
        return new Laya.Vector2(this._coinInfo.x, this._coinInfo.y);
    }

    private _refreshCoinUI(show: boolean) {
        this._coinInfo.visible = show;
    }

    private _refreshLevelInfoUI(show: boolean, result: boolean) {
        this._levelInfoBack.visible = show
        if (show) {
            let level = MiniGameManager.instance().getSceneLevel();
            let curLevel = Math.floor(level / 3) + 1;
            let part = result ? level % 3 + 1 : level % 3;
            this._curLabel.text = curLevel.toString();
            this._nextLabel.text = (curLevel + 1).toString();
            for (let i = 0; i < this._progressItems.length; i++) {
                if (i < part) {
                    this._progressItems[i].visible = true;
                } else {
                    this._progressItems[i].visible = false;
                }
            }
        }
    }

    private _refreshTitle(show) {
        if (!show) {
            this._titleBack.visible = false;
            return;
        }
        this._titleBack.visible = true;
        let title: PlayerTitle = CharactorManager.instance().getPlayerTitle();
        switch (title) {
            case PlayerTitle.QINGTONG:
                this._titleImage.skin = "textures/title1.png";
                break;
            case PlayerTitle.BAIYING:
                this._titleImage.skin = "textures/title2.png";
                break;
            case PlayerTitle.HUANGJING:
                this._titleImage.skin = "textures/title3.png";
                break;
            case PlayerTitle.BOJING:
                this._titleImage.skin = "textures/title4.png";
                break;

            case PlayerTitle.ZHUANSHI:
                this._titleImage.skin = "textures/title5.png";
                break;
            case PlayerTitle.DASHI:
                this._titleImage.skin = "textures/title6.png";
                break;
            case PlayerTitle.WANGZHE:
                this._titleImage.skin = "textures/title7.png";
                break;
        }
    }

    private _titleChanged() {
        Laya.Tween.clearAll(this._titleSeal);
        Laya.Tween.clearAll(this._titleImage);
        this._titleImage.scale(1.2,1.2);
        Laya.Tween.to(this._titleImage, { scaleX: 1, scaleY: 1 }, 150, Laya.Ease.backIn,null, 450)
        this._titleSeal.scale(2.5, 2.5);
        Laya.Tween.to(this._titleSeal, { scaleX: 1, scaleY: 1 }, 300, Laya.Ease.backIn, Laya.Handler.create(this, () => {
            AudioManager.instance().playEffect("Seal");
        }), 450)
    }

    private showEndCallBack() {
        //this._refreshTitle()
    }


}