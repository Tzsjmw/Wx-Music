// pages/more-playlist/index.js
import { getPlaylist } from "../../service/api_music";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    playlists: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let playlistType = options.id.slice(0, 2); // 取出歌单类型 '华语' '欧美'
    if (playlistType === "热门") playlistType = "";
    // 请求51条数据
    getPlaylist(playlistType, 51).then((res) => {
      this.setData({
        title: options.id, // 储存title, 作为这页的title
        playlists: res.playlists,
      });
    });

  },

});
