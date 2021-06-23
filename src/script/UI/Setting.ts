import { Constants } from "../../Data/Constants";
import GamePage from "../Pages/GamePage";
import AudioManager from "../Singleton/AudioManager";
import { PanelBase, UITYpes } from "./PanelBase";

export default class Setting extends PanelBase {
    public static instance: Setting = null;
    public type: UITYpes = UITYpes.PANEL;

    private _setting: Laya.Image;
    private _uiBox: Laya.Box;
    private _closeBtn: Laya.Button;
    private _vibrateToggle: Laya.Button;
    private _audioToggle: Laya.Button;


    constructor() {
        super();
        Setting.instance = this;
    }

    onAwake() {
        this._setting = this.owner as Laya.Image;
        this._uiBox = this._setting.getChildAt(0) as Laya.Box;
        this._closeBtn = this._uiBox.getChildByName("CloseBtn") as Laya.Button;
        this._vibrateToggle = this._uiBox.getChildByName("Vibrate").getChildByName("VibrateToggle") as Laya.Button;
        this._audioToggle = this._uiBox.getChildByName("Audio").getChildByName("AudioToggle") as Laya.Button;

        this._closeBtn.on(Laya.Event.CLICK, this, this.onCloseBtnClick);
        this._vibrateToggle.on(Laya.Event.CLICK, this, this.onVibrateToggleClick);
        this._audioToggle.on(Laya.Event.CLICK, this, this.onAudioToggleClick);
    }

    onStart() {
        
    }

    show() {
        super.show();
        this._refreshSettingUI();
        
    }

    hide() {
        super.hide();
    }

    private _refreshSettingUI() {
        if (AudioManager.instance().getVibrate()) {
            this._vibrateToggle.skin = "textures/toggle_on.png"
        } else {
            this._vibrateToggle.skin = "textures/toggle_off.png"
        }

        if (AudioManager.instance().getAudioMute()) {
            this._audioToggle.skin = "textures/toggle_off.png";
        } else {
            this._audioToggle.skin = "textures/toggle_on.png";
        }
    }

    onVibrateToggleClick() {
        AudioManager.instance().playEffect("Click");
        AudioManager.instance().setVibrate(!AudioManager.instance().getVibrate());
        this._refreshSettingUI();
    }

    onAudioToggleClick() {
        AudioManager.instance().setAudioMute(!AudioManager.instance().getAudioMute())
        AudioManager.instance().playEffect("Click");
        this._refreshSettingUI();
    }

    onCloseBtnClick() {
        AudioManager.instance().playEffect("Click");
        //GamePage.instance.hideAll();
        GamePage.instance.hidePage(Constants.UIPage.setting, () => {
            //GamePage.instance.showPage(Constants.UIPage.home);
        });


    }
}