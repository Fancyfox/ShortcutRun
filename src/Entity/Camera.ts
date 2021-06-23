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
    EventManager.register(EventName.PLAYER_PLANK_CHANGE, this.changeCameraFieldOfView, this);
    EventManager.register(EventName.MINI_GAME_END,this.changeCameraToFinal,this);
  }

  onDisable() {
    EventManager.unRegister(EventName.PLAYER_PLANK_CHANGE, this.changeCameraFieldOfView, this);
    EventManager.unRegister(EventName.MINI_GAME_END,this.changeCameraToFinal,this);
  }

  public initPlayerData(player: Laya.Sprite3D, point: Laya.Sprite3D) {
    this._target = player;
    this._point = point;
    this._start_moving = false;
    this._camera.fieldOfView = 50;
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
    Laya.Tween.clearAll(this._camera);
    Laya.Tween.to(this._camera, { fieldOfView: 40 }, 500, Laya.Ease.linearIn);
    Laya.Tween.to(point.transform, { localPositionZ: -10, localPositionY: 5 }, 1000, null, Laya.Handler.create(this, () => {
    }))

  }

  private changeCameraFieldOfView(count: number) {
    Laya.Tween.clearAll(this._camera);
    let fie = 45 + count / 2;
    if (fie > 80) {
      fie = 80;
    }
    Laya.Tween.to(this._camera, { fieldOfView: fie }, 200, Laya.Ease.linearIn);
  }

  private changeCameraToFinal(){
    Laya.Tween.clearAll(this._camera);
    Laya.Tween.to(this._camera, { fieldOfView: 40 }, 1500, Laya.Ease.linearIn);
  }





}