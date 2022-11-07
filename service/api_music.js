import hyRequest from "./index";

// 获取轮播图的请求
export function getBanners() {
  // type 默认为0  0:PC   1:android   2.iphone  3.ipad
  return hyRequest.get("/banner", { type: 2 });
}

// 获取歌曲榜单数据
export function getRankings() {
  return hyRequest.get("/toplist");
}


// 获取热门歌单
export function getPlaylist(cat = "全部", limit = 10) {
  return hyRequest.get("/top/playlist", { cat, limit });
}

// 获取歌单详情(id, 创建者， 简介， 10首音乐)
export function getPlaylistDetail(id) {
  return hyRequest.get("/playlist/detail", { id });
}

// 获取歌单歌曲
export function getPlaylistTrack(id, limit, offset) {
  return hyRequest.get("/playlist/track/all", { id, limit, offset });
}

// 获取歌单所有歌曲
export function getPlaylistAllTracks(id) {
  return hyRequest.get("/playlist/track/all", { id });
}
