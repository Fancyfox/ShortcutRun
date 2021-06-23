import EventManager from "../script/Singleton/EventManager";
import GameData from "../script/Singleton/GameData";
import { EventName } from "../script/Singleton/GameDefine";
import Obj from "./Obj";

export default class Arrival extends Obj {
    private _arrival: Laya.Sprite3D;
    private _boom:Laya.Sprite3D;

    onAwake() {
        super.onAwake();
        this._arrival = this.owner as Laya.Sprite3D;
        this._boom = this._arrival.getChildByName("boom") as Laya.Sprite3D;

        EventManager.register(EventName.MINI_GAME_END,this._showBoom,this);
    }

    onDestroy(){
        EventManager.unRegister(EventName.MINI_GAME_END,this._showBoom,this);
    }

    init(data) {
        super.init(data);
        this.setArrivalPosArray();
        this._hideBoom();
    }

    setArrivalPosArray() {
        GameData.arrival_pos_array.length = 0;
        let pos_arr = [];
        let pos_1 = this._arrival.transform.position.clone();
        let pos_2 = new Laya.Vector3(pos_1.x - 2, pos_1.y, pos_1.z);
        pos_arr.push(pos_2);
        let pos_3 = new Laya.Vector3(pos_1.x + 2, pos_1.y, pos_1.z);
        pos_arr.push(pos_3);
        let pos_4 = new Laya.Vector3(pos_1.x, pos_1.y, pos_1.z + 2);
        pos_arr.push(pos_4);
        let pos_5 = new Laya.Vector3(pos_1.x, pos_1.y, pos_1.z - 2);
        pos_arr.push(pos_5);
        pos_arr.push(pos_1);
        GameData.arrival_pos_array = pos_arr;
    }

    private _hideBoom(){
        if(this._boom.active){
            this._boom.active = false;
         }
    }

    private _showBoom(){
        if(!this._boom.active){
           this._boom.active = true;
        }
    }

}