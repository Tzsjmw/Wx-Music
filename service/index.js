// const BASE_URL = 'http://123.207.32.32:9001'
const BASE_URL = "http://47.100.219.250:8005";
const LOGIN_BASE_URL = "http://123.207.32.32:3000";
class HYRequest{
  request(url,method,params,header={}){
   return new  Promise((resolve,reject)=>{
    wx.request({
      url: BASE_URL+url,
      method:method,
      header:header,
      data:params,
      success:function(res){
        resolve(res.data)
      },
      fail:function(err){
        reject(err)
      }
    })
   })
  }
  get(url,params,header){
    return this.request(url,"GET",params,header)
  }

  post(url,data,header){
    return this.request(url,"POST",data,header)
  }
}

const hyRequest =new HYRequest(BASE_URL);
const loginRequest = new HYRequest(LOGIN_BASE_URL);

export default hyRequest
export { loginRequest };