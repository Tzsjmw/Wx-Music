// components/area-header/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "默认标题",
    },
    showMore: {
      type: Boolean,
      value: true,
    },
    /**
     * @page 需要跳转到的page
     * @id 歌单的id,或歌单类型的id
     */
    jumpTo: {
      type: Array,
      value: ['not-found', 123],
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    moreClick: function () {
      let page = this.properties.jumpTo[0];
      let id = this.properties.jumpTo[1];
      wx.navigateTo({
        url: `/pages/${page}/index?id=${id}`,
      });
    },
  },
});
