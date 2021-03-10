import { Configuration } from "../../Data/Configuration";
import { Constants } from "../../Data/Constants";
import { SdkUitl } from "../../Util/SdkUitl";


export interface IAudioInfo {
    musicMute: boolean,
    effectMute: boolean,
    musicVolume: number,
    effectVolume: number
}

export default class AudioManager {
    static _instance: AudioManager = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new AudioManager();
        }

        return this._instance;
    }
    public audioInfo: IAudioInfo = null;




    public getAudioData() {
        return this.audioInfo;
    }

    public loadFromCache() {
        const audioInfo = Configuration.instance().getConfigData(Constants.AudioConfigID);
        if (audioInfo) {
            this.audioInfo = JSON.parse(audioInfo);
        } else {
            this._generateAudio();
        }
        console.log("loadFromCache");
        
    }

    public saveAudioInfoToCache() {
        const data = JSON.stringify(this.audioInfo);
        Configuration.instance().setConfigData(Constants.AudioConfigID, data);
    }

    private _generateAudio() {
        this.audioInfo = {
            musicMute: false,
            effectMute: false,
            musicVolume: 0.5,
            effectVolume: 0.5
        }
        this.saveAudioInfoToCache();
    }

    public playMusic(name: string) {
        if (this.audioInfo && !this.audioInfo.musicMute) {
            SdkUitl.playMusic(name, true);
        }

    }

    public resumeMusic() {
        if (this.audioInfo && !this.audioInfo.musicMute) {
            // if (!cc.audioEngine.isMusicPlaying()) {
            //     cc.audioEngine.resumeMusic();
            // }
        }
    }

    public pasueMusic() {
        if (this.audioInfo && !this.audioInfo.musicMute) {
            // if (cc.audioEngine.isMusicPlaying()) {
            //     cc.audioEngine.pauseMusic();
            // }
        }
    }

    public stopMusic() {


    }

    public setMusicVolume(volume: number) {


    }

    public playEffect(name: string) {
        if (this.audioInfo && !this.audioInfo.effectMute) {
            const path = `subPackage/sub2/Audio/Effect/${name}.mp3`;
            console.log(path,"path");
            
            Laya.SoundManager.playSound(path);
        }

    }

    public stopAllEffects() {
        //cc.audioEngine.stopAllEffects();
    }

    public setEffectVolume(volume: number) {
        // if (this.audioInfo) {
        //     this.audioInfo.effectVolume = volume;
        //     cc.audioEngine.setEffectsVolume(this.audioInfo.effectVolume);
        // }

    }
}