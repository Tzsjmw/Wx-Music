// 二次封装
import { getTopMV } from '../../service/api_video'
import { playerStore } from "../../store/player-store";
Page({

    /*** 页面的初始数据*/
    data: {
        topMVs: [],
        hasMore: true,
        navTitle: { // 导航标题 可以为空
          type: String,
          value: ''
        },
    },

    /*** 生命周期函数--监听页面加载
     * aysnc await
     */
    onLoad: async function(options) {
        this.getTopMVData(0)
    },

    // 封装网络请求
    getTopMVData: async function(offset) {
        // 判断是否能请求
        if (!this.data.hasMore && offset !== 0) return
            // 显示loading
        wx.showNavigationBarLoading()
            // 真正请求数据
        const res = await getTopMV(offset)
        let newData = this.data.topMVs

        if (offset === 0) {
            // offset为0，刷新请求数据，重置数据
            newData = res.data
        } else {
            // 加上上一次请求的数据
            newData = newData.concat(res.data)
        }

        // 设置数据
        this.setData({ topMVs: newData })
        this.setData({ hasMore: res.hasMore })

        // 删除loading
        wx.hideNavigationBarLoading()
        if (offset === 0) {
            wx.stopPullDownRefresh()
        }
    },


    // 页面上拉触底事件的处理函数
    onReachBottom: async function() {
        this.getTopMVData(this.data.topMVs.length)
    },

    // 上拉刷新
    onPullDownRefresh: async function() {
        this.getTopMVData(0)
    },

    //封装传值跳转的方法
    handleVideoItemClick: function(event) {
        //获取每个视频的id
        const id = event.currentTarget.dataset.item.id
            // 跳转
        wx.navigateTo({
            url: '/pages/detail-video/index?id=' + id,
        })
         // 查看是否正在播放歌曲
        if (playerStore.state.songPlayState) {
          playerStore.dispatch("changePlayStateAction");
        }
    }







})