import { CharactorManager } from "../../../Data/CharactorManager";
import { MiniGameManager } from "../../../Data/MiniGameManager";
import GameData, { PlayerInfo } from "../../Singleton/GameData";

export default class RankItem extends Laya.Script {
    private _rankBack: Laya.Image;
    private _rankLabel: Laya.Label;
    private _coinLabel: Laya.Label;
    private _nameLabel: Laya.Label;
    private _tween: Laya.Tween = new Laya.Tween();


    onAwake() {
        this._rankBack = this.owner as Laya.Image;
        this._rankLabel = this._rankBack.getChildByName("RankLabel") as Laya.Label;
        this._coinLabel = this._rankBack.getChildByName("Coin").getChildByName("CoinLabel") as Laya.Label;
        this._nameLabel = this._rankBack.getChildByName("NameLabel") as Laya.Label;
    }


    setData(data: any) {
        if (!data) {
            return;
        }
        this.refreshUI(data);

    }

    refreshUI(data: PlayerInfo) {
        if (!data) {
            return;
        }
        this._rankBack.scaleX = 1;
        this._rankBack.scaleY = 1;
        if (data.player) {
            this._rankBack.skin = "textures/you.png";
            this.playTween();
            GameData.rewardCoin = MiniGameManager.instance().getRewardCoinCount(data.rank);
            GameData.rewardScore = MiniGameManager.instance().getRankScore(data.rank);
            CharactorManager.instance().addScore(GameData.rewardScore); 
        } else {
            this._rankBack.skin = "textures/RankPanel.png";
            this.stopTween();
        }
        this._nameLabel.text = data.name;
        if (MiniGameManager.instance().getRewardCoinCount(data.rank)) {
            this._coinLabel.text = MiniGameManager.instance().getRewardCoinCount(data.rank).toString();
        }

    }

    private playTween() {
        //this._tween.repeat = 0;
        this._toLong();
    }

    private _toLong() {
        this._tween.to(this._rankBack, { scaleX: 1.1, scaleY: 1.1 }, 500, null, Laya.Handler.create(this, this._toShort));
    }

    private _toShort() {
        this._tween.to(this._rankBack, { scaleX: 1, scaleY: 1 }, 500, null, Laya.Handler.create(this, this._toLong));
    }

    private stopTween() {
        this._tween.clear();
    }
}