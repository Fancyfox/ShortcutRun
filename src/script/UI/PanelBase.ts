export enum UITYpes {
    PANEL,
    POPUP,
    TIP,
    TUTORIAL
}

export class PanelBase extends Laya.Script {
    public type: UITYpes = UITYpes.PANEL;
    public isVisible: boolean = false;
    public onShowEnd: Function = null;

    public show(...args: any[]) {
        this.isVisible = true;
        switch (this.type) {
            case UITYpes.PANEL:
            case UITYpes.POPUP:
                let panel: Laya.Image = this.owner as Laya.Image;
                panel.scaleX = 0.8;
                panel.scaleY = 0.8;
                Laya.Tween.to(panel, { scaleX: 1.1, scaleY: 1.1 }, 0.2, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(panel, { scaleX: 1, scaleY: 1 }, 0.1, null, Laya.Handler.create(this, () => {
                        if (this.onShowEnd) {
                            this.onShowEnd();
                        }
                    }))
                }));
                break;
        }
    };

    public hide() {
        this.isVisible = false;
    };
}