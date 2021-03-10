import { Constants } from "./Constants";




export class Configuration {
    private _jsonData = {};
    private _markSave = false;

    static _instance: Configuration = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new Configuration();
        }

        return this._instance;
    }

    public init() {
        const localStorage = Laya.LocalStorage.getJSON(Constants.GameConfigID);
        if (localStorage) {
            this._jsonData = JSON.parse(localStorage);
        }

        setInterval(this._scheduleSave.bind(this), 500);
    }

    public getConfigData(key: string) {
        const data = this._jsonData[key];
        return data || '';
    }

    public setConfigData(key: string, value: string) {
        this._jsonData[key] = value;
        this._markSave = true;
    }

    private _scheduleSave() {
        if (!this._markSave) {
            return;
        }

        const data = JSON.stringify(this._jsonData);
        Laya.LocalStorage.setJSON(Constants.GameConfigID, data)
        this._markSave = false;
    }
}