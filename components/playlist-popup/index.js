// components/playlist-popup/index.js
import { playerStore } from "../../store/player-store";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowPlaylistPopup: {
      type: Boolean,
      value: false,
    },
    widthP: {
      type: String,
      value: "100",
    },
    leftP: {
      type: String,
      value: "0",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    curerntPlayModeText: "", // 当前播放模式
    currentPlaylistTracks: [], // 播放列表,
    currentIndex: 0, // 当前播放歌曲在歌单中的index
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPlaylistPopupClose() {
      this.triggerEvent("onClose", false);
    },
    onSongClick(event) {
      const index = event.currentTarget.dataset.index;
      const id = this.data.currentPlaylistTracks[index].id;
      playerStore.setState("currentPlayMusicIndexInTrack", index);
      playerStore.dispatch("getPlayMusicWithSongIdAction", { id: id });
    },
    onDeletClick(event) {
      const index = event.currentTarget.dataset.index;
      playerStore.dispatch("removeSongFromPlaylistAction", { index: index });
      this.setData({
        currentPlaylistTracks: playerStore.state.currentPlaylistTracks,
      });
    },
  },

  lifetimes: {
    ready() {
      playerStore.onStates(
        [
          "curerntPlayModeText",
          "currentPlaylistTracks",
          "currentPlayMusicIndexInTrack",
        ],
        ({
          curerntPlayModeText,
          currentPlaylistTracks,
          currentPlayMusicIndexInTrack,
        }) => {
          if (curerntPlayModeText) {
            this.setData({ curerntPlayModeText });
          }
          if (currentPlaylistTracks) {
            this.setData({ currentPlaylistTracks });
          }
          // 当前的index
          if (currentPlayMusicIndexInTrack) {
            this.setData({ currentIndex: currentPlayMusicIndexInTrack });
          }
        }
      );
    },
  },
});
