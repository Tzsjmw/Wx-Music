import hyRequest from './index'
// offset偏移数量 , 用于分页 , limit请求数量 , 默认为 10
export function getTopMV(offset,limit=10){
  return hyRequest.get("/top/mv",{
    offset,
    limit
  })
}
/**
 * 请求视频页MV播放url
 * @param {number} id MVid 
 */
export function getMVURL(id){
  return hyRequest.get("/mv/url", {
    id
  })
}
/**
 * 请求视频页详情数据
 * @param {number} mvid MVid
 */
export function getMVDetail(mvid) {
  return hyRequest.get("/mv/detail", {
    mvid
  })
}
/**
 * 请求视频详情页其它视频相关数据
 * @param {number} id MVid
 */
export function getRelatedVideo(id) {
  return hyRequest.get("/related/allvideo", {
    id
  })
}
// 2.从推荐mv进入 （32位id）
/**获取视频播放地址
 *
 * @param {} id
 */
export function getVideoUrl(id) {
  return hyRequest.get("/video/url", { id });
}
/** 获取视频的信息
 *
 * @param {number} mvid
 */
export function getVideoDefail(id) {
  return hyRequest.get("/video/detail", { id });
}