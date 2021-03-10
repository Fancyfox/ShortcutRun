import RandomUtil from "./RandomUtil";

const templateId_tt: string = "";
const videoAdUnitId_wx: string = "";
const videoAdUnitId_tt: string = ""


export class SdkUitl {

    static images = [
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

    private static _videoPath: string = "";

    private static _videoRewardAd: any;

    public static share(isRecord: boolean = false, succesCallback?: Function, failCallback?: Function) {
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
                        // if(callBack_Success) callBack_Success();
                    },
                    fail: () => {
                        //if(callBack_Fail_Cancel) callBack_Fail_Cancel();
                    }
                })
            } else {
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
                            //add 失败提示
                            if (failCallback) {
                                // GameRecorderManager.instance().setGameRecordBtnState(GameRecorderBtnState.Normal);
                                //恢复录制按钮
                                failCallback();
                            }

                            return;
                        }

                        console.log("取消发布录屏");
                        if (failCallback) {
                            // GameRecorderManager.instance().setGameRecordBtnState(GameRecorderBtnState.End);
                            failCallback();
                        }
                    }
                });
            }
            return;
        }
    }
    public static passiveShare() {
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
                //let data = wx.uma.trackShare(share);
                // return data;
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
                        // let data = tt.uma.trackShare(share);
                        //return data;
                    });
                }
            });
        }
        return;
    }


    private static videoSuccessCallback: Function;
    private static videoFailCallback: Function;
    private static handler: Function = SdkUitl.closeHandler;
    public static createVideoRewardAd() {
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
                // resolve();
                return;
            }
            this._videoRewardAd = wx.createRewardedVideoAd({
                adUnitId: videoAdUnitId_tt
            });
            //this.videoRewardAds.push(videoRewardAd);
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

    private static closeHandler(res) {
        if (res && res.isEnded || res === undefined) {
            // 给与奖励
            console.log("给予奖励");
            this.videoSuccessCallback && this.videoSuccessCallback();
            // AudioManager.instance().resumeMusic();
        } else {
            console.log("未看完广告");
            this.videoFailCallback && this.videoFailCallback();
            // AudioManager.instance().resumeMusic();
        }
    }

    private static setVideoRewardAdCloseEvent(succesCallback: Function, failCallback: Function) {
        this.videoSuccessCallback = succesCallback;
        this.videoFailCallback = failCallback;
    }

    public static showVideoReward(successCallback: Function, failCallback: Function) {
        if (!this._videoRewardAd) {
            return;
        }

        if (!this._videoRewardAd.show) {
            return;
        }

        this._videoRewardAd.show().then(() => {
            console.log("视频广告显示成功，暂停背景音乐");
            //AudioManager.instance().pasueMusic();
            SdkUitl.setVideoRewardAdCloseEvent(successCallback, failCallback);
        }, err => {
            console.log("视频广告显示失败", err);
            this._videoRewardAd.load();
        });
    }

    private static _audio: any = null;
    public static playMusic(name: string, loop: boolean = true) {
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
                this._audio.src = `subPackage/sub2/Audio/Effect/${name}.mp3`;;
                this._audio.autoplay = true;
                this._audio.loop = true;
                this._audio.play();
            }
        }
        let url = `subPackage/sub2/Audio/Effect/${name}.mp3`;
        let bgmLoop = loop ? 0 : 1
        Laya.SoundManager.playMusic(url, bgmLoop);
    }
}



