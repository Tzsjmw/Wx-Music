// app.js
import {
  getLoginCode,
  sendCodeToServer,
  checkToken,
  checkSession
} from "./service/api_login";

import { TOKEN_KEY } from "./constants/token-const";

App({
  globalData: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
  },
  onLaunch: async function () {
    // 1.请求设备信息
    const info = wx.getSystemInfoSync();
    // 拿到屏幕宽高在全局中进行保存
    this.globalData.screenWidth = info.screenWidth;
    this.globalData.screenHeight = info.screenHeight;
    this.globalData.statusBarHeight = info.statusBarHeight;
    // 2.让用户默认进行登录
    this.handleLogin();
  },
  handleLogin: async function () {
    // 先检查token是否过期
    const token = wx.getStorageSync(TOKEN_KEY);
    if (token) {
      const checkResult = await checkToken(token);
      console.log("checkResult",checkResult)
      const isSessionExpire = await checkSession();
      if (checkResult.errorCode || !isSessionExpire) {
        this.loginAction();
      }
    }
  },

  loginAction: async function () {
    // 1.获取微信随机给的code
    const code = await getLoginCode();
    // 2.携带code交给自己的服务器交换token
    const result = await sendCodeToServer(code);
    const token = result.token;
    // 3.储存在Storage里面
    wx.setStorageSync(TOKEN_KEY, token);
  },
});
