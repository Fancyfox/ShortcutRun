import { Constants } from "../../Data/Constants";
import { MiniGameManager } from "../../Data/MiniGameManager";
import Arrival from "../../Entity/Arrival";
import Camera from "../../Entity/Camera";
import Enemy from "../../Entity/Enemy";
import Jumper from "../../Entity/Jumper";
import Obj from "../../Entity/Obj";
import Player from "../../Entity/Player";
import Water from "../../Entity/Water";
import Box3 from "../Extensions/Box3";
import GamePage from "../Pages/GamePage";
import AudioManager from "./AudioManager";
import CannonManager from "./CannonManager";
import EffectUtil from "./EffectUtil";
import ES from "./ES";
import EventManager from "./EventManager";
import GameData from "./GameData";
import GameDefine, { EventName, GameState } from "./GameDefine";
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

    private camera: Laya.Camera;

    /**Map AABB */
    public mapBox: Box3 = new Box3();
    /**地形模型 */
    public map: Laya.Sprite3D;
    public road_mat: Laya.BlinnPhongMaterial;
    public water_index = 0;
    public sky_mat: Laya.SkyBoxMaterial;
    /**当前关卡数据 */
    public data: any;
    public entitys = {};

    public isGameReady: boolean = false





    public loadLevel(level: number) {
        GameData.name_array = GameData.RandomName();
        return new Promise<void>(resolve => {
            Promise.all([
                this.loadScene3D(GameDefine.scenePath),
                this.loadConfig(level),
                this.loadSounds(),
                this.loadRoadTextures(),
                this.loadWaterTextures()
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
                GameData.scene3d = this.scene_3d;
                GameData.map = this.map;
                if (this.road_mat) {
                    let index = (level - 1) % 7;
                    if (GameData.roadTex_map.has(index.toString()))
                        this.road_mat.albedoTexture = GameData.roadTex_map.get(index.toString());
                }
                
                if (MiniGameManager.instance().getSceneLevel() > 15 && MiniGameManager.instance().getSceneLevel() < 30) {
                    EventManager.dispatchEvent(EventName.CHANGE_WATER, 0);
                } else if (MiniGameManager.instance().getSceneLevel() >= 30) {
                    EventManager.dispatchEvent(EventName.CHANGE_WATER, 1);
                }
            }).then(() => {
                this.init().then(() => {
                    this.isGameReady = true;
                    console.log("game ready");
                     resolve();
                });
            })
        })
    }

    /**加载皮肤贴图 */
    private loadRoadTextures() {
        return new Promise<void>(resolve => {
            let arr = [];
            for (let i = 0; i < 7; i++) {
                arr.push(new Promise<void>(resolve2 => {
                    Laya.Texture2D.load(GameDefine.roadTexPath + i + ".png", Handler.create(null, (tex: Laya.Texture2D) => {
                        if (!GameData.roadTex_map.has(i.toString())) {
                            GameData.roadTex_map.set(i.toString(), tex)
                        }
                        resolve2();
                    }))
                }));
            }
            Promise.all(arr).then(() => {
                Laya.timer.frameOnce(1, null, () => {
                    resolve();
                });
            })
        })
    }

    /**加载皮肤贴图 */
    private loadWaterTextures() {
        return new Promise<void>(resolve => {
            let arr = [];
            for (let i = 0; i < 2; i++) {
                arr.push(new Promise<void>(resolve2 => {
                    Laya.Texture2D.load(GameDefine.waterTexPath + i + ".png", Handler.create(null, (tex: Laya.Texture2D) => {
                        if (!GameData.waterTex_map.has(i.toString())) {
                            GameData.waterTex_map.set(i.toString(), tex)
                        }
                        resolve2();
                    }))
                }));
            }
            Promise.all(arr).then(() => {
                Laya.timer.frameOnce(1, null, () => {
                    resolve();
                });
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
        return new Promise<void>(resolve => {
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
                    resolve()
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
        ES.instance.on(ES.on_clear_scene, this, this.clearScene);


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
                        if (name == "Turn_45_L.lh") {
                            this.setRoadMat(sp);
                        }
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

    private setRoadMat(sp: Laya.Sprite3D) {
        let road = sp as Laya.MeshSprite3D;
        this.road_mat = road.meshRenderer.sharedMaterial as Laya.BlinnPhongMaterial;
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
            case "water":
                ins = clone.addComponent(Water);
                break;
            case "character_base":
                GameData.player = clone;
                ins = clone.addComponent(Player);
                ins.initScene3d(this.scene_3d);
                break;
            case "enemy":
                ins = clone.addComponent(Enemy);
                ins.initScene3d(this.scene_3d);
                break;
            case "arrival":
                ins = clone.addComponent(Arrival);
                break;
            case "jumper":
                ins = clone.addComponent(Jumper);
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
    * 加载天空盒子材质
    */
    private loadSkyMat() {
        let scr = GameDefine.prefabRoot + 'Assets/Materialss/SkyMat.lmat';
        return new Promise<void>(resolve => {
            Laya.SkyBoxMaterial.load(scr, Laya.Handler.create(null, (m: Laya.SkyBoxMaterial) => {
                this.sky_mat = m;
                resolve();
            }));
        });
    }

    private loadSkyCube() {
        let scr = GameDefine.prefabRoot + 'Assets/Materialss/skyCubeMap.ltc';
        return new Promise<void>(resolve => {
            Laya.TextureCube.load(scr, Laya.Handler.create(null, (textC: Laya.TextureCube) => {
                this.sky_mat.textureCube = textC;
                resolve();
            }));
        });
    }

    /**
   * 清理场景 释放资源
   */
    private clearScene() {
        //LoadLevel.instance.showLoadLevelUI();
        Laya.timer.clearAll(this);
        Laya.timer.clearAll(null);
        EffectUtil.instance.clear();
        // CannonManager.instance.clear();
        this.data = null;
        GameData.scene3d.removeSelf();
        GameData.scene3d.destroy();
        GameData.scene3d = null;
        GameData.resetData();
        this.entitys = {};
        ES.instance.offAll();
        Laya.stage.offAll();
        //Laya.Resource.destroyUnusedResources();
        GameDefine.gameState = GameState.None;
    }
}