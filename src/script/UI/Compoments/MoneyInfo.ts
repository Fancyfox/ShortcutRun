import { CharactorManager } from "../../../Data/CharactorManager";
import { Constants } from "../../../Data/Constants";
import EventManager from "../../Singleton/EventManager";
import { EventName } from "../../Singleton/GameDefine";

export default class MoneyInfo extends Laya.Script {
    private _moneyBack: Laya.Image;
    private _moenyLabel: Laya.Label;


    onAwake() {
        this._moneyBack = this.owner as Laya.Image;
        this._moenyLabel = this._moneyBack.getChildAt(0) as Laya.Label;
    }

    onEnable() {
        this.refreshMoneyLabel();
        EventManager.register(EventName.REDUCE_MOENY, this.refreshMoneyLabel, this);
        EventManager.register(EventName.ADD_MOENY, this.refreshMoneyLabel, this);
    }

    onDisable() {
        EventManager.unRegister(EventName.REDUCE_MOENY, this.refreshMoneyLabel, this);
        EventManager.unRegister(EventName.ADD_MOENY, this.refreshMoneyLabel, this);
    }


    private refreshMoneyLabel() {
        this._moenyLabel.text = CharactorManager.instance().playerInfo.money.toString();;
    }
}