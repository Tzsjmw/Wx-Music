// components/rankings-area/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rankings: {
      type: Array,
      value: [],
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    created() {},
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
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
    itemClick(event) {
      const id = event.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/detail-playlist/index?id=${id}`,
      });
    },
  },
});
