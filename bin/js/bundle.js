(function () {
    'use strict';

    class Constants {
    }
    Constants.version = "1.0.0";
    Constants.UIPage = {
        home: "Home",
        playing: "Playing",
        relife: "Relife",
        result: "Result",
        loading: "Loading"
    };
    Constants.GameConfigID = 'SHORTCOU_RUN';
    Constants.LevelTick = 'level_tick';
    Constants.AudioConfigID = 'audioConfigID';
    Constants.PlayerInfoID = 'playerInfoID';

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
        static loadSubpackage(name, callBack) {
            if (Laya.Browser.onWeiXin) {
                if (wx.loadSubpackage) {
                    let task = wx.loadSubpackage({
                        name: name,
                        success: function (res) {
                            callBack && callBack();
                        },
                        fail: function (res) {
                        }
                    });
                    return task;
                }
            }
            callBack && callBack();
            return null;
        }
        static vibrateShort() {
            if (Laya.Browser.onWeiXin) {
                wx.vibrateShort && wx.vibrateShort({
                    type: "light"
                });
                return;
            }
            if (Laya.Browser.window.tt) {
                tt.vibrateShort && tt.vibrateShort();
                return;
            }
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
                Laya.SoundManager.playSound(path);
            }
        }
        stopAllEffects() {
        }
        setEffectVolume(volume) {
        }
    }
    AudioManager._instance = null;

    class GameData {
        static getArrivalPos() {
            console.log(this.arrival_pos_array, "arrival pos array");
            if (this.arrival_pos_array.length <= 0) {
                return null;
            }
            else {
                return this.arrival_pos_array.pop();
            }
        }
        static resetData() {
            this.arrival_pos_array.length = 0;
            this.playerInfos.length = 0;
            this.rank = 1;
            this.playRank = 1;
            this.rewardCoin = 0;
            this.canRelife = true;
        }
        static RandomName() {
            var arr = ["凄美如画", "土豆沙", "茕茕孑立", " 追风逐月", "剑舞琴扬", "天涯为客", "静候缘来", "慕雪剑心", "慕血十三",
                "小天使", "泡泡龙", "tina", "for_love", "花菲", "可儿", "非想", "开元", "杰克", "大朋友", "尓蕞紾貴", "大棒", "灵兰若梦", "锦瑟幽心", "冰城", "文远", "阿红", "都是辣鸡", "蛰伏",
                "柯", "天涯", "森舟", "似曾相识", "可可妈", "醉红尘", "莲波仙子", "bibe", "小棉", "金色", "卖了一个世界", "袭夜风", "一颗海藻", "wei", "獨留記憶:", "HGC、", "车♀神",
                "吥丶可能", "额滴个神", "窈窕", "梦入晚花", "爲愛鼓掌", "雨", "落樱纷飞", "马猴烧酒", "向阳花", "白衣少年", "幸运烟雨", "斗宗强者", "三师公", "步步为赢", "苍了微凉", "枫林晚", "卡哇伊",
                "乘风破~", "欧豆豆", "史迪仔", "斯給妳", "积灰石台", "此夜此月", "干净月光", "故人长安", "崖山一夜", "山河故人", "干净利落", "给我盘ta", "古道西风", "十里桃花", "话在心里", "G.I钟",
                "黑凤梨~", "几度几分", "尽揽风月", "静待花开", "孤海微凉", "淮南柚香", "格桑花", "闰土与猹", "蓝涩雨蝶", "兔女郎", "会飞的鱼", "佛剑分说", "两小无猜",
                "也总", "安得广厦", "焚琴煮鹤", "青阳", "钢炼", "笑在眉眼", "我是雨师..", "我是演员", "青梅煮马", "瘦马淡雾", "小仙女", "狗骑兔子", "醉酒当歌",
                "晴天飞雪", "破~伤风", "卧龙跃马", "一场惊鸿", "biu,爽", "寒光冷照", "失心疯", "雨伞风听", "新鲜感觉", "如之奈何", "君子剑", "烈酒入喉", "杂修", "剑指天涯", "山中老人", "时辰的错",
                "救赎乀", "夜雨沧皮", "醉饮千山", "不离不弃", "莫山主", "冷战思维", "猪头帝", "单相思", "猪头少年", "红袖依然", "独角戏", "冬去春来", "冰轮", "乱了头发", "天国比雕",
                "锁心神笔", "留级生", "有烟无伤", "疯狂游戏", "小奶狗", "余温余情", "joe", "好人卡", "三刀流", "贰零壹玖", "朱颜华发", "万人敌", "死肥宅", "竹楼醉酒", "仅仅喜欢", "甲方",
                "人心所向", "韩晓飞", "如你所愿", "冷漾船舷", "又是一年", "周扒皮", "君莫笑", "飞刀", "四月绿", "心安如梦", "流沙", "烟云浮华", "弃总", "走路草", "追忆流年"];
            return arr;
        }
        static getName() {
            let name;
            let ran = Math.floor(Math.random() * (GameData.name_array.length));
            name = GameData.name_array.splice(ran, 1)[0];
            return name;
        }
    }
    GameData.level = 1;
    GameData.maxLevel = 20;
    GameData.arrival_pos_array = [];
    GameData.coin = 0;
    GameData.isMoveEnd = false;
    GameData.playerSkin_index = 0;
    GameData.playerSkin_maxindex = 5;
    GameData.playerSkinTex_array = [];
    GameData.princessSkin_index = 0;
    GameData.princessSkin_maxindex = 5;
    GameData.roadTex_map = new Map();
    GameData.isShake = true;
    GameData.isShowHome = false;
    GameData.name_array = [];
    GameData.canRelife = true;
    GameData.rank = 1;
    GameData.rewardCoin = 0;
    GameData.playRank = 1;
    GameData.playerInfos = [];

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
                case "arrival":
                    GameData.arrival_pos = this.transform.position.clone();
                    break;
                default:
                    break;
            }
        }
        onDestroy() {
            super.onDestroy();
        }
    }

    class Arrival extends Obj {
        onAwake() {
            super.onAwake();
            this._arrival = this.owner;
        }
        init(data) {
            super.init(data);
            this.setArrivalPosArray();
        }
        setArrivalPosArray() {
            GameData.arrival_pos_array.length = 0;
            let pos_arr = [];
            let pos_1 = this._arrival.transform.position.clone();
            let pos_2 = new Laya.Vector3(pos_1.x - 2, pos_1.y, pos_1.z);
            pos_arr.push(pos_2);
            let pos_3 = new Laya.Vector3(pos_1.x + 2, pos_1.y, pos_1.z);
            pos_arr.push(pos_3);
            let pos_4 = new Laya.Vector3(pos_1.x, pos_1.y, pos_1.z + 2);
            pos_arr.push(pos_4);
            let pos_5 = new Laya.Vector3(pos_1.x, pos_1.y, pos_1.z - 2);
            pos_arr.push(pos_5);
            pos_arr.push(pos_1);
            GameData.arrival_pos_array = pos_arr;
        }
    }

    var GameState;
    (function (GameState) {
        GameState[GameState["None"] = 0] = "None";
        GameState[GameState["Ready"] = 1] = "Ready";
        GameState[GameState["PreviewMap"] = 2] = "PreviewMap";
        GameState[GameState["Playing"] = 3] = "Playing";
        GameState[GameState["Pause"] = 4] = "Pause";
        GameState[GameState["Die"] = 5] = "Die";
        GameState[GameState["End"] = 6] = "End";
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
        EventName["MINI_GAME_DIE"] = "mini-game-die";
        EventName["MINI_GAME_RELIFE"] = "mini-game-relife";
        EventName["PLAYER_RELIFE"] = "player-relife";
        EventName["ADD_MOENY"] = "add-money";
        EventName["REDUCE_MOENY"] = "reduce-money";
    })(EventName || (EventName = {}));
    class GameDefine {
    }
    GameDefine.maxLevel = 4;
    GameDefine.prefabRoot = 'subPackage/sub1/LayaScene_main/Conventional/';
    GameDefine.levelRoot = 'subPackage/sub1/LayaScene_main/remote/levels/';
    GameDefine.scenePath = "subPackage/sub1/LayaScene_main/Conventional/main.ls";
    GameDefine.wordTexPath = 'subPackage/LayaScene_main/tex/';
    GameDefine.soundPath = 'subPackage/LayaScene_main/sounds/';
    GameDefine.roadTexPath = 'subPackage/sub1/RoadTextures/ground_';
    GameDefine.dataPath = "data/";
    GameDefine.preload = [
        "character_base.lh",
        "water.lh",
        "plank_hand.lh",
        "plank_road.lh",
        "Turn_45_L.lh",
        "Turn_45_R.lh",
        "Turn_45_short_L.lh",
        "Turn_45_short_R.lh",
        "cube.lh",
        "arrival.lh",
        "fallEffect.lh",
        "planks.lh",
        "enemy.lh",
        "Stright.lh",
        "Cylinder.lh"
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
            this._start_moving = false;
            Camera.instance = this;
        }
        onAwake() {
            this._camera = this.owner;
            this._cameraPos = this._camera.transform.position.clone();
        }
        onEnable() {
        }
        onDisable() {
        }
        initPlayerData(player, point) {
            this._target = player;
            this._point = point;
            this._start_moving = false;
        }
        onLateUpdate() {
            if (Laya.timer.delta > 100) {
                return;
            }
            if (GameDefine.gameState != GameState.Playing) {
                return;
            }
            this._cameraPointTween(this._point, this._target);
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
        _cameraPointTween(point, target) {
            if (!point || this._start_moving || !target) {
                return;
            }
            this._start_moving = true;
            Laya.Tween.to(point.transform, { localPositionZ: -10, localPositionY: 5 }, 1000, null, Laya.Handler.create(this, () => {
            }));
        }
    }
    Camera.instance = null;

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
                    (parent || GameData.scene3d).addChild(p);
                    p.transform.position = pos;
                    if (recycleDelay != -1)
                        Laya.timer.once(recycleDelay, this, a => this.recycleEffect(a), [p]);
                    resolve(p);
                }
                else {
                    Laya.Sprite3D.load(GameDefine.prefabRoot + tag + '.lh', Laya.Handler.create(null, (res) => {
                        let ins = Laya.Sprite3D.instantiate(res);
                        (parent || GameData.scene3d).addChild(ins);
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

    class Pool {
        constructor() {
            this.plankHand_array = [];
            this.plankRoad_array = [];
            this.effect_map = new Map();
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
            this.charactor_tween = new Laya.Tween();
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

    class Enemy extends Charactor {
        constructor() {
            super();
            this._canPop = true;
            this._rotate_speed = 4;
            this._isMoveArrival = false;
            this._die = false;
            this._toArrival = false;
            this._final = false;
            this._toRight = false;
            this.qua = new Laya.Quaternion();
        }
        onAwake() {
            super.onAwake();
            this.player = this.owner;
            this.animator = this.player.getComponent(Laya.Animator);
            this.blank_point = this.player.getChildByName("plank_point");
            this._left = this.player.getChildByName("left");
            this._right = this.player.getChildByName("right");
            this.playerMove = new Laya.Vector3(0, 0, this.forward_speed);
            this.playerRotate = new Laya.Vector3(0, this._rotate_speed, 0);
            this._point = this.player.getChildByName("point");
            this.moveArrivalpointHandler = new Laya.Handler(this, this.moveArrivalpointCallback);
        }
        onStart() {
            super.onStart();
            this.initRay();
            this.playerInfo = {
                name: GameData.getName(),
                rank: 1,
                player: false
            };
            GameData.playerInfos.push(this.playerInfo);
        }
        onEnable() {
            EventManager.register(EventName.MINI_GAME_START, this.onGameStart, this);
            EventManager.register(EventName.MINI_GAME_END, this.onGameEnd, this);
        }
        onDisable() {
            EventManager.unRegister(EventName.MINI_GAME_START, this.onGameStart, this);
            EventManager.unRegister(EventName.MINI_GAME_END, this.onGameEnd, this);
        }
        init(data) {
            super.init(data);
            this.changePlayerState(CharacterAnimation.Idel);
            this.cube_count = 0;
            this._canPop = true;
            this._die = false;
            this._toArrival = false;
            this._final = false;
        }
        onUpdate() {
            if (Laya.timer.delta > 100) {
                return;
            }
            if (GameDefine.gameState == GameState.None || GameDefine.gameState == GameState.Ready) {
                return;
            }
            if (this._die) {
                return;
            }
            if (this._final) {
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
                        this.enemyDie();
                        let pos = new Laya.Vector3(this.player.transform.position.x, -0.5, this.player.transform.position.z);
                        EffectUtil.instance.loadEffect("fallEffect", -1, pos).then(res => {
                            res.active = true;
                        });
                    }
                    break;
            }
        }
        enemyDie() {
            if (!this._die) {
                this._die = true;
            }
        }
        onGameStart() {
            this.changePlayerState(CharacterAnimation.Running);
            this.startRay();
        }
        onGameEnd() {
            if (this._final) {
                return;
            }
            this.playerInfo.rank = GameData.rank;
            GameData.rank++;
        }
        startRay() {
            this.isRayCast = true;
        }
        initRay() {
            this.ray_orign = this.player.transform.position.clone();
            this.ray_down = new Laya.Ray(this.ray_orign, Laya.Vector3.down);
            this.outInfo = new Laya.HitResult();
            this.ray_left_orign = this._left.transform.position.clone();
            this.ray_left_down = new Laya.Ray(this.ray_left_orign, Laya.Vector3.down);
            this.outInfo_left = new Laya.HitResult();
            this.ray_right_orign = this._right.transform.position.clone();
            this.ray_right_down = new Laya.Ray(this.ray_right_orign, Laya.Vector3.down);
            this.outInfo_right = new Laya.HitResult();
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
            if (this.physicsSimulation.rayCast(this.ray_down, this.outInfo, 20)) {
                this.refreshState(this.outInfo, this.animationState);
            }
            if (this._toArrival) {
                this.player.transform.lookAt(GameData.arrival_pos, Laya.Vector3.up, false, false);
                return;
            }
            if (this._toRight) {
                this._toRight = false;
                this._rotateToRight();
            }
            if (this.rayLeftCast() && this.rayRigtCast()) {
                return;
            }
            if (this.rayLeftCast()) {
                this._rotate(-1);
                return;
            }
            if (this.rayRigtCast()) {
                this._rotate(1);
                return;
            }
        }
        refreshState(outInfo, state) {
            if (!outInfo || !outInfo.succeeded) {
                return;
            }
            let colliderName = this.outInfo.collider.owner.name;
            let point = outInfo.point;
            switch (state) {
                case CharacterAnimation.Planche:
                    switch (colliderName) {
                        case "arrival":
                            this._moveArrivalPoint(this.outInfo.collider.owner);
                            break;
                        case "water":
                            if (this.cube_count > 0) {
                                this._popPlankToRoad();
                                this.changePlayerState(CharacterAnimation.Planche);
                            }
                            else {
                                this.changePlayerState(CharacterAnimation.Jump);
                            }
                            break;
                        case "Turn_45_L":
                        case "Turn_45_R":
                        case "Turn_45_short_L":
                        case "Turn_45_short_R":
                        case "Cylinder":
                        case "Stright":
                        case "plank":
                            if (this._toArrival) {
                                this._toArrival = false;
                            }
                            if (!this._toRight) {
                                this._toRight = true;
                                this._part = this.outInfo.collider.owner;
                            }
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
                        case "arrival":
                            this._moveArrivalPoint(this.outInfo.collider.owner);
                            break;
                        case "water":
                            if (this.cube_count > 0) {
                                this._popPlankToRoad();
                                this.changePlayerState(CharacterAnimation.Planche);
                            }
                            else {
                                this.changePlayerState(CharacterAnimation.Jump);
                            }
                            break;
                        case "plank":
                            this._addPlankToEnemy();
                            this.changePlayerState(CharacterAnimation.Carrying);
                            let plank = outInfo.collider.owner;
                            plank.removeSelf();
                            break;
                    }
                    break;
                case CharacterAnimation.Jump:
                    switch (colliderName) {
                        case "arrvial":
                            if (this.juageRoadDistance()) {
                                if (this.player.transform.localPositionY < 0) {
                                    this.player.transform.localPositionY = 0;
                                }
                                this._moveArrivalPoint(this.outInfo.collider.owner);
                            }
                            break;
                        case "plank":
                        case "Turn_45_L":
                        case "Turn_45_R":
                        case "Turn_45_short_L":
                        case "Turn_45_short_R":
                        case "Cylinder":
                        case "Stright":
                            if (this.juageRoadDistance()) {
                                if (!this._toRight) {
                                    this._toRight = true;
                                    this._part = this.outInfo.collider.owner;
                                }
                                this.changePlayerState(CharacterAnimation.Running);
                                if (this.player.transform.localPositionY < 0) {
                                    this.player.transform.localPositionY = 0;
                                }
                            }
                            break;
                        case "plank_road":
                            if (this.juageBlankDistance(point)) {
                                this.changePlayerState(CharacterAnimation.Running);
                            }
                            break;
                    }
                    break;
            }
        }
        juageRoadDistance() {
            return this.player.transform.localPositionY <= 0;
        }
        juageBlankDistance(point) {
            let distance_y = this.player.transform.localPositionY - point.y;
            return distance_y <= 0.05;
        }
        juageWaterDistance() {
            return this.player.transform.localPositionY <= -2.3;
        }
        juageToArrival() {
            if (this._toArrival) {
                return;
            }
            if (this.cube_count > RandomUtil.RandomInteger(14, 18)) {
                this._toArrival = true;
                Laya.timer.once(1000, this, () => {
                    this._toArrival = false;
                });
            }
        }
        rayLeftCast() {
            if (!this.physicsSimulation || !this.isRayCast) {
                return false;
            }
            let pos = this._left.transform.position;
            this.ray_left_orign.setValue(pos.x, pos.y, pos.z);
            if (this.physicsSimulation.rayCast(this.ray_left_down, this.outInfo_left, 20)) {
                let colliderName = this.outInfo_left.collider.owner.name;
                switch (colliderName) {
                    case "water":
                        return false;
                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":
                    case "plank":
                    case "arrival":
                    case "Cylinder":
                    case "Stright":
                        return true;
                }
            }
            return false;
        }
        rayRigtCast() {
            if (!this.physicsSimulation || !this.isRayCast) {
                return false;
            }
            let pos = this._right.transform.position;
            this.ray_right_orign.setValue(pos.x, pos.y, pos.z);
            if (this.physicsSimulation.rayCast(this.ray_right_down, this.outInfo_right, 20)) {
                let colliderName = this.outInfo_right.collider.owner.name;
                switch (colliderName) {
                    case "water":
                        return false;
                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":
                    case "plank":
                    case "arrival":
                    case "Cylinder":
                    case "Stright":
                        return true;
                }
            }
            return false;
        }
        _rotateToRight() {
            if (!this._part) {
                return;
            }
            let target = this._part.getChildAt(0);
            if (!target) {
                return;
            }
            this.player.transform.lookAt(target.transform.position.clone(), Laya.Vector3.up, false, false);
        }
        _moveForward() {
            this.player.transform.translate(this.playerMove, true);
        }
        _decreaseDownspeed() {
            return Laya.timer.delta / 1000 * 0.8;
        }
        _rotate(dir) {
            this.playerRotate.setValue(0, -this._rotate_speed * dir * Laya.timer.delta / 1000, 0);
            this.player.transform.rotate(this.playerRotate, true);
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
            if (state == CharacterAnimation.Planche) {
                this.animator.speed = 1.5;
            }
            else {
                this.animator.speed = 1;
            }
            this.animator.play(state);
        }
        _addPlankToEnemy() {
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
            let animator = cube.getComponent(Laya.Animator);
            animator.play("blank_push");
            let target_y = cube.transform.localPositionY + 0.2;
            Laya.Tween.from(cube.transform, { localPositionY: target_y }, 0.6);
            cube.transform.rotation = this.blank_point.transform.rotation;
            this.cube_array.push(cube);
            this.juageToArrival();
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
        }
        _clearPlank() {
            Laya.timer.frameLoop(1, this.player, () => {
                if (this.cube_array.length <= 0) {
                    Laya.timer.clearAll(this.player);
                    return;
                }
                let cube = this.cube_array.pop();
                this.cube_count--;
                Pool.instance.reversePlankHandCube(cube);
            });
        }
        _moveArrivalPoint(arrival) {
            if (this._isMoveArrival) {
                return;
            }
            if (!arrival) {
                return;
            }
            this._clearPlank();
            this.changePlayerState(CharacterAnimation.Running);
            let pos = GameData.getArrivalPos();
            this._isMoveArrival = true;
            this._clearMoveTween();
            this.player.transform.lookAt(pos, Laya.Vector3.up, false, false);
            this.charactor_tween.to(this.player.transform, { localPositionX: pos.x, localPositionZ: pos.z }, 500, null, this.moveArrivalpointHandler);
        }
        _clearMoveTween() {
            this.charactor_tween.clear();
        }
        moveArrivalpointCallback() {
            if (this._final) {
                return;
            }
            this.playerInfo.rank = GameData.rank;
            GameData.rank++;
            this._final = true;
            if (this.playerInfo.rank === 1) {
                this.changePlayerState(CharacterAnimation.Dance);
            }
            else {
                this.changePlayerState(CharacterAnimation.Defeated);
            }
        }
    }

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
        PauseGame() {
            GameDefine.gameState = GameState.Pause;
            EventManager.dispatchEvent(EventName.MINI_GAME_RELIFE);
        }
        ResumeGame() {
            GameDefine.gameState = GameState.Playing;
        }
        DieGame() {
            GameDefine.gameState = GameState.Die;
            EventManager.dispatchEvent(EventName.MINI_GAME_DIE);
        }
        getRewardCoinCount(rank) {
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
    MiniGameManager._instance = null;

    class Player extends Charactor {
        constructor() {
            super();
            this._rotate_speed = 0.35;
            this.fingerMoveDistance_x = 0;
            this.isMouseDown = false;
            this._canPop = true;
            this._isMoveArrival = false;
        }
        onAwake() {
            super.onAwake();
            this.player = this.owner;
            this._point = this.player.getChildByName("point");
            this.blank_point = this.player.getChildByName("plank_point");
            this.animator = this.player.getComponent(Laya.Animator);
            this.playerMove = new Laya.Vector3(0, 0, this.forward_speed);
            this.curFrameTouchPoint_x = 0;
            this.lastFrameTouchPoint_x = 0;
            this.playerRotate = new Laya.Vector3(0, this._rotate_speed, 0);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
            this.moveArrivalpointHandler = new Laya.Handler(this, this.moveArrivalpointCallback);
        }
        onStart() {
            super.onStart();
            this.initRay();
            this.playerInfo = {
                name: "你",
                rank: 1,
                player: true
            };
            GameData.playerInfos.push(this.playerInfo);
        }
        onEnable() {
            EventManager.register(EventName.MINI_GAME_START, this.onGameStart, this);
            EventManager.register(EventName.MINI_GAME_END, this.onGameEnd, this);
            EventManager.register(EventName.PLAYER_RELIFE, this.relifeCallback, this);
        }
        onDisable() {
            EventManager.unRegister(EventName.MINI_GAME_START, this.onGameStart, this);
            EventManager.unRegister(EventName.MINI_GAME_END, this.onGameEnd, this);
            EventManager.unRegister(EventName.PLAYER_RELIFE, this.relifeCallback, this);
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
                    this._moveForward();
                    if (this.player.transform.localPositionY < 0) {
                        this.player.transform.localPositionY = 0;
                    }
                    break;
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
                        let pos = new Laya.Vector3(this.player.transform.position.x, -0.5, this.player.transform.position.z);
                        EffectUtil.instance.loadEffect("fallEffect", -1, pos).then(res => {
                            res.active = true;
                        });
                        if (GameData.canRelife) {
                            GameData.canRelife = false;
                            MiniGameManager.instance().PauseGame();
                        }
                        else {
                            MiniGameManager.instance().DieGame();
                        }
                    }
                    break;
            }
        }
        init(data) {
            super.init(data);
            Camera.instance.initPlayerData(this.player, this._point);
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
            if (state == CharacterAnimation.Planche) {
                this.animator.speed = 1.5;
            }
            else {
                this.animator.speed = 1;
            }
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
            if (this.physicsSimulation.rayCast(this.ray_down, this.outInfo, 20)) {
                this.refeshState(this.outInfo, this.animationState);
            }
        }
        refeshState(outInfo, state) {
            if (!outInfo || !outInfo.succeeded) {
                return;
            }
            let colliderName = this.outInfo.collider.owner.name;
            if (GameData.canRelife) {
                switch (colliderName) {
                    case "Turn_45_L":
                    case "Turn_45_R":
                    case "Turn_45_short_L":
                    case "Turn_45_short_R":
                    case "Cylinder":
                    case "Stright":
                        let part = this.outInfo.collider.owner;
                        this.setRelifePart(part);
                        break;
                }
            }
            let point = outInfo.point;
            switch (state) {
                case CharacterAnimation.Planche:
                    switch (colliderName) {
                        case "arrival":
                            this._moveArrivalPoint(this.outInfo.collider.owner);
                            break;
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
                        case "Cylinder":
                        case "Stright":
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
                        case "arrival":
                            this._moveArrivalPoint(this.outInfo.collider.owner);
                            break;
                        case "water":
                            if (this.cube_count > 0) {
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
                            break;
                    }
                    break;
                case CharacterAnimation.Jump:
                    switch (colliderName) {
                        case "arrvial":
                            if (this.juageRoadDistance()) {
                                if (this.player.transform.localPositionY < 0) {
                                    this.player.transform.localPositionY = 0;
                                }
                                this._moveArrivalPoint(this.outInfo.collider.owner);
                            }
                            break;
                        case "plank":
                        case "Turn_45_L":
                        case "Turn_45_R":
                        case "Turn_45_short_L":
                        case "Turn_45_short_R":
                        case "Cylinder":
                        case "Stright":
                            if (this.juageRoadDistance()) {
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
            let animator = cube.getComponent(Laya.Animator);
            animator.play("blank_push");
            let target_y = cube.transform.localPositionY + 0.2;
            Laya.Tween.from(cube.transform, { localPositionY: target_y }, 0.6);
            cube.transform.rotation = this.blank_point.transform.rotation;
            this.cube_array.push(cube);
            AudioManager.instance().playEffect("Collect");
            SdkUitl.vibrateShort();
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
            SdkUitl.vibrateShort();
        }
        _clearPlank() {
            Laya.timer.frameLoop(1, this.player, () => {
                if (this.cube_array.length <= 0) {
                    Laya.timer.clearAll(this.player);
                    return;
                }
                let cube = this.cube_array.pop();
                this.cube_count--;
                Pool.instance.reversePlankHandCube(cube);
            });
        }
        _throwPlank(cb) {
            if (this.cube_array.length < 0) {
                cb && cb();
                return;
            }
            this.cube_array.map((cube, index) => {
                let target_x = RandomUtil.Random(-5, 5);
                let target_z = RandomUtil.Random(3, 10);
                Laya.Tween.to(cube.transform, { localPositionX: target_x / 2, localPositionY: RandomUtil.Random(3, 5), localPositionZ: target_z / 2 }, 500, Laya.Ease.quadIn, Laya.Handler.create(this, () => {
                    Laya.Tween.to(cube.transform, { localPositionX: target_x, localPositionY: 0, localPositionZ: target_z }, 500, Laya.Ease.quadIn, Laya.Handler.create(this, () => {
                        if (index === this.cube_array.length - 1) {
                            cb && cb();
                        }
                    }));
                }));
            });
        }
        _moveArrivalPoint(arrival) {
            if (this._isMoveArrival) {
                return;
            }
            if (!arrival) {
                return;
            }
            this._throwPlank(() => {
                this._clearPlank();
            });
            this.changePlayerState(CharacterAnimation.Running);
            let pos = GameData.getArrivalPos();
            this.player.transform.lookAt(pos, Laya.Vector3.up, false, false);
            this._isMoveArrival = true;
            this._clearMoveTween();
            this.charactor_tween.to(this.player.transform, { localPositionX: pos.x, localPositionZ: pos.z }, 500, null, this.moveArrivalpointHandler);
        }
        _clearMoveTween() {
            this.charactor_tween.clear();
        }
        moveArrivalpointCallback() {
            if (GameDefine.gameState == GameState.End) {
                return;
            }
            this.playerInfo.rank = GameData.rank;
            GameData.playRank = this.playerInfo.rank;
            GameData.rank++;
            MiniGameManager.instance().EndGame();
            if (this.playerInfo.rank === 1) {
                AudioManager.instance().playEffect("Win");
                this.changePlayerState(CharacterAnimation.Dance);
            }
            else {
                AudioManager.instance().playEffect("Fail");
                this.changePlayerState(CharacterAnimation.Defeated);
            }
        }
        setRelifePart(part) {
            if (!this._relifePart) {
                this._relifePart = part;
                return;
            }
            if (this._relifePart != part) {
                this._relifePart = part;
            }
        }
        relifeCallback() {
            if (this._relifePart) {
                let relifePos = this._relifePart.transform.position.clone();
                this.player.transform.position = new Laya.Vector3(relifePos.x, 0, relifePos.z);
                let target = this._relifePart.getChildAt(0);
                this.player.transform.lookAt(target.transform.position.clone(), Laya.Vector3.up, false, false);
                MiniGameManager.instance().ResumeGame();
            }
            else {
            }
        }
    }

    class Water extends Obj {
        onAwake() {
            super.onAwake();
            this._water = this.owner;
            this._mat = this._water.meshRenderer.material;
        }
        init(data) {
            super.init(data);
        }
        onUpdate() {
            if (Laya.timer.delta >= 100) {
                return;
            }
            this.WaterFloat();
        }
        WaterFloat() {
            if (!this._mat) {
                return;
            }
            let uv_y = this._mat.tilingOffsetY;
            let uv_x = this._mat.tilingOffsetX;
            let timer = Laya.timer.delta / 1000;
            this._mat.tilingOffsetY += 0.01 * 0.02 * (Math.sin(uv_x * 3.5 + timer * 0.35) + Math.sin(uv_x * 4.8 + timer * 1.05) + Math.sin(uv_x * 7.3 + timer * 0.45)) / 3.0;
            this._mat.tilingOffsetX += 0.12 * 0.02 * (Math.sin(uv_y * 4.0 + timer * 0.5) + Math.sin(uv_y * 6.8 + timer * 0.75) + Math.sin(uv_y * 11.3 + timer * 0.2)) / 3.0;
            this._mat.tilingOffsetY += 0.12 * 0.02 * (Math.sin(uv_x * 4.2 + timer * 0.64) + Math.sin(uv_x * 6.3 + timer * 1.65) + Math.sin(uv_x * 8.2 + timer * 0.45)) / 3.0;
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

    var Handler$1 = Laya.Handler;
    var Vector3$2 = Laya.Vector3;
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
            GameData.name_array = GameData.RandomName();
            return new Promise(resolve => {
                Promise.all([
                    this.loadScene3D(GameDefine.scenePath),
                    this.loadConfig(level),
                    this.loadSounds(),
                    this.loadRoadTextures(),
                ]).then(ret => {
                    this.data = ret[1];
                    this.data.objs.sort((a, b) => a.transform[14] - b.transform[14]);
                    this.camera = this.scene_3d.getChildByName("Main Camera");
                    this.camera.addComponent(Camera);
                    this.camera.enableHDR = false;
                    this.map = new Laya.Sprite3D("Map", true);
                    this.map.transform.position = Vector3$2.zero;
                    this.map.transform.setWorldLossyScale(Vector3$2.one);
                    this.map.transform.rotation = Quaternion$1.DEFAULT;
                    this.scene_3d.addChild(this.map);
                    Laya.stage.getChildByName("root").addChildAt(this.scene_3d, 0);
                    console.log(Laya.stage, "root");
                    GameData.scene3d = this.scene_3d;
                    GameData.map = this.map;
                    if (this.road_mat) {
                        let index = (level - 1) % 7;
                        if (GameData.roadTex_map.has(index.toString()))
                            this.road_mat.albedoTexture = GameData.roadTex_map.get(index.toString());
                    }
                }).then(() => {
                    this.init().then(() => {
                        this.isGameReady = true;
                        console.log("game ready");
                        resolve();
                    });
                });
            });
        }
        loadRoadTextures() {
            return new Promise(resolve => {
                let arr = [];
                for (let i = 0; i < 7; i++) {
                    arr.push(new Promise(resolve2 => {
                        Laya.Texture2D.load(GameDefine.roadTexPath + i + ".png", Handler$1.create(null, (tex) => {
                            if (!GameData.roadTex_map.has(i.toString())) {
                                GameData.roadTex_map.set(i.toString(), tex);
                            }
                            resolve2();
                        }));
                    }));
                }
                Promise.all(arr).then(() => {
                    Laya.timer.frameOnce(1, null, () => {
                        resolve();
                    });
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
                        resolve();
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
                            if (name == "Turn_45_L.lh") {
                                this.setRoadMat(sp);
                            }
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
        setRoadMat(sp) {
            let road = sp;
            this.road_mat = road.meshRenderer.sharedMaterial;
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
                default:
                    ins = clone.addComponent(Obj);
                    break;
            }
            ins.init(d);
            this.entitys[d.id] = ins;
            return ins;
        }
        loadSkyMat() {
            let scr = GameDefine.prefabRoot + 'Assets/Materialss/SkyMat.lmat';
            return new Promise(resolve => {
                Laya.SkyBoxMaterial.load(scr, Laya.Handler.create(null, (m) => {
                    console.log("load mat success", m);
                    this.sky_mat = m;
                    resolve();
                }));
            });
        }
        loadSkyCube() {
            let scr = GameDefine.prefabRoot + 'Assets/Materialss/skyCubeMap.ltc';
            return new Promise(resolve => {
                Laya.TextureCube.load(scr, Laya.Handler.create(null, (textC) => {
                    this.sky_mat.textureCube = textC;
                    resolve();
                }));
            });
        }
        clearScene() {
            Laya.timer.clearAll(this);
            Laya.timer.clearAll(null);
            EffectUtil.instance.clear();
            this.data = null;
            GameData.scene3d.removeSelf();
            GameData.scene3d.destroy();
            GameData.scene3d = null;
            GameData.resetData();
            this.entitys = {};
            ES.instance.offAll();
            Laya.stage.offAll();
            GameDefine.gameState = GameState.None;
        }
    }
    GameManager._instance = null;

    var UITYpes;
    (function (UITYpes) {
        UITYpes[UITYpes["PANEL"] = 0] = "PANEL";
        UITYpes[UITYpes["POPUP"] = 1] = "POPUP";
        UITYpes[UITYpes["TIP"] = 2] = "TIP";
        UITYpes[UITYpes["TUTORIAL"] = 3] = "TUTORIAL";
    })(UITYpes || (UITYpes = {}));
    class PanelBase extends Laya.Script {
        constructor() {
            super(...arguments);
            this.type = UITYpes.PANEL;
            this.isVisible = false;
            this.onShowEnd = null;
        }
        show(...args) {
            this.isVisible = true;
            switch (this.type) {
                case UITYpes.PANEL:
                case UITYpes.POPUP:
                    let panel = this.owner;
                    panel.scaleX = 0.8;
                    panel.scaleY = 0.8;
                    Laya.Tween.to(panel, { scaleX: 1.1, scaleY: 1.1 }, 0.2, null, Laya.Handler.create(this, () => {
                        Laya.Tween.to(panel, { scaleX: 1, scaleY: 1 }, 0.1, null, Laya.Handler.create(this, () => {
                            if (this.onShowEnd) {
                                this.onShowEnd();
                            }
                        }));
                    }));
                    break;
            }
        }
        ;
        hide() {
            this.isVisible = false;
        }
        ;
    }

    class GamePage extends Laya.Script {
        constructor() {
            super();
            this.dictPanelMap = new Map();
            GamePage.instance = this;
        }
        onAwake() {
            AudioManager.instance().loadFromCache();
            this._panelLayer = this.owner.getChildByName("PanelLayer");
            this._popupLayer = this.owner.getChildByName("PopupLayer");
            this._tipLayer = this.owner.getChildByName("TipLayer");
        }
        onStart() {
            let level = this.loadLevelFromCache();
            this.showPage(Constants.UIPage.loading);
            GameManager.instance().loadLevel(level).then(() => {
                this.hidePage(Constants.UIPage.loading, () => {
                    this.showPage(Constants.UIPage.home, null);
                });
                console.log("init scene");
            });
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
        hidePage(name, cb) {
            if (this.dictPanelMap.has(name)) {
                const panel = this.dictPanelMap.get(name);
                if (panel.parent && panel.parent.active) {
                    panel.parent.active = false;
                }
                panel.removeSelf();
                const comp = panel.getComponent(PanelBase);
                if (comp && comp['hide']) {
                    comp['hide'].apply(comp);
                }
                if (cb) {
                    cb();
                }
            }
        }
        showPage(name, cb, ...args) {
            if (this.dictPanelMap.has(name)) {
                const panel = this.dictPanelMap.get(name);
                const comp = panel.getComponent(PanelBase);
                const parent = this.getParent(comp.type);
                parent.active = true;
                parent.addChild(panel);
                if (comp && comp['show']) {
                    comp['show'].apply(comp, args);
                }
                cb && cb();
                return;
            }
            let prefab = this.getPrefab(name);
            let panel = prefab.create();
            this.dictPanelMap.set(name, panel);
            const comp = panel.getComponent(PanelBase);
            const parent = this.getParent(comp.type);
            parent.active = true;
            parent.addChild(panel);
            if (comp && comp['show']) {
                comp['show'].apply(comp, args);
            }
            cb && cb();
        }
        hideAll() {
            this.dictPanelMap.forEach((panel) => {
                const comp = panel.getComponent(PanelBase);
                if (comp && comp.isVisible) {
                    this.hidePage(panel.name);
                }
            });
        }
        getParent(type) {
            switch (type) {
                case UITYpes.PANEL:
                    return this._panelLayer;
                case UITYpes.POPUP:
                    return this._popupLayer;
                case UITYpes.TIP:
                    return this._tipLayer;
            }
        }
        getPrefab(name) {
            switch (name) {
                case Constants.UIPage.home:
                    return this.homePage;
                case Constants.UIPage.playing:
                    return this.playingPage;
                case Constants.UIPage.relife:
                    return this.relifePage;
                case Constants.UIPage.result:
                    return this.resultPage;
                case Constants.UIPage.loading:
                    return this.loadingPage;
            }
        }
    }
    GamePage.instance = null;

    class CharactorManager {
        static instance() {
            if (!this._instance) {
                this._instance = new CharactorManager();
            }
            return this._instance;
        }
        loadFromCache() {
            const playerInfo = Configuration.instance().getConfigData(Constants.PlayerInfoID);
            if (playerInfo) {
                this.playerInfo = JSON.parse(playerInfo);
            }
            else {
                this.playerInfo = {
                    money: 0
                };
            }
        }
        saveAudioInfoToCache() {
            const data = JSON.stringify(this.playerInfo);
            Configuration.instance().setConfigData(Constants.PlayerInfoID, data);
        }
        addMoney(money) {
            this.playerInfo.money += money;
            this.saveAudioInfoToCache();
            EventManager.dispatchEvent(EventName.ADD_MOENY);
        }
        reduceMoney(money) {
            if (this.playerInfo.money >= money) {
                this.playerInfo.money -= money;
                this.saveAudioInfoToCache();
                EventManager.dispatchEvent(EventName.REDUCE_MOENY);
            }
        }
    }
    CharactorManager._instance = null;

    const width = 530;
    class LoadingPage extends Laya.Script {
        constructor() {
            super(...arguments);
            this._isSubload = false;
            this._enterGame = false;
        }
        onAwake() {
            this.uiBox = this.owner.getChildAt(0);
            this.progress = this.owner.getChildByName("progress");
            this.progress.width = 1;
        }
        onStart() {
            Configuration.instance().init();
            CharactorManager.instance().loadFromCache();
            this.loadSubPackages();
        }
        onUpdate() {
            if (Laya.timer.delta > 100)
                return;
            if (this._enterGame)
                return;
            this._refreshProgress();
        }
        loadSubPackages() {
            this._subTask = SdkUitl.loadSubpackage("sub1", () => {
                this.subCallback();
            });
            if (this._subTask) {
                this._subTask.onProgressUpdate(res => {
                    this._subProgress = res.progress;
                });
            }
        }
        _refreshProgress() {
            if (this.progress.width <= 0.9 * width) {
                if (this._subTask) {
                    this.progress.width = this._subProgress * 0.9 * width;
                }
                else {
                    this.progress.width += Laya.timer.delta / 1000 * 0.5 * width;
                }
            }
            else {
                if (this._isSubload) {
                    this.progress.width += Laya.timer.delta / 1000 * 0.2 * width;
                }
                if (this.progress.width >= width) {
                    this.progress.width = width;
                }
                if (this.progress.width >= width) {
                    this.enterGame();
                }
            }
        }
        subCallback() {
            if (!this._isSubload) {
                Laya.Scene.open("Scenes/Game.scene", false);
                this._isSubload = true;
                SdkUitl.loadSubpackage("sub2", null);
            }
        }
        enterGame() {
            if (!this._enterGame && GameManager.instance().isGameReady) {
                console.log("enter game!");
                Laya.Scene.close("Scenes/Start.scene");
                this._enterGame = true;
            }
        }
    }

    class MoneyInfo extends Laya.Script {
        onAwake() {
            this._moneyBack = this.owner;
            this._moenyLabel = this._moneyBack.getChildAt(0);
        }
        onEnable() {
            this.refreshMoneyLabel();
            EventManager.register(EventName.REDUCE_MOENY, this.refreshMoneyLabel, this);
            EventManager.register(EventName.ADD_MOENY, this.refreshMoneyLabel, this);
        }
        onDisable() {
            EventManager.unRegister(EventName.REDUCE_MOENY, this.refreshMoneyLabel, this);
            EventManager.unRegister(EventName.ADD_MOENY, this.refreshMoneyLabel, this);
        }
        refreshMoneyLabel() {
            this._moenyLabel.text = CharactorManager.instance().playerInfo.money.toString();
            ;
        }
    }

    class Home extends PanelBase {
        constructor() {
            super();
            this.type = UITYpes.PANEL;
            Home.instance = this;
        }
        onAwake() {
            this._homeUI = this.owner;
            this._uiBox = this._homeUI.getChildAt(0);
            this._startBtn = this._uiBox.getChildByName("StartBtn");
        }
        show(...args) {
            super.show();
        }
        hide() {
            super.hide();
        }
        onEnable() {
            this._startBtn.on(Laya.Event.CLICK, null, this.startGame.bind(this));
        }
        onDisable() {
            this._startBtn.off(Laya.Event.CLICK, null, this.startGame.bind(this));
        }
        startGame() {
            if (GameDefine.gameState != GameState.Playing) {
                MiniGameManager.instance().StartGame();
                GamePage.instance.hidePage(Constants.UIPage.home, () => {
                    GamePage.instance.showPage(Constants.UIPage.playing);
                });
            }
        }
    }
    Home.instance = null;

    class Loading extends PanelBase {
        constructor() {
            super(...arguments);
            this.type = UITYpes.TIP;
            this._startRotate = false;
        }
        onAwake() {
            this._loading = this.owner;
            this._uiBox = this._loading.getChildAt(0);
            this._round = this._uiBox.getChildByName("Round");
        }
        onUpdate() {
            if (Laya.timer.delta > 100) {
                return;
            }
            if (this._startRotate) {
                this._round.rotation += 20;
            }
        }
        show() {
            super.show();
            this._startRotate = true;
        }
        hide() {
            super.hide();
            this._startRotate = false;
            this._round.rotation = 0;
        }
    }

    class Playing extends PanelBase {
        constructor() {
            super();
            this.type = UITYpes.PANEL;
            Playing.instance = this;
        }
        onAwake() {
            this._playing = this.owner;
            this._uiBox = this._playing.getChildAt(0);
            this._moveArrow = this._uiBox.getChildByName("MoveArrow");
        }
        onEnable() {
            this._uiBox.on(Laya.Event.MOUSE_DOWN, this, this.hideMoveArrow.bind(this));
            EventManager.register(EventName.MINI_GAME_RELIFE, this.showRelifeUI, this);
            EventManager.register(EventName.MINI_GAME_DIE, this.showDieUI, this);
            EventManager.register(EventName.MINI_GAME_END, this.showResultUI, this);
        }
        onDisable() {
            this._uiBox.offAll();
            EventManager.unRegister(EventName.MINI_GAME_RELIFE, this.showRelifeUI, this);
            EventManager.unRegister(EventName.MINI_GAME_DIE, this.showDieUI, this);
            EventManager.unRegister(EventName.MINI_GAME_END, this.showResultUI, this);
        }
        show(...args) {
            super.show();
            this.showMoveArrow();
        }
        hide() {
            super.hide();
            this.hideMoveArrow();
        }
        showMoveArrow() {
            this._moveArrow.x = this._uiBox.width / 2;
            this._moveArrow.y = this._uiBox.height / 3 * 2;
            this._moveArrow.visible = true;
        }
        hideMoveArrow() {
            if (this._moveArrow.visible) {
                this._moveArrow.visible = false;
            }
        }
        showRelifeUI() {
            console.log("show relife");
            GamePage.instance.hidePage(Constants.UIPage.playing, () => {
                GamePage.instance.showPage(Constants.UIPage.relife, null, 0);
            });
        }
        showDieUI() {
            console.log("show die");
            GamePage.instance.hidePage(Constants.UIPage.playing, () => {
                GamePage.instance.showPage(Constants.UIPage.relife, null, 1);
            });
        }
        showResultUI() {
            console.log("show result");
            GamePage.instance.hidePage(Constants.UIPage.playing, () => {
                GamePage.instance.showPage(Constants.UIPage.result);
            });
        }
    }
    Playing.instance = null;

    class Relife extends PanelBase {
        constructor() {
            super();
            this.type = UITYpes.PANEL;
            this._time = 5;
            Relife.instance = this;
        }
        onAwake() {
            this._relife = this.owner;
            this._uiBox = this._relife.getChildAt(0);
            this._relifeBtn = this._uiBox.getChildByName("RelifeBtn");
            this._restartBtn = this._uiBox.getChildByName("AgainBtn");
            this._title = this._uiBox.getChildByName("Title");
            this._timerImg = this._uiBox.getChildByName("Timer");
        }
        onEnable() {
            this._relifeBtn.on(Laya.Event.CLICK, this, this.playerRelfie.bind(this));
            this._restartBtn.on(Laya.Event.CLICK, this, this.playAgain.bind(this));
        }
        onDisable() {
            this._relifeBtn.offAll();
        }
        show(type = 0) {
            super.show();
            console.log(type, "type");
            switch (type) {
                case 0:
                    this._relifeBtn.visible = true;
                    this._restartBtn.visible = true;
                    this._title.visible = false;
                    this.showCountdown();
                    break;
                case 1:
                    this._timerImg.visible = false;
                    this._relifeBtn.visible = false;
                    this._restartBtn.visible = true;
                    this._title.visible = true;
                    break;
            }
        }
        hide() {
            super.hide();
        }
        playerRelfie() {
            Laya.timer.clear(this, this._refreshCountdown);
            GamePage.instance.hidePage(Constants.UIPage.relife, () => {
                GamePage.instance.showPage(Constants.UIPage.playing, () => {
                    EventManager.dispatchEvent(EventName.PLAYER_RELIFE);
                });
            });
        }
        playAgain() {
            Laya.timer.clear(this, this._refreshCountdown);
            GamePage.instance.hidePage(Constants.UIPage.relife, () => {
                ES.instance.event(ES.on_clear_scene);
                GamePage.instance.showPage(Constants.UIPage.loading);
                GameManager.instance().loadLevel(GameData.level).then(() => {
                    console.log('init scene complete');
                    GamePage.instance.hidePage(Constants.UIPage.loading, () => {
                        GamePage.instance.showPage(Constants.UIPage.home, null);
                    });
                });
            });
        }
        showCountdown() {
            this._time = 5;
            this._timerImg.skin = "textures/d5.png";
            this._timerImg.visible = true;
            this._relifeBtn.visible = true;
            Laya.timer.loop(1000, this, this._refreshCountdown);
        }
        _refreshCountdown() {
            if (this._time > 0) {
                this._time--;
            }
            if (this._time === 0) {
                this._timerImg.visible = false;
                this._relifeBtn.visible = false;
                Laya.timer.clear(this, this._refreshCountdown);
                return;
            }
            this._timerImg.skin = `textures/d${this._time}.png`;
        }
    }
    Relife.instance = null;

    class RankItem extends Laya.Script {
        constructor() {
            super(...arguments);
            this._tween = new Laya.Tween();
        }
        onAwake() {
            this._rankBack = this.owner;
            this._rankLabel = this._rankBack.getChildByName("RankLabel");
            this._coinLabel = this._rankBack.getChildByName("Coin").getChildByName("CoinLabel");
            this._nameLabel = this._rankBack.getChildByName("NameLabel");
        }
        setData(data) {
            if (!data) {
                return;
            }
            this.refreshUI(data);
        }
        refreshUI(data) {
            if (!data) {
                return;
            }
            this._rankBack.scaleX = 1;
            this._rankBack.scaleY = 1;
            if (data.player) {
                this._rankBack.skin = "textures/you.png";
                this.playTween();
                GameData.rewardCoin = MiniGameManager.instance().getRewardCoinCount(data.rank);
            }
            else {
                this._rankBack.skin = "textures/RankPanel.png";
                this.stopTween();
            }
            this._nameLabel.text = data.name;
            if (MiniGameManager.instance().getRewardCoinCount(data.rank)) {
                this._coinLabel.text = MiniGameManager.instance().getRewardCoinCount(data.rank).toString();
            }
        }
        playTween() {
            this._toLong();
        }
        _toLong() {
            this._tween.to(this._rankBack, { scaleX: 1.1, scaleY: 1.1 }, 500, null, Laya.Handler.create(this, this._toShort));
        }
        _toShort() {
            this._tween.to(this._rankBack, { scaleX: 1, scaleY: 1 }, 500, null, Laya.Handler.create(this, this._toLong));
        }
        stopTween() {
            this._tween.clear();
        }
    }

    class Result extends PanelBase {
        constructor() {
            super();
            this.onShowEnd = this.setRankItem;
            Result.instance = this;
        }
        onAwake() {
            this._result = this.owner;
            this._uiBox = this._result.getChildAt(0);
            this._videoBtn = this._uiBox.getChildByName("VideoBtn");
            this._directBtn = this._uiBox.getChildByName("DirectBtn");
            this._ranks = this._uiBox.getChildByName("Ranks");
            this._youRankLabel = this._uiBox.getChildByName("RankBack").getChildByName("YouRankBack");
        }
        onStart() {
            this._videoBtn.on(Laya.Event.CLICK, this, this.getVideoReward);
            this._directBtn.on(Laya.Event.CLICK, this, this.getDirectReward);
        }
        show() {
            super.show();
            this._refreshYouRankLabel();
        }
        hide() {
            super.hide();
        }
        getVideoReward() {
            this._getReward(3);
            this.nextLevel();
        }
        getDirectReward() {
            this._getReward();
            this.nextLevel();
        }
        nextLevel() {
            GameData.level++;
            if (GameData.level > GameDefine.maxLevel) {
                GameData.level = 1;
            }
            GamePage.instance.hidePage(Constants.UIPage.result, () => {
                ES.instance.event(ES.on_clear_scene);
                GamePage.instance.showPage(Constants.UIPage.loading);
                GameManager.instance().loadLevel(GameData.level).then(() => {
                    GamePage.instance.hidePage(Constants.UIPage.loading, () => {
                        GamePage.instance.showPage(Constants.UIPage.home);
                    });
                });
            });
        }
        setRankItem() {
            console.log(GameData.playerInfos, "GameData.playerInfos");
            for (let i = 0; i < this._ranks.numChildren; i++) {
                let playerData;
                GameData.playerInfos.map(data => {
                    if (data.rank - 1 == i) {
                        playerData = data;
                    }
                });
                const comp = this._ranks.getChildAt(i).getComponent(RankItem);
                comp.setData && comp.setData(playerData);
            }
        }
        _getReward(rate = 1) {
            let rewardCoin = GameData.rewardCoin * rate;
            CharactorManager.instance().addMoney(rewardCoin);
        }
        _refreshYouRankLabel() {
            let rank = GameData.playRank;
            switch (rank) {
                case 1:
                    this._youRankLabel.text = "第一名";
                    break;
                case 2:
                    this._youRankLabel.text = "第二名";
                    break;
                case 3:
                    this._youRankLabel.text = "第三名";
                    break;
                case 4:
                    this._youRankLabel.text = "第四名";
                    break;
            }
        }
    }
    Result.instance = null;

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/Pages/GamePage.ts", GamePage);
            reg("script/Pages/LoadingPage.ts", LoadingPage);
            reg("script/UI/Compoments/MoneyInfo.ts", MoneyInfo);
            reg("script/UI/Home.ts", Home);
            reg("script/UI/Loading.ts", Loading);
            reg("script/UI/Playing.ts", Playing);
            reg("script/UI/Relife.ts", Relife);
            reg("script/UI/Compoments/RankItem.ts", RankItem);
            reg("script/UI/Result.ts", Result);
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
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

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

    var Vector3$3 = (function () {
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

    var Vector2 = Laya.Vector2;
    var zero = new Vector2();
    var Vector2$1 = (function () {
        Vector2.prototype.vsub = function (v, target) {
            var self = this;
            var target = target || new Laya.Vector2();
            target.x = self.x - v.x;
            target.y = self.y - v.y;
            return target;
        };
        Vector2.prototype.vadd = function (v, target) {
            var self = this;
            var target = target || new Laya.Vector2();
            target.x = self.x + v.x;
            target.y = self.y + v.y;
            return target;
        };
        Vector2.prototype.mult = function (n, target) {
            var target = target || new Vector2();
            target.x = this.x * n;
            target.y = this.y * n;
            return target;
        };
        Vector2.prototype.divide = function (n, target) {
            var target = target || new Vector2();
            target.x = this.x / n;
            target.y = this.y / n;
            return target;
        };
        Vector2.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y;
        };
        Vector2.prototype.lerp = function (a, t, target) {
            t = Mathf.Clamp01(t);
            var target = target || new Laya.Vector2();
            target.x = this.x + ((a.x - this.x) * t);
            target.y = this.y + ((a.y - this.y) * t);
            return target;
        };
        Vector2.prototype.lerpUnclamped = function (a, t, target) {
            var target = target || new Laya.Vector2();
            target.x = this.x + ((a.x - this.x) * t);
            target.y = this.y + ((a.y - this.y) * t);
            return target;
        };
        Vector2.prototype.magnitude = function () {
            return Mathf.Sqrt((this.x * this.x) + (this.y * this.y));
        };
        Vector2.moveTowards = function (current, target, maxDistanceDelta, out) {
            var out = out || new Vector2();
            var vector = target.vsub(current);
            var magnitude = vector.magnitude();
            if (magnitude <= maxDistanceDelta || magnitude == 0)
                out.copy(target);
            else {
                current.vadd(vector.divide(magnitude).mult(maxDistanceDelta), out);
            }
            return out;
        };
        Vector2.prototype.normalize = function () {
            let magnitude = this.magnitude();
            if (magnitude <= 1E-05)
                this.set(0, 0);
            else
                this.divide(magnitude, this);
            return this;
        };
        Vector2.prototype.magnitudeSquared = function () {
            return this.dot(this);
        };
        Vector2.prototype.unit = Vector2.prototype.normalize;
        Vector2.prototype.distanceTo = function (p) {
            var x = this.x, y = this.y;
            var px = p.x, py = p.y;
            return Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
        };
        Vector2.prototype.distanceSquared = function (p) {
            var x = this.x, y = this.y;
            var px = p.x, py = p.y;
            return (px - x) * (px - x) + (py - y) * (py - y);
        };
        Vector2.prototype.negate = function (target) {
            target = target || new Laya.Vector2();
            target.x = -this.x;
            target.y = -this.y;
            return target;
        };
        Vector2.prototype.copy = function (v) {
            this.x = v.x;
            this.y = v.y;
            return this;
        };
        Vector2.prototype.set = function (newX, newY) {
            this.x = newX;
            this.y = newY;
        };
        Vector2.prototype.toArray = function () {
            return [this.x, this.y];
        };
        Vector2.prototype.fromArray = function (arr) {
            this.x = arr[0];
            this.y = arr[1];
            this.z = arr[2];
            return this;
        };
        Vector2.prototype.almostEquals = function (v, precision) {
            if (precision === undefined) {
                precision = 1e-6;
            }
            if (Math.abs(this.x - v.x) > precision || Math.abs(this.y - v.y) > precision) {
                return false;
            }
            return true;
        };
        Vector2.prototype.isZero = function () {
            return this.x === 0 && this.y === 0;
        };
        Vector2.prototype.min = function (v) {
            this.x = Mathf.Min(this.x, v.x);
            this.y = Mathf.Min(this.y, v.y);
            return this;
        };
        Vector2.prototype.max = function (v) {
            this.x = Mathf.Max(this.x, v.x);
            this.y = Mathf.Max(this.y, v.y);
            return this;
        };
        Vector2.angle = function (from, to) {
            var num = Mathf.Sqrt(from.magnitudeSquared() * to.magnitudeSquared());
            return num >= 1E-15 ? Mathf.Acos(Mathf.Clamp(from.dot(to) / num, -1, 1)) * 57.29578 : 0;
        };
        Vector2.signedAngle = function (from, to) {
            return Vector2.angle(from, to) * Mathf.Sign(from.x * to.y - from.y * to.x);
        };
        Vector2.reflect = function (inDirection, inNormal, target) {
            var target = target || new Vector2();
            inNormal.mult(inNormal.dot(inDirection) * -2, target);
            target.vadd(inDirection, target);
            return target;
        };
        Vector2.prototype.toString = function () {
            return 'Vector2: ' + this.x + ", " + this.y;
        };
        Vector2.zero = new Vector2();
        Vector2.one = new Vector2(1, 1);
        Vector2.up = new Vector2(0, 1);
        Vector2.down = new Vector2(0, -1);
        Vector2.right = new Vector2(1, 0);
        Vector2.left = new Vector2(-1, 0);
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

    var Vector3$4 = Laya.Vector3;
    var Vector4 = Laya.Vector4;
    var Color = (function () {
        Laya.Color.prototype.toVector3 = function (target) {
            let self = this;
            target = target || new Vector3$4();
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
    var Vector3$5 = Laya.Vector3;
    var Matrix4x4$1 = (function () {
        var _v1 = new Vector3$5();
        var _m1 = new Laya.Matrix4x4();
        var _zero = new Vector3$5(0, 0, 0);
        var _one = new Vector3$5(1, 1, 1);
        var _x = new Vector3$5();
        var _y = new Vector3$5();
        var _z = new Vector3$5();
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
