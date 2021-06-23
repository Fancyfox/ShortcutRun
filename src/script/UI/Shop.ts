import { CharactorManager } from "../../Data/CharactorManager";
import { Constants } from "../../Data/Constants";
import { StaticDataManager } from "../../Tmpl/StaticDataManager";
import { SdkUitl } from "../../Util/SdkUitl";
import GamePage from "../Pages/GamePage";
import AudioManager from "../Singleton/AudioManager";
import EventManager from "../Singleton/EventManager";
import { EventName } from "../Singleton/GameDefine";
import { ShopManager } from "../Singleton/ShopManager";
import PlankShopItem from "./Compoments/PlankShopItem";
import { PanelBase } from "./PanelBase";

export default class Shop extends PanelBase {
    public static instance: Shop = null;
    private _shop: Laya.Image;
    private _uiBox: Laya.Box;
    private _unLockBtn: Laya.Button;
    private _adBtn: Laya.Button;
    private _homeBtn: Laya.Button;
    private _plankList: Laya.List;
    private _listBox: Laya.Box;
    private _priceLabel: Laya.Label


    /** @prop {name:plankItem,tips:"预制体对象",type:Prefab}*/
    plankItemPrefab: Laya.Prefab;
    constructor() {
        super();
        Shop.instance = this;
    }

    onAwake() {
        this._shop = this.owner as Laya.Image;
        this._uiBox = this._shop.getChildAt(0) as Laya.Box;
        this._plankList = this._uiBox.getChildByName("PlankList") as Laya.List;
        this._listBox = this._plankList.getChildAt(0) as Laya.Box;
        this._unLockBtn = this._uiBox.getChildByName("CoinUnlockBtn") as Laya.Button;
        this._priceLabel = this._unLockBtn.getChildByName("CoinCount") as Laya.Label;
        this._adBtn = this._uiBox.getChildByName("AdBtn") as Laya.Button;
        this._homeBtn = this._uiBox.getChildByName("HomeBtn") as Laya.Button;
        this.show();


        this._unLockBtn.on(Laya.Event.CLICK, this, this.randomUnlcok);
        this._adBtn.on(Laya.Event.CLICK, this, this.addMoneyByAD);
        this._homeBtn.on(Laya.Event.CLICK, this, this.showHomeView);
        EventManager.register(EventName.SHOP_PLANK_BUY, this._refeshUI, this);
        EventManager.register(EventName.SHOP_PLANK_CHOOSE, this._refeshUI, this);
    }

    onStart() {
        
    }

    show() {
        //super.show();

        if (!this._shop) {
            return;
        }
        if (this._listBox.numChildren > 0) {
            this._refeshUI();
            return;
        }
        SdkUitl.hideBanner();
    }



    private _refeshUI() {
        //this._plankList.refresh();
        let tmpls = StaticDataManager.getPlanksRecord();
        let index = 0;
        for (let key in tmpls) {
            let item = this._listBox.getChildAt(index).getChildAt(0) as Laya.Button //this._itemList[i];
            const comp = item.getComponent(PlankShopItem);
            comp.setData(key);
            index++;
        }
        if (!ShopManager.instance().isAllUnlock()) {
            this._unLockBtn.visible = true;
            this._priceLabel.text = (ShopManager.instance().getUnlockCount() * 1500).toString();
        } else {
            this._unLockBtn.visible = false;
        }
    }

    private randomUnlcok() {
        ShopManager.instance().unlockPlankByMoney();
    }

    private showHomeView() {
        AudioManager.instance().playEffect("Click");
        GamePage.instance.hidePage(Constants.UIPage.shop, () => {
            GamePage.instance.showPage(Constants.UIPage.home)
        });
    }

    private addMoneyByAD() {
        AudioManager.instance().playEffect("Click");
        let startPos = new Laya.Vector2(this._adBtn.x, this._adBtn.y);
        SdkUitl.showVideoRewardAd(() => {
            CharactorManager.instance().addMoney(1500, true);
            SdkUitl.ShowToast("恭喜获得1500金币~");
            GamePage.instance.showPage(Constants.UIPage.coinEffect, null, startPos, () => {
                EventManager.dispatchEvent(EventName.ADD_MOENY);
            }, 10, GamePage.instance.getCoinPrefab());

        }, () => {
            SdkUitl.ShowToast("只有观看完毕才可获取奖励哦~");
        })

       

    }
}