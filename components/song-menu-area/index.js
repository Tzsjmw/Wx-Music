// components/song-menu-area/index.js

// 全局app的值
const app=getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "歌单",
    },
    playLists: {
      type: Array,
      value: [],
    },
  },
  lifetimes: {
    created() {},
    ready() {},
  },
  /**
   * 组件的初始数据
   */
  data: {
    // 拿到全局的值 -屏幕的宽度
    screenWidth:app.globalData.screenWidth
  },

  /**
   * 组件的方法列表
   */
  methods: {},
});
