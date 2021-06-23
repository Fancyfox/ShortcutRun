import { Configuration } from "../../Data/Configuration";
import { Constants } from "../../Data/Constants";
import { MiniGameManager } from "../../Data/MiniGameManager";
import { SdkUitl } from "../../Util/SdkUitl";
import AudioManager from "../Singleton/AudioManager";
import GameManager from "../Singleton/GameManager";
import { ShopManager } from "../Singleton/ShopManager";
import { PanelBase, UITYpes } from "../UI/PanelBase";



export default class GamePage extends Laya.Script {
  public static instance: GamePage = null;

  private _panelLayer: Laya.Box;
  private _popupLayer: Laya.Box;
  private _tipLayer: Laya.Box;
  private _effectLayer: Laya.Box;

  /** @prop {name:coin,tips:"预制体对象",type:Prefab}*/
  coin: Laya.Prefab;

  /** @prop {name:homePage,tips:"预制体对象",type:Prefab}*/
  homePage: Laya.Prefab;

  /** @prop {name:playingPage,tips:"预制体对象",type:Prefab}*/
  playingPage: Laya.Prefab;

  /** @prop {name:relifePage,tips:"预制体对象",type:Prefab}*/
  relifePage: Laya.Prefab;

  /** @prop {name:resultPage,tips:"预制体对象",type:Prefab}*/
  resultPage: Laya.Prefab;

  /** @prop {name:loadingPage,tips:"预制体对象",type:Prefab}*/
  loadingPage: Laya.Prefab;

  /** @prop {name:shopPage,tips:"预制体对象",type:Prefab}*/
  shopPage: Laya.Prefab;

  /** @prop {name:infoPage,tips:"预制体对象",type:Prefab}*/
  infoPage: Laya.Prefab;

  /** @prop {name:settingPage,tips:"预制体对象",type:Prefab}*/
  settingPage: Laya.Prefab;

  /** @prop {name:coinEffectPage,tips:"预制体对象",type:Prefab}*/
  coinEffectPage: Laya.Prefab;

  private dictPanelMap = new Map<string, Laya.Image>();

  constructor() {
    super();
    GamePage.instance = this;
  }

  onAwake() {

    AudioManager.instance().loadFromCache();
    ShopManager.instance().loadFromCache();
    this._panelLayer = this.owner.getChildByName("PanelLayer") as Laya.Box;
    this._popupLayer = this.owner.getChildByName("PopupLayer") as Laya.Box;
    this._tipLayer = this.owner.getChildByName("TipLayer") as Laya.Box;
    this._effectLayer = this.owner.getChildByName("EffectLayer") as Laya.Box;
  }

  onStart() {
    let level = Math.floor(MiniGameManager.instance().getSceneLevel() / 3) + 1;
    level = level % 7 == 0 ? 1 : level % 7;
    this.showPage(Constants.UIPage.loading);
    GameManager.instance().loadLevel(level).then(() => {
      this.hidePage(Constants.UIPage.loading, () => {
        this.showPage(Constants.UIPage.home, null);
        this.showPage(Constants.UIPage.info, null, true,true, true);
        SdkUitl.loadVideoRewardAd();
      });
    });
  }



  public hidePage(name: string, cb?: Function) {
    if (this.dictPanelMap.has(name)) {
      const panel = this.dictPanelMap.get(name);
      if (panel.parent && panel.parent.active) {
        panel.parent.active = false;
      }
      panel.removeSelf();

      const comp = panel.getComponent(PanelBase);
      if (comp && comp['hide']) {
        comp['hide'].apply(comp);
      }

      if (cb) {
        cb();
      }
    }
  }

  public showPage(name: string, cb?: Function, ...args: any[]) {
    if (this.dictPanelMap.has(name)) {
      const panel = this.dictPanelMap.get(name);
      const comp = panel.getComponent(PanelBase);
      const parent = this.getParent(comp.type);
      parent.addChild(panel);
      parent.active = true;
      if (comp && comp['show']) {
        comp['show'].apply(comp, args);
      }
      cb && cb();
      return;
    }
    let prefab = this.getPrefab(name);
    let panel = prefab.create() as Laya.Image;
    this.dictPanelMap.set(name, panel);
    const comp = panel.getComponent(PanelBase);
    const parent = this.getParent(comp.type);
    parent.active = true;
    parent.addChild(panel);

    if (comp && comp['show']) {
      comp['show'].apply(comp, args);
    }

    cb && cb();
  }

  public hideAll() {
    this.dictPanelMap.forEach((panel: Laya.Image) => {
      const comp = panel.getComponent(PanelBase);
      if (comp && comp.isVisible) {
        this.hidePage(panel.name);
      }
    })
  }

  private getParent(type) {
    switch (type) {
      case UITYpes.PANEL:
        return this._panelLayer;
      case UITYpes.POPUP:
        return this._popupLayer;
      case UITYpes.TIP:
        return this._tipLayer;
      case UITYpes.EFFECT:
        return this._effectLayer;
    }
  }

  private getPrefab(name: string) {
    switch (name) {
      case Constants.UIPage.home:
        return this.homePage;
      case Constants.UIPage.playing:
        return this.playingPage;
      case Constants.UIPage.relife:
        return this.relifePage;
      case Constants.UIPage.result:
        return this.resultPage;
      case Constants.UIPage.loading:
        return this.loadingPage
      case Constants.UIPage.shop:
        return this.shopPage;
      case Constants.UIPage.info:
        return this.infoPage;
      case Constants.UIPage.setting:
        return this.settingPage;
      case Constants.UIPage.coinEffect:
        return this.coinEffectPage;
    }
  }

  public getCoinPrefab(){
    return this.coin;
  }


}