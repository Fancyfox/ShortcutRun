export default class BtnComp extends Laya.Script{
    private _btn:Laya.Button;



    onAwake(){
        this._btn = this.owner as Laya.Button;
        //this._btn.on(Laya.Event.CLICK,this,thi)
    }




}