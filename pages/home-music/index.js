// pages/home-music/index.js
import{getBanners,
      getPlaylist,
      getPlaylistDetail,
      getPlaylistAllTracks,} from '../../service/api_music'
import queryRect from '../../utils/query-rect'
import throttle from '../../utils/throttle'

import {rankingStore,rankingMap,playerStore} from '../../store/index'


const throttleQueryRect = throttle(queryRect, 1000);

Page({

  /*** 页面的初始数据*/
  data: {
    banners:[],
    swiperHeight: 0,
    hitRankingInfo: {},
    hitSongs: [], // 热歌榜所有歌曲
    hitSongsTop6: [], // 热歌榜前6首歌曲
    
    hitPlayLists: [], // 热门歌单所有歌单
    mandarinPlayLists: [], // 华语歌单所有歌单
    ancientPlayLists: [], // 歌单所有歌单
    westernPlayLists: [], // 欧美歌单所有歌单
    homeMusicRankings: [],//巅峰榜
  },

  //生命周期函数--监听页面加载
  onLoad(options) {
    // 获取页面数据
    this.getPageData()

    // 发送请求获取共享数据
    // 获取排行榜数据
    rankingStore.dispatch("getRankingDataAction");

     // 从store获取共享的数据
    // 热歌榜前六条数据
    rankingStore.onState("hotRanking", (res) => {
      if (!res.tracks) return;
      this.setData({
        hitRankingInfo: res, // 热歌榜信息
        hitSongs: res.tracks, // 歌单所有歌曲
        hitSongsTop6: res.tracks.slice(0, 6), // 前6首歌曲
      });
    });

       // 循环收集歌单数据,从Store里面 巅峰榜单
       rankingMap.forEach((item, index) => {
        rankingStore.onState(item, (res) => {
          if (!res.tracks) return;
          const ranking = {};
          ranking.id = res.id;
          ranking.rankingName = res.name;
          ranking.rankingCoverImg = res.coverImgUrl;
          ranking.playCount = res.playCount;
          ranking.songList = res.tracks.slice(0, 3);
          this.data.homeMusicRankings[index] = ranking;
          // 每获取到一个歌单都要用setData储存，才有响应式。
          this.setData({ homeMusicRankings: this.data.homeMusicRankings }); 
        });
      });
    

  }, 

  // 获取页面数据
  getPageData:function(){
    // 请求轮播图图片
    getBanners().then(res=>{
      // setData在设置data数据上，是同步的
      // 通过最新的数据对wxml进行渲染，渲染的过程是异步的
      this.setData({banners:res.banners})
    })
    // 获取所有歌单
    getPlaylist().then((res) => {
      this.setData({ hitPlayLists: res.playlists });
    });
    // 获取热门歌单
    getPlaylist("华语").then((res) => {
      this.setData({ mandarinPlayLists: res.playlists });
    });
    //古风
    getPlaylist("古风").then((res) => {
      this.setData({ ancientPlayLists: res.playlists });
    });
    //欧美
    getPlaylist("欧美").then((res) => {
      this.setData({ westernPlayLists: res.playlists });
    });
  },

// 共享网络请求



  //点击前往搜索详情页
 handleSearchClick: function () {
   wx.navigateTo({
     url: "/pages/detail-search/index",
   });
 },
  // swiper图片加载完毕
  onSwiperImageLoaded: function () {
    // 这里的执行顺序是：
    // 每有图片加载完成都会执行这个onSwiperImageLoaded函数
    // 每次执行的throttleQueryRect函数都是同一个函数，这个函数是具有节流效果的。
    // 给这个throttleQueryRect函数传入queryRect的必要参数(".swiper-image")
    // 执行throttleQueryRect相当于执行queryRect，执行queryRect会返回一个Promise，结果在then函数中。在节流函数中会将整个Promise返回，在外层继续使用then拿到res，设置给对应的变量。
    throttleQueryRect(".swiper-image").then(res=>{
      const rect =res[0]
      this.setData({swiperHeight:rect.height})
    })
  },
  // 改变当前播放的歌单
  changeCurrentPlaylist: function (params) {
    // 歌单相同不要改变
    if (playerStore.state.currentPlaylist.id !== this.data.hitRankingInfo.id) {
      console.log("changeCurrentPlayList do");
      playerStore.dispatch("changeCurrentPlayList", {
        playlist: this.data.hitRankingInfo,
        playlistTracks: this.data.hitSongs,
      });
    }
  },  // 首次打开小程序请求上次播放歌曲的数据
  firstOpen: async function () {
    // 获取上次播放的音乐
    wx.getStorage({ key: "currentSong" }).then(
      (res) => {
        const indexInTrack = res.data.indexInTrack;
        const songId = res.data.songId;
        // 加载音乐但是不播放
        playerStore.dispatch("getPlayMusicWithSongIdAction", {
          id: songId,
          isFirst: true,
        });
        // 设置当前播放的index
        playerStore.setState("currentPlayMusicIndexInTrack", indexInTrack);
      },
      (err) => {
        console.log(err);
      }
    );
    // 获取上次播放的歌单
    wx.getStorage({ key: "currentPlayListId" }).then(
      (res) => {
        const playlistId = res.data;
        // 请求歌单信息
        Promise.all([
          getPlaylistDetail(playlistId),
          getPlaylistAllTracks(playlistId),
        ]).then((resArr) => {
          // 请求歌单所有歌曲
          // 储存到Store里面
          console.log(resArr);
          playerStore.dispatch("changeCurrentPlayList", {
            playlist: resArr[0].playlist,
            playlistTracks: resArr[1].songs,
          });
        });
      },
      (err) => {
        console.log(err);
      }
    );
    // 获取上次的播放模式
    wx.getStorage({ key: "playModeIndex" }).then(
      (res) => {
        playerStore.dispatch("changePlayModeAction", {
          pointedIndex: res.data,
        });
      },
      (err) => {
        console.log(err, "Storage里面没有数据");
      }
    );
  },

})
