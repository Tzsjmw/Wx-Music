// baseUI/nav-bar/index.js
Component({
  options: {
    multipleSlots: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    back() {
      wx.navigateBack({
        delta: 1,
      });
    },
  },

  lifetimes: {
    ready() {
      // console.log(this.data.statusBarHeight);
    },
  },
});
