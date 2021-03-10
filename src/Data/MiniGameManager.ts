import EventManager from "../script/Singleton/EventManager";
import GameData from "../script/Singleton/GameData";
import GameDefine, { CharacterState, EventName, GameState } from "../script/Singleton/GameDefine";
import { Constants } from "./Constants"


export class MiniGameManager {
    static _instance: MiniGameManager = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new MiniGameManager();
        }

        return this._instance;
    }




    public StartGame() {
        GameDefine.gameState = GameState.Playing;
        EventManager.dispatchEvent(EventName.MINI_GAME_START)
    }

    public EndGame(){
        GameDefine.gameState=GameState.End;
        EventManager.dispatchEvent(EventName.MINI_GAME_END)

    }


}