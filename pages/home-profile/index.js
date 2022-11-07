// pages/home-profile/index.js
import { getUserInfo } from "../../service/api_login";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    icons: [
      {
        icon: "wechat",
        title: "敬请期待",
      },
      {
        icon: "html_5",
        title: "敬请期待",
      },
      {
        icon: "css_3",
        title: "敬请期待",
      },
      {
        icon: "js",
        title: "敬请期待",
      },
      {
        icon: "edge",
        title: "敬请期待",
      },
      {
        icon: "google",
        title: "敬请期待",
      },
      {
        icon: "react",
        title: "敬请期待",
      },
      {
        icon: "vue",
        title: "敬请期待",
      },
      {
        icon: "npm",
        title: "敬请期待",
      },
      {
        icon: "github",
        title: "敬请期待",
      },
      {
        icon: "git",
        title: "敬请期待",
      },
      {
        icon: "node_js",
        title: "敬请期待",
      },
    ],
    isLogin: false,
    userInfo: {},
    profile:"../../assets/images/profile/register.png"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},
  onAvatarClick: function (event) {
    console.log("event",event);
    // 获取用户信息
    getUserInfo().then((res) => {
      this.setData({ isLogin: true, userInfo: res.userInfo });
      console.log("用户信息",res.userInfo)
    });
  },

 
});
