import EventManager from "../script/Singleton/EventManager";
import GameDefine, { EventName, GameState } from "../script/Singleton/GameDefine";

export default class Camera extends Laya.Script3D {
  public static instance: Camera = null;
  private _camera: Laya.Camera;
  private _target: Laya.Sprite3D;
  private _point: Laya.Sprite3D;
  private _cameraPos: Laya.Vector3;
  private _start_moving: boolean = false;


  constructor() {
    super();
    Camera.instance = this;
  }

  onAwake() {
    this._camera = this.owner as Laya.Camera;
    this._cameraPos = this._camera.transform.position.clone();



  }

  onEnable() {
    //EventManager.register(EventName.MINI_GAME_START, this._cameraPointTween, this);
  }

  onDisable() {
    //EventManager.dispatchEvent(EventName.MINI_GAME_START, this._cameraPointTween, this);
  }

  public initPlayerData(player: Laya.Sprite3D, point: Laya.Sprite3D) {
    this._target = player;
    this._point = point;
    this._start_moving = false;
  }

  onLateUpdate() {
    if (Laya.timer.delta > 100) {
      return;
    }

    if (GameDefine.gameState != GameState.Playing) {
      return;
    }


    this._cameraPointTween(this._point, this._target);
    this._lookAtTarget(this._target, this._point);
  }

  private _lookAtTarget(target: Laya.Sprite3D, point: Laya.Sprite3D) {
    if (!target || !point) {
      return;
    }
    let pos = point.transform.position;
    this._cameraPos.setValue(pos.x, pos.y, pos.z);
    this._camera.transform.position = this._cameraPos;
    this._camera.transform.lookAt(target.transform.position, Laya.Vector3.up);
    //this._camera.
  }

  private _cameraPointTween(point: Laya.Sprite3D, target: Laya.Sprite3D) {
    if (!point || this._start_moving || !target) {
      return;
    }
    this._start_moving = true;
    Laya.Tween.to(point.transform, { localPositionZ: -10, localPositionY: 5 }, 1000, null, Laya.Handler.create(this, () => {
    }))
  }



}