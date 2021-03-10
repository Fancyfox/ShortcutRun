import WeChatManager from "../../Util/WeChatManager";

export default class LoadingPage extends Laya.Script {
    private uiBox: Laya.Box;
    private progress: Laya.ProgressBar;
    private _isSubload: boolean = false;
    private _enterGame: boolean = false;

    onAwake() {
        this.uiBox = this.owner.getChildAt(0) as Laya.Box;
        this.progress = this.uiBox.getChildByName("ProgressBar") as Laya.ProgressBar;
    }

    onStart() {
        console.log("onStart");

        this.progress.value = 0;
        this.loadSubPackages();
    }

    onUpdate() {
        if (Laya.timer.delta > 100) return;
        if (this._enterGame) return;
        if (this.progress.value <= 0.9) {
            this.progress.value += Laya.timer.delta / 1000 * 0.3;
        } else {
            if (this._isSubload) {
                this.progress.value += Laya.timer.delta / 1000 * 0.1;
            }

            if (this.progress.value >= 1) {
                this.enterGame();
            }
        }

    }


    private loadSubPackages() {
        let p1 = new Promise<void>(reslove => {
            WeChatManager.LoadSubpackage("sub1", () => {
                reslove();
            });
        })

        let p2 = new Promise<void>(reslove => {
            WeChatManager.LoadSubpackage("sub2", () => {
                reslove();
            })
        })

        Promise.all([p1, p2]).then(() => {
            if (!this._isSubload) {
                Laya.Scene.open("Scenes/Game.scene", false);
                this._isSubload = true;
            }
        })

    }

    private enterGame() {
        if (!this._enterGame) {
            console.log("enter game!");
            Laya.Scene.close("Scenes/Start.scene")
            this._enterGame = true;
        }
    }


}