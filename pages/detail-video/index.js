// pages/detail-video/index.js
import {getMVURL,getMVDetail,getRelatedVideo,getVideoUrl,getVideoDefail} from '../../service/api_video'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mvURLInfo:{},
    mvDetail:{},
    relatedVideos:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 1.获取传入的id
    const id =options.id
    // console.log(id)
    // 2.获取页面的数据
    this.getPageData(id)
 
    // 3.其他逻辑
    
  },
  getPageData:function(id){
    if (id.length === 32) {
      // 视频播放地址
      getVideoUrl(id).then((res) => this.setData({ mvURLInfo: res.urls[0] }));
      // 获取mv的信息
      getVideoDefail(id).then((res) => this.setData({ mvDetail: res.data }));
    }else{

    //请求播放地址
    getMVURL(id).then((res) => this.setData({ mvURLInfo: res.data }));
    //获取推荐视频信息
    getMVDetail(id).then(res=>{this.setData({mvDetail:res.data})})
    }

    //请求相关视频
    getRelatedVideo(id).then(res=>{
      this.setData({relatedVideos:res.data})
    })
  },
  // 点击推荐mv跳转到播放页
  mvItemClick: function (event) {
    const vid = event.currentTarget.dataset.vid;
    wx.navigateTo({
      url: `/pages/detail-video/index?id=${vid}`,
    });
    
  },


})