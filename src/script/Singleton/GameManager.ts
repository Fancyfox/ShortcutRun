import Camera from "../../Entity/Camera";
import Obj from "../../Entity/Obj";
import Player from "../../Entity/Player";
import Box3 from "../Extensions/Box3";
import AudioManager from "./AudioManager";
import CannonManager from "./CannonManager";
import EffectUtil from "./EffectUtil";
import ES from "./ES";
import GameData from "./GameData";
import GameDefine, { GameState } from "./GameDefine";
import Handler = Laya.Handler;
import Vector3 = Laya.Vector3;
import Quaternion = Laya.Quaternion;

export default class GameManager {
    static _instance: GameManager = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }
    /**3d场景 */
    private scene_3d: Laya.Scene3D;
    /**2dUI场景 */
    private scene_2d: Laya.Scene;
    private camera: Laya.Camera;

    /**Map AABB */
    public mapBox: Box3 = new Box3();
    /**地形模型 */
    public map: Laya.Sprite3D;
    /**当前关卡数据 */
    public data: any;
    public entitys = {};

    public isGameReady: boolean = false


    /**
      * 设置UI场景
      * @param scene UI场景
      */
    public setUIScene(scene: Laya.Scene): void {
        this.scene_2d = scene;
    }

    public loadLevel(level: number) {
        return new Promise(resolve => {
            Promise.all([
                this.loadScene3D(GameDefine.scenePath),
                this.loadConfig(level),
                this.loadSounds(),

            ]).then(ret => {
                this.data = ret[1];
                this.data.objs.sort((a, b) => a.transform[14] - b.transform[14]);
                this.camera = this.scene_3d.getChildByName("Main Camera") as Laya.Camera;
                // GameData.camera.addComponent(Camera);
                this.camera.addComponent(Camera);
                this.camera.enableHDR = false;
                this.map = new Laya.Sprite3D("Map", true);
                this.map.transform.position = Vector3.zero;
                this.map.transform.setWorldLossyScale(Vector3.one);
                this.map.transform.rotation = Quaternion.DEFAULT;
                this.scene_3d.addChild(this.map);
                Laya.stage.getChildByName("root").addChildAt(this.scene_3d, 0);
                console.log(Laya.stage, "root");
                GameData.scene3d = this.scene_3d;
                GameData.map = this.map;
                CannonManager.instance.enableCannonWorld();
            }).then(() => {
                this.init().then(resolve);
            })
        })
    }

    /**
     * 加载3d场景
     * @param path 路径
     */
    private loadScene3D(path: string) {
        return new Promise(resolve => {
            Laya.loader.create(path, Laya.Handler.create(this, () => {
                this.scene_3d = Laya.loader.getRes(path);
                resolve(this.scene_3d);
            }));
        })

    }

    /**
     * 加载关卡配置
     * @param level 关卡
     */
    private loadConfig(level: number) {
        let fn = GameDefine.levelRoot + 'Lv_' + level + '.json';
        return new Promise(resolve => {
            let t1 = new Date().getTime();
            let ret = Laya.loader.load(fn, Handler.create(null, d => {
                console.log('load:', fn, new Date().getTime() - t1, 'ms');
                resolve(d);
            }), null, Laya.Loader.JSON);
            ret.once(Laya.Event.ERROR, null, url => {
                console.log('load config error!', url, 'return home page');
                //ES.instance.event(ES.on_clear_scene);
                // Laya.Scene.closeAll();
                // Laya.Dialog.closeAll();
                // Laya.Scene.open('Home.scene', true);
            });
        });
    }

    /**
     * 预加载音效
     */
    private loadSounds() {
        return new Promise(resolve => {
            let arr = [];
            for (let i = 0; i < GameDefine.sounds.length; i++) {
                let name = GameDefine.sounds[i];
                arr.push(new Promise<void>(resolve2 => {
                    Laya.loader.create(GameDefine.soundPath + name, Handler.create(null, () => {
                        resolve2();
                    }))
                }))
            }
            Promise.all(arr).then(() => {
                Laya.timer.frameOnce(1, null, resolve);
            })
        })
    }

    /**
* 场景和配置加载完成之后生成地面等
*/
    private init() {
        return new Promise(resolve => {
            // 生成模型
            this.mapBox.makeEmpty();

            this.loadPrefabs().then(() => {

                let pa = [
                    this.loadObjs(),
                    // this.loadSkyMat(this.levelIndex)
                ];

                Promise.all(pa).then(() => {
                    //  this.EnableShadow = this.enableShadow;
                    // 预编译Shader
                    this.compileShaders();
                    this.onGameReady();

                });


            });
        });
    }
    private onGameReady() {

        console.log("ongameReady+++++++++++++++++++");
        if (!this.isGameReady) {
            this.isGameReady = true;
        } else {


        }
        // Camera.instance.initCamera();
        ES.instance.on(ES.on_clear_scene, this, this.clearScene);
        //  Home.instance.showHomeUI();
        //   ES.instance.event(ES.on_level_loaded);
        //  ES.instance.on(ES.on_clear_scene, this, this.clearScene);

        //Log.log('collides', CannonManager.instance.world.bodies.length);
        //Log.log('constraints', CannonManager.instance.world.constraints.length);

    }

    private compileShaders() {

        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'UV1', 'SHADOWMAP_PSSM1', 'CASTSHADOW', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'SHADOWMAP_PSSM1', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'SHADOWMAP_PSSM1', 'CASTSHADOW', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['DIRECTIONLIGHT', 'UV', 'UV1', 'SHADOWMAP_PSSM1', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['DIRECTIONLIGHT', 'UV', 'COLOR', 'SHADOWMAP_PSSM1', 'CASTSHADOW', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'COLOR', 'SHADOWMAP_PSSM1', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['DIRECTIONLIGHT', 'UV', 'COLOR', 'SHADOWMAP_PSSM1', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'UV1', 'SHADOWMAP_PSSM1', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'COLOR', 'FOG']);
        Laya.Shader3D.compileShaderByDefineNames('PARTICLESHURIKEN', 0, 0, ['DIFFUSEMAP', 'FOG', 'ADDTIVEFOG', 'STRETCHEDBILLBOARD', 'COLOROVERLIFETIME', 'SIZEOVERLIFETIMECURVE', 'SHAPE', 'TINTCOLOR']);
        Laya.Shader3D.compileShaderByDefineNames('PARTICLESHURIKEN', 0, 0, ['DIFFUSEMAP', 'FOG', 'SPHERHBILLBOARD', 'COLOROVERLIFETIME', 'ROTATIONOVERLIFETIMERANDOMCONSTANTS', 'SIZEOVERLIFETIMECURVE', 'ROTATIONOVERLIFETIME', 'TEXTURESHEETANIMATIONCURVE', 'SHAPE', 'TINTCOLOR']);
        Laya.Shader3D.compileShaderByDefineNames('PARTICLESHURIKEN', 0, 0, ['DIFFUSEMAP', 'FOG', 'SPHERHBILLBOARD', 'ROTATIONOVERLIFETIMERANDOMCONSTANTS', 'SIZEOVERLIFETIMECURVE', 'ROTATIONOVERLIFETIMESEPERATE', 'SHAPE', 'TINTCOLOR']);
        Laya.Shader3D.compileShaderByDefineNames('PARTICLESHURIKEN', 0, 0, ['DIFFUSEMAP', 'FOG', 'SPHERHBILLBOARD', 'COLOROVERLIFETIME', 'ROTATIONOVERLIFETIMERANDOMCONSTANTS', 'SIZEOVERLIFETIMECURVE', 'ROTATIONOVERLIFETIME', 'SHAPE', 'TINTCOLOR']);
        Laya.Shader3D.compileShaderByDefineNames('PARTICLESHURIKEN', 0, 0, ['DIFFUSEMAP', 'FOG', 'ADDTIVEFOG', 'SPHERHBILLBOARD', 'COLOROVERLIFETIME', 'ROTATIONOVERLIFETIMERANDOMCONSTANTS', 'SIZEOVERLIFETIMECURVE', 'ROTATIONOVERLIFETIME', 'TEXTURESHEETANIMATIONCURVE', 'SHAPE', 'TINTCOLOR']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['DIFFUSEMAP', 'DIRECTIONLIGHT', 'UV', 'SHADOWMAP_PSSM1', 'FOG', 'SHADOWMAP_PCF3']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'UV1', 'FOG']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIRECTIONLIGHT', 'UV', 'FOG']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIFFUSEMAP', 'DIRECTIONLIGHT', 'UV', 'TILINGOFFSET', 'FOG']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['DIRECTIONLIGHT', 'UV', 'UV1', 'RECEIVESHADOW', 'FOG']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['DIFFUSEMAP', 'DIRECTIONLIGHT', 'UV', 'UV1', 'RECEIVESHADOW', 'TILINGOFFSET', 'FOG']);
        Laya.Shader3D.compileShaderByDefineNames('BLINNPHONG', 0, 0, ['GPU_INSTANCE', 'DIFFUSEMAP', 'DIRECTIONLIGHT', 'UV', 'UV1', 'RECEIVESHADOW', 'TILINGOFFSET', 'FOG']);
    }


    /**
     * 预加载资源
     */
    private loadPrefabs() {
        return new Promise(resolve => {
            let arr = [];
            for (let i = 0; i < GameDefine.preload.length; i++) {
                let name = GameDefine.preload[i];
                arr.push(new Promise<void>(resolve2 => {
                    Laya.Sprite3D.load(GameDefine.prefabRoot + name, Handler.create(null, (sp: Laya.Sprite3D) => {
                        this.scene_3d.addChild(sp);
                        sp.transform.position = new Laya.Vector3(0, 0, 0);
                        Laya.timer.frameOnce(1, null, a1 => {
                            this.scene_3d.removeChild(a1);
                            resolve2();
                        }, [sp]);
                    }))
                }))
            }
            Promise.all(arr).then(() => {
                Laya.timer.frameOnce(1, null, resolve);
            })
        })
    }

    /**
   * 加载障碍物
   */
    private loadObjs() {
        return new Promise<void>(resolve => {
            if (this.data.objs) this.data.objs.map(d => {
                let obj = this.loadObj(d);
                this.mapBox.expandByObject(obj.owner as Laya.Sprite3D);
            });
            resolve();
        });
    }

    public loadObj(d: any) {
        let ins = this.entitys[d.id];
        if (ins) return ins;
        let tag = d.tag;
        let url = GameDefine.prefabRoot + tag + '.lh';
        let prefab = Laya.loader.getRes(url);
        let clone = Laya.Sprite3D.instantiate(prefab, this.map);
        switch (d.tag) {
            case "character_base":
                ins = clone.addComponent(Player);
                console.log(d, "ddd");
                ins.initScene3d(this.scene_3d);
                break;
            default:
                ins = clone.addComponent(Obj);
                break;
        }
        ins.init(d);
        this.entitys[d.id] = ins;

        return ins;
    }

    /**
   * 清理场景 释放资源
   */
    private clearScene() {
        //LoadLevel.instance.showLoadLevelUI();
        Laya.timer.clearAll(this);
        Laya.timer.clearAll(null);
        EffectUtil.instance.clear();
        CannonManager.instance.clear();
        this.data = null;
        GameData.scene3d.removeSelf();
        GameData.scene3d.destroy();
        GameData.scene3d = null;
        this.entitys = {};
        ES.instance.offAll();
        Laya.stage.offAll();
        Laya.Resource.destroyUnusedResources();
        GameDefine.gameState = GameState.None;
    }
}