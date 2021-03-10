import { Configuration } from "../../Data/Configuration";
import { Constants } from "../../Data/Constants";
import GameManager from "../Singleton/GameManager";

export default class GamePage extends Laya.Script{
  onAwake(){
    let level=this.loadLevelFromCache();
    GameManager.instance().loadLevel(level);
  }

  private loadLevelFromCache(){
    const level= Configuration.instance().getConfigData(Constants.LevelTick);
    let scene_level:number
    if(level){
        scene_level =JSON.parse(level);
    }else{
        scene_level=1;
    }
    return scene_level;
  }
}