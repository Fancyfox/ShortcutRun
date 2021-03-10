(function () {
    'use strict';

    class Constants {
    }
    Constants.version = "1.0.0";
    Constants.UIPage = {
        mainUI: 'mainUI',
        hireUI: 'hireUI',
        broadcasterUI: 'broadcasterUI',
        goldenUI: 'goldenUI',
        goldenRankUI: 'goldenRankUI',
        missionUI: 'missionUI',
        giftUI: 'giftUI',
        giftDetailUI: 'giftDetailUI',
        selectFloorUI: 'selectFloorUI',
        messageUI: 'messageUI',
        popupUI: 'popupUI',
        superManagerUI: 'superManagerUI',
        rocketUI: 'rocketUI',
        gashaponMachineUI: 'gashaponMachineUI',
        shopUI: 'shopUI',
        bookUI: 'bookUI',
        bookDetailUI: 'bookDetailUI',
        settingUI: 'settingUI',
        goldenKeyUI: 'goldenKeyUI',
        offlineBenefitsUI: 'offlineBenefitsUI',
        coinflyUI: 'coinFlyUI',
        tutorialUI: 'tutorialUI',
        tutorialMissionUI: 'tutorialMissionUI'
    };
    Constants.GameConfigID = 'SHORTCOU_RUN';
    Constants.LevelTick = 'level_tick';
    Constants.AudioConfigID = 'audioConfigID';

    class Configuration {
        constructor() {
            this._jsonData = {};
            this._markSave = false;
        }
        static instance() {
            if (!this._instance) {
                this._instance = new Configuration();
            }
            return this._instance;
        }
        init() {
            const localStorage = Laya.LocalStorage.getJSON(Constants.GameConfigID);
            if (localStorage) {
                this._jsonData = JSON.parse(localStorage);
            }
            setInterval(this._scheduleSave.bind(this), 500);
        }
        getConfigData(key) {
            const data = this._jsonData[key];
            return data || '';
        }
        setConfigData(key, value) {
            this._jsonData[key] = value;
            this._markSave = true;
        }
        _scheduleSave() {
            if (!this._markSave) {
                return;
            }
            const data = JSON.stringify(this._jsonData);
            Laya.LocalStorage.setJSON(Constants.GameConfigID, data);
            this._markSave = false;
        }
    }
    Configuration._instance = null;

    class RandomUtil {
        static Random(min = 0, max = 1) {
            return min + (max - min) * Math.random();
        }
        static RandomInteger(min = 0, max = 1) {
            let ran = this.Random(min, max);
            return Math.floor(ran);
        }
        static Shuffle(array) {
            for (let len = array.length, i = len - 1; i >= 0; i--) {
                let ran = Math.floor(Math.random() * i);
                let temp = array[ran];
                array[ran] = array[i];
                array[i] = temp;
            }
            return array;
        }
    }

    const templateId_tt = "";
    const videoAdUnitId_wx = "";
    const videoAdUnitId_tt = "";
    class SdkUitl {
        static share(isRecord = false, succesCallback, failCallback) {
            if (Laya.Browser.onWeiXin) {
                wx.shareAppMessage && wx.shareAppMessage({
                    title: "欢乐搬砖人"
                });
                return;
            }
            if (Laya.Browser.window.tt) {
                if (!tt.shareAppMessage) {
                    return;
                }
                let i = RandomUtil.RandomInteger(0, this.images.length);
                let title = this.images[i]['des' + RandomUtil.RandomInteger(1, 4)];
                let imageUrl = this.images[i].imageUrlId;
                if (!isRecord) {
                    tt.shareAppMessage({
                        title: title,
                        templateId: templateId_tt,
                        imageUrl: imageUrl,
                        query: "",
                        success: () => {
                        },
                        fail: () => {
                        }
                    });
                }
                else {
                    console.log(this._videoPath, "this.videoPath");
                    tt.shareAppMessage({
                        channel: "video",
                        title: title,
                        query: "",
                        templateId: templateId_tt,
                        extra: {
                            videoPath: this._videoPath,
                            videoTopics: ["动物经纪人"],
                            hashtag_list: ["动物经纪人"]
                        },
                        success: (res) => {
                            console.log("录屏发布成功", res);
                            if (succesCallback) {
                                succesCallback();
                                this._videoPath = "";
                            }
                        },
                        fail: (res) => {
                            if (!isRecord) {
                                return;
                            }
                            let errs = res.errMsg.split(":");
                            console.log(errs[1], "errs录屏发布失败");
                            if (errs[1].search("cancel") == -1) {
                                if (failCallback) {
                                    failCallback();
                                }
                                return;
                            }
                            console.log("取消发布录屏");
                            if (failCallback) {
                                failCallback();
                            }
                        }
                    });
                }
                return;
            }
        }
        static passiveShare() {
            if (Laya.Browser.onWeiXin) {
                wx.showShareMenu && wx.showShareMenu({
                    success: (res) => {
                        console.log('开启被动转发成功!');
                    },
                    fail: (res) => {
                        console.log(res);
                        console.log('开启被动转发失败!');
                    }
                });
                wx.onShareAppMessage(function () {
                    let i = RandomUtil.RandomInteger(0, this.images.length);
                    var share = {
                        title: this.images[i]['des' + RandomUtil.RandomInteger(1, 4)],
                        imageUrlId: this.images[i].imageUrlId,
                        imageUrl: this.images[i].imageUrl
                    };
                }.bind(this));
                return;
            }
            if (Laya.Browser.window.tt) {
                tt.showShareMenu && tt.showShareMenu({
                    withShareTicket: true,
                    success: () => {
                        tt.onShareAppMessage(() => {
                            let i = RandomUtil.RandomInteger(0, this.images.length);
                            var share = {
                                title: this.images[i]['des' + RandomUtil.RandomInteger(1, 4)],
                                imageUrl: this.images[i].imageUrl,
                                query: ""
                            };
                        });
                    }
                });
            }
            return;
        }
        static createVideoRewardAd() {
            if (Laya.Browser.onWeiXin) {
                if (!wx.createRewardedVideoAd) {
                    return;
                }
                let videoRewardAd = wx.createRewardedVideoAd({
                    adUnitId: videoAdUnitId_wx
                });
                videoRewardAd.onLoad && videoRewardAd.onLoad(function (res) {
                    console.log("视频广告加载完成", res.errMsg);
                });
                videoRewardAd.onError && videoRewardAd.onError(function (res) {
                    console.log("视频广告加载失败", res.errMsg);
                    videoRewardAd.load && videoRewardAd.load();
                });
                videoRewardAd.onClose && videoRewardAd.onClose(this.handler.bind(this));
                return;
            }
            if (Laya.Browser.window.tt) {
                if (!tt.createRewardedVideoAd) {
                    return;
                }
                this._videoRewardAd = wx.createRewardedVideoAd({
                    adUnitId: videoAdUnitId_tt
                });
                this._videoRewardAd.onLoad && this._videoRewardAd.onLoad(function (res) {
                    console.log("视频广告加载完成", res.errMsg);
                });
                this._videoRewardAd.onError && this._videoRewardAd.onError(function (res) {
                    console.log("视频广告加载失败", res.errMsg);
                    this._videoRewardAd.load && this._videoRewardAd.load();
                });
                this._videoRewardAd.onClose && this._videoRewardAd.onClose(this.handler.bind(this));
            }
        }
        static closeHandler(res) {
            if (res && res.isEnded || res === undefined) {
                console.log("给予奖励");
                this.videoSuccessCallback && this.videoSuccessCallback();
            }
            else {
                console.log("未看完广告");
                this.videoFailCallback && this.videoFailCallback();
            }
        }
        static setVideoRewardAdCloseEvent(succesCallback, failCallback) {
            this.videoSuccessCallback = succesCallback;
            this.videoFailCallback = failCallback;
        }
        static showVideoReward(successCallback, failCallback) {
            if (!this._videoRewardAd) {
                return;
            }
            if (!this._videoRewardAd.show) {
                return;
            }
            this._videoRewardAd.show().then(() => {
                console.log("视频广告显示成功，暂停背景音乐");
                SdkUitl.setVideoRewardAdCloseEvent(successCallback, failCallback);
            }, err => {
                console.log("视频广告显示失败", err);
                this._videoRewardAd.load();
            });
        }
        static playMusic(name, loop = true) {
            if (Laya.Browser.onWeiXin) {
                if (wx.createInnerAudioContext) {
                    this._audio = wx.createInnerAudioContext();
                    this._audio.src = `subPackage/sub2/Audio/Effect/${name}.mp3`;
                    this._audio.autoplay = true;
                    this._audio.loop = true;
                    this._audio.play();
                }
                return;
            }
            if (Laya.Browser.window.tt) {
                if (tt.createInnerAudioContext) {
                    this._audio = tt.createInnerAudioContext();
                    this._audio.src = `subPackage/sub2/Audio/Effect/${name}.mp3`;
                    ;
                    this._audio.autoplay = true;
                    this._audio.loop = true;
                    this._audio.play();
                }
            }
            let url = `subPackage/sub2/Audio/Effect/${name}.mp3`;
            let bgmLoop = loop ? 0 : 1;
            Laya.SoundManager.playMusic(url, bgmLoop);
        }
    }
    SdkUitl.images = [
        {
            des1: '爆料！某主播带货竟强买强卖，快来看看~',
            des2: '谁才是直播界带货一哥？',
            des3: '招募主播，直播带货，生意蒸蒸日上！',
            imageUrlId: 'M9YkQjdARgCfpupY+bmNWg==',
            imageUrl: 'https://mmocgame.qpic.cn/wechatgame/svmLHWrwdtCYgLpZSS63QZgMVfWXicOgOzkRYs9U4MWJvcqhRlkCc5RX6yYzNftB3/0'
        },
        {
            des1: '音乐奇才，无人倾听，经纪人们快来帮帮他~',
            des2: '情歌天王，千万人气，为何深夜独自神伤？',
            des3: '流浪歌手到亚洲歌王，阿呆的梦想！',
            imageUrlId: 'tG+4Q4WqTjGtAYjdg8YDNA==',
            imageUrl: 'https://mmocgame.qpic.cn/wechatgame/svmLHWrwdtCXN4yFyb3E95qdaYVoTxia4fOntH6sDskhelq7sK7CPlCgKunhQ3keb/0'
        },
        {
            des1: '猪二蛋：欢迎来的我的直播间！',
            des2: '打造属于你自己的直播天团吧！',
            des3: '大胃王猪二蛋高调路过，聘请他来直播吧~',
            imageUrlId: 'xbKpyKtLQAi4ieYtjqNVUw==',
            imageUrl: 'https://mmocgame.qpic.cn/wechatgame/svmLHWrwdtDVs2rjY0ZJKXlnhB8STMuHiaibI7C7iaSSvgjjHDmToalpa7uHzfiaKuibx/0'
        }
    ];
    SdkUitl._videoPath = "";
    SdkUitl.handler = SdkUitl.closeHandler;
    SdkUitl._audio = null;

    class AudioManager {
        constructor() {
            this.audioInfo = null;
        }
        static instance() {
            if (!this._instance) {
                this._instance = new AudioManager();
            }
            return this._instance;
        }
        getAudioData() {
            return this.audioInfo;
        }
        loadFromCache() {
            const audioInfo = Configuration.instance().getConfigData(Constants.AudioConfigID);
            if (audioInfo) {
                this.audioInfo = JSON.parse(audioInfo);
            }
            else {
                this._generateAudio();
            }
            console.log("loadFromCache");
        }
        saveAudioInfoToCache() {
            const data = JSON.stringify(this.audioInfo);
            Configuration.instance().setConfigData(Constants.AudioConfigID, data);
        }
        _generateAudio() {
            this.audioInfo = {
                musicMute: false,
                effectMute: false,
                musicVolume: 0.5,
                effectVolume: 0.5
            };
            this.saveAudioInfoToCache();
        }
        playMusic(name) {
            if (this.audioInfo && !this.audioInfo.musicMute) {
                SdkUitl.playMusic(name, true);
            }
        }
        resumeMusic() {
            if (this.audioInfo && !this.audioInfo.musicMute) {
            }
        }
        pasueMusic() {
            if (this.audioInfo && !this.audioInfo.musicMute) {
            }
        }
        stopMusic() {
        }
        setMusicVolume(volume) {
        }
        playEffect(name) {
            if (this.audioInfo && !this.audioInfo.effectMute) {
                const path = `subPackage/sub2/Audio/Effect/${name}.mp3`;
                console.log(path, "path");
                Laya.SoundManager.playSound(path);
            }
        }
        stopAllEffects() {
        }
        setEffectVolume(volume) {
        }
    }
    AudioManager._instance = null;

    var GameState;
    (function (GameState) {
        GameState[GameState["None"] = 0] = "None";
        GameState[GameState["Ready"] = 1] = "Ready";
        GameState[GameState["PreviewMap"] = 2] = "PreviewMap";
        GameState[GameState["Playing"] = 3] = "Playing";
        GameState[GameState["Pause"] = 4] = "Pause";
        GameState[GameState["End"] = 5] = "End";
    })(GameState || (GameState = {}));
    var CharacterState;
    (function (CharacterState) {
        CharacterState[CharacterState["None"] = 0] = "None";
        CharacterState[CharacterState["Idle"] = 1] = "Idle";
        CharacterState[CharacterState["Run"] = 2] = "Run";
        CharacterState[CharacterState["Die"] = 3] = "Die";
        CharacterState[CharacterState["Win"] = 4] = "Win";
    })(CharacterState || (CharacterState = {}));
    var CharacterAnimation;
    (function (CharacterAnimation) {
        CharacterAnimation["Idel"] = "idle";
        CharacterAnimation["Running"] = "running";
        CharacterAnimation["Falling"] = "falling";
        CharacterAnimation["Escalade"] = "escalade";
        CharacterAnimation["Back"] = "back";
        CharacterAnimation["Carrying"] = "carrying";
        CharacterAnimation["Jump"] = "jump";
        CharacterAnimation["Planche"] = "planche";
        CharacterAnimation["Defeated"] = "defeated";
        CharacterAnimation["Dance"] = "dance";
    })(CharacterAnimation || (CharacterAnimation = {}));
    var EventName;
    (function (EventName) {
        EventName["MINI_GAME_START"] = "mini-game-start";
        EventName["MINI_GAME_END"] = "mini-game-end";
    })(EventName || (EventName = {}));
    class GameDefine {
    }
    GameDefine.maxLevel = 50;
    GameDefine.prefabRoot = 'subPackage/sub1/LayaScene_main/Conventional/';
    GameDefine.levelRoot = 'subPackage/sub1/LayaScene_main/remote/levels/';
    GameDefine.scenePath = "subPackage/sub1/LayaScene_main/Conventional/main.ls";
    GameDefine.wordTexPath = 'subPackage/LayaScene_main/tex/';
    GameDefine.soundPath = 'subPackage/LayaScene_main/sounds/';
    GameDefine.skinTexPath = 'subPackage/LayaScene_main/skins/';
    GameDefine.dataPath = "data/";
    GameDefine.preload = [
        "character_base.lh",
        "plank.lh",
        "water.lh",
        "plank_hand.lh",
        "plank_road.lh",
        "Turn_45_L.lh",
        "Turn_45_R.lh",
        "Turn_45_short_L.lh",
        "Turn_45_short_R.lh",
        "cube.lh",
    ];
    GameDefine.sounds = [];
    GameDefine.bgms = [
        "bgm.mp3"
    ];
    GameDefine.gameState = GameState.None;
    GameDefine.playerState = CharacterState.None;
    GameDefine.CollisionGroup_Obs = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3;

    class Camera extends Laya.Script3D {
        constructor() {
            super();
            Camera.instance = this;
        }
        onAwake() {
            this._camera = this.owner;
            this._cameraPos = this._camera.transform.position.clone();
        }
        initPlayerData(player, point) {
            this._target = player;
            this._point = point;
        }
        onLateUpdate() {
            if (Laya.timer.delta > 100) {
                return;
            }
            if (GameDefine.gameState != GameState.Playing) {
                return;
            }
            this._lookAtTarget(this._target, this._point);
        }
        _lookAtTarget(target, point) {
            if (!target || !point) {
                return;
            }
            let pos = point.transform.position;
            this._cameraPos.setValue(pos.x, pos.y, pos.z);
            this._camera.transform.position = this._cameraPos;
            this._camera.transform.lookAt(target.transform.position, Laya.Vector3.up);
        }
    }
    Camera.instance = null;

    class ES extends Laya.EventDispatcher {
        static get instance() {
            !this._instance && (this._instance = new ES());
            return this._instance;
        }
    }
    ES.on_pass_level = 'on_pass_level';
    ES.on_fail_level = 'on_fail_level';
    ES.on_clear_scene = 'on_clear_scene';
    ES.on_level_loaded = 'on_level_loaded';
    ES.on_game_ready = 'on_game_ready';
    ES.on_game_start = 'on_game_start';
    ES.on_back_home = 'on_back_home';
    ES.on_game_reset = 'on_game_reset';
    ES.on_show_tip = 'on_show_tip';
    ES.msg_draw_end = 'msg_draw_end';
    ES.msg_be_discovered = 'msg_be_discovered';
    ES.msg_be_freezed = 'msg_be_freezed';
    ES.msg_off_trap = 'msg_off_trap';
    ES.msg_switch_enter = 'msg_switch_enter';
    ES.msg_hit_enemy = 'msg_hit_enemy';
    ES.msg_camera_move = 'msg_camera_move';
    ES.msg_save_princess = 'msg_save_princess';

    var Handler = Laya.Handler;
    class Entity extends Laya.Script3D {
        onAwake() {
            ES.instance.on(ES.on_clear_scene, this, this.onClearScene);
            this.transform = this.owner['transform'];
        }
        destroy() {
            if (this.owner) {
                this.owner.removeSelf();
                this.owner.destroy();
            }
            if (!this.destroyed)
                this.destroy();
        }
        onDestroy() {
            Laya.timer.clearAll(this);
        }
        onUpdate() {
        }
        smoothDestroy(aniDur = 1000) {
            if (this.destroyed)
                return;
            this.owner.traverse(s => {
                if (s instanceof Laya.MeshSprite3D) {
                    let m = s.meshRenderer.material;
                    m.renderMode = 2;
                    Laya.Tween.to(m, { albedoColorA: 0 }, aniDur, Laya.Ease.linearNone, Handler.create(null, () => {
                        this.destroy();
                    }));
                }
            });
        }
        smoothBlack(aniDur = 500, destroyFinish = true) {
            if (this.destroyed)
                return;
            this.owner.traverse(s => {
                if (s instanceof Laya.MeshSprite3D) {
                    let m = s.meshRenderer.material;
                    m.renderMode = 2;
                    Laya.Tween.to(m, { _ColorR: 0, _ColorG: 0, _ColorB: 0 }, aniDur, Laya.Ease.linearNone, Handler.create(null, () => {
                        destroyFinish && this.destroy();
                    }));
                }
            });
        }
        smoothBlackSkinned(aniDur = 500, destroyFinish = true) {
            if (this.destroyed)
                return;
            this.owner.traverse(s => {
                if (s instanceof Laya.SkinnedMeshSprite3D) {
                    let m = s.skinnedMeshRenderer.material;
                    m.renderMode = 2;
                    Laya.Tween.to(m, { _ColorR: 0, _ColorG: 0, _ColorB: 0 }, aniDur, Laya.Ease.linearNone, Handler.create(null, () => {
                        destroyFinish && this.destroy();
                    }));
                }
            });
        }
        onClearScene() {
            Laya.timer.clearAll(this);
        }
    }

    var Vector3 = Laya.Vector3;
    var Quaternion = Laya.Quaternion;
    class Obj extends Entity {
        get tag() {
            return this.data.tag;
        }
        get entityId() {
            return this.data.id;
        }
        init(data) {
            this.data = data;
            let p = new Vector3();
            let q = new Quaternion();
            let s = new Vector3();
            let m = new Laya.Matrix4x4().fromArray(data.transform);
            this.transform.worldMatrix = m;
            switch (this.tag) {
                default:
                    break;
            }
        }
        onDestroy() {
            super.onDestroy();
        }
    }

    class EventManager {
        static register(eventName, cb, target) {
            if (!this.handle[eventName]) {
                this.handle[eventName] = [];
            }
            const data = { func: cb, target };
            this.handle[eventName].push(data);
        }
        static unRegister(eventName, cb, target) {
            const list = this.handle[eventName];
            if (!list || list.length <= 0) {
                return;
            }
            for (let i = 0; i < list.length; i++) {
                const event = list[i];
                if (event.func === cb && (!target || target === event.target)) {
                    list.splice(i, 1);
                    break;
                }
            }
        }
        static dispatchEvent(eventName, ...args) {
            const list = this.handle[eventName];
            if (!list || list.length <= 0) {
                return;
            }
            for (let i = 0; i < list.length; i++) {
                const event = list[i];
                event.func.apply(event.target, args);
            }
        }
    }
    EventManager.handle = {};

    class MiniGameManager {
        static instance() {
            if (!this._instance) {
                this._instance = new MiniGameManager();
            }
            return this._instance;
        }
        StartGame() {
            GameDefine.gameState = GameState.Playing;
            EventManager.dispatchEvent(EventName.MINI_GAME_START);
        }
        EndGame() {
            GameDefine.gameState = GameState.End;
            EventManager.dispatchEvent(EventName.MINI_GAME_END);
        }
    }
    MiniGameManager._instance = null;

    class GameData {
        static resetData() {
        }
    }
    GameData.level = 1;
    GameData.maxLevel = 20;
    GameData.coin = 0;
    GameData.isMoveEnd = false;
    GameData.playerSkin_index = 0;
    GameData.playerSkin_maxindex = 5;
    GameData.playerSkinTex_array = [];
    GameData.princessSkin_index = 0;
    GameData.princessSkin_maxindex = 5;
    GameData.princessSkinTex_array = [];
    GameData.isShake = true;
    GameData.isShowHome = false;

    class Pool {
        constructor() {
            this.plankHand_array = [];
            this.plankRoad_array = [];
            this.cube_scale = new Laya.Vector3(1, 1, 1);
        }
        static get instance() {
            if (!this._instance)
                this._instance = new Pool();
            return this._instance;
        }
        getPlank_hand(parent, pos) {
            let cube;
            if (this.plankHand_array.length <= 0) {
                let prefab = Laya.loader.getRes(GameDefine.prefabRoot + "plank_hand.lh");
                cube = Laya.Sprite3D.instantiate(prefab, parent, true);
            }
            else {
                cube = this.plankHand_array.pop();
                parent.addChild(cube);
            }
            cube.transform.position = pos;
            cube.active = true;
            return cube;
        }
        getPlank_road(parent, pos) {
            let cube;
            if (this.plankRoad_array.length <= 0) {
                let prefab = Laya.loader.getRes(GameDefine.prefabRoot + "plank_road.lh");
                cube = Laya.Sprite3D.instantiate(prefab, parent, true);
            }
            else {
                cube = this.plankRoad_array.pop();
                parent.addChild(cube);
            }
            cube.transform.position = pos;
            cube.active = true;
            return cube;
        }
        reversePlankHandCube(cube) {
            cube.active = false;
            cube.removeSelf();
            this.plankHand_array.push(cube);
        }
        reversePlankRoadCube(cube) {
            cube.active = false;
            cube.removeSelf();
            this.plankRoad_array.push(cube);
        }
        clearPool() {
            let len1 = this.plankRoad_array.length;
            for (let i = 0; i < len1; i++) {
                let cube = this.plankRoad_array.pop();
                if (cube) {
                    cube.removeSelf();
                    cube.destroy();
                }
            }
            let len2 = this.plankHand_array.length;
            for (let i = 0; i < len2; i++) {
                let cube = this.plankHand_array.pop();
                if (cube) {
                    cube.removeSelf();
                    cube.destroy();
                }
            }
            this.plankHand_array.length = 0;
            this.plankRoad_array.length = 0;
            ;
        }
    }

    class Charactor extends Obj {
        constructor() {
            super(...arguments);
            this.forward_speed = 0.15;
            this.down_speed = 0.24;
            this.cube_count = 0;
            this.cube_array = [];
            this.cube_height = 0.16;
            this.isRayCast = false;
        }
        onAwake() {
            super.onAwake();
            this.player = this.owner;
            this.animator = this.player.getComponent(Laya.Animator);
        }
        onStart() {
            super.onStart();
            this.initScene3d();
        }
        initScene3d() {
            this.physicsSimulation = GameData.scene3d.physicsSimulation;
        }
    }

    class Player extends Charactor {
        constructor() {
            super();
            this._rotate_speed = 0.35;
            this.fingerMoveDistance_x = 0;
            this.isMouseDown = false;
            this._canPop = true;
        }
        onAwake() {
            super.onAwake();
            this.player = this.owner;
            this._point = this.player.getChildByName("point");
            this.blank_point = this.player.getChildByName("plank_point");
            this.animator = this.player.getComponent(Laya.Animator);
            console.log(this.animator, "animatro");
            this.playerMove = new Laya.Vector3(0, 0, this.forward_speed);
            this.curFrameTouchPoint_x = 0;
            this.lastFrameTouchPoint_x = 0;
            this.playerRotate = new Laya.Vector3(0, this._rotate_speed, 0);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
        }
        onStart() {
            super.onStart();
            this.initRay();
        }
        onEnable() {
            EventManager.register(EventName.MINI_GAME_START, this.onGameStart, this);
            EventManager.register(EventName.MINI_GAME_END, this.onGameEnd, this);
        }
        onDisable() {
            EventManager.unRegister(EventName.MINI_GAME_START, this.onGameStart, this);
            EventManager.unRegister(EventName.MINI_GAME_END, this.onGameEnd, this);
        }
        mouseDown() {
            if (GameDefine.gameState != GameState.Playing) {
                return;
            }
            if (this.isMouseDown) {
                return;
            }
            this.isMouseDown = true;
            this.curFrameTouchPoint_x = Laya.MouseManager.instance.mouseX;
            this.lastFrameTouchPoint_x = Laya.MouseManager.instance.mouseX;
        }
        mouseMove() {
            if (GameDefine.gameState != GameState.Playing) {
                return;
            }
            if (!this.isMouseDown) {
                return;
            }
            this.curFrameTouchPoint_x = Laya.MouseManager.instance.mouseX;
            this.fingerMoveDistance_x = this.curFrameTouchPoint_x - this.lastFrameTouchPoint_x;
            if (this.fingerMoveDistance_x > 0) {
                this.playerRotate.setValue(0, -this._rotate_speed * Laya.timer.delta / 1000 * this.fingerMoveDistance_x, 0);
                this.player.transform.rotate(this.playerRotate, true);
            }
            else if (this.fingerMoveDistance_x < 0) {
                this.playerRotate.setValue(0, -this._rotate_speed * Laya.timer.delta / 1000 * this.fingerMoveDistance_x, 0);
                this.player.transform.rotate(this.playerRotate, true);
            }
            this.lastFrameTouchPoint_x = this.curFrameTouchPoint_x;
        }
        mouseUp() {
            if (GameDefine.gameState != GameState.Playing) {
                return;
            }
            if (this.isMouseDown) {
                this.isMouseDown = false;
            }
        }
        onUpdate() {
            if (Laya.timer.delta > 100) {
                return;
            }
            if (GameDefine.gameState != GameState.Playing) {
                return;
            }
            this.rayCast();
            switch (this.animationState) {
                case CharacterAnimation.Planche:
                case CharacterAnimation.Carrying:
                case CharacterAnimation.Running:
                    this._moveForward();
                    if (this.player.transform.localPositionY < 0) {
                        this.player.transform.localPositionY = 0;
                    }
                    break;
                case CharacterAnimation.Jump:
                    this.playerMove.y -= this._decreaseDownspeed();
                    this._moveForward();
                    if (this.juageWaterDistance()) {
                        AudioManager.instance().playEffect("FallInWater");
                        MiniGameManager.instance().EndGame();
                    }
                    break;
            }
        }
        init(data) {
            super.init(data);
            Camera.instance.initPlayerData(this.player, this._point);
            console.log(this.player.transform.position.y, "positionY");
            this.changePlayerState(CharacterAnimation.Idel);
            this.cube_count = 0;
            this._canPop = true;
        }
        initCamera(camera) {
            this._camera = camera;
            this.player = this.owner;
            this.player.addChild(camera);
            let point = this.player.getChildByName("point");
            this._camera.transform.position = point.transform.position;
            this._camera.transform.lookAt(this.player.transform.position, Laya.Vector3.up);
        }
        _moveForward() {
            this.player.transform.translate(this.playerMove, true);
        }
        _decreaseDownspeed() {
            return Laya.timer.delta / 1000 * 0.8;
        }
        changePlayerState(state) {
            if (this.animationState == state) {
                return;
            }
            this._playAnimation(state);
            switch (state) {
                case CharacterAnimation.Planche:
                case CharacterAnimation.Carrying:
                case CharacterAnimation.Running:
                    this.playerMove.setValue(0, 0, this.forward_speed);
                    break;
                case CharacterAnimation.Jump:
                    this.playerMove.setValue(0, this.down_speed, this.forward_speed);
                    break;
                case CharacterAnimation.Idel:
                    this.playerMove.setValue(0, 0, 0);
                    break;
                default:
                    break;
            }
        }
        _playAnimation(state) {
            this.animationState = state;
            this.animator.play(state);
        }
        onGameStart() {
            this.changePlayerState(CharacterAnimation.Running);
            this.startRay();
        }
        onGameEnd() {
            this.changePlayerState(CharacterAnimation.Falling);
        }
        initRay() {
            this.ray_orign = this.player.transform.position.clone();
            this.ray_down = new Laya.Ray(this.ray_orign, Laya.Vector3.down);
            this.outInfo = new Laya.HitResult();
        }
        startRay() {
            this.isRayCast = true;
        }
        rayCast() {
            if (!this.physicsSimulation) {
                return;
            }
            if (!this.isRayCast) {
                return;
            }
            let pos = this.player.transform.position;
            this.ray_orign.setValue(pos.x, pos.y + 5, pos.z);
            if (this.physicsSimulation.rayCast(this.ray_down, this.outInfo, 10)) {
                console.log("射线检测到了", this.outInfo.collider.owner.name);
                this.refeshState(this.outInfo, this.animationState);
            }
        }
        refeshState(outInfo, state) {
            if (!outInfo || !outInfo.succeeded) {
                return;
            }
            let colliderName = this.outInfo.collider.owner.name;
            let point = outInfo.point;
            switch (state) {
                case CharacterAnimation.Planche:
                    switch (colliderName) {
                        case "water":
                            if (this.cube_count > 0) {
                                console.log("pop blank");
                                this._popPlankToRoad();
                                this.changePlayerState(CharacterAnimation.Planche);
                            }
                            else {
                                this.changePlayerState(CharacterAnimation.Jump);
                                AudioManager.instance().playEffect("Jump");
                            }
                            break;
                        case "Turn_45_L":
                        case "Turn_45_R":
                        case "Turn_45_short_L":
                        case "Turn_45_short_R":
                        case "plank":
                            if (this.cube_count > 0) {
                                this.changePlayerState(CharacterAnimation.Carrying);
                            }
                            else {
                                this.changePlayerState(CharacterAnimation.Running);
                            }
                            break;
                    }
                    break;
                case CharacterAnimation.Carrying:
                case CharacterAnimation.Running:
                    switch (colliderName) {
                        case "water":
                            if (this.cube_count > 0) {
                                console.log("pop blank");
                                this._popPlankToRoad();
                                this.changePlayerState(CharacterAnimation.Planche);
                            }
                            else {
                                this.changePlayerState(CharacterAnimation.Jump);
                                AudioManager.instance().playEffect("Jump");
                            }
                            break;
                        case "plank":
                            console.log("plank");
                            this._addPlankToPlayer();
                            this.changePlayerState(CharacterAnimation.Carrying);
                            let plank = outInfo.collider.owner;
                            plank.removeSelf();
                            plank.destroy();
                            break;
                    }
                    break;
                case CharacterAnimation.Jump:
                    switch (colliderName) {
                        case "Turn_45_L":
                        case "Turn_45_R":
                        case "Turn_45_short_L":
                        case "Turn_45_short_R":
                            if (this.juageRoadDistance()) {
                                console.log("judge");
                                this.changePlayerState(CharacterAnimation.Running);
                                if (this.player.transform.localPositionY < 0) {
                                    this.player.transform.localPositionY = 0;
                                }
                            }
                            break;
                        case "plank_road":
                            if (this.juageBlankDistance(point)) {
                                console.log("judge blank road");
                                this.changePlayerState(CharacterAnimation.Running);
                            }
                            break;
                    }
                    break;
            }
        }
        juageWaterDistance() {
            return this.player.transform.localPositionY <= -2.3;
        }
        juageRoadDistance() {
            return this.player.transform.localPositionY <= 0;
        }
        juageBlankDistance(point) {
            let distance_y = this.player.transform.localPositionY - point.y;
            return distance_y <= 0.05;
        }
        _addPlankToPlayer() {
            this.cube_count++;
            let pos = new Laya.Vector3();
            if (this.cube_array.length > 0) {
                let lastcube = this.cube_array[this.cube_array.length - 1];
                pos.setValue(lastcube.transform.position.x, lastcube.transform.position.y + this.cube_height, lastcube.transform.position.z);
            }
            else {
                pos = this.blank_point.transform.position.clone();
            }
            let cube = Pool.instance.getPlank_hand(this.blank_point, pos);
            cube.transform.rotation = this.blank_point.transform.rotation;
            this.cube_array.push(cube);
            AudioManager.instance().playEffect("Collect");
        }
        _popPlankToRoad() {
            if (!this._canPop) {
                return;
            }
            if (this.cube_array.length <= 0) {
                return;
            }
            let cube = this.cube_array.pop();
            this.cube_count--;
            Pool.instance.reversePlankHandCube(cube);
            let plankRoad = Pool.instance.getPlank_road(GameData.map, this.player.transform.position.clone());
            plankRoad.transform.rotation = this.player.transform.rotation.clone();
            plankRoad.transform.setWorldLossyScale(Laya.Vector3.one);
            this._canPop = false;
            Laya.timer.once(200, this, () => {
                this._canPop = true;
            });
            AudioManager.instance().playEffect("Put");
        }
    }

    var Vector3$1 = Laya.Vector3;
    var _points = [
        new Vector3$1(),
        new Vector3$1(),
        new Vector3$1(),
        new Vector3$1(),
        new Vector3$1(),
        new Vector3$1(),
        new Vector3$1(),
        new Vector3$1()
    ];
    var _vector = new Vector3$1();
    var _v0 = new Vector3$1();
    var _v1 = new Vector3$1();
    var _v2 = new Vector3$1();
    var _box;
    var _f0 = new Vector3$1();
    var _f1 = new Vector3$1();
    var _f2 = new Vector3$1();
    var _center = new Vector3$1();
    var _extents = new Vector3$1();
    var _triangleNormal = new Vector3$1();
    var _testAxis = new Vector3$1();
    class Box3 {
        constructor(min, max) {
            this.min = (min !== undefined) ? min : new Vector3$1(+Infinity, +Infinity, +Infinity);
            this.max = (max !== undefined) ? max : new Vector3$1(-Infinity, -Infinity, -Infinity);
        }
        set(min, max) {
            this.min.copy(min);
            this.max.copy(max);
            return this;
        }
        setFromArray(array) {
            var minX = +Infinity;
            var minY = +Infinity;
            var minZ = +Infinity;
            var maxX = -Infinity;
            var maxY = -Infinity;
            var maxZ = -Infinity;
            for (var i = 0, l = array.length; i < l; i += 3) {
                var x = array[i];
                var y = array[i + 1];
                var z = array[i + 2];
                if (x < minX)
                    minX = x;
                if (y < minY)
                    minY = y;
                if (z < minZ)
                    minZ = z;
                if (x > maxX)
                    maxX = x;
                if (y > maxY)
                    maxY = y;
                if (z > maxZ)
                    maxZ = z;
            }
            this.min.set(minX, minY, minZ);
            this.max.set(maxX, maxY, maxZ);
            return this;
        }
        setFromPoints(points) {
            this.makeEmpty();
            for (var i = 0, il = points.length; i < il; i++) {
                this.expandByPoint(points[i]);
            }
            return this;
        }
        setFromCenterAndSize(center, size) {
            var halfSize = _vector.copy(size).mult(0.5);
            this.min.copy(center).vsub(halfSize, this.min);
            this.max.copy(center).vadd(halfSize, this.max);
            return this;
        }
        setFromObject(object) {
            this.makeEmpty();
            return this.expandByObject(object);
        }
        copy(box) {
            this.min.copy(box.min);
            this.max.copy(box.max);
            return this;
        }
        clone() {
            return new Box3().copy(this);
        }
        makeEmpty() {
            this.min.x = this.min.y = this.min.z = +Infinity;
            this.max.x = this.max.y = this.max.z = -Infinity;
            return this;
        }
        isEmpty() {
            return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
        }
        getCenter(target) {
            var target = target || new Vector3$1();
            if (this.isEmpty())
                target.set(0, 0, 0);
            else {
                this.min.vadd(this.max, target);
                target.mult(0.5, target);
            }
            return target;
        }
        getSize(target) {
            var target = target || new Vector3$1();
            if (this.isEmpty())
                target.set(0, 0, 0);
            else {
                this.max.vsub(this.min, target);
            }
            return target;
        }
        expandByPoint(point) {
            this.min.min(point);
            this.max.max(point);
            return this;
        }
        expandByVector(vector) {
            this.min.vsub(vector, this.min);
            this.max.vadd(vector, this.max);
            return this;
        }
        expandByScalar(scalar) {
            this.min.x -= scalar;
            this.min.y -= scalar;
            this.min.z -= scalar;
            this.max.x += scalar;
            this.max.y += scalar;
            this.max.z += scalar;
            return this;
        }
        expandByObject(object) {
            if (object instanceof Laya.MeshSprite3D) {
                let m = object;
                m.meshFilter.sharedMesh.calculateBounds();
                if (!_box)
                    _box = new Box3();
                _box.set(m.meshFilter.sharedMesh.bounds.getMin(), m.meshFilter.sharedMesh.bounds.getMax());
                _box.applyMatrix4(object.transform.worldMatrix);
                this.union(_box);
            }
            var children = [];
            for (let i = 0; i < object.numChildren; i++) {
                children.push(object.getChildAt(i));
            }
            for (var i = 0, l = children.length; i < l; i++) {
                this.expandByObject(children[i]);
            }
            return this;
        }
        containsPoint(point) {
            return point.x < this.min.x || point.x > this.max.x ||
                point.y < this.min.y || point.y > this.max.y ||
                point.z < this.min.z || point.z > this.max.z ? false : true;
        }
        containsBox(box) {
            return this.min.x <= box.min.x && box.max.x <= this.max.x &&
                this.min.y <= box.min.y && box.max.y <= this.max.y &&
                this.min.z <= box.min.z && box.max.z <= this.max.z;
        }
        getParameter(point, target) {
            var target = target || new Vector3$1();
            target.set((point.x - this.min.x) / (this.max.x - this.min.x), (point.y - this.min.y) / (this.max.y - this.min.y), (point.z - this.min.z) / (this.max.z - this.min.z));
            return target;
        }
        intersectsBox(box) {
            return box.max.x < this.min.x || box.min.x > this.max.x ||
                box.max.y < this.min.y || box.min.y > this.max.y ||
                box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
        }
        applyMatrix4(matrix) {
            if (this.isEmpty())
                return this;
            _points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix);
            _points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix);
            _points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix);
            _points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix);
            _points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix);
            _points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix);
            _points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix);
            _points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix);
            this.setFromPoints(_points);
            return this;
        }
        union(box) {
            this.min = this.min.min(box.min);
            this.max = this.max.max(box.max);
            return this;
        }
        intersect(box) {
            this.min.max(box.min);
            this.max.min(box.max);
            if (this.isEmpty())
                this.makeEmpty();
            return this;
        }
    }

    class Mathf {
        static Sin(f) {
            return Math.sin(f);
        }
        static Cos(f) {
            return Math.cos(f);
        }
        static Tan(f) {
            return Math.tan(f);
        }
        static Asin(f) {
            return Math.asin(f);
        }
        static Acos(f) {
            return Math.acos(f);
        }
        static Atan(f) {
            return Math.atan(f);
        }
        static Atan2(y, x) {
            return Math.atan2(y, x);
        }
        static Sqrt(f) {
            return Math.sqrt(f);
        }
        static Abs(f) {
            return Math.abs(f);
        }
        static Random(min, max, float = true) {
            return float ? Math.random() * (max - min) + min : Math.floor(Math.random() * (max - min) + min);
        }
        static Min(...values) {
            let length = values.length;
            if (length == 0) {
                return 0;
            }
            let num3 = values[0];
            for (let i = 1; i < length; i++) {
                if (values[i] < num3) {
                    num3 = values[i];
                }
            }
            return num3;
        }
        static Max(...values) {
            let length = values.length;
            if (length == 0) {
                return 0;
            }
            let num3 = values[0];
            for (let i = 1; i < length; i++) {
                if (values[i] > num3) {
                    num3 = values[i];
                }
            }
            return num3;
        }
        static Pow(f, p) {
            return Math.pow(f, p);
        }
        static Exp(power) {
            return Math.exp(power);
        }
        static Log(f) {
            return Math.log(f);
        }
        static Log10(f) {
            return Math.log10(f);
        }
        static Ceil(f) {
            return Math.ceil(f);
        }
        static Floor(f) {
            return Math.floor(f);
        }
        static Round(f, n = 0) {
            let d = this.Pow(10, n);
            return Math.floor(f * d + 0.5) / d;
        }
        static RoundVector3(v, n = 0) {
            v.x = this.Round(v.x, n);
            v.y = this.Round(v.y, n);
            v.z = this.Round(v.z, n);
        }
        static Sign(f) {
            return ((f < 0) ? -1 : 1);
        }
        static Clamp(value, min, max) {
            if (value < min) {
                value = min;
                return value;
            }
            if (value > max) {
                value = max;
            }
            return value;
        }
        static Clamp01(value) {
            if (value < 0) {
                return 0;
            }
            if (value > 1) {
                return 1;
            }
            return value;
        }
        static Lerp(a, b, t) {
            return (a + ((b - a) * this.Clamp01(t)));
        }
        static LerpUnclamped(a, b, t) {
            return (a + ((b - a) * t));
        }
        static LerpAngle(a, b, t) {
            let num = this.Repeat(b - a, 360);
            if (num > 180) {
                num -= 360;
            }
            return (a + (num * this.Clamp01(t)));
        }
        static MoveTowards(current, target, maxDelta) {
            if (this.Abs((target - current)) <= maxDelta) {
                return target;
            }
            return (current + (this.Sign(target - current) * maxDelta));
        }
        static MoveTowardsAngle(current, target, maxDelta) {
            let num = this.DeltaAngle(current, target);
            if ((-maxDelta < num) && (num < maxDelta)) {
                return target;
            }
            target = current + num;
            return this.MoveTowards(current, target, maxDelta);
        }
        static SmoothStep(from, to, t) {
            t = this.Clamp01(t);
            t = (((-2 * t) * t) * t) + ((3 * t) * t);
            return ((to * t) + (from * (1 - t)));
        }
        static Gamma(value, absmax, gamma) {
            let flag = false;
            if (value < 0) {
                flag = true;
            }
            let num = this.Abs(value);
            if (num > absmax) {
                return (!flag ? num : -num);
            }
            let num3 = this.Pow(num / absmax, gamma) * absmax;
            return (!flag ? num3 : -num3);
        }
        static Repeat(t, length) {
            return this.Clamp(t - (this.Floor(t / length) * length), 0, length);
        }
        static PingPong(t, length) {
            t = this.Repeat(t, length * 2);
            return (length - this.Abs((t - length)));
        }
        static InverseLerp(a, b, value) {
            if (a != b) {
                return this.Clamp01((value - a) / (b - a));
            }
            return 0;
        }
        static DeltaAngle(current, target) {
            let num = this.Repeat(target - current, 360);
            if (num > 180) {
                num -= 360;
            }
            return num;
        }
        static SmoothDamp(current, target, currentVelocity, smoothTime, maxSpeed = Number.MAX_SAFE_INTEGER, deltaTime = Laya.timer.delta * 0.001) {
            smoothTime = this.Max(0.0001, smoothTime);
            let num = 2 / smoothTime;
            let num2 = num * deltaTime;
            let num3 = 1 / (((1 + num2) + ((0.48 * num2) * num2)) + (((0.235 * num2) * num2) * num2));
            let num4 = current - target;
            let num5 = target;
            let max = maxSpeed * smoothTime;
            num4 = this.Clamp(num4, -max, max);
            target = current - num4;
            let num7 = (currentVelocity + (num * num4)) * deltaTime;
            currentVelocity = (currentVelocity - (num * num7)) * num3;
            let num8 = target + ((num4 + num7) * num3);
            if (((num5 - current) > 0) == (num8 > num5)) {
                num8 = num5;
                currentVelocity = (num8 - num5) / deltaTime;
            }
            return { value: num8, currentVelocity };
        }
        static LineIntersection(p1, p2, p3, p4, result) {
            let num = p2.x - p1.x;
            let num2 = p2.y - p1.y;
            let num3 = p4.x - p3.x;
            let num4 = p4.y - p3.y;
            let num5 = (num * num4) - (num2 * num3);
            if (num5 == 0) {
                return false;
            }
            let num6 = p3.x - p1.x;
            let num7 = p3.y - p1.y;
            let num8 = ((num6 * num4) - (num7 * num3)) / num5;
            result = new Laya.Vector2(p1.x + (num8 * num), p1.y + (num8 * num2));
            return true;
        }
        static LineSegmentIntersection(p1, p2, p3, p4, result) {
            let num = p2.x - p1.x;
            let num2 = p2.y - p1.y;
            let num3 = p4.x - p3.x;
            let num4 = p4.y - p3.y;
            let num5 = (num * num4) - (num2 * num3);
            if (num5 == 0) {
                return false;
            }
            let num6 = p3.x - p1.x;
            let num7 = p3.y - p1.y;
            let num8 = ((num6 * num4) - (num7 * num3)) / num5;
            if ((num8 < 0) || (num8 > 1)) {
                return false;
            }
            let num9 = ((num6 * num2) - (num7 * num)) / num5;
            if ((num9 < 0) || (num9 > 1)) {
                return false;
            }
            result = new Laya.Vector2(p1.x + (num8 * num), p1.y + (num8 * num2));
            return true;
        }
    }
    Mathf.PI = 3.141593;
    Mathf.Infinity = Number.MAX_SAFE_INTEGER;
    Mathf.NegativeInfinity = Number.MIN_SAFE_INTEGER;
    Mathf.Deg2Rad = 0.01745329;
    Mathf.Rad2Deg = 57.29578;

    class ColorUtil {
        static toHex(color) {
            let aColor = [];
            aColor.push(Mathf.Round(color.r * 255));
            aColor.push(Mathf.Round(color.g * 255));
            aColor.push(Mathf.Round(color.b * 255));
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                if (hex.length < 2) {
                    hex = '0' + hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = '#ffffff';
            }
            return strHex;
        }
        static fromHex(sColor) {
            sColor = sColor.toLowerCase();
            var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            if (sColor && reg.test(sColor)) {
                if (sColor.length === 4) {
                    var sColorNew = "#";
                    for (var i = 1; i < 4; i += 1) {
                        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                    }
                    sColor = sColorNew;
                }
                var sColorChange = [];
                for (var i = 1; i < 7; i += 2) {
                    sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
                }
                return new Laya.Color(sColorChange[0] / 255, sColorChange[1] / 255, sColorChange[2] / 255, 1);
            }
            return new Laya.Color();
        }
    }

    var Vector3$2 = Laya.Vector3;
    var Vector2 = Laya.Vector2;
    var box;
    class MeshUtil {
        static genMesh(ver, tris, transform, color) {
            var points = ver[0] instanceof Array ? ver : this.convertPoints(ver);
            var faces = tris[0] instanceof Array ? tris : this.convertFaces(tris);
            var normals = this.computeVertexNormals(points, faces);
            var uvs = this.computeUVs(points, faces);
            var vertexDeclaration = Laya.VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
            var vertices = [];
            for (let j = 0; j < ver.length; j += 3) {
                let i = Mathf.Floor(j / 3);
                vertices.push(-ver[j], ver[j + 1], ver[j + 2], normals[i].x, normals[i].y, normals[i].z, uvs[i].x, uvs[i].y);
            }
            let mesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, new Float32Array(vertices), new Uint16Array(tris));
            let s = new Laya.MeshSprite3D(mesh);
            if (color) {
                let mat = new Laya.BlinnPhongMaterial();
                mat.albedoColor = ColorUtil.fromHex(color).toVector4();
                s.meshRenderer.material = mat;
            }
            let m = new Laya.Matrix4x4().fromArray(transform);
            s.transform.worldMatrix = m;
            return s;
        }
        static computeFaceNormals(ver, faces) {
            var cb = new Vector3$2(), ab = new Vector3$2();
            var normals = [];
            for (let i = 0, f = faces.length; i < f; i++) {
                let face = faces[i];
                let vA = ver[face[0]];
                let vB = ver[face[1]];
                let vC = ver[face[2]];
                vC.vsub(vB, cb);
                vA.vsub(vB, ab);
                cb.cross(ab, cb);
                cb.normalize();
                normals.push(cb);
            }
            return normals;
        }
        static computeVertexNormals(ver, faces, areaWeighted = true) {
            let v;
            let vl;
            let f;
            let fl;
            let face;
            let vertices;
            vertices = new Array(ver.length);
            for (v = 0, vl = ver.length; v < vl; v++) {
                vertices[v] = new Vector3$2();
            }
            if (areaWeighted) {
                var vA, vB, vC;
                var cb = new Vector3$2(), ab = new Vector3$2();
                for (f = 0, fl = faces.length; f < fl; f++) {
                    face = faces[f];
                    vA = ver[face[0]];
                    vB = ver[face[1]];
                    vC = ver[face[2]];
                    vC.vsub(vB, cb);
                    vA.vsub(vB, ab);
                    cb.cross(ab, cb);
                    vertices[face[0]].vadd(cb, vertices[face[0]]);
                    vertices[face[1]].vadd(cb, vertices[face[1]]);
                    vertices[face[2]].vadd(cb, vertices[face[2]]);
                }
            }
            else {
                let normals = this.computeFaceNormals(ver, faces);
                for (f = 0, fl = faces.length; f < fl; f++) {
                    face = faces[f];
                    vertices[face[0]].vadd(normals[f], vertices[face[0]]);
                    vertices[face[1]].vadd(normals[f], vertices[face[1]]);
                    vertices[face[2]].vadd(normals[f], vertices[face[2]]);
                }
            }
            for (v = 0, vl = vertices.length; v < vl; v++) {
                vertices[v].normalize();
            }
            return vertices;
        }
        static computeUVs(ver, faces) {
            let normals = this.computeVertexNormals(ver, faces);
            let uvs = [];
            if (!box)
                box = new Box3();
            box.setFromPoints(ver);
            let size = box.getSize();
            for (let i = 0, il = ver.length; i < il; i++) {
                let normal = normals[i];
                var components = ['x', 'y', 'z'].sort((a, b) => Math.abs(normal[b]) - Math.abs(normal[a]));
                var x = components[1], y = components[2];
                var v1 = ver[i];
                let a = (v1[x] + size[x] * 0.5) / size[x];
                let b = (v1[y] + size[y] * 0.5) / size[y];
                uvs.push(new Vector2(a, b));
            }
            ;
            return uvs;
        }
        static convertPoints(ver) {
            var points = [];
            for (let i = 0; i < ver.length; i += 3) {
                let p = new Vector3$2(ver[i], ver[i + 1], ver[i + 2]);
                points.push(p);
            }
            return points;
        }
        static convertFaces(tris) {
            var faces = [];
            for (let i = 0; i < tris.length; i += 3) {
                let tri = [];
                let f1 = tris[i];
                let f2 = tris[i + 1];
                let f3 = tris[i + 2];
                tri.push(f1);
                tri.push(f2);
                tri.push(f3);
                faces.push(tri);
            }
            return faces;
        }
        static convertNormals(normals) {
            var ret = [];
            for (let i = 0; i < normals.length; i += 3) {
                let n = new Vector3$2(normals[i], normals[i + 1], normals[i + 2]);
                ret.push(n);
            }
            return ret;
        }
        static ccw(a, b, c) {
            let m00 = a.x;
            let m01 = a.y;
            let m02 = a.z;
            let m10 = b.x;
            let m11 = b.y;
            let m12 = b.z;
            let m20 = c.x;
            let m21 = c.y;
            let m22 = c.z;
            let f = m00 * (m11 * m22 - m12 * m21)
                + m01 * (m12 * m20 - m10 * m22)
                + m02 * (m10 * m21 - m11 * m20);
            return f > 0 ? 1 : f < 0 ? -1 : 0;
        }
    }

    var Vector3$3 = Laya.Vector3;
    var Vec3 = CANNON.Vec3;
    class CannonManager {
        constructor() {
            this.gravity = -20;
            this.cannonStep = 1;
            this.que = [];
            this.removeQue = [];
            this.debugSprites = new Array();
            this.touchRay = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
            this.ray = new CANNON.Ray();
            this.result = new CANNON.RaycastResult();
            this.hitInfo = new Laya.HitResult();
            this.outinfo = new Laya.HitResult();
            this.forward = new Laya.Vector3(0, 0, 1);
            this.temp_vec3_1 = new Laya.Vector3(0, 0, 0);
            this.temp_vec3_2 = new Laya.Vector3(0, 0, 0);
            this.temp_vec3_3 = new Laya.Vector3(0, 0, 0);
        }
        static get instance() {
            if (!CannonManager._instance)
                CannonManager._instance = new CannonManager();
            return CannonManager._instance;
        }
        GetTouchPos3D(camera, drawPlane, pos) {
            let pos_2 = new Laya.Vector2(pos.x, pos.y);
            camera.viewportPointToRay(pos_2, this.touchRay);
            this.touchRay = this.touchRay;
            let hitPoint = this.getIntersectWithLineAndPlane(this.touchRay.origin, this.touchRay.direction, this.forward, drawPlane.transform.position);
            return hitPoint;
        }
        getIntersectWithLineAndPlane(point, direct, planeNormal, planePoint) {
            Laya.Vector3.subtract(planePoint, point, this.temp_vec3_1);
            this.temp_vec3_1 = this.temp_vec3_1;
            let mul = Laya.Vector3.dot(direct, planeNormal);
            this.temp_vec3_2.setValue(planeNormal.x / mul, planeNormal.y / mul, planeNormal.z / mul);
            let d = Laya.Vector3.dot(this.temp_vec3_1, this.temp_vec3_2);
            Laya.Vector3.normalize(direct, this.temp_vec3_1);
            this.temp_vec3_1 = this.temp_vec3_1;
            Laya.Vector3.scale(this.temp_vec3_1, d, this.temp_vec3_1);
            this.temp_vec3_1 = this.temp_vec3_1;
            Laya.Vector3.add(this.temp_vec3_1, point, this.temp_vec3_3);
            this.temp_vec3_3 = this.temp_vec3_3;
            let pos = new Laya.Vector3(0, 0, 0);
            pos.setValue(this.temp_vec3_3.x, this.temp_vec3_3.y, this.temp_vec3_3.z);
            return pos;
        }
        enableCannonWorld() {
            console.log('enable cannon world!');
            this.world = new CANNON.World();
            this.world.gravity.set(0, this.gravity, 0);
            this.world.broadphase = new CANNON.NaiveBroadphase();
            this.world.quatNormalizeFast = false;
            this.world.quatNormalizeSkip = 0;
            this.world.defaultContactMaterial.restitution = 0;
            this.world.defaultMaterial.restitution = -1;
            this.cannonRefreshDelta = this.cannonStep / 60;
            ES.instance.on(ES.on_pass_level, this, this.clear);
            ES.instance.on(ES.on_fail_level, this, this.clear);
            Laya.timer.frameLoop(this.cannonStep, this, this.updateCannonWorld);
            this.setWorldIterations(10);
        }
        attachTransform(transform, moveByUser, data, collideCallback = null, group = 1, mask = -1, friction = 0.1, restitution = 0.06) {
            let ret;
            if (data.components) {
                ret = [];
                data.components.map(c => {
                    let t = transform.owner.find(c.path);
                    if (!t) {
                        console.error('can not find', c.path, 'on', transform.owner);
                        return;
                    }
                    if (c.transform) {
                        t.transform.localMatrix = new Laya.Matrix4x4().fromArray(c.transform);
                    }
                    let scale = new Vector3$3().setFromMatrixScale(t.transform.worldMatrix);
                    let body = this.addBody(t['transform'], c, scale.toArray(), moveByUser, group, mask, friction, restitution);
                    body.tag = data.tag;
                    if (collideCallback)
                        body.addEventListener('collide', collideCallback);
                    ret.push({
                        body: body,
                        transform: t['transform']
                    });
                });
            }
            return ret;
        }
        addBody(transform, components, scale, moveByUser, group, mask, friction, restitution) {
            let type;
            let mass = 0;
            let angularDrag = 0;
            let drag = 0;
            let linearFactor = new CANNON.Vec3(1, 1, 1);
            let angularFactor = new CANNON.Vec3(1, 1, 1);
            if (components.rigidbody) {
                if (components.rigidbody.isKinematic)
                    type = CANNON.Body.KINEMATIC;
                if (components.rigidbody.useGravity && !components.rigidbody.isKinematic)
                    type = CANNON.Body.DYNAMIC;
                if (!components.rigidbody.useGravity && !components.rigidbody.isKinematic)
                    type = CANNON.Body.STATIC;
                mass = components.rigidbody.mass;
                angularDrag = components.rigidbody.angularDrag;
                drag = components.rigidbody.drag;
                let cons = components.rigidbody.constraints;
                linearFactor.x = cons & 2 ? 0 : 1;
                linearFactor.y = cons & 4 ? 0 : 1;
                linearFactor.z = cons & 8 ? 0 : 1;
                angularFactor.x = cons & 16 ? 0 : 1;
                angularFactor.y = cons & 32 ? 0 : 1;
                angularFactor.z = cons & 64 ? 0 : 1;
            }
            else {
                type = CANNON.Body.STATIC;
            }
            let body = new CANNON.Body({
                position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z),
                quaternion: new CANNON.Quaternion(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w),
                mass: mass,
                type: type,
                material: new CANNON.Material({
                    friction: friction,
                    restitution: restitution
                }),
                angularVelocity: new CANNON.Vec3(),
                angularDamping: angularDrag,
                velocity: new CANNON.Vec3(),
                linearDamping: drag,
                fixedRotation: false,
                collisionFilterGroup: group,
                collisionFilterMask: mask,
                linearFactor: linearFactor,
                angularFactor: angularFactor
            });
            let trigger = false;
            components.colliders.map(co => {
                if (co.trigger)
                    trigger = true;
            });
            body.collisionResponse = !trigger;
            this.addShape(body, components.colliders, scale, transform.owner);
            body.allowSleep = true;
            body.wakeUp();
            this.world.addBody(body);
            this.que.push({
                type: body.type,
                transform: transform,
                body: body,
                moveByUser: moveByUser,
                cposition: new Vec3(),
                cquaternion: new CANNON.Quaternion(),
                lposition: new Vector3$3(),
                lquaternion: new Laya.Quaternion(),
            });
            return body;
        }
        removeBody(transform) {
            let link = this.queryLinkByTransform(transform);
            if (link) {
                this.removeQue.push(link);
            }
        }
        convertBodyType(transform, type) {
            let link = this.queryLinkByTransform(transform);
            if (link) {
                link.body.type = type;
                switch (type) {
                    case CANNON.Body.STATIC:
                        link.moveByUser = true;
                        link.body.mass = 0;
                        break;
                    default:
                        link.moveByUser = false;
                        link.body.mass = 1;
                        break;
                }
                link.body.updateMassProperties();
                link.body.wakeUp();
                return link.body;
            }
        }
        queryLinkByTransform(transform) {
            let index = -1;
            for (let i = 0; i < this.que.length; i++) {
                let d = this.que[i];
                if (!d)
                    continue;
                if (d.transform === transform) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                let t = this.que[index];
                t.index = index;
                return t;
            }
        }
        addConstraint(c) {
            this.world.addConstraint(c);
        }
        removeConstraint(c) {
            this.world.removeConstraint(c);
        }
        beforeBodyRemove(body) {
            for (let i = 0; i < this.world.constraints.length; i++) {
                let c = this.world.constraints[i];
                if (c.bodyA === body || c.bodyB === body) {
                    this.world.constraints.splice(i--, 1);
                }
            }
        }
        setWorldIterations(iterations) {
            this.world.solver['iterations'] = iterations;
        }
        updateCannonWorld() {
            while (this.removeQue.length > 0) {
                let link = this.removeQue.pop();
                this.beforeBodyRemove(link.body);
                this.world.removeBody(link.body);
                delete this.que[link.index];
            }
            this.world.step(this.cannonRefreshDelta);
            for (let i = 0; i < this.que.length; i++) {
                let d = this.que[i];
                if (!d)
                    continue;
                if (d.body.sleepState === CANNON.Body.SLEEPING && !d.moveByUser)
                    continue;
                d.moveByUser ? this.bodyFollowTransform(d) : this.transformFollowBody(d);
            }
        }
        bodyFollowTransform(d) {
            d.body.position.x = d.transform.position.x;
            d.body.position.y = d.transform.position.y;
            d.body.position.z = d.transform.position.z;
            d.body.quaternion.x = d.transform.rotation.x;
            d.body.quaternion.y = d.transform.rotation.y;
            d.body.quaternion.z = d.transform.rotation.z;
            d.body.quaternion.w = d.transform.rotation.w;
        }
        transformFollowBody(d) {
            d.lposition.x = d.body.position.x;
            d.lposition.y = d.body.position.y;
            d.lposition.z = d.body.position.z;
            d.lquaternion.x = d.body.quaternion.x;
            d.lquaternion.y = d.body.quaternion.y;
            d.lquaternion.z = d.body.quaternion.z;
            d.lquaternion.w = d.body.quaternion.w;
            d.transform.position = d.lposition;
            d.transform.rotation = d.lquaternion;
        }
        addShape(body, colliders, scale, owner) {
            for (let i = 0; i < colliders.length; i++) {
                let data = colliders[i];
                if (data.type === 'UnityEngine.BoxCollider') {
                    let center = new CANNON.Vec3().set(-data.center[0] * scale[0], data.center[1] * scale[1], data.center[2] * scale[2]);
                    let size = new CANNON.Vec3(data.size[0] * scale[0] * 0.5, data.size[1] * scale[1] * 0.5, data.size[2] * scale[2] * 0.5);
                    let shape = new CANNON.Box(size);
                    body.addShape(shape, center);
                }
                else if (data.type === 'UnityEngine.SphereCollider') {
                    let center = new CANNON.Vec3().set(-data.center[0] * scale[0], data.center[1] * scale[1], data.center[2] * scale[2]);
                    let shape = new CANNON.Sphere(data.radius * scale[0]);
                    body.addShape(shape, center);
                }
                else if (data.type === 'UnityEngine.CapsuleCollider') {
                    let center = new CANNON.Vec3().set(-data.center[0] * scale[0], data.center[1] * scale[1], data.center[2] * scale[2]);
                    let shape = new CANNON.Cylinder(data.radius, data.radius, data.height, 9);
                    body.addShape(shape, center);
                }
                else if (data.type === 'UnityEngine.MeshCollider') {
                    let vertices = [];
                    for (let i = 0; i < data.ver.length; i += 3) {
                        let d = data.ver;
                        let p = new Vec3(d[i], d[i + 1], d[i + 2]);
                        vertices.push(p);
                    }
                    let tris = MeshUtil.convertFaces(data.tris);
                    let shape = new CANNON.ConvexPolyhedron(vertices, tris);
                    body.addShape(shape);
                }
                else {
                    console.error('unsuport shape type', data.type);
                }
            }
        }
        clear(index) {
            if (index === 0) {
                this.que = [];
                this.world = null;
                Laya.timer.clearAll(this);
            }
        }
    }

    class EffectUtil {
        constructor() {
            this.effects = {};
        }
        static get instance() {
            if (!this._instance)
                this._instance = new EffectUtil();
            return this._instance;
        }
        loadEffect(tag, recycleDelay = 1000, pos, parent) {
            return new Promise(resolve => {
                if (!this.effects[tag])
                    this.effects[tag] = [];
                let arr = this.effects[tag];
                if (arr.length > 0) {
                    let p = arr.pop();
                    parent.addChild(p);
                    p.transform.position = pos;
                    if (recycleDelay != -1)
                        Laya.timer.once(recycleDelay, this, a => this.recycleEffect(a), [p]);
                    resolve(p);
                }
                else {
                    Laya.Sprite3D.load(GameDefine.prefabRoot + tag + '.lh', Laya.Handler.create(null, (res) => {
                        let ins = Laya.Sprite3D.instantiate(res);
                        parent.addChild(ins);
                        ins.transform.position = pos;
                        if (recycleDelay != -1)
                            Laya.timer.once(recycleDelay, this, a => this.recycleEffect(a), [ins]);
                        resolve(ins);
                    }));
                }
            });
        }
        recycleEffect(p) {
            p.removeSelf();
            if (!this.effects[p.name])
                return;
            this.effects[p.name].push(p);
        }
        clear() {
            for (const k in this.effects) {
                if (this.effects.hasOwnProperty(k)) {
                    const arr = this.effects[k];
                    arr.map(p => p.destroy());
                }
            }
            this.effects = {};
        }
    }

    var Handler$1 = Laya.Handler;
    var Vector3$4 = Laya.Vector3;
    var Quaternion$1 = Laya.Quaternion;
    class GameManager {
        constructor() {
            this.mapBox = new Box3();
            this.entitys = {};
            this.isGameReady = false;
        }
        static instance() {
            if (!this._instance) {
                this._instance = new GameManager();
            }
            return this._instance;
        }
        setUIScene(scene) {
            this.scene_2d = scene;
        }
        loadLevel(level) {
            return new Promise(resolve => {
                Promise.all([
                    this.loadScene3D(GameDefine.scenePath),
                    this.loadConfig(level),
                    this.loadSounds(),
                ]).then(ret => {
                    this.data = ret[1];
                    this.data.objs.sort((a, b) => a.transform[14] - b.transform[14]);
                    this.camera = this.scene_3d.getChildByName("Main Camera");
                    this.camera.addComponent(Camera);
                    this.camera.enableHDR = false;
                    this.map = new Laya.Sprite3D("Map", true);
                    this.map.transform.position = Vector3$4.zero;
                    this.map.transform.setWorldLossyScale(Vector3$4.one);
                    this.map.transform.rotation = Quaternion$1.DEFAULT;
                    this.scene_3d.addChild(this.map);
                    Laya.stage.getChildByName("root").addChildAt(this.scene_3d, 0);
                    console.log(Laya.stage, "root");
                    GameData.scene3d = this.scene_3d;
                    GameData.map = this.map;
                    CannonManager.instance.enableCannonWorld();
                }).then(() => {
                    this.init().then(resolve);
                });
            });
        }
        loadScene3D(path) {
            return new Promise(resolve => {
                Laya.loader.create(path, Laya.Handler.create(this, () => {
                    this.scene_3d = Laya.loader.getRes(path);
                    resolve(this.scene_3d);
                }));
            });
        }
        loadConfig(level) {
            let fn = GameDefine.levelRoot + 'Lv_' + level + '.json';
            return new Promise(resolve => {
                let t1 = new Date().getTime();
                let ret = Laya.loader.load(fn, Handler$1.create(null, d => {
                    console.log('load:', fn, new Date().getTime() - t1, 'ms');
                    resolve(d);
                }), null, Laya.Loader.JSON);
                ret.once(Laya.Event.ERROR, null, url => {
                    console.log('load config error!', url, 'return home page');
                });
            });
        }
        loadSounds() {
            return new Promise(resolve => {
                let arr = [];
                for (let i = 0; i < GameDefine.sounds.length; i++) {
                    let name = GameDefine.sounds[i];
                    arr.push(new Promise(resolve2 => {
                        Laya.loader.create(GameDefine.soundPath + name, Handler$1.create(null, () => {
                            resolve2();
                        }));
                    }));
                }
                Promise.all(arr).then(() => {
                    Laya.timer.frameOnce(1, null, resolve);
                });
            });
        }
        init() {
            return new Promise(resolve => {
                this.mapBox.makeEmpty();
                this.loadPrefabs().then(() => {
                    let pa = [
                        this.loadObjs(),
                    ];
                    Promise.all(pa).then(() => {
                        this.compileShaders();
                        this.onGameReady();
                    });
                });
            });
        }
        onGameReady() {
            console.log("ongameReady+++++++++++++++++++");
            if (!this.isGameReady) {
                this.isGameReady = true;
            }
            else {
            }
            ES.instance.on(ES.on_clear_scene, this, this.clearScene);
        }
        compileShaders() {
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
        loadPrefabs() {
            return new Promise(resolve => {
                let arr = [];
                for (let i = 0; i < GameDefine.preload.length; i++) {
                    let name = GameDefine.preload[i];
                    arr.push(new Promise(resolve2 => {
                        Laya.Sprite3D.load(GameDefine.prefabRoot + name, Handler$1.create(null, (sp) => {
                            this.scene_3d.addChild(sp);
                            sp.transform.position = new Laya.Vector3(0, 0, 0);
                            Laya.timer.frameOnce(1, null, a1 => {
                                this.scene_3d.removeChild(a1);
                                resolve2();
                            }, [sp]);
                        }));
                    }));
                }
                Promise.all(arr).then(() => {
                    Laya.timer.frameOnce(1, null, resolve);
                });
            });
        }
        loadObjs() {
            return new Promise(resolve => {
                if (this.data.objs)
                    this.data.objs.map(d => {
                        let obj = this.loadObj(d);
                        this.mapBox.expandByObject(obj.owner);
                    });
                resolve();
            });
        }
        loadObj(d) {
            let ins = this.entitys[d.id];
            if (ins)
                return ins;
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
        clearScene() {
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
    GameManager._instance = null;

    class GamePage extends Laya.Script {
        onAwake() {
            let level = this.loadLevelFromCache();
            GameManager.instance().loadLevel(level);
            AudioManager.instance().loadFromCache();
        }
        loadLevelFromCache() {
            const level = Configuration.instance().getConfigData(Constants.LevelTick);
            let scene_level;
            if (level) {
                scene_level = JSON.parse(level);
            }
            else {
                scene_level = 1;
            }
            return scene_level;
        }
    }

    class Home extends Laya.Script {
        constructor() {
            super();
            Home.instance = this;
        }
        onAwake() {
            this._homeUI = this.owner;
            this._uiBox = this._homeUI.getChildAt(0);
            this._startBtn = this._uiBox.getChildByName("StartBtn");
        }
        onEnable() {
            this._startBtn.on(Laya.Event.CLICK, null, this.startGame.bind(this));
        }
        onDisable() {
            this._startBtn.off(Laya.Event.CLICK, null, this.startGame.bind(this));
        }
        close() {
            this._uiBox.removeSelf();
        }
        startGame() {
            if (GameDefine.gameState != GameState.Playing) {
                MiniGameManager.instance().StartGame();
                this.close();
            }
        }
    }
    Home.instance = null;

    const voidAdUnitId = "adunit-80bb77f0c855a581";
    const bannerUnitId = "adunit-7f5a5baa1cf4c0bf";
    const interstitialId = "adunit-50e928fd1ef1c080";
    const gridUnitId = "adunit-3df25aa6f16f67e6";
    const appidOfGameList = "";
    class WeChatManager {
        constructor() {
        }
        static SingletonList_expand() {
            Laya.SingletonList.prototype["_remove"] = function (index) {
                if (index == -1) {
                    return;
                }
                this.length--;
                if (index !== this.length) {
                    var end = this.elements[this.length];
                    if (end) {
                        this.elements[index] = end;
                        end._setIndexInList(index);
                    }
                }
            };
            var old_func = Laya.SimpleSingletonList.prototype["add"];
            Laya.SimpleSingletonList.prototype["add"] = function (element) {
                var index = element._getIndexInList();
                if (index !== -1) {
                    return;
                }
                old_func.call(this, element);
            };
        }
        static ShowShareMenu(_withShareTicket = false) {
            if (Laya.Browser.onWeiXin) {
                wx.showShareMenu({
                    withShareTicket: _withShareTicket,
                    success: () => {
                        wx.onShareAppMessage(() => {
                            var r = Math.random();
                            let n = r < 0.25 ? 1 : r < 0.5 ? 2 : r < 0.75 ? 3 : 4;
                            return {
                                title: this.shareWords[n - 1],
                                imageUrl: "subPackage/sub/share" + String(n) + ".jpg",
                                query: "",
                                success: () => {
                                }
                            };
                        });
                    },
                    fail: () => {
                        console.log("显示当前页面的转发按钮--失败！");
                    }
                });
            }
        }
        static ShareGame(_imageUrl, _title = null, _query = null) {
            if (Laya.Browser.onWeiXin) {
                wx.shareAppMessage({
                    title: _title,
                    imageUrl: _imageUrl,
                    query: _query
                });
                var startTime = new Date().getTime();
                var LeaveBack = function () {
                    wx.offHide(LeaveBack);
                };
                wx.onHide(LeaveBack);
                var callback = function () {
                    wx.offShow(callback);
                    var endTime = new Date().getTime();
                    if (Math.abs(startTime - endTime) < 3000) {
                        if (this.isFirstShare) {
                            this.isFirstShare = false;
                        }
                        else {
                        }
                    }
                    else {
                    }
                };
                wx.onShow(callback);
            }
        }
        static PostMessage(message) {
            if (Laya.Browser.onWeiXin) {
                if (wx.getOpenDataContext) {
                    if (this.openDataContext == null) {
                        this.openDataContext = wx.getOpenDataContext();
                    }
                    this.openDataContext.postMessage(message);
                }
            }
        }
        static CreateUserInfoButton(callBack) {
            if (Laya.Browser.onWeiXin) {
                if (wx.createUserInfoButton) {
                    var userInfoButton = wx.createUserInfoButton({
                        type: 'image',
                        image: 'LoadUI/Enter.png',
                        style: {
                            top: wx.getSystemInfoSync().windowHeight / 2,
                            left: wx.getSystemInfoSync().windowWidth / 2 - 100,
                            width: 200,
                            height: 60
                        }
                    });
                    userInfoButton.onTap((res) => {
                        userInfoButton.destroy();
                        this.userInfo = res.userInfo;
                        console.log("用户信息", this.userInfo);
                        if (this.userInfo == undefined) {
                            this.userInfo = { nickName: "Player", avatarUrl: "PlayerUI/h_0.png" };
                        }
                        localStorage.setItem("nickName", this.userInfo.nickName);
                        localStorage.setItem("userhead", this.userInfo.avatarUrl);
                        callBack();
                    });
                }
                else {
                    wx.authorize({
                        scope: "scope.userInfo",
                        success: function () {
                            wx.getUserInfo({
                                success: (res) => {
                                    this.userInfo = res.userInfo;
                                    console.log("***用户信息", this.userInfo);
                                    if (this.userInfo == undefined) {
                                        this.userInfo = { nickName: "Player", avatarUrl: "PlayerUI/h_0.png" };
                                    }
                                    localStorage.setItem("nickName", this.userInfo.nickName);
                                    localStorage.setItem("userhead", this.userInfo.avatarUrl);
                                    callBack();
                                },
                                fail: (err) => {
                                    console.log("***用户信息获取失败", err);
                                    localStorage.setItem("nickName", "Player");
                                    localStorage.setItem("userhead", "PlayerUI/h_0.png");
                                    callBack();
                                }
                            });
                        },
                        fail: (err) => {
                            console.log("***授权失败", err);
                            localStorage.setItem("nickName", "Player");
                            localStorage.setItem("userhead", "PlayerUI/h_0.png");
                            callBack();
                        }
                    });
                }
            }
        }
        static GetUserInfo(callBack) {
            if (Laya.Browser.window.wx) {
                if (wx.authorize) {
                    wx.authorize({
                        scope: "scope.userInfo",
                        success: function () {
                            wx.getUserInfo({
                                success: (res) => {
                                    this.userInfo = res.userInfo;
                                    console.log("***用户信息", this.userInfo);
                                    if (this.userInfo == undefined) {
                                        this.userInfo = { nickName: "Player", avatarUrl: "PlayerUI/h_0.png" };
                                    }
                                    localStorage.setItem("nickName", this.userInfo.nickName);
                                    localStorage.setItem("userhead", this.userInfo.avatarUrl);
                                    callBack();
                                },
                                fail: (err) => {
                                    console.log("***用户信息获取失败", err);
                                    localStorage.setItem("nickName", "Player");
                                    localStorage.setItem("userhead", "PlayerUI/h_0.png");
                                    callBack();
                                }
                            });
                        },
                        fail: (err) => {
                            console.log("***授权失败", err);
                            localStorage.setItem("nickName", "Player");
                            localStorage.setItem("userhead", "PlayerUI/h_0.png");
                            callBack();
                        }
                    });
                }
                else {
                    localStorage.setItem("nickName", "Player");
                    localStorage.setItem("userhead", "PlayerUI/h_0.png");
                    callBack();
                }
            }
            else {
                localStorage.setItem("nickName", "Player");
                localStorage.setItem("userhead", "PlayerUI/h_0.png");
                callBack();
            }
        }
        static LoadSubpackage(subPackageName, callBack) {
            if (Laya.Browser.window.wx) {
                if (wx.loadSubpackage) {
                    wx.loadSubpackage({
                        name: subPackageName,
                        success: (err) => {
                            console.log("分包加载成功", err);
                            callBack();
                        },
                        fail: (err) => {
                            console.log("分包加载失败", err);
                        }
                    });
                }
                else {
                    Laya.Browser.window.require(subPackageName + "/game.js");
                    Laya.timer.once(1000, this, () => {
                        callBack();
                    });
                }
            }
            else {
                callBack();
            }
        }
        static ShowToast(title = "", icon = "none", duration = 1500) {
            if (Laya.Browser.window.wx) {
                wx.showToast({
                    title: title,
                    icon: icon,
                    duration: duration,
                });
            }
        }
        static MoreGameLink(_qrcodeurl, _appid = "") {
            if (Laya.Browser.onWeiXin) {
                if (_appid != "") {
                    if (wx.navigateToMiniProgram) {
                        wx.navigateToMiniProgram({
                            appId: _appid
                        });
                    }
                    else {
                        this.ShowQRCode(_qrcodeurl);
                    }
                }
                else {
                    this.ShowQRCode(_qrcodeurl);
                }
            }
        }
        static ShowQRCode(_qrcodeurl) {
            if (Laya.Browser.onWeiXin) {
                if (wx.previewImage) {
                    wx.previewImage({
                        current: null,
                        urls: [_qrcodeurl]
                    });
                }
            }
        }
        static SetVibration(_isShort = true, callBack = null) {
            if (Laya.Browser.onWeiXin) {
                if (_isShort) {
                    if (wx.vibrateShort)
                        wx.vibrateShort({ success: () => { if (callBack)
                                callBack(); } });
                }
                else {
                    if (wx.vibrateLong)
                        wx.vibrateLong({ success: () => { if (callBack)
                                callBack(); } });
                }
            }
        }
        static getSystemInfo() {
            if (Laya.Browser.onWeiXin) {
                if (wx.getSystemInfoSync) {
                    let obj = wx.getSystemInfoSync();
                    console.log(obj, "systeminfo");
                    return obj;
                }
                else {
                }
            }
        }
        static WxOnShow(callBack = null) {
            if (Laya.Browser.onWeiXin) {
                if (wx.onShow) {
                    wx.onShow((res) => {
                        if (callBack) {
                            callBack();
                        }
                    });
                }
            }
        }
        static WxOnHide(callBack = null) {
            if (Laya.Browser.onWeiXin) {
                if (wx.onHide) {
                    wx.onHide((res) => {
                        if (callBack) {
                            callBack();
                        }
                    });
                }
            }
        }
        static CreateRewardAd() {
            if (Laya.Browser.onWeiXin) {
                if (voidAdUnitId == "") {
                    console.log("视频广告ID未设置！请检查！");
                    return;
                }
                if (wx.createRewardedVideoAd) {
                    if (this.rewardAd == null) {
                        this.rewardAd = wx.createRewardedVideoAd({ adUnitId: voidAdUnitId });
                    }
                    this.rewardAd.onLoad(() => {
                        console.log("拉取视频成功");
                        this.isHasAd = true;
                    });
                    this.rewardAd.onError((err) => {
                        console.log("拉取视频失败", err);
                    });
                    this.rewardAd.onClose((res) => {
                        this.rewardAd_CallBack(res);
                    });
                }
            }
        }
        static rewardAd_CallBack(res) {
            console.log("用户点击了【关闭广告】按钮");
            if (res && res.isEnded || res === undefined) {
                switch (this.reword_index) {
                    default:
                        break;
                }
                this.isHasAd = false;
            }
            else {
                console.log("未看完广告");
                this.isHasAd = false;
                this.ShowToast("只有观看完整视频才能获得奖励哦", "none", 1500);
            }
        }
        static RewordAD() {
            if (Laya.Browser.onWeiXin) {
                if (this.netWorkType == "" || this.netWorkType == "none") {
                    this.ShowToast("暂无可播放的视频,请稍后再试!");
                    return;
                }
                if (wx.createRewardedVideoAd) {
                    if (!this.isHasAd) {
                        wx.showToast({
                            title: "暂时没有可播放的广告，请稍后再试",
                            icon: "none",
                            duration: 1500
                        });
                        this.rewardAd.onLoad();
                        return;
                    }
                    this.rewardAd.show();
                }
            }
        }
        static onNetworkStatusChange() {
            if (Laya.Browser.window.wx && Laya.Browser.window.wx.onNetworkStatusChange) {
                Laya.Browser.window.wx.onNetworkStatusChange((res) => {
                    console.log("当前是否有网络连接：", res.isConnected);
                    console.log("网络类型：", res.networkType);
                    console.log("在此可添加逻辑代码，并注释本行代码");
                    this.netWorkType = res.networkType;
                });
            }
        }
        static showVideoAd(callBack_Success, callBack_Fail) {
            if (!this.isHasAd)
                return;
            if (this.rewardAd) {
                this.rewardAd.show();
                this.callBack_Success = callBack_Success;
                this.callBack_Fail = callBack_Fail;
            }
        }
        static ShowRewardAd(callBack, defafun = () => { }) {
            if (Laya.Browser.onWeiXin) {
                if (!this.isHasAd) {
                    return;
                }
                ;
                if (this.rewardAd != null) {
                    this.rewardAd.show();
                    this.rewardAd.onClose((res) => {
                        this.rewardAd.offClose();
                        if (res && res.isEnded || res === undefined) {
                            callBack();
                            this.isHasAd = false;
                        }
                        else {
                            console.log("未看完广告");
                            this.isHasAd = false;
                            defafun();
                        }
                        callBack = () => { };
                        this.BGM_PLAY('subPackage/audio/BGM.mp3');
                    });
                }
            }
        }
        static CreateBanner() {
            if (Laya.Browser.onWeiXin) {
                if (bannerUnitId == "") {
                    console.warn("条形广告ID未设置！请检查！");
                    return;
                }
                if (wx.createBannerAd) {
                    if (this.bannerAd == null) {
                        this.bannerAd = wx.createBannerAd({
                            adUnitId: bannerUnitId,
                            adIntervals: 30,
                            style: {
                                left: 0,
                                top: 0,
                                width: Laya.Browser.width
                            }
                        });
                    }
                    else
                        return;
                    this.bannerAd.onError((err) => {
                        console.log("banner 加载失败", err);
                        this.ClearBanner();
                    });
                    this.bannerAd.onLoad((err) => {
                        console.log("banner 加载成功", err);
                    });
                    this.bannerAd.onResize((res) => {
                        this.bannerAd.style.left = (wx.getSystemInfoSync().screenWidth - this.bannerAd.style.realWidth) / 2;
                        if (Laya.Browser.clientHeight / Laya.Browser.clientWidth > 2 && Laya.Browser.onIOS) {
                            this.bannerAd.style.top = wx.getSystemInfoSync().screenHeight - this.bannerAd.style.realHeight * 1.2;
                        }
                        else {
                            this.bannerAd.style.top = wx.getSystemInfoSync().screenHeight - this.bannerAd.style.realHeight;
                        }
                    });
                    if (Laya.Browser.clientHeight / Laya.Browser.clientWidth <= 1.34 && Laya.Browser.clientHeight / Laya.Browser.clientWidth > 1.33) {
                        this.bannerAd.style.width = 300;
                    }
                    else {
                        this.bannerAd.style.width = 300;
                    }
                    this.bannerAd.show();
                }
            }
        }
        static ClearBanner() {
            if (Laya.Browser.onWeiXin) {
                if (this.bannerAd != null) {
                    if (this.bannerAd.destroy)
                        this.bannerAd.destroy();
                    this.bannerAd = null;
                }
            }
        }
        static ShowBanner() {
            if (Laya.Browser.onWeiXin) {
                if (this.bannerAd != null) {
                    if (this.bannerAd.show)
                        this.bannerAd.show();
                }
                else {
                    this.CreateBanner();
                }
            }
        }
        static HideBanner() {
            if (Laya.Browser.onWeiXin) {
                if (this.bannerAd != null) {
                    if (this.bannerAd.hide) {
                        this.bannerAd.hide();
                    }
                    else if (this.bannerAd.destroy) {
                        this.bannerAd.destroy();
                    }
                }
            }
        }
        static CreateGridAd() {
            if (Laya.Browser.onWeiXin) {
                if (gridUnitId == "") {
                    console.warn("格子广告ID未设置！请检查！");
                    return;
                }
                if (wx.createGridAd) {
                    console.log("开始创建格子广告");
                    if (this.gridAd == null) {
                        this.gridAd = wx.createGridAd({
                            adUnitId: gridUnitId,
                            adTheme: 'white',
                            gridCount: 5,
                            style: {
                                left: 0,
                                top: 0,
                                width: 330,
                                opacity: 0.8
                            }
                        });
                    }
                    else
                        return;
                    this.gridAd.onError((err) => {
                        console.log("grid 加载失败", err);
                        this.loadGrid = false;
                        this.ClearGrid();
                    });
                    this.gridAd.onLoad((err) => {
                        console.log("grid 加载成功", err);
                        this.loadGrid = true;
                    });
                    this.gridAd.onResize((res) => {
                        this.gridAd.style.left = (wx.getSystemInfoSync().screenWidth - this.gridAd.style.realWidth) / 2;
                        if (Laya.Browser.height / Laya.Browser.width > 2 && Laya.Browser.onIOS) {
                            this.gridAd.style.top = wx.getSystemInfoSync().screenHeight - this.gridAd.style.realHeight * 1.3;
                        }
                        else {
                            this.gridAd.style.top = wx.getSystemInfoSync().screenHeight - this.gridAd.style.realHeight;
                        }
                    });
                    if (Laya.Browser.onIOS && Laya.Browser.clientHeight / Laya.Browser.clientWidth - 1.3 <= 0.04) {
                        this.gridAd.style.width = Laya.Browser.clientWidth / 2;
                    }
                    else {
                        this.gridAd.style.width = Laya.Browser.clientWidth;
                    }
                }
                else {
                    console.log("没有格子广告创建方法");
                }
            }
        }
        static ShowGrid() {
            if (Laya.Browser.onWeiXin) {
                if (wx.createGridAd) {
                    if (this.gridAd != null) {
                        if (this.loadGrid) {
                            if (this.gridAd.show)
                                this.gridAd.show();
                            else {
                                console.log("格子广告没有show方法");
                            }
                        }
                        else {
                            this.ShowBanner();
                        }
                    }
                    else {
                        console.log("没有格子广告 重新创建");
                        this.CreateGridAd();
                    }
                }
                else {
                    this.ShowBanner();
                }
            }
        }
        static ClearGrid() {
            if (Laya.Browser.onWeiXin) {
                if (this.gridAd != null) {
                    if (this.gridAd.destroy)
                        this.gridAd.destroy();
                    this.gridAd = null;
                }
            }
        }
        static HideGrid() {
            if (Laya.Browser.onWeiXin) {
                if (wx.createGridAd) {
                    if (this.gridAd != null) {
                        if (this.loadGrid) {
                            if (this.gridAd.hide) {
                                this.gridAd.hide();
                            }
                            else if (this.gridAd.destroy) {
                                this.gridAd.destroy();
                            }
                        }
                        else {
                            this.HideBanner();
                        }
                    }
                }
                else {
                    this.HideBanner();
                }
            }
        }
        static CreateInterstitial() {
            if (Laya.Browser.onWeiXin) {
                if (interstitialId == "") {
                    console.warn("插屏广告ID未设置！请检查！");
                    return;
                }
                if (wx.createInterstitialAd) {
                    if (this.interstitialAd == null) {
                        this.interstitialAd = wx.createInterstitialAd({
                            adUnitId: interstitialId,
                        });
                    }
                    else
                        return;
                    this.interstitialAd.onError((err) => {
                        console.log("interstitial 加载失败", err);
                        this.ClearInterstitial();
                    });
                    this.interstitialAd.onLoad((err) => {
                        console.log("interstitial 加载成功", err);
                    });
                }
            }
        }
        static ClearInterstitial() {
            if (Laya.Browser.onWeiXin) {
                if (this.interstitialAd != null) {
                    if (this.interstitialAd.destroy)
                        this.interstitialAd.destroy();
                    this.interstitialAd = null;
                }
            }
        }
        static ShowInterstitial() {
            if (Laya.Browser.onWeiXin) {
                if (this.interstitialAd != null) {
                    if (this.interstitialAd.show)
                        this.interstitialAd.show();
                }
                else {
                    this.CreateInterstitial();
                }
            }
        }
        static Shake(isShort = true) {
            if (Laya.Browser.onWeiXin) {
                if (isShort) {
                    wx.vibrateShort({});
                }
                else {
                    wx.vibrateLong({});
                }
            }
        }
        static PlayerSound(url) {
            if (this.isMute)
                return;
            if (this.isSoundMute)
                return;
            if (Laya.Browser.onWeiXin) {
                this.audioIndex++;
                if (this.audioIndex >= 5) {
                    this.audioIndex = 0;
                }
                switch (this.audioIndex) {
                    case 0:
                        if (this.wxAudio1 == null) {
                            this.wxAudio1 = wx.createInnerAudioContext();
                        }
                        this.wxAudio1.src = url;
                        this.wxAudio1.play();
                        break;
                    case 1:
                        if (this.wxAudio2 == null) {
                            this.wxAudio2 = wx.createInnerAudioContext();
                        }
                        this.wxAudio2.src = url;
                        this.wxAudio2.play();
                        break;
                    case 2:
                        if (this.wxAudio3 == null) {
                            this.wxAudio3 = wx.createInnerAudioContext();
                        }
                        this.wxAudio3.src = url;
                        this.wxAudio3.play();
                        break;
                    case 3:
                        if (this.wxAudio4 == null) {
                            this.wxAudio4 = wx.createInnerAudioContext();
                        }
                        this.wxAudio4.src = url;
                        this.wxAudio4.play();
                        break;
                    case 4:
                        if (this.wxAudio5 == null) {
                            this.wxAudio5 = wx.createInnerAudioContext();
                        }
                        this.wxAudio5.src = url;
                        this.wxAudio5.play();
                        break;
                }
            }
            else {
                Laya.SoundManager.playSound(url);
            }
        }
        static PlayBGM(url, isLoop = true) {
            if (Laya.Browser.onWeiXin) {
                if (this.wxBGMAudio == null) {
                    this.wxBGMAudio = wx.createInnerAudioContext();
                    console.log(this.wxBGMAudio, "play bgm");
                }
                this.wxBGMAudio.src = url;
                this.wxBGMAudio.loop = isLoop;
                this.wxBGMAudio.play();
            }
            else {
                Laya.SoundManager.playMusic(url);
            }
        }
        static BGM_Stop() {
            if (Laya.Browser.onWeiXin) {
                console.log(this.wxBGMAudio, " this.wxBGMAudio");
                this.wxBGMAudio.stop();
                console.log("stop bgm");
            }
            else {
                Laya.SoundManager.stopMusic();
            }
        }
        static BGM_PLAY(url, isLoop = true) {
            if (Laya.Browser.onWeiXin) {
                if (this.wxBGMAudio == null) {
                    this.wxBGMAudio = wx.createInnerAudioContext();
                    console.log(this.wxBGMAudio, "play bgm");
                    this.wxBGMAudio.src = url;
                    this.wxBGMAudio.loop = isLoop;
                    this.wxBGMAudio.play();
                }
                else {
                    this.wxBGMAudio.src = url;
                    this.wxBGMAudio.loop = isLoop;
                    this.wxBGMAudio.play();
                }
            }
        }
        static LoadFont(url) {
            if (Laya.Browser.onWeiXin) {
                if (wx.loadFont) {
                    var font = wx.loadFont(url);
                }
            }
            else {
                Laya.loader.load(url, Laya.Handler.create(this, (fontRes) => {
                    console.log("*************", fontRes);
                }), null, Laya.Loader.TTF);
            }
        }
    }
    WeChatManager.openDataContext = null;
    WeChatManager.userInfo = null;
    WeChatManager.gameListData = null;
    WeChatManager.maxIndex = 0;
    WeChatManager.indexQR = 0;
    WeChatManager.rewardAd = null;
    WeChatManager.isHasAd = false;
    WeChatManager.bannerAd = null;
    WeChatManager.interstitialAd = null;
    WeChatManager.gridAd = null;
    WeChatManager.wxAudio1 = null;
    WeChatManager.wxAudio2 = null;
    WeChatManager.wxAudio3 = null;
    WeChatManager.wxAudio4 = null;
    WeChatManager.wxAudio5 = null;
    WeChatManager.wxBGMAudio = null;
    WeChatManager.isSoundMute = false;
    WeChatManager.isBGMMute = false;
    WeChatManager.isMute = false;
    WeChatManager.reword_index = "";
    WeChatManager.share_index = "";
    WeChatManager.audioIndex = 0;
    WeChatManager.loadGrid = false;
    WeChatManager.miniGameIndex = 0;
    WeChatManager.isFirstShare = true;
    WeChatManager.shareWords = ["精彩又刺激的铲树皮，我知道你玩的很6！", "伐木达人在线削木头，自称“光头强”？不简单", "李老板在线砍木头，这么奇怪的花纹都能弄出来！", "这是什么铲子？铲出来的树皮竟然是大大卷！！"];
    WeChatManager.callBack_Success = null;
    WeChatManager.callBack_Fail = null;

    class LoadingPage extends Laya.Script {
        constructor() {
            super(...arguments);
            this._isSubload = false;
            this._enterGame = false;
        }
        onAwake() {
            this.uiBox = this.owner.getChildAt(0);
            this.progress = this.uiBox.getChildByName("ProgressBar");
        }
        onStart() {
            console.log("onStart");
            this.progress.value = 0;
            this.loadSubPackages();
        }
        onUpdate() {
            if (Laya.timer.delta > 100)
                return;
            if (this._enterGame)
                return;
            if (this.progress.value <= 0.9) {
                this.progress.value += Laya.timer.delta / 1000 * 0.3;
            }
            else {
                if (this._isSubload) {
                    this.progress.value += Laya.timer.delta / 1000 * 0.1;
                }
                if (this.progress.value >= 1) {
                    this.enterGame();
                }
            }
        }
        loadSubPackages() {
            let p1 = new Promise(reslove => {
                WeChatManager.LoadSubpackage("sub1", () => {
                    reslove();
                });
            });
            let p2 = new Promise(reslove => {
                WeChatManager.LoadSubpackage("sub2", () => {
                    reslove();
                });
            });
            Promise.all([p1, p2]).then(() => {
                if (!this._isSubload) {
                    Laya.Scene.open("Scenes/Game.scene", false);
                    this._isSubload = true;
                }
            });
        }
        enterGame() {
            if (!this._enterGame) {
                console.log("enter game!");
                Laya.Scene.close("Scenes/Start.scene");
                this._enterGame = true;
            }
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/Pages/GamePage.ts", GamePage);
            reg("script/UI/Home.ts", Home);
            reg("script/Pages/LoadingPage.ts", LoadingPage);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "center";
    GameConfig.startScene = "Scenes/Start.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    var Quaternion$2 = Laya.Quaternion;
    var Quaternion$3 = (function () {
        Quaternion$2.prototype.vmult = function (v, target) {
            var target = target || new Laya.Vector3();
            var x = v.x, y = v.y, z = v.z;
            var qx = this.x, qy = this.y, qz = this.z, qw = this.w;
            var ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
            target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return target;
        };
        Quaternion$2.prototype.conjugate = function () {
            this.x *= -1;
            this.y *= -1;
            this.z *= -1;
            return this;
        };
        Quaternion$2.prototype.copy = function (s) {
            this.x = s.x;
            this.y = s.y;
            this.z = s.z;
            this.w = s.w;
            return this;
        };
        Quaternion$2.prototype.setFromEuler = function (euler) {
            var x = euler.x, y = euler.y, z = euler.z;
            var cos = Math.cos;
            var sin = Math.sin;
            var c1 = cos(x / 2);
            var c2 = cos(y / 2);
            var c3 = cos(z / 2);
            var s1 = sin(x / 2);
            var s2 = sin(y / 2);
            var s3 = sin(z / 2);
            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 + s1 * s2 * c3;
            this.w = c1 * c2 * c3 - s1 * s2 * s3;
            return this;
        };
        Quaternion$2.prototype.setFromAxisAngle = function (axis, angle) {
            var halfAngle = angle / 2, s = Math.sin(halfAngle);
            this.x = axis.x * s;
            this.y = axis.y * s;
            this.z = axis.z * s;
            this.w = Math.cos(halfAngle);
            return this;
        };
        Quaternion$2.prototype.setFromRotationMatrix = function (m) {
            var te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33, s;
            if (trace > 0) {
                s = 0.5 / Math.sqrt(trace + 1.0);
                this.w = 0.25 / s;
                this.x = (m32 - m23) * s;
                this.y = (m13 - m31) * s;
                this.z = (m21 - m12) * s;
            }
            else if (m11 > m22 && m11 > m33) {
                s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
                this.w = (m32 - m23) / s;
                this.x = 0.25 * s;
                this.y = (m12 + m21) / s;
                this.z = (m13 + m31) / s;
            }
            else if (m22 > m33) {
                s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
                this.w = (m13 - m31) / s;
                this.x = (m12 + m21) / s;
                this.y = 0.25 * s;
                this.z = (m23 + m32) / s;
            }
            else {
                s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
                this.w = (m21 - m12) / s;
                this.x = (m13 + m31) / s;
                this.y = (m23 + m32) / s;
                this.z = 0.25 * s;
            }
            return this;
        };
        Quaternion$2.prototype.setFromUnitVectors = function (vFrom, vTo) {
            var EPS = 0.000001;
            var r = vFrom.dot(vTo) + 1;
            if (r < EPS) {
                r = 0;
                if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
                    this.x = -vFrom.y;
                    this.y = vFrom.x;
                    this.z = 0;
                    this.w = r;
                }
                else {
                    this.x = 0;
                    this.y = -vFrom.z;
                    this.z = vFrom.y;
                    this.w = r;
                }
            }
            else {
                this.x = vFrom.y * vTo.z - vFrom.z * vTo.y;
                this.y = vFrom.z * vTo.x - vFrom.x * vTo.z;
                this.z = vFrom.x * vTo.y - vFrom.y * vTo.x;
                this.w = r;
            }
            return this.normalize();
        };
        Quaternion$2.prototype.angleTo = function (q) {
            return 2 * Math.acos(Math.abs(Mathf.Clamp(this.dot(q), -1, 1)));
        };
        Quaternion$2.prototype.rotateTowards = function (q, step) {
            var angle = this.angleTo(q);
            if (angle === 0)
                return this;
            var t = Math.min(1, step / angle);
            this.slerp(q, t);
            return this;
        };
        Quaternion$2.prototype.inverse = function () {
            return this.conjugate();
        };
        Quaternion$2.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
        };
        Quaternion$2.prototype.lengthSq = function () {
            return this.dot(this);
        };
        Quaternion$2.prototype.length = function () {
            return Math.sqrt(this.dot(this));
        };
        Quaternion$2.prototype.normalize = function () {
            var l = this.length();
            if (l === 0) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 1;
            }
            else {
                l = 1 / l;
                this.x = this.x * l;
                this.y = this.y * l;
                this.z = this.z * l;
                this.w = this.w * l;
            }
            return this;
        };
        Quaternion$2.prototype.multiply = function (q) {
            return this.multiplyQuaternions(this, q);
        };
        Quaternion$2.prototype.premultiply = function (q) {
            return this.multiplyQuaternions(q, this);
        };
        Quaternion$2.prototype.multiplyQuaternions = function (a, b) {
            var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
            var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;
            this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
            this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
            this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
            this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
            return this;
        };
        Quaternion$2.prototype.slerp = function (qb, t) {
            if (t === 0)
                return this;
            if (t === 1)
                return this.copy(qb);
            var x = this.x, y = this.y, z = this.z, w = this.w;
            var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
            if (cosHalfTheta < 0) {
                this.w = -qb.w;
                this.x = -qb.x;
                this.y = -qb.y;
                this.z = -qb.z;
                cosHalfTheta = -cosHalfTheta;
            }
            else {
                this.copy(qb);
            }
            if (cosHalfTheta >= 1.0) {
                this.w = w;
                this.x = x;
                this.y = y;
                this.z = z;
                return this;
            }
            var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
            if (sqrSinHalfTheta <= Number.EPSILON) {
                var s = 1 - t;
                this.w = s * w + t * this.w;
                this.x = s * x + t * this.x;
                this.y = s * y + t * this.y;
                this.z = s * z + t * this.z;
                this.normalize();
                return this;
            }
            var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
            var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
            var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
            this.w = (w * ratioA + this.w * ratioB);
            this.x = (x * ratioA + this.x * ratioB);
            this.y = (y * ratioA + this.y * ratioB);
            this.z = (z * ratioA + this.z * ratioB);
            return this;
        };
        Quaternion$2.prototype.equals = function (quaternion) {
            return (quaternion.x === this.x) && (quaternion.y === this.y) && (quaternion.z === this.z) && (quaternion.w === this.w);
        };
        Quaternion$2.prototype.fromArray = function (arr) {
            this.x = arr[0];
            this.y = arr[1];
            this.z = arr[2];
            this.w = arr[3];
            return this;
        };
        Quaternion$2.prototype.toArray = function () {
            return [this.x, this.y, this.z, this.w];
        };
        Quaternion$2.prototype.toString = function () {
            return 'Quaternion: ' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w;
        };
    })();

    var Vector3$5 = (function () {
        Laya.Vector3.prototype.vsub = function (v, target) {
            var target = target || new Laya.Vector3();
            Laya.Vector3.subtract(this, v, target);
            return target;
        };
        Laya.Vector3.prototype.vadd = function (v, target) {
            var target = target || new Laya.Vector3();
            Laya.Vector3.add(this, v, target);
            return target;
        };
        Laya.Vector3.prototype.mult = function (scalar, target) {
            target = target || new Laya.Vector3();
            var x = this.x, y = this.y, z = this.z;
            target.x = scalar * x;
            target.y = scalar * y;
            target.z = scalar * z;
            return target;
        };
        Laya.Vector3.prototype.divide = function (scalar, target) {
            target = target || new Laya.Vector3();
            var x = this.x, y = this.y, z = this.z;
            target.x = x / scalar;
            target.y = y / scalar;
            target.z = z / scalar;
            return target;
        };
        Laya.Vector3.prototype.cross = function (v, target) {
            var vx = v.x, vy = v.y, vz = v.z, x = this.x, y = this.y, z = this.z;
            var target = target || new Laya.Vector3();
            target.x = (y * vz) - (z * vy);
            target.y = (z * vx) - (x * vz);
            target.z = (x * vy) - (y * vx);
            return target;
        };
        Laya.Vector3.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        };
        Laya.Vector3.prototype.normalize = function () {
            var num = this.magnitude();
            if (num <= 1E-05)
                this.set(0, 0, 0);
            else
                this.divide(num, this);
            return this;
        };
        Laya.Vector3.prototype.magnitude = function () {
            return Mathf.Sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        };
        Laya.Vector3.prototype.magnitudeSquared = function () {
            return this.dot(this);
        };
        Laya.Vector3.prototype.distanceTo = function (p) {
            var x = this.x, y = this.y, z = this.z;
            var px = p.x, py = p.y, pz = p.z;
            return Math.sqrt((px - x) * (px - x) +
                (py - y) * (py - y) +
                (pz - z) * (pz - z));
        };
        Laya.Vector3.prototype.distanceSquared = function (p) {
            var x = this.x, y = this.y, z = this.z;
            var px = p.x, py = p.y, pz = p.z;
            return (px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z);
        };
        Laya.Vector3.prototype.scale = Laya.Vector3.prototype.mult;
        Laya.Vector3.prototype.vmul = function (vector, target) {
            target = target || new Laya.Vector3();
            target.x = vector.x * this.x;
            target.y = vector.y * this.y;
            target.z = vector.z * this.z;
            return target;
        };
        Laya.Vector3.prototype.negate = function (target) {
            target = target || new Laya.Vector3();
            target.x = -this.x;
            target.y = -this.y;
            target.z = -this.z;
            return target;
        };
        Laya.Vector3.prototype.set = function (x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        };
        Laya.Vector3.prototype.copy = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        };
        Laya.Vector3.prototype.toArray = function () {
            return [this.x, this.y, this.z];
        };
        Laya.Vector3.prototype.fromArray = function (array, offset) {
            if (offset === undefined)
                offset = 0;
            this.x = array[offset];
            this.y = array[offset + 1];
            this.z = array[offset + 2];
            return this;
        };
        var Vec3_tangents_n = new Laya.Vector3();
        var Vec3_tangents_randVec = new Laya.Vector3();
        Laya.Vector3.prototype.tangents = function (t1, t2) {
            var norm = this.norm();
            if (norm > 0.0) {
                var n = Vec3_tangents_n;
                var inorm = 1 / norm;
                n.set(this.x * inorm, this.y * inorm, this.z * inorm);
                var randVec = Vec3_tangents_randVec;
                if (Math.abs(n.x) < 0.9) {
                    randVec.set(1, 0, 0);
                    n.cross(randVec, t1);
                }
                else {
                    randVec.set(0, 1, 0);
                    n.cross(randVec, t1);
                }
                n.cross(t1, t2);
            }
            else {
                t1.set(1, 0, 0);
                t2.set(0, 1, 0);
            }
        };
        Laya.Vector3.prototype.lerp = function (v, t, target) {
            var x = this.x, y = this.y, z = this.z;
            target.x = x + (v.x - x) * t;
            target.y = y + (v.y - y) * t;
            target.z = z + (v.z - z) * t;
        };
        Laya.Vector3.prototype.almostEquals = function (v, precision) {
            if (precision === undefined) {
                precision = 1e-6;
            }
            if (Math.abs(this.x - v.x) > precision ||
                Math.abs(this.y - v.y) > precision ||
                Math.abs(this.z - v.z) > precision) {
                return false;
            }
            return true;
        };
        Laya.Vector3.prototype.isZero = function () {
            return this.x === 0 && this.y === 0 && this.z === 0;
        };
        var antip_neg = new Laya.Vector3();
        Laya.Vector3.prototype.isAntiparallelTo = function (v, precision) {
            this.negate(antip_neg);
            return antip_neg.almostEquals(v, precision);
        };
        Laya.Vector3.angle = function (from, to) {
            var num = Mathf.Sqrt(from.magnitudeSquared() * to.magnitudeSquared());
            return num >= 1E-15 ? Mathf.Acos(Mathf.Clamp(from.dot(to) / num, -1, 1)) * 57.29578 : 0;
        };
        Laya.Vector3.signedAngle = function (from, to, axis) {
            return Laya.Vector3.angle(from, to) * Mathf.Sign(axis.dot(from.cross(to)));
        };
        Laya.Vector3.moveTowards = function (current, target, maxDistanceDelta, out) {
            var out = out || new Laya.Vector3();
            var vector = target.vsub(current);
            var magnitude = vector.magnitude();
            if (magnitude <= maxDistanceDelta || magnitude == 0)
                out.copy(target);
            else {
                current.vadd(vector.divide(magnitude).mult(maxDistanceDelta), out);
            }
            return out;
        };
        Laya.Vector3.reflect = function (inDirection, inNormal, target) {
            var target = target || new Laya.Vector3();
            inNormal.mult(inNormal.dot(inDirection) * -2, target);
            target.vadd(inDirection, target);
            return target;
        };
        Laya.Vector3.prototype.min = function (v) {
            this.x = Mathf.Min(this.x, v.x);
            this.y = Mathf.Min(this.y, v.y);
            this.z = Mathf.Min(this.z, v.z);
            return this;
        };
        Laya.Vector3.prototype.max = function (v) {
            this.x = Mathf.Max(this.x, v.x);
            this.y = Mathf.Max(this.y, v.y);
            this.z = Mathf.Max(this.z, v.z);
            return this;
        };
        Laya.Vector3.prototype.applyMatrix3 = function (m) {
            var x = this.x, y = this.y, z = this.z;
            var e = m.elements;
            this.x = e[0] * x + e[3] * y + e[6] * z;
            this.y = e[1] * x + e[4] * y + e[7] * z;
            this.z = e[2] * x + e[5] * y + e[8] * z;
            return this;
        };
        Laya.Vector3.prototype.applyMatrix4 = function (m) {
            var x = this.x, y = this.y, z = this.z;
            var e = m.elements;
            var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
            this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
            this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
            this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
            return this;
        };
        Laya.Vector3.prototype.applyQuaternion = function (q) {
            var x = this.x, y = this.y, z = this.z;
            var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
            var ix = qw * x + qy * z - qz * y;
            var iy = qw * y + qz * x - qx * z;
            var iz = qw * z + qx * y - qy * x;
            var iw = -qx * x - qy * y - qz * z;
            this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return this;
        };
        Laya.Vector3.prototype.setFromMatrixPosition = function (m) {
            var e = m.elements;
            this.x = e[12];
            this.y = e[13];
            this.z = e[14];
            return this;
        };
        Laya.Vector3.prototype.setFromMatrixScale = function (m) {
            var sx = this.setFromMatrixColumn(m, 0).magnitude();
            var sy = this.setFromMatrixColumn(m, 1).magnitude();
            var sz = this.setFromMatrixColumn(m, 2).magnitude();
            this.x = sx;
            this.y = sy;
            this.z = sz;
            return this;
        };
        Laya.Vector3.prototype.setFromMatrix3Column = function (m, index) {
            return this.fromArray(m.elements, index * 3);
        };
        Laya.Vector3.prototype.setFromMatrixColumn = function (m, index) {
            return this.fromArray(m.elements, index * 4);
        };
        Laya.Vector3.prototype.toString = function () {
            return 'Vector3: ' + this.x + ", " + this.y + ", " + this.z;
        };
        Laya.Vector3.zero = new Laya.Vector3();
        Laya.Vector3.one = new Laya.Vector3(1, 1, 1);
        Laya.Vector3.up = new Laya.Vector3(0, 1, 0);
        Laya.Vector3.down = new Laya.Vector3(0, -1, 0);
        Laya.Vector3.forward = new Laya.Vector3(0, 0, 1);
        Laya.Vector3.back = new Laya.Vector3(0, 0, -1);
        Laya.Vector3.right = new Laya.Vector3(-1, 0, 0);
        Laya.Vector3.left = new Laya.Vector3(1, 0, 0);
    })();

    var Vector2$1 = Laya.Vector2;
    var zero = new Vector2$1();
    var Vector2$2 = (function () {
        Vector2$1.prototype.vsub = function (v, target) {
            var self = this;
            var target = target || new Laya.Vector2();
            target.x = self.x - v.x;
            target.y = self.y - v.y;
            return target;
        };
        Vector2$1.prototype.vadd = function (v, target) {
            var self = this;
            var target = target || new Laya.Vector2();
            target.x = self.x + v.x;
            target.y = self.y + v.y;
            return target;
        };
        Vector2$1.prototype.mult = function (n, target) {
            var target = target || new Vector2$1();
            target.x = this.x * n;
            target.y = this.y * n;
            return target;
        };
        Vector2$1.prototype.divide = function (n, target) {
            var target = target || new Vector2$1();
            target.x = this.x / n;
            target.y = this.y / n;
            return target;
        };
        Vector2$1.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y;
        };
        Vector2$1.prototype.lerp = function (a, t, target) {
            t = Mathf.Clamp01(t);
            var target = target || new Laya.Vector2();
            target.x = this.x + ((a.x - this.x) * t);
            target.y = this.y + ((a.y - this.y) * t);
            return target;
        };
        Vector2$1.prototype.lerpUnclamped = function (a, t, target) {
            var target = target || new Laya.Vector2();
            target.x = this.x + ((a.x - this.x) * t);
            target.y = this.y + ((a.y - this.y) * t);
            return target;
        };
        Vector2$1.prototype.magnitude = function () {
            return Mathf.Sqrt((this.x * this.x) + (this.y * this.y));
        };
        Vector2$1.moveTowards = function (current, target, maxDistanceDelta, out) {
            var out = out || new Vector2$1();
            var vector = target.vsub(current);
            var magnitude = vector.magnitude();
            if (magnitude <= maxDistanceDelta || magnitude == 0)
                out.copy(target);
            else {
                current.vadd(vector.divide(magnitude).mult(maxDistanceDelta), out);
            }
            return out;
        };
        Vector2$1.prototype.normalize = function () {
            let magnitude = this.magnitude();
            if (magnitude <= 1E-05)
                this.set(0, 0);
            else
                this.divide(magnitude, this);
            return this;
        };
        Vector2$1.prototype.magnitudeSquared = function () {
            return this.dot(this);
        };
        Vector2$1.prototype.unit = Vector2$1.prototype.normalize;
        Vector2$1.prototype.distanceTo = function (p) {
            var x = this.x, y = this.y;
            var px = p.x, py = p.y;
            return Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
        };
        Vector2$1.prototype.distanceSquared = function (p) {
            var x = this.x, y = this.y;
            var px = p.x, py = p.y;
            return (px - x) * (px - x) + (py - y) * (py - y);
        };
        Vector2$1.prototype.negate = function (target) {
            target = target || new Laya.Vector2();
            target.x = -this.x;
            target.y = -this.y;
            return target;
        };
        Vector2$1.prototype.copy = function (v) {
            this.x = v.x;
            this.y = v.y;
            return this;
        };
        Vector2$1.prototype.set = function (newX, newY) {
            this.x = newX;
            this.y = newY;
        };
        Vector2$1.prototype.toArray = function () {
            return [this.x, this.y];
        };
        Vector2$1.prototype.fromArray = function (arr) {
            this.x = arr[0];
            this.y = arr[1];
            this.z = arr[2];
            return this;
        };
        Vector2$1.prototype.almostEquals = function (v, precision) {
            if (precision === undefined) {
                precision = 1e-6;
            }
            if (Math.abs(this.x - v.x) > precision || Math.abs(this.y - v.y) > precision) {
                return false;
            }
            return true;
        };
        Vector2$1.prototype.isZero = function () {
            return this.x === 0 && this.y === 0;
        };
        Vector2$1.prototype.min = function (v) {
            this.x = Mathf.Min(this.x, v.x);
            this.y = Mathf.Min(this.y, v.y);
            return this;
        };
        Vector2$1.prototype.max = function (v) {
            this.x = Mathf.Max(this.x, v.x);
            this.y = Mathf.Max(this.y, v.y);
            return this;
        };
        Vector2$1.angle = function (from, to) {
            var num = Mathf.Sqrt(from.magnitudeSquared() * to.magnitudeSquared());
            return num >= 1E-15 ? Mathf.Acos(Mathf.Clamp(from.dot(to) / num, -1, 1)) * 57.29578 : 0;
        };
        Vector2$1.signedAngle = function (from, to) {
            return Vector2$1.angle(from, to) * Mathf.Sign(from.x * to.y - from.y * to.x);
        };
        Vector2$1.reflect = function (inDirection, inNormal, target) {
            var target = target || new Vector2$1();
            inNormal.mult(inNormal.dot(inDirection) * -2, target);
            target.vadd(inDirection, target);
            return target;
        };
        Vector2$1.prototype.toString = function () {
            return 'Vector2: ' + this.x + ", " + this.y;
        };
        Vector2$1.zero = new Vector2$1();
        Vector2$1.one = new Vector2$1(1, 1);
        Vector2$1.up = new Vector2$1(0, 1);
        Vector2$1.down = new Vector2$1(0, -1);
        Vector2$1.right = new Vector2$1(1, 0);
        Vector2$1.left = new Vector2$1(-1, 0);
    })();

    function traverse(node, callback) {
        callback.runWith(node);
        if (node.numChildren > 0)
            for (let i = 0; i < node.numChildren; i++)
                traverse(node.getChildAt(i), callback);
    }
    var Node = (function () {
        Laya.Node.prototype.find = function (path) {
            let self = this;
            if (!path)
                return self;
            let arr = path.split('/');
            let cur = self;
            while (arr.length > 0) {
                cur = cur.getChildByName(arr.shift());
                if (!cur)
                    return null;
            }
            return cur;
        };
        Laya.Node.prototype.findChild = function (name) {
            let self = this;
            for (let i = 0; i < self.numChildren; i++) {
                let n = self.getChildAt(i);
                if (n.name === name)
                    return n;
                else {
                    if (n.numChildren > 0) {
                        let ret = n.findChild(name);
                        if (ret.name === name)
                            return ret;
                    }
                }
            }
        };
        Laya.Node.prototype.traverse = function (call) {
            let h = new Laya.Handler(Laya.Node.prototype, call);
            traverse(this, h);
            h.recover();
        };
    })();

    var Transform3D = (function () {
        var tmpQuat = new Laya.Quaternion();
        Laya.Transform3D.pointToLocalFrame = function (position, quaternion, worldPoint, result) {
            var result = result || new Laya.Vector3();
            worldPoint.vsub(position, result);
            quaternion.conjugate(tmpQuat);
            tmpQuat.vmult(result, result);
            return result;
        };
        Laya.Transform3D.prototype.pointToLocalFrame = function (worldPoint, result) {
            return Laya.Transform3D.pointToLocalFrame(this.position, this.rotation, worldPoint, result);
        };
        Laya.Transform3D.pointToWorldFrame = function (position, quaternion, localPoint, result) {
            var result = result || new Laya.Vector3();
            quaternion.vmult(localPoint, result);
            result.vadd(position, result);
            return result;
        };
        Laya.Transform3D.prototype.pointToWorldFrame = function (localPoint, result) {
            return Laya.Transform3D.pointToWorldFrame(this.position, this.rotation, localPoint, result);
        };
        Laya.Transform3D.vectorToWorldFrame = function (quaternion, localVector, result) {
            var result = result || new Laya.Vector3();
            quaternion.vmult(localVector, result);
            return result;
        };
        Laya.Transform3D.prototype.vectorToWorldFrame = function (localVector, result) {
            return Laya.Transform3D.vectorToWorldFrame(this.rotation, localVector, result);
        };
        Laya.Transform3D.vectorToLocalFrame = function (quaternion, worldVector, result) {
            var result = result || new Laya.Vector3();
            quaternion.w *= -1;
            quaternion.vmult(worldVector, result);
            quaternion.w *= -1;
            return result;
        };
        Laya.Transform3D.prototype.vectorToLocalFrame = function (worldVector, result) {
            return Laya.Transform3D.vectorToLocalFrame(this.rotation, worldVector, result);
        };
    })();

    var Graphics = (function () {
        Laya.Graphics.prototype.drawCircleWithAngle = function drawCircleWithAngle(x, y, radius, startAngle, endAngle, offset, clockwise, fillColor, lineColor, lineWidth) {
            let self = this;
            let delta = 1;
            startAngle += offset;
            endAngle += offset;
            let temp = endAngle;
            if (startAngle > endAngle) {
                endAngle = startAngle;
                startAngle = temp;
            }
            if (endAngle - startAngle < delta)
                return;
            var points = [];
            for (let i = startAngle; i <= endAngle; i += delta) {
                let rad = i * Mathf.Deg2Rad;
                points.push(Mathf.Sin(rad) * radius, Mathf.Cos(rad) * radius);
            }
            if (!clockwise)
                points.reverse();
            if (fillColor) {
                if (endAngle - startAngle < 360)
                    points.push(x, y);
                self.drawPoly(x, y, points, fillColor, lineColor, lineWidth);
            }
            else
                self.drawLines(x, y, points, lineColor, lineWidth);
        };
    })();

    var Vector3$6 = Laya.Vector3;
    var Vector4 = Laya.Vector4;
    var Color = (function () {
        Laya.Color.prototype.toVector3 = function (target) {
            let self = this;
            target = target || new Vector3$6();
            target.x = self.r;
            target.y = self.g;
            target.z = self.b;
            return target;
        };
        Laya.Color.prototype.toVector4 = function (target) {
            let self = this;
            target = target || new Vector4();
            target.x = self.r;
            target.y = self.g;
            target.z = self.b;
            target.w = self.a;
            return target;
        };
    })();

    var _Array = (function () {
        Array.prototype.unique = function () {
            this.sort();
            var re = [this[0]];
            for (var i = 1; i < this.length; i++) {
                if (this[i] !== re[re.length - 1]) {
                    re.push(this[i]);
                }
            }
            return re;
        };
        Array.prototype.union = function (a) {
            return this.concat(a).unique();
        };
        Array.prototype.minus = function (a) {
            var result = [];
            var clone = this;
            for (var i = 0; i < clone.length; i++) {
                var flag = true;
                for (var j = 0; j < a.length; j++) {
                    if (clone[i] == a[j])
                        flag = false;
                }
                if (flag)
                    result.push(clone[i]);
            }
            return result.unique();
        };
        Array.prototype.intersect = function (b) {
            var result = [];
            var a = this;
            for (var i = 0; i < b.length; i++) {
                var temp = b[i];
                for (var j = 0; j < a.length; j++) {
                    if (temp === a[j]) {
                        result.push(temp);
                        break;
                    }
                }
            }
            return result.unique();
        };
    })();

    var Matrix4x4 = Laya.Matrix4x4;
    var Vector3$7 = Laya.Vector3;
    var Matrix4x4$1 = (function () {
        var _v1 = new Vector3$7();
        var _m1 = new Laya.Matrix4x4();
        var _zero = new Vector3$7(0, 0, 0);
        var _one = new Vector3$7(1, 1, 1);
        var _x = new Vector3$7();
        var _y = new Vector3$7();
        var _z = new Vector3$7();
        Matrix4x4.prototype.set = function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
            var self = this;
            var te = self.elements;
            te[0] = n11;
            te[4] = n12;
            te[8] = n13;
            te[12] = n14;
            te[1] = n21;
            te[5] = n22;
            te[9] = n23;
            te[13] = n24;
            te[2] = n31;
            te[6] = n32;
            te[10] = n33;
            te[14] = n34;
            te[3] = n41;
            te[7] = n42;
            te[11] = n43;
            te[15] = n44;
            return this;
        };
        Matrix4x4.prototype.copy = function (m) {
            var te = this.elements;
            var me = m.elements;
            te[0] = me[0];
            te[1] = me[1];
            te[2] = me[2];
            te[3] = me[3];
            te[4] = me[4];
            te[5] = me[5];
            te[6] = me[6];
            te[7] = me[7];
            te[8] = me[8];
            te[9] = me[9];
            te[10] = me[10];
            te[11] = me[11];
            te[12] = me[12];
            te[13] = me[13];
            te[14] = me[14];
            te[15] = me[15];
            return this;
        };
        Matrix4x4.prototype.copyPosition = function (m) {
            var te = this.elements, me = m.elements;
            te[12] = me[12];
            te[13] = me[13];
            te[14] = me[14];
            return this;
        };
        Matrix4x4.prototype.extractBasis = function (xAxis, yAxis, zAxis) {
            xAxis.setFromMatrixColumn(this, 0);
            yAxis.setFromMatrixColumn(this, 1);
            zAxis.setFromMatrixColumn(this, 2);
            return this;
        };
        Matrix4x4.prototype.makeBasis = function (xAxis, yAxis, zAxis) {
            this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.extractRotation = function (m) {
            var te = this.elements;
            var me = m.elements;
            var scaleX = 1 / _v1.setFromMatrixColumn(m, 0).magnitude();
            var scaleY = 1 / _v1.setFromMatrixColumn(m, 1).magnitude();
            var scaleZ = 1 / _v1.setFromMatrixColumn(m, 2).magnitude();
            te[0] = me[0] * scaleX;
            te[1] = me[1] * scaleX;
            te[2] = me[2] * scaleX;
            te[3] = 0;
            te[4] = me[4] * scaleY;
            te[5] = me[5] * scaleY;
            te[6] = me[6] * scaleY;
            te[7] = 0;
            te[8] = me[8] * scaleZ;
            te[9] = me[9] * scaleZ;
            te[10] = me[10] * scaleZ;
            te[11] = 0;
            te[12] = 0;
            te[13] = 0;
            te[14] = 0;
            te[15] = 1;
            return this;
        };
        Matrix4x4.prototype.makeRotationFromEuler = function (euler) {
            var te = this.elements;
            var x = euler.x, y = euler.y, z = euler.z;
            var a = Math.cos(x), b = Math.sin(x);
            var c = Math.cos(y), d = Math.sin(y);
            var e = Math.cos(z), f = Math.sin(z);
            var ae = a * e, af = a * f, be = b * e, bf = b * f;
            te[0] = c * e;
            te[4] = -c * f;
            te[8] = d;
            te[1] = af + be * d;
            te[5] = ae - bf * d;
            te[9] = -b * c;
            te[2] = bf - ae * d;
            te[6] = be + af * d;
            te[10] = a * c;
            te[3] = 0;
            te[7] = 0;
            te[11] = 0;
            te[12] = 0;
            te[13] = 0;
            te[14] = 0;
            te[15] = 1;
            return this;
        };
        Matrix4x4.prototype.makeRotationFromQuaternion = function (q) {
            return this.compose(_zero, q, _one);
        };
        Matrix4x4.prototype.lookAt = function (eye, target, up) {
            var te = this.elements;
            eye.vsub(target, _z);
            if (_z.magnitudeSquared() === 0) {
                _z.z = 1;
            }
            _z.normalize();
            up.cross(_z, _x);
            if (_x.magnitudeSquared() === 0) {
                if (Math.abs(up.z) === 1) {
                    _z.x += 0.0001;
                }
                else {
                    _z.z += 0.0001;
                }
                _z.normalize();
                up.cross(_z, _x);
            }
            _x.normalize();
            _z.cross(_x, _y);
            te[0] = _x.x;
            te[4] = _y.x;
            te[8] = _z.x;
            te[1] = _x.y;
            te[5] = _y.y;
            te[9] = _z.y;
            te[2] = _x.z;
            te[6] = _y.z;
            te[10] = _z.z;
            return this;
        };
        Matrix4x4.prototype.multiply = function (m) {
            return this.multiplyMatrices(this, m);
        };
        Matrix4x4.prototype.premultiply = function (m) {
            return this.multiplyMatrices(m, this);
        };
        Matrix4x4.prototype.multiplyMatrices = function (a, b) {
            var ae = a.elements;
            var be = b.elements;
            var te = this.elements;
            var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
            var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
            var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
            var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
            var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
            var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
            var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
            var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
            te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
            te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
            te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
            te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
            te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
            te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
            te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
            te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
            te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
            te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
            te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
            te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
            te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
            te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
            te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
            te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
            return this;
        };
        Matrix4x4.prototype.multiplyScalar = function (s) {
            var te = this.elements;
            te[0] *= s;
            te[4] *= s;
            te[8] *= s;
            te[12] *= s;
            te[1] *= s;
            te[5] *= s;
            te[9] *= s;
            te[13] *= s;
            te[2] *= s;
            te[6] *= s;
            te[10] *= s;
            te[14] *= s;
            te[3] *= s;
            te[7] *= s;
            te[11] *= s;
            te[15] *= s;
            return this;
        };
        Matrix4x4.prototype.determinant = function () {
            var te = this.elements;
            var n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
            var n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
            var n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
            var n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
            return (n41 * (+n14 * n23 * n32
                - n13 * n24 * n32
                - n14 * n22 * n33
                + n12 * n24 * n33
                + n13 * n22 * n34
                - n12 * n23 * n34) +
                n42 * (+n11 * n23 * n34
                    - n11 * n24 * n33
                    + n14 * n21 * n33
                    - n13 * n21 * n34
                    + n13 * n24 * n31
                    - n14 * n23 * n31) +
                n43 * (+n11 * n24 * n32
                    - n11 * n22 * n34
                    - n14 * n21 * n32
                    + n12 * n21 * n34
                    + n14 * n22 * n31
                    - n12 * n24 * n31) +
                n44 * (-n13 * n22 * n31
                    - n11 * n23 * n32
                    + n11 * n22 * n33
                    + n13 * n21 * n32
                    - n12 * n21 * n33
                    + n12 * n23 * n31));
        };
        Matrix4x4.prototype.transpose = function () {
            var te = this.elements;
            var tmp;
            tmp = te[1];
            te[1] = te[4];
            te[4] = tmp;
            tmp = te[2];
            te[2] = te[8];
            te[8] = tmp;
            tmp = te[6];
            te[6] = te[9];
            te[9] = tmp;
            tmp = te[3];
            te[3] = te[12];
            te[12] = tmp;
            tmp = te[7];
            te[7] = te[13];
            te[13] = tmp;
            tmp = te[11];
            te[11] = te[14];
            te[14] = tmp;
            return this;
        };
        Matrix4x4.prototype.setPosition = function (x, y, z) {
            var te = this.elements;
            if (x instanceof Laya.Vector3) {
                te[12] = x.x;
                te[13] = x.y;
                te[14] = x.z;
            }
            else {
                te[12] = x;
                te[13] = y;
                te[14] = z;
            }
            return this;
        };
        Matrix4x4.prototype.getInverse = function (m) {
            var te = this.elements, me = m.elements, n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3], n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7], n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11], n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
            var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
            if (det === 0)
                return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            var detInv = 1 / det;
            te[0] = t11 * detInv;
            te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
            te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
            te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
            te[4] = t12 * detInv;
            te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
            te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
            te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
            te[8] = t13 * detInv;
            te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
            te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
            te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
            te[12] = t14 * detInv;
            te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
            te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
            te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
            return this;
        };
        Matrix4x4.prototype.scale = function (v) {
            var te = this.elements;
            var x = v.x, y = v.y, z = v.z;
            te[0] *= x;
            te[4] *= y;
            te[8] *= z;
            te[1] *= x;
            te[5] *= y;
            te[9] *= z;
            te[2] *= x;
            te[6] *= y;
            te[10] *= z;
            te[3] *= x;
            te[7] *= y;
            te[11] *= z;
            return this;
        };
        Matrix4x4.prototype.getMaxScaleOnAxis = function () {
            var te = this.elements;
            var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
            var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
            var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
            return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
        };
        Matrix4x4.prototype.makeTranslation = function (x, y, z) {
            this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.makeRotationX = function (theta) {
            var c = Math.cos(theta), s = Math.sin(theta);
            this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.makeRotationY = function (theta) {
            var c = Math.cos(theta), s = Math.sin(theta);
            this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.makeRotationZ = function (theta) {
            var c = Math.cos(theta), s = Math.sin(theta);
            this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.makeRotationAxis = function (axis, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var t = 1 - c;
            var x = axis.x, y = axis.y, z = axis.z;
            var tx = t * x, ty = t * y;
            this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.makeScale = function (x, y, z) {
            this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.makeShear = function (x, y, z) {
            this.set(1, y, z, 0, x, 1, z, 0, x, y, 1, 0, 0, 0, 0, 1);
            return this;
        };
        Matrix4x4.prototype.compose = function (position, quaternion, scale) {
            var te = this.elements;
            var x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
            var x2 = x + x, y2 = y + y, z2 = z + z;
            var xx = x * x2, xy = x * y2, xz = x * z2;
            var yy = y * y2, yz = y * z2, zz = z * z2;
            var wx = w * x2, wy = w * y2, wz = w * z2;
            var sx = scale.x, sy = scale.y, sz = scale.z;
            te[0] = (1 - (yy + zz)) * sx;
            te[1] = (xy + wz) * sx;
            te[2] = (xz - wy) * sx;
            te[3] = 0;
            te[4] = (xy - wz) * sy;
            te[5] = (1 - (xx + zz)) * sy;
            te[6] = (yz + wx) * sy;
            te[7] = 0;
            te[8] = (xz + wy) * sz;
            te[9] = (yz - wx) * sz;
            te[10] = (1 - (xx + yy)) * sz;
            te[11] = 0;
            te[12] = position.x;
            te[13] = position.y;
            te[14] = position.z;
            te[15] = 1;
            return this;
        };
        Matrix4x4.prototype.decompose = function (position, quaternion, scale) {
            var te = this.elements;
            var sx = _v1.set(te[0], te[1], te[2]).magnitude();
            var sy = _v1.set(te[4], te[5], te[6]).magnitude();
            var sz = _v1.set(te[8], te[9], te[10]).magnitude();
            var det = this.determinant();
            if (det < 0)
                sx = -sx;
            position.x = te[12];
            position.y = te[13];
            position.z = te[14];
            _m1.copy(this);
            var invSX = 1 / sx;
            var invSY = 1 / sy;
            var invSZ = 1 / sz;
            _m1.elements[0] *= invSX;
            _m1.elements[1] *= invSX;
            _m1.elements[2] *= invSX;
            _m1.elements[4] *= invSY;
            _m1.elements[5] *= invSY;
            _m1.elements[6] *= invSY;
            _m1.elements[8] *= invSZ;
            _m1.elements[9] *= invSZ;
            _m1.elements[10] *= invSZ;
            quaternion.setFromRotationMatrix(_m1);
            scale.x = sx;
            scale.y = sy;
            scale.z = sz;
            return this;
        };
        Matrix4x4.prototype.equals = function (matrix) {
            var te = this.elements;
            var me = matrix.elements;
            for (var i = 0; i < 16; i++) {
                if (te[i] !== me[i])
                    return false;
            }
            return true;
        };
        Matrix4x4.prototype.toArray = function (array, offset) {
            if (array === undefined)
                array = [];
            if (offset === undefined)
                offset = 0;
            var te = this.elements;
            array[offset] = te[0];
            array[offset + 1] = te[1];
            array[offset + 2] = te[2];
            array[offset + 3] = te[3];
            array[offset + 4] = te[4];
            array[offset + 5] = te[5];
            array[offset + 6] = te[6];
            array[offset + 7] = te[7];
            array[offset + 8] = te[8];
            array[offset + 9] = te[9];
            array[offset + 10] = te[10];
            array[offset + 11] = te[11];
            array[offset + 12] = te[12];
            array[offset + 13] = te[13];
            array[offset + 14] = te[14];
            array[offset + 15] = te[15];
            return array;
        };
        Matrix4x4.prototype.fromArray = function (array, offset) {
            if (offset === undefined)
                offset = 0;
            for (var i = 0; i < 16; i++) {
                this.elements[i] = array[i + offset];
            }
            return this;
        };
    })();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
