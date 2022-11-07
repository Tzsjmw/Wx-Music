// components/song-item-v2/index.js
import { playerStore } from "../../store/index";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    song: {
      type: Object,
      value: () => ({
        name: "name of name",
        artists: [],
        id: "1111111",
        mvid: "22222222",
        album: "alnumName",
      }),
    },
    orderNum: {
      type: Number,
      value: -1,
    },
    // 歌曲数据返回的字段不同，需要改变就将这个字段的告诉这个组件
    _artists: {
      type: String,
      value: "artists",
    },
    _mvid: {
      type: String,
      value: "mvid",
    },
    _album: {
      type: String,
      value: "album",
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
    // 点击视频按钮
    mvBtnClick: function (event) {
      wx.navigateTo({
        url: `/pages/detail-video/index?id=${
          this.data.song[this.properties._mvid]
        }`,
      });
    },
    // 点击更多按钮 eclipse
    moreActionBtnClick(event) {
      this.triggerEvent("onMoreActionBtnClick", {
        isShowMoreAction: true,
        songId: this.properties.song.id,
      }); // 点击弹出action-sheet
    },
    onSongClick(event) {
      const id = this.properties.song.id;
      // 1.跳到播放页面
      wx.navigateTo({
        url: `/pages/music-player/index?id=${id}`,
      });
      // 4.当前歌曲在歌单中的index // 这个须在播放歌曲之前执行
      playerStore.setState("currentPlayMusicIndexInTrack", this.data.orderNum);
      // 2.获取音乐播放数据,开始播放音乐
      playerStore.dispatch("getPlayMusicWithSongIdAction", { id });
      // 3.告诉detail-playList页面把歌单所有歌曲都传给Store
      this.triggerEvent("changeCurrentPlaylist");
    },
  },
});
