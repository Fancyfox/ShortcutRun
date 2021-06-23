import EventManager from "../script/Singleton/EventManager";
import { EventName } from "../script/Singleton/GameDefine";
import { Configuration } from "./Configuration";
import { Constants } from "./Constants";

export interface PlayerData {
    money: number,
    score: number
}

export enum PlayerTitle {
    QINGTONG = "搬砖青铜",
    BAIYING = "搬砖白银",
    HUANGJING = "搬砖黄金",
    BOJING = "搬砖铂金",
    ZHUANSHI = "搬砖砖石",
    DASHI = "搬砖大师",
    WANGZHE = "搬砖王者"
}

export class CharactorManager {
    static _instance: CharactorManager = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new CharactorManager();
        }
        return this._instance;
    }

    public playerInfo: PlayerData;
    public playerTitle = PlayerTitle.HUANGJING;

    public loadFromCache() {
        const playerInfo = Configuration.instance().getConfigData(Constants.PlayerInfoID);
        console.log(playerInfo, "playerINfo++++++++++");
        if (playerInfo) {
            this.playerInfo = JSON.parse(playerInfo);
            if (!this.playerInfo.score) {
                this.playerInfo.score = 0;
            }

        } else {
            this.playerInfo = {
                money: 0,
                score: 0
            }
        }

    }

    public savePlayerInfoToCache() {
        const data = JSON.stringify(this.playerInfo);
        Configuration.instance().setConfigData(Constants.PlayerInfoID, data);
    }

    public addMoney(money: number, delay: boolean = false) {
        this.playerInfo.money += money;
        this.savePlayerInfoToCache();
        if (!delay) {
            EventManager.dispatchEvent(EventName.ADD_MOENY);
        }
    }

    public reduceMoney(money: number) {
        if (this.playerInfo.money >= money) {
            this.playerInfo.money -= money;
            this.savePlayerInfoToCache();
            EventManager.dispatchEvent(EventName.REDUCE_MOENY);
            return true;
        }

        return false;
    }

    public addScore(score: number) {
        this.playerInfo.score += score;
        this.savePlayerInfoToCache();
        EventManager.dispatchEvent(EventName.ADD_SCORE);
    }

    public setPlayerTitle() {
        let score = this.playerInfo.score;
        
        if (score < 15) {
            this.playerTitle = PlayerTitle.QINGTONG;
        } else if (score >= 15 && score < 40) {
            if (this.playerTitle != PlayerTitle.BAIYING) {
                this.playerTitle = PlayerTitle.BAIYING;
                EventManager.dispatchEvent(EventName.CHANGE_TITLE);
            }
        } else if (score >= 40 && score < 80) {
            if (this.playerTitle != PlayerTitle.HUANGJING) {
                this.playerTitle = PlayerTitle.HUANGJING;
                EventManager.dispatchEvent(EventName.CHANGE_TITLE);
            }
        } else if (score >= 80 && score < 140) {
            if (this.playerTitle != PlayerTitle.BOJING) {
                this.playerTitle = PlayerTitle.BOJING;
                EventManager.dispatchEvent(EventName.CHANGE_TITLE);
            }
        } else if (score >= 140 && score < 200) {
            if (this.playerTitle != PlayerTitle.DASHI) {
                this.playerTitle = PlayerTitle.DASHI;
                EventManager.dispatchEvent(EventName.CHANGE_TITLE);
            }
        } else {
            if (this.playerTitle != PlayerTitle.WANGZHE) {
                this.playerTitle = PlayerTitle.WANGZHE;
                EventManager.dispatchEvent(EventName.CHANGE_TITLE);
            }
        }
    }

    public getPlayerTitle() {
        return this.playerTitle;
    }
}