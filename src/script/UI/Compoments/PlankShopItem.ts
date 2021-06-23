import { StaticDataManager } from "../../../Tmpl/StaticDataManager";
import Graphics from "../../Extensions/Graphics";
import { ShopManager } from "../../Singleton/ShopManager";

export default class PlankShopItem extends Laya.Script {
    private _backBtn: Laya.Button;
    private _icon: Laya.Image;
    private _lock: Laya.Text;
    private _check: Laya.Sprite;
    

    private _id:string;
    private _unlock:boolean = false

    onAwake() {
        this._backBtn = this.owner as Laya.Button;
        this._icon = this._backBtn.getChildByName("icon") as Laya.Image;
        this._lock = this._backBtn.getChildByName("lock") as Laya.Text;
        this._check = this._backBtn.getChildByName("check") as Laya.Sprite;
 
        if(this._id){
           this._refreshItem(this._id);
        }
        
    }

    onStart(){
        
    }

    setData(id) {
        if (!id) {
            return;
        }

        this._id = id;

        if(this._backBtn){
            this._refreshItem(id);
        }
      
       
    }

    private _refreshItem(id: string) {
        this._backBtn.on(Laya.Event.CLICK,this,this._chooseSkin)
        let tmpl = StaticDataManager.getPlanksRecord(id);
        this._unlock = ShopManager.instance().hasUnlock(id);
        if (this._unlock) {
            this._lock.visible = false;
            if (ShopManager.instance().getChoosePlankID() == id) {
                this._backBtn.skin = "textures/grid_green.png";
                this._check.visible = true;
            } else {
                this._backBtn.skin = "textures/grid_blue.png";
                this._check.visible = false;
            }
            let spriteName = tmpl.SpriteName;
            let url = `planks/${spriteName}.png`;
            this._icon.skin = url;
            this._icon.visible = true;
            
            return;
        }

        this._backBtn.skin = "textures/grid_grey.png";
        this._icon.visible = false;
        this._check.visible = false;
        this._lock.visible = true;
    }

    private _chooseSkin(){
        console.log("choose skin",this._id);
        
        if(this._unlock){
            ShopManager.instance().choosePlank(this._id);
        }else{
            return;
        }
    }
}