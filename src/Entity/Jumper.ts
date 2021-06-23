import AudioManager from "../script/Singleton/AudioManager";
import Obj from "./Obj";

export default class Jumper extends Obj {
private _jumper:Laya.Sprite3D;
private _arrow:Laya.Sprite3D;
private _jumperAnimater:Laya.Animator;

onAwake(){
    super.onAwake();
    this._jumper = this.owner as Laya.Sprite3D;
    this._arrow = this._jumper.getChildByName("arrow") as Laya.Sprite3D;
    this._jumperAnimater = this._jumper.getChildByName("jumper.001").getChildAt(0).getComponent(Laya.Animator);
}


public playJumpAni(){
    this._jumperAnimater.play();
    AudioManager.instance().playEffect("Jumper");
}
}