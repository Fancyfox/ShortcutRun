import { PanelBase, UITYpes } from "../UI/PanelBase";




export class UIManager {
    static _dictPanel = new Map<string, Laya.Sprite>();
    static _isLoading: boolean = false;

    public static showPanel(name: string, cb?: Function, ...args: any[]) {

        if (this._dictPanel.has(name)) {
            const panel = this._dictPanel.get(name);
            const comp = panel.getComponent(PanelBase);
            const parent = this.GetParent(comp.type);

            parent.active = true;
            parent.addChild(panel);

            if (comp && comp['show']) {
                comp['show'].apply(comp, args);
            }

            if (cb) {
                cb();
            }

            return;
        }

        if (name == "messageUI") {
            const path = `Prefabs/${name}.prefab`;
            Laya.loader.create(path, Laya.Handler.create(this, () => {
                let prefab = Laya.loader.getRes(path) as Laya.Prefab;
                const panel = prefab.create();
                this._dictPanel.set(name, panel);
                const comp = panel.getComponent(PanelBase);
                const parent = this.GetParent(comp.type);
                parent.active = true;
                parent.addChild(panel);

                if (comp && comp['show']) {
                    comp['show'].apply(comp, args);
                }

                if (cb) {
                    cb();
                }
            }));

            return;
        }

        this.showLoadUI(() => {
            const path = `ui/${name}`;
            cc.resources.preload(path, cc.Asset, null, function (error, items) {
                if (error) {
                    cc.error(error);
                    WXUtil.showToast("资源加载失败")
                    this.hideLoadUI(() => {
                        TutorialManager.instance().setCanShowTutorial(true);
                    });
                    return;
                }
                cc.resources.load(path, cc.Prefab, (err: any, prefab: cc.Prefab) => {
                    if (err) {
                        console.log(err);
                        WXUtil.showToast("资源加载失败")
                        this.hideLoadUI(() => {
                            TutorialManager.instance().setCanShowTutorial(true);
                        });
                        return;
                    }

                    const panel = cc.instantiate(prefab) as cc.Node;
                    this._dictPanel.set(name, panel);
                    const comp = panel.getComponent(PanelBase);
                    const parent = this.GetParent(comp.type);
                    parent.active = true;
                    panel.parent = parent;

                    if (comp && comp['show']) {
                        comp['show'].apply(comp, args);
                    }

                    if (cb) {
                        cb();
                    }


                    this.hideLoadUI(() => {
                        TutorialManager.instance().setCanShowTutorial(true);
                    });
                });

            }.bind(this));
        }


        );




    }

    public static hidePanel(name: string, cb?: Function) {
        if (this._dictPanel.has(name)) {
            const panel = this._dictPanel.get(name);
            if (panel.parent && panel.parent.active) {
                panel.parent.active = false;
            }
            panel.removeFromParent(false);

            const comp = panel.getComponent(PanelBase);
            if (comp && comp['hide']) {
                comp['hide'].apply(comp);
            }

            if (cb) {
                cb();
            }
        }
    }

    public static preLoadPanel(name: string) {
        if (!this._dictPanel.has(name)) {
            const path = `ui/${name}`;
            cc.resources.preload(path, cc.Asset, null, function (error, items) {
                if (error) {
                    cc.error(error);
                    return;
                }
            }.bind(this));
        }

    }

    static GetParent(type: UITYpes) {
        switch (type) {
           case UITYpes.PANEL:
                return Laya.stage.find("Canvas/PanelLayer");
            case UITYpes.POPUP:
                return Laya.stage.find("Canvas/PopupLayer");
            case UITYpes.TIP:
                return Laya.stage.find("Canvas/TipLayer");
            case UITYpes.TUTORIAL:
                return Laya.stage.find("Canvas/TutorialLayer");
        }
    }

    static hideAll() {
        this._dictPanel.forEach((panelNode: cc.Node) => {
            const comp = panelNode.getComponent(PanelBase);
            if (comp && comp.isVisible) {
                UIManager.hidePanel(panelNode.name);
            }
        })
    }



    static showLoadUI(cb?: Function) {
        if (this._isLoading) {
            return;
        }

        let name = "loadUI";
        if (this._dictPanel.has(name)) {
            const panel = this._dictPanel.get(name);
            const comp = panel.getComponent(PanelBase);
            const parent = this.GetParent(comp.type);

            parent.active = true;
            panel.parent = parent;

            if (comp && comp['show']) {
                comp['show'].apply(comp);
            }

            if (cb) {
                cb();
            }

            return;
        }
        this._isLoading = true;
        const path = `ui/${name}`;
        cc.resources.load(path, cc.Prefab, (err: any, prefab: cc.Prefab) => {
            this._isLoading = false;
            if (err) {
                console.log(err);
                return;
            }

            const panel = cc.instantiate(prefab) as cc.Node;
            this._dictPanel.set(name, panel);
            const comp = panel.getComponent(PanelBase);
            const parent = this.GetParent(comp.type);
            parent.active = true;
            panel.parent = parent;

            if (comp && comp['show']) {
                comp['show'].apply(comp);
            }

            if (cb) {
                cb();
            }
        });
    }


    static hideLoadUI(cb?: Function) {
        this.hidePanel("loadUI", cb);
    }
}