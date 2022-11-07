// components/song-menu-area-item/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playListsItem: {
      type: Object,
      value: {},
    },
  },
  lifetimes: {},

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    itemClick() {
      const id = this.properties.playListsItem.id;
      wx.navigateTo({
        url: `/pages/detail-playlist/index?id=${id}`,
      });
    },
  },
});