export declare namespace wx {
    /**
     * 
     */
    export const env: any;
    /**
     * 显示当前页面的转发按钮
     * @param obj 
     */
    export function showShareMenu(obj): any
    /**
     * 隐藏转发按钮
     * @param obj 
     */
    export function hideShareMenu(obj): any
    /**
     * 监听小游戏回到前台的事件
     * @param fun 回调
     */
    export function onShow(fun: Function): any
    export function offShow(fun: Function): any
    /**
     * 监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面、显示在聊天顶部等操作会触发此事件。
     * @param fun 回调
     */
    export function onHide(fun: Function): any
    export function offHide(fun: Function): any
    /**
     * 创建激励视频广告组件。
     * @param obj 
     */
    export function createRewardedVideoAd(obj): any
    /**
     * 创建 banner 广告组件。
     * @param obj 
     */
    export function createBannerAd(obj): any
    export function createGridAd(obj): any
    /**
     * 创建插屏广告组件
     */
    export function createInterstitialAd(obj): any
    /**
     * 创建用户信息按钮
     * @param obj 
     */
    export function createUserInfoButton(obj): any
    /**
     * 获取开放数据域
     */
    export function getOpenDataContext(): any
    /**
     * 主动拉起转发，进入选择通讯录界面。
     * @param obj 
     */
    export function shareAppMessage(obj): any
    /**
     * 监听用户点击右上角菜单的「转发」按钮时触发的事件
     * @param obj 
     */
    export function onShareAppMessage(obj): any
    /**
     * 触发分包加载
     * @param obj 
     */
    export function loadSubpackage(obj): any
    /**
     * 获取全局唯一的文件管理器
     */
    export function getFileSystemManager(): any
    /**
     * 打开另一个小程序
     * @param obj 
     */
    export function navigateToMiniProgram(obj): any;
    /**
     * 发起 HTTPS 网络请求。
     * @param obj 
     */
    export function request(obj): any
    /**
     * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
     * @param obj 
     */
    export function previewImage(obj): any
    /**
     * 提前向用户发起授权请求。调用后会立刻弹窗询问用户是否同意授权小程序使用某项功能或获取用户的某些数据，但不会实际调用对应接口。如果用户之前已经同意授权，则不会出现弹窗，直接返回成功。
     * @param obj 
     */
    export function authorize(obj): any
    /**
     * 获取用户信息
     * @param obj 
     */
    export function getUserInfo(obj): any
    /**
     * 显示消息提示框
     * @param obj 
     */
    export function showToast(obj): any
    /**
     * 显示模态对话框
     * @param obj 
     */
    export function showModal(obj): any
    /**
     * 显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
     * @param obj 
     */
    export function showLoading(obj): any
    /**
     * 显示操作菜单
     * @param obj 
     */
    export function showActionSheet(obj): any
    /**
     * 隐藏消息提示框
     * @param obj 
     */
    export function hideToast(obj): any
    /**
     * 隐藏 loading 提示框
     * @param obj 
     */
    export function hideLoading(obj): any
    /**
     * 使手机发生较短时间的振动（15 ms）。仅在 iPhone 7 / 7 Plus 以上及 Android 机型生效
     * @param obj 
     */
    export function vibrateShort(obj): any
    /**
     * 使手机发生较长时间的振动（400 ms)
     * @param obj 
     */
    export function vibrateLong(obj): any
    /**
     * 创建内部 audio 上下文 InnerAudioContext 对象。
     */
    export function createInnerAudioContext(): any
    /**
     * 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
     * @param obj 
     */
    export function getSetting(obj): any
    /**
     * wx.getSystemInfo 的同步版本
     */
    export function getSystemInfoSync(): any
    /**
     * 获取系统信息
     * @param obj 
     */
    export function getSystemInfo(obj): any
    /**
     * 获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。
     */
    export function getMenuButtonBoundingClientRect(): any
    /**
     * 加载字体
     */
    export function loadFont(url: string): string;
}

export declare namespace tt {
    export function createImage(): any
    /**加载自定义字体文件*/
    export function loadFont(obj: any): any
    /**使手机发生较长时间的振动*/
    export function vibrateLong(): any
    /**使手机发生较短时间的振动*/
    export function vibrateShort(): any
    /**显示当前页面的转发按钮*/
    export function showShareMenu(obj: any): any
    /**主动拉起转发界面*/
    export function shareAppMessage(obj: any): any
    /**监听用户点击右上角菜单的“转发”按钮时触发的事件*/
    export function onShareAppMessage(obj: any): any
    /**显示灰色背景的消息提示框*/
    export function showToast(obj: any): any
    /**获取全局唯一的 GameRecorderManager，录屏*/
    export function getGameRecorderManager(): any
    /**创建一个 InnerAudioContext 实例*/
    export function createInnerAudioContext(): any
    /**监听小游戏回到前台的事件*/
    export function onShow(obj: any): any
    /**监听小游戏隐藏到后台事件*/
    export function onHide(obj: any): any
    /**获取临时登录凭证*/
    export function login(obj: any): any
    /**获取已登录用户的基本信息或特殊信息*/
    export function getUserInfo(obj: any): any
    /**获取用户已经授权过的配置*/
    export function getSetting(obj: any): any
    /**打开设置页面，返回用户设置过的授权结果*/
    export function openSetting(obj: any): any;
    /**插屏广告 */
    export function createInterstitialAd(obj: any): any;
    /**条形广告*/
    export function createBannerAd(obj: any): any
    /**视频广告*/
    export function createRewardedVideoAd(obj: any): any
    /**获取系统信息*/
    export function getSystemInfoSync(): any
    /**设置帧率*/
    export function setPreferredFramesPerSecond(obj: any): any
    /**加载字体 */
    export function loadFont(fun: string): string;
    /**发起一个网络请求 */
    export function request(obj: any): any;
    /**调用方法会提前向用户发出授权请求 */
    export function authorize(obj: any): any;
    /**获取用户已经授权过的配置 */
    export function getSetting(obj: any): any;
    /** */
    export function checkSession(obj: any): any;
    /**
 * ​显示模态弹窗
 */
    export function showModal(object: Object): any;

    export function createMoreGamesButton(obj): any;


    export function hbSendOpenid(opendId: string): any;

    export function hbVideo(bool: boolean): any;


}