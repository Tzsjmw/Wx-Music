// pages/music-player/index.js
import { queryRect } from "../../utils/query-rect";
import { audioContext, playerStore } from "../../store/index";
import { debounce } from "../../utils/debounce";
import Notify from "../../miniprogram_npm/@vant/weapp/notify/notify";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, // 当前音乐的id
    currentSong: {}, // 当前播放的音乐
    durationTime: 0, // RO-歌曲总时长
    perOnePercentDurationTime: 0, // 这首歌时间的1% 毫秒
    currentPage: 0, // 活跃的页面
    contentHeight: 0, // 主要内容的高度
    songPlayState: false, // 歌曲是否在播放
    currentTime: 0, // 歌曲已经播放了的时间, 真实从audioContenxt获取的时间
    currentTimeTmp: 0, // 用户滑动播放进度条，作为展示使用。
    isSliderChanging: false, // 进度条是否正在被滑动
    sliderValue: 0, // 歌曲进度进度条
    CDPageLyricItemHeight: 0, //cd播放页歌词高度
    currentPlayMode: "order", // 当前播放模式
    isShowPlaylistPopup: false, // 控制展示歌单列表
    // ========歌词页data========
    lyric: [], // 歌词
    volume: 0, // 音量
    currentLineOfLyric: "", // 当前播放的歌词
    currentIndexOfLyric: 0, // 当前歌词的在数组中的index。// 控制歌词高亮
    currentIndexOfLyric1: 0, // 在制作歌词页时遇到滑动歌词与歌词自动滚动冲突问题；两个index，一个控制歌词高亮，一个控制歌词滚动
    lyricsPageLyricItemHeight: 0, // 歌词页每句歌词的高度
    isLyricDragging: false, // 歌词是否在被用户滑动
    playty:"../../assets/images/player/play-ty.png",
  },
  /**
   * 生命周期函数--监听页面加载
   * 点击song-item组件执行跳转到歌曲播放页,并且开始播放歌曲.
   * 有关正在播放歌曲的所有事件,数据都放在了Store里面.
   */
  onLoad: function (options) {
    // 1.请求歌曲数据,并且开始播放歌曲
    this.setupPlayerStoreListener();
  },
  handleLyricRolling: function (lyricItemSelector, callback) {
    // 1.获取每句歌词的高度
    queryRect(lyricItemSelector)
      .then(callback)
      .catch((err) => {
        // console.log(err.msg);
        this.handleLyricRolling(lyricItemSelector);
      });
  },
  // 切换cd页与歌词展示页
  shiftPage: function () {
    if (this.data.currentPage) {
      this.setData({ currentPage: 0 });
      playerStore.setState("currentIndexOfLyric", 0);
    } else {
      this.setData({ currentPage: 1 });
      playerStore.setState("currentIndexOfLyric", 0);
      // 切换到歌词页需要获取每句歌词的高度. cd播放页加载页面就获取了。
      if (!this.data.lyricsPageLyricItemHeight) {
        this.handleLyricRolling(".lyricsPageLyricItem", (res) => {
          this.setData({ lyricsPageLyricItemHeight: res.height });
        });
      }
    }
    // this.setData({currentPage: !currentPage})
  },
  // ===================== 歌词页的方法 ========================
  // 拖动完成slider
  onVolumeSliderChanged: function (event) {
    const volume = event.detail.value / 100; // 保留两位小数
    // 储存在Storage里面
    wx.setStorage({
      key: "volume",
      data: volume,
    });
    audioContext.volume = volume;
    playerStore.setState("volume", volume);
  },
  // 正在拖动slider
  onVolumeSliderChangging: function (event) {
    const volume = event.detail.value / 100;
    audioContext.volume = volume;
    // 这里可以不需要改变volume，最后在onVolumeSliderChanged改变
    // playerStore.setState("volume", volume);
  },
  // 歌词被滑动
  onLyricTextDisplayDragStart: debounce(
    (event) => {
      playerStore.setState("isLyricDragging", true);
    },
    1000,
    true
  ),
  onLyricTextDisplayDragEnd: debounce((event) => {
    playerStore.setState("isLyricDragging", false);
  }, 1000),
  // ======================================== 底部控制器的方法 ============================================
  // 进度条正在拖动
  onProgressSliderChanging: function (event) {
    // 如果在移动就不要重复设置了. 这个可能是undefined
    if (this.data.isSliderChanging === false) {
      console.log("this.data.isSliderChanging === false");
      playerStore.setState("isSliderChanging", true);
    }
    // 实时更新当前播放进度
    const val = event.detail.value;
    const currentTime = val.toFixed(2) * this.data.perOnePercentDurationTime;
    this.setData({ currentTime });
    // playerStore.setState("currentTime", currentTime);
  },
  // 进度条拖动后
  onProgressSliderChanged: function (event) {
    // 拖动进度条改变歌曲进度
    // 1.slider被滑动到的值
    const sliderValue = event.detail.value;
    playerStore.dispatch("jumpToMusicPlayTimeAction", { sliderValue });
  },
  // 模式按钮被点击
  onModeBtnClick: function (params) {
    playerStore.dispatch("changePlayModeAction");
  },
  // 点击上一曲
  onPrevBtnClick: function () {
    playerStore.dispatch("switchSong", { act: -1 });
  },
  // 播放按钮点击
  onPlayBtnClick: function () {
    playerStore.dispatch("changePlayStateAction");
  },
  // 点击下一曲
  onNextBtnClick: function (params) {
    playerStore.dispatch("switchSong", { act: +1 });
  },
  // 播放列表按钮被点击
  onListBtnClick: function () {
    this.setData({ isShowPlaylistPopup: true });
    // console.log(playerStore.state.currentPlayMusicIndexInTrack);
    // console.log(playerStore.state.currentPlaylist);
    // console.log(playerStore.state.currentPlaylistTracks);
  },
  //
  onPlaylistPopupClose: function () {
    this.setData({ isShowPlaylistPopup: false });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const screenHeight = getApp().globalData.screenHeight;
    // 1.计算储存content的高度
    queryRect(".nav-bar").then((res) => {
      this.setData({ contentHeight: screenHeight - res.height });
    });
    // 2.获取cd播放页歌词高度
    this.handleLyricRolling(".CDPageLyricItem", (res) => {
      this.setData({ CDPageLyricItemHeight: res.height });
    });
  },
  /**
   * 监听当前播放歌曲的信息
   */
  setupPlayerStoreListener: function () {
    // 1.获取网络请求下来的固定数据
    // onstates是监听些值的改变，每次改变都会执行回调函数，并且把监听的数据作为参数执行回调函数
    playerStore.onStates(
      ["currentSong", "durationTime", "perOnePercentDurationTime", "lyric"],
      ({ currentSong, durationTime, perOnePercentDurationTime, lyric }) => {
        if (currentSong) this.setData({ currentSong });
        if (durationTime) this.setData({ durationTime });
        if (perOnePercentDurationTime)
          this.setData({ perOnePercentDurationTime });
        if (lyric) this.setData({ lyric });
      }
    );
    // 2.监听歌曲播放状态
    playerStore.onStates(
      ["isSliderChanging", "volume"],
      ({ isSliderChanging, volume }) => {
        // boolean的变量
        if (isSliderChanging !== undefined) this.setData({ isSliderChanging });
        if (volume) this.setData({ volume });
      }
    );
    // 3.歌曲播放进度
    playerStore.onStates(
      ["currentTime", "sliderValue"],
      ({ currentTime, sliderValue }) => {
        if (currentTime) this.setData({ currentTime });
        if (sliderValue) this.setData({ sliderValue });
      }
    );
    // 4.歌词状态
    playerStore.onStates(
      ["currentLineOfLyric", "currentIndexOfLyric", "currentIndexOfLyric1"],
      ({ currentLineOfLyric, currentIndexOfLyric, currentIndexOfLyric1 }) => {
        if (currentLineOfLyric) this.setData({ currentLineOfLyric });
        if (currentIndexOfLyric) this.setData({ currentIndexOfLyric });
        if (currentIndexOfLyric1) this.setData({ currentIndexOfLyric1 });
      }
    );
    // 5.播放模式、上一曲、暂停、下一曲、播放列表
    playerStore.onStates(
      ["currentPlayMode", "songPlayState", "curerntPlayModeText"],
      ({ currentPlayMode, songPlayState, curerntPlayModeText }) => {
        if (currentPlayMode) {
          this.setData({ currentPlayMode });
        }
        if (songPlayState !== undefined) this.setData({ songPlayState });
        if (curerntPlayModeText) {
          // 提示当前播放模式
          // 每次进来这个页面都会执行onlaunch函数，这个函数也会一起执行。第一次两个参数肯定是一样的所以不用提示。
          if (currentPlayMode !== this.data.currentPlayMode) {
            wx.showToast({
              title: curerntPlayModeText,
              icon: "none",
            });
          }
        }
      }
    );
  },

});
