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

    public EndGame() {
        GameDefine.gameState = GameState.End;
        EventManager.dispatchEvent(EventName.MINI_GAME_END)

    }

    public PauseGame() {
        GameDefine.gameState = GameState.Pause;
        EventManager.dispatchEvent(EventName.MINI_GAME_RELIFE);
    }

    public ResumeGame() {
        GameDefine.gameState = GameState.Playing;
    }

    public DieGame() {
        GameDefine.gameState = GameState.Die;
        EventManager.dispatchEvent(EventName.MINI_GAME_DIE);
    }

    public getRewardCoinCount(rank: number) {
        switch (rank) {
            case 1:
                return 900;
            case 2:
                return 500;
            case 3:
                return 120;
            case 4:
                return 15;
        }
    }


}