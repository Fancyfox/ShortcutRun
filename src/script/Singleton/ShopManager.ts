import { CharactorManager } from "../../Data/CharactorManager";
import { Configuration } from "../../Data/Configuration";
import { Constants } from "../../Data/Constants";
import { StaticDataManager } from "../../Tmpl/StaticDataManager";
import { SdkUitl } from "../../Util/SdkUitl";
import EventManager from "./EventManager";
import { EventName } from "./GameDefine";

export class ShopManager {
    static _instance: ShopManager = null;

    private _unlockIDMap = new Map<string, boolean>();
    private _unlockIDSaveList: string[] = [];
    private _unPlankChooseID: string;


    public static instance() {
        if (!this._instance) {
            this._instance = new ShopManager();
        }
        return this._instance;
    }

    public loadFromCache() {
        const shopInfo = Configuration.instance().getConfigData(Constants.ShopInfoID);
        const chooseID = Configuration.instance().getConfigData(Constants.PlankChooseID);

        if (chooseID) {
            this._unPlankChooseID = JSON.parse(chooseID);
        }
        if (shopInfo) {
            this._unlockIDSaveList = JSON.parse(shopInfo);
        } else {
            this._unlockIDSaveList.push("1001");
            this._unPlankChooseID = "1001";
            this._savePlankChooseID(this._unPlankChooseID);
            this._savePlankListToCache();
        }

        for (let i = 0; i < this._unlockIDSaveList.length; i++) {
            if (!this._unlockIDMap.has(this._unlockIDSaveList[i])) {
                this._unlockIDMap.set(this._unlockIDSaveList[i], true);
            }
        }

    }

    private _savePlankListToCache() {
        const data = JSON.stringify(this._unlockIDSaveList);
        Configuration.instance().setConfigData(Constants.ShopInfoID, data);
    }

    private _savePlankChooseID(id: string) {
        this._unPlankChooseID = id;
        Configuration.instance().setConfigData(Constants.PlankChooseID, this._unPlankChooseID);
    }

    public getUnlockCount() {
        return this._unlockIDSaveList.length;
    }

    public isAllUnlock() {
        return this._unlockIDSaveList.length >= 9;
    }

    public isAllPlankUnlock() {
        return this._unlockIDSaveList.length >= Constants.MaxPlankSkin;
    }

    public unlockPlankByMoney() {
        let unlockMoney = this._unlockIDSaveList.length * 1500;
        if (CharactorManager.instance().reduceMoney(unlockMoney)) {
            let lockList = this.getLockIDList()
            let ranIndex = Math.floor(Math.random() * lockList.length);
            this.unlockPlank(lockList[ranIndex]);
            EventManager.dispatchEvent(EventName.SHOP_PLANK_BUY, lockList[ranIndex])
        } else {
            SdkUitl.ShowToast("金币数量不够~");
        }
    }

    public hasUnlock(id: string) {
        return this._unlockIDMap.has(id);
    }

    public unlockPlank(id: string) {
        if (!this._unlockIDMap.has(id)) {
            this._unlockIDSaveList.push(id);
            this._unlockIDMap.set(id, true);
            this._savePlankListToCache();
            this._savePlankChooseID(id);
        }

    }

    public choosePlank(id: string) {
        if (!this._unlockIDMap.has(id)) {
            return;
        }

        this._savePlankChooseID(id);
        EventManager.dispatchEvent(EventName.SHOP_PLANK_CHOOSE, id);
    }

    public getChoosePlankID() {
        return this._unPlankChooseID;
    }

    public getLockIDList() {
        let tmpls = StaticDataManager.getPlanksRecord();
        let lockList = [];
        for (let key in tmpls) {
            if (!this._unlockIDMap.has(key)) {
                lockList.push(key);
            }
        }
        return lockList;
    }
}