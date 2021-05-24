import { Configuration } from "../../Data/Configuration";
import { Constants } from "../../Data/Constants";
import AudioManager from "../Singleton/AudioManager";
import GameManager from "../Singleton/GameManager";
import { PanelBase, UITYpes } from "../UI/PanelBase";



export default class GamePage extends Laya.Script {
  public static instance: GamePage = null;

  private _panelLayer: Laya.Box;
  private _popupLayer: Laya.Box;
  private _tipLayer: Laya.Box;

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

  private dictPanelMap = new Map<string, Laya.Image>();

  constructor() {
    super();
    GamePage.instance = this;
  }

  onAwake() {

    AudioManager.instance().loadFromCache();
    this._panelLayer = this.owner.getChildByName("PanelLayer") as Laya.Box;
    this._popupLayer = this.owner.getChildByName("PopupLayer") as Laya.Box;
    this._tipLayer = this.owner.getChildByName("TipLayer") as Laya.Box;

  }

  onStart() {
    let level = this.loadLevelFromCache();
    this.showPage(Constants.UIPage.loading);
    GameManager.instance().loadLevel(level).then(() => {
      this.hidePage(Constants.UIPage.loading, () => {
        this.showPage(Constants.UIPage.home, null);
      });
      console.log("init scene");

    });
  }

  private loadLevelFromCache() {
    const level = Configuration.instance().getConfigData(Constants.LevelTick);
    let scene_level: number
    if (level) {
      scene_level = JSON.parse(level);
    } else {
      scene_level = 1;
    }
    return scene_level;
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
      parent.active = true;
      parent.addChild(panel);
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
    }
  }


}