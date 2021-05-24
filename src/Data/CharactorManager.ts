import EventManager from "../script/Singleton/EventManager";
import { EventName } from "../script/Singleton/GameDefine";
import { Configuration } from "./Configuration";
import { Constants } from "./Constants";

export interface PlayerData {
    money: number
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

    public loadFromCache() {
        const playerInfo = Configuration.instance().getConfigData(Constants.PlayerInfoID);
        if (playerInfo) {
            this.playerInfo = JSON.parse(playerInfo);
        } else {
            this.playerInfo = {
                money: 0
            }
        }

    }

    public saveAudioInfoToCache() {
        const data = JSON.stringify(this.playerInfo);
        Configuration.instance().setConfigData(Constants.PlayerInfoID, data);
    }

    public addMoney(money: number) {
        this.playerInfo.money += money;
        this.saveAudioInfoToCache();
        EventManager.dispatchEvent(EventName.ADD_MOENY);
    }

    public reduceMoney(money: number) {
        if (this.playerInfo.money >= money) {
            this.playerInfo.money -= money;
            this.saveAudioInfoToCache();
            EventManager.dispatchEvent(EventName.REDUCE_MOENY);
        }
    }
}