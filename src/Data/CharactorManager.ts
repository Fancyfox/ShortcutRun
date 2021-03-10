export class CharactorManager {
    static _instance:CharactorManager=null;
    public static instance(){
        if(!this._instance){
            this._instance=new CharactorManager();
        }
        return this._instance;
    }

    
}