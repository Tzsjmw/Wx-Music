// components/play-bar/index.js
import { playerStore } from "../../store/player-store";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    safeAreaInsetBottom: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isPlay: false,
    isShowPlaylistPopup: false,
    currentSong: {},
    playlist: [],
    playimg:'../../assets/images/player/play_mus.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPlayBtnClick() {
      // 第一次点播放按钮时 需要先将歌曲放在播放器上
      playerStore.dispatch("changePlayStateAction");
    },
    onPlayBarClick() {
      wx.navigateTo({
        url: "/pages/music-player/index",
      });
    },
    onPlaylistBtnClick() {
      this.setData({ isShowPlaylistPopup: true });
    },
    onPlaylistPopupClose() {
      this.setData({ isShowPlaylistPopup: false });
    },
  },
  lifetimes: {
    ready() {
      playerStore.onStates(
        ["currentSong", "currentPlaylistTracks"],
        ({ currentSong, currentPlaylistTracks }) => {
          if (currentSong) this.setData({ currentSong: currentSong });
          if (currentPlaylistTracks) {
            this.setData({ playlist: currentPlaylistTracks });
          }
        }
      );
      playerStore.onState("songPlayState", (songPlayState) => {
        this.setData({ isPlay: songPlayState });
      });
    },
  },
});
