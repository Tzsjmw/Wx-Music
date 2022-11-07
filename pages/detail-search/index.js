// pages/detail-search/index.js
import {
  getSearchDefaultWord,
  getSearchHotWords,
  getSearchSuggest,
  getSearchSongs,
} from "../../service/api_search";

// 富文本截取字符串
import { string2Node } from "../../utils/string2Node";
// 防抖
import { debounce } from "../../utils/debounce";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchDefaultWord: "", // input的placeholder
    inputedSearchKeyWord: "", // 输入框已经输入的值
    hotWords: [], // 热门搜索
    searchHistoryWords: [], // 搜索历史
    searchSuggests: [],
    searchSuggestNodes: [], // 通过搜索联想到的字符串转换为 node， 为了实现匹配字符变色
    searchSongsResult: [], //搜索到的歌曲
    isShowMoreAction: false,
    moreActions: [
      {
        name: "选项1",
      },
      {
        name: "选项2",
      },
      {
        name: "选项3",
        subname: "描述信息",
        openType: "share",
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取这页的网络数据
    this.getPageData();
    // 获取搜索历史
    wx.getStorage({
      key: "historySearchKeys",
    }).then(
      (res) => {
        this.setData({ searchHistoryWords: res.data });
      },
      () => {
        wx.setStorage({ key: "historySearchKeys", data: [] });
      }
    );
  },

  getPageData: function () {
    getSearchDefaultWord().then((res) => {
      this.setData({ searchDefaultWord: res.data.realkeyword });
    });
    getSearchHotWords().then((res) => {
      this.setData({ hotWords: res.result.hots });
    });
  },
  // 获取历史搜索words
  // 输入的关键字变化, 用防抖函数包裹
  onSearchWordsChange: debounce(function (event) {
    // 输入的值储存起来
    this.setData({ inputedSearchKeyWord: event.detail });
    // 如果没有输入 那么不用发送搜索推荐请求
    if (event.detail.length === 0) return;
    this.handleGetSearchSuggest(event.detail);
  }),
  // 发送联想推荐请求
  handleGetSearchSuggest: function (keyword) {
    getSearchSuggest(keyword).then((res) => {
      // 有匹配的词再做下面的操作
      if (!res.result.allMatch) return;
      // 拿到结果将其处理成【匹配的字，末尾的字】  转成node节点
      const suggests = res.result.allMatch.map((item) => item.keyword);
      const suggestsMapNodes = [];
      for (const keyword of suggests) {
        suggestsMapNodes.push(
          string2Node(keyword, this.data.inputedSearchKeyWord)
        );
      }
      this.setData({
        searchSuggests: suggests,
        searchSuggestNodes: suggestsMapNodes,
      });
    });
  },
  // 点击搜索按钮
  onSearchBtnClick: function (event, keywords) {
    // 点击搜索就把搜索推荐清空，因为也不需要显示。
    this.setData({ searchSuggestNodes: [] });
    let _keywords = "";
    // 1.有传入值就用传入的值（点击热门搜索keyword， 点击搜索联想,）
    if (keywords) {
      _keywords = keywords;
      // 2.输入框没有内容就用 (1.input已经输入的值, 2.使用placeholder的词)
    } else {
      if (this.data.inputedSearchKeyWord) {
        _keywords = this.data.inputedSearchKeyWord;
      } else {
        _keywords = this.data.searchDefaultWord;
        // 这个词自动输入到输入框
        this.setData({
          inputedSearchKeyWord: _keywords,
        });
      }
    }
    // 获取搜索结果
    getSearchSongs(_keywords).then((res) => {
      this.setData({ searchSongsResult: res.result.songs });
    });
    
    // 放在历史搜索词组里面
    wx.getStorage({
      key: "historySearchKeys",
    })
      .then((res) => {
        const searchWords = res.data;
        // 判断是否存在这个词,存在就把原来的元素删除，
        const wordIndex = searchWords.indexOf(_keywords);
        // 存在就把原来的元素删除
        if (wordIndex >= 0) searchWords.splice(wordIndex, 1);
        // 超过二十个删除最后一个
        if (searchWords.length >= 21) searchWords.pop();
        // 在头部添加新的元素
        searchWords.unshift(_keywords);
        wx.setStorage({
          key: "historySearchKeys",
          data: searchWords,
        });
        // 交给viewModel渲染
        this.setData({ searchHistoryWords: searchWords });
      })
      .catch((err) => {
        wx.setStorage({
          key: "historySearchKeys",
          data: [_keywords],
        });
        this.setData({ searchHistoryWords: [_keywords] });
      });
  },
  // 热门搜索关键字被点击
  onHotsWordsItemClick: function (event) {
    // 哪个区域发来的点击事件
    const area = event.currentTarget.dataset.index[0];
    const index = event.currentTarget.dataset.index[1];
    let keywords = "";
    if (area === "hot") {
      keywords = this.data.hotWords[index].first;
    } else if (area === "search") {
      keywords = this.data.searchHistoryWords[index];
    }
    // 当结果返回到输入框中
    this.setData({ inputedSearchKeyWord: keywords });
    this.onSearchBtnClick(keywords);
  },
  // 搜索框focus
  onSearchFocus: function () {
    this.setData({ searchSongsResult: [] });
    if (this.data.inputedSearchKeyWord) {
      this.handleGetSearchSuggest(this.data.inputedSearchKeyWord);
    }
  },
  // 推荐关键字被点击
  onSuggestItemClick: function (event) {
    // 1.搜索 获取点击的关键字
    const keywords = this.data.searchSuggests[
      event.currentTarget.dataset.index
    ];
    this.setData({ inputedSearchKeyWord: keywords });
    this.onSearchBtnClick(keywords); 
  },
  //action-sheet的事件
  onMoreActionBtnClick: function (event) {
    console.log(event.detail);
    this.setData({ isShowMoreAction: true });
  },
  onMoreActionClose: function (event) {
    this.setData({ isShowMoreAction: false });
  },
  onMoreActionSelect: function (event) {
    console.log(event);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.setData({ isFocus: true });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
