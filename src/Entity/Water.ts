import EventManager from "../script/Singleton/EventManager";
import GameData from "../script/Singleton/GameData";
import { EventName } from "../script/Singleton/GameDefine";
import Obj from "./Obj";

export default class Water extends Obj {
    private _water: Laya.MeshSprite3D;
    private _mat: Laya.UnlitMaterial;

    onAwake() {
        super.onAwake();
        this._water = this.owner as Laya.MeshSprite3D;
        this._mat = this._water.meshRenderer.material as Laya.UnlitMaterial;

        EventManager.register(EventName.CHANGE_WATER,this.SetWaterTexture,this);
    }

    onDestroy(){
        EventManager.unRegister(EventName.CHANGE_WATER,this.SetWaterTexture,this);
    }

    init(data:any) {
        super.init(data);
    }

    onUpdate() {
        if (Laya.timer.delta >= 100) {
            return;
        }



        this.WaterFloat();
    }

    private WaterFloat() {
        if (!this._mat) {
            return;
        }
        let uv_y = this._mat.tilingOffsetY;
        let uv_x = this._mat.tilingOffsetX;
        let timer = Laya.timer.delta/1000;

        this._mat.tilingOffsetY += 0.01*0.02 * (Math.sin(uv_x * 3.5 + timer * 0.35) + Math.sin(uv_x * 4.8 + timer * 1.05) + Math.sin(uv_x * 7.3 + timer * 0.45)) / 3.0;
        this._mat.tilingOffsetX += 0.12*0.02 * (Math.sin(uv_y * 4.0 + timer * 0.5) + Math.sin(uv_y * 6.8 + timer * 0.75) + Math.sin(uv_y * 11.3 + timer * 0.2)) / 3.0;
        this._mat.tilingOffsetY += 0.12*0.02 * (Math.sin(uv_x * 4.2 + timer * 0.64) + Math.sin(uv_x * 6.3 + timer * 1.65) + Math.sin(uv_x * 8.2 + timer * 0.45)) / 3.0;
    }

    public SetWaterTexture(index){
       this._mat.albedoTexture = GameData.waterTex_map.get(index.toString());
      }
}