import { Constants } from "../../Data/Constants";
import GamePage from "../Pages/GamePage";
import EventManager from "../Singleton/EventManager";
import { EventName } from "../Singleton/GameDefine";
import { PanelBase, UITYpes } from "./PanelBase";

export default class Playing extends PanelBase {
    public static instance: Playing = null;
    private _playing: Laya.Image;
    private _uiBox: Laya.Box;
    private _moveArrow: Laya.Animation;
    public type: UITYpes = UITYpes.PANEL;


    constructor() {
        super();
        Playing.instance = this;
    }

    onAwake() {
        this._playing = this.owner as Laya.Image;
        this._uiBox = this._playing.getChildAt(0) as Laya.Box;
        this._moveArrow = this._uiBox.getChildByName("MoveArrow") as Laya.Animation;

    }

    onEnable() {
        this._uiBox.on(Laya.Event.MOUSE_DOWN, this, this.hideMoveArrow.bind(this));
        EventManager.register(EventName.MINI_GAME_RELIFE, this.showRelifeUI, this);
        EventManager.register(EventName.MINI_GAME_DIE, this.showDieUI, this);
        EventManager.register(EventName.MINI_GAME_END, this.showResultUI, this);
    }

    onDisable() {
        this._uiBox.offAll();
        EventManager.unRegister(EventName.MINI_GAME_RELIFE, this.showRelifeUI, this);
        EventManager.unRegister(EventName.MINI_GAME_DIE, this.showDieUI, this);
        EventManager.unRegister(EventName.MINI_GAME_END, this.showResultUI, this);
    }

    show(...args: any[]) {
        super.show();
        this.showMoveArrow();
    }

    hide() {
        super.hide();
        this.hideMoveArrow();
    }



    private showMoveArrow() {
        this._moveArrow.x = this._uiBox.width / 2;
        this._moveArrow.y = this._uiBox.height / 3 * 2;
        this._moveArrow.visible = true;
    }


    private hideMoveArrow() {
        if (this._moveArrow.visible) {
            this._moveArrow.visible = false;
        }
    }

    showRelifeUI() {
        GamePage.instance.hidePage(Constants.UIPage.playing, () => {
            GamePage.instance.showPage(Constants.UIPage.relife, null, 0)
        });
    }

    showDieUI() {
        GamePage.instance.hidePage(Constants.UIPage.playing, () => {
            GamePage.instance.showPage(Constants.UIPage.relife, null, 1)
        });
    }

    showResultUI() {
        GamePage.instance.hidePage(Constants.UIPage.playing, () => {
            GamePage.instance.showPage(Constants.UIPage.result)
            GamePage.instance.showPage(Constants.UIPage.info, null, true, true,false, true);
        });
    }


}