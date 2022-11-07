import { loginRequest } from "./index";

// 获取微信随机返回的code
export function getLoginCode() {
  return new Promise((resove, reject) => {
    wx.login({
      timeout: 1000,
      success: (res) => {
        resove(res.code);
      },
      fail: (err) => {
        console.log(err);
        reject(err);
      },
    });
  });
}

// 将随机code发送给自己的服务器，自己的服务器再携带code+appid+appsecret发送给微信的服务器，微信服务器返回session——key与openid
export function sendCodeToServer(code) {
  return loginRequest.post("/login", { code });
}
// 验证自己的token是否过期
export function checkToken(token) {
  return loginRequest.post("/auth", {}, { token });
}
// 微信返回的sesion是否过期
export function checkSession() {
  return new Promise((resolve) => {
    wx.checkSession({
      success: () => {
        resolve(true);
      },
      fail: () => {
        resolve(false);
      },
    });
  });
}
// 获取用户信息
export function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: "你好, 微信用户",
      success: (res) => {
        resolve(res);
      },
      fail: reject,
    });
  });
}
