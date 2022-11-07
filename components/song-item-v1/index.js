// components/song-item-v1/index.js
import { playerStore } from "../../store/index";
import { getPlaylistAllTracks } from "../../service/api_music";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {},
    },
    orderNum: {
      type: Number,
      value: 0,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    onSongClick(event) {
      const id = this.properties.item.id;
      wx.navigateTo({
        url: `/pages/music-player/index?id=${id}`,
      });
      // 2.当前歌曲在歌单中的index // 这个须在播放歌曲之前执行
      playerStore.setState("currentPlayMusicIndexInTrack", this.data.orderNum);
      // 3.获取音乐播放数据，开始播放音乐
      playerStore.dispatch("getPlayMusicWithSongIdAction", { id });
      // 4.告诉父页面把歌单所有歌曲都传给Store
      this.triggerEvent("changeCurrentPlaylist");
    },
  },
});
