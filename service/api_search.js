import hyRequest from "./index";

// 获取搜索框的placeholder
export function getSearchDefaultWord() {
  return hyRequest.get("/search/default");
}
// 获取热门搜索
export function getSearchHotWords() {
  return hyRequest.get("/search/hot");
}
// 搜索联想 搜索建议
export function getSearchSuggest(keywords) {
  return hyRequest.get("/search/suggest", {
    keywords,
    type: "mobile",
  });
}
// 搜索歌曲
export function getSearchSongs(keywords) {
  return hyRequest.get("/search", { keywords });
  // 更全
  // return hyRequest.get("/cloudsearch", { keywords });

}
