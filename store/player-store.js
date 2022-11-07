import { HYEventStore } from "hy-event-store";
import { getMusicDetail, getMusicLyric } from "../service/api_player";
import { parseLyric } from "../utils/parse-lyric";

// const audioContext = wx.createInnerAudioContext(); // 创建前台播放实例
/**
 * 创建后台播放实例（统一使用后台播放实例）
 * 1.在app.json中请求在后台播放歌曲的权限
 * 2.区别于wx.createInnerAudioContext还需要给音乐设置title
 */
const audioContext = wx.getBackgroundAudioManager();
const playerStore = new HYEventStore({
  state: {
    id: 0, // 当前音乐的id
    isLoadedMusic: false,
    currentSong: {}, // 当前播放的音乐
    durationTime: 0, // RO-歌曲总时长
    perOnePercentDurationTime: 0, // 这首歌时间的1% 毫秒
    songPlayState: false, // 歌曲是否在播放
    currentTime: 0, // RO-歌曲已经播放了的时间。仅作为记录，不会设置dao播放器实例中。
    sliderValue: 0, // 歌曲进度进度条
    isSliderChanging: false, // 进度条是否正在被滑动
    currentPlayModeIndex: 0, // 当前播放模式index
    currentPlayMode: "order", // 当前播放模式
    curerntPlayModeText: "顺序播放",
    currentPlaylist: {}, // 当前播放的歌单
    currentPlaylistTracks: [], // 当前播放歌单的所有歌曲
    currentPlayMusicIndexInTrack: 0, // 当前播放音乐在歌单里面的index
    // 歌词页
    lyric: [], // 歌词
    volume: 0, // 音量
    isLyricDragging: false, // 歌词是否在被用户滑动
    currentLineOfLyric: "", // 当前播放的歌词
    currentIndexOfLyric: 0, // 当前歌词的在数组中的index。// 控制歌词高亮
    currentIndexOfLyric1: 0, // 在制作歌词页时遇到滑动歌词与歌词自动滚动冲突问题; 滑动歌词不需要再自动往上滚；两个index，一个控制歌词高亮，一个控制歌词滚动
  },
  actions: {
    // ==================================== 1.发送请求获取信息 ===============================
    // 改变当前音乐. {歌曲id， 是否改变当前音乐后立刻播放（页面首次加载不要立即播放）}
    async getPlayMusicWithSongIdAction(ctx, { id, isFirst = false }) {
      if (ctx.id === id) return; // 点击正在播放的歌曲song-item-v1
      ctx.id = id;
      // 两个都有值再进行下一步
      const resArr = await Promise.all([getMusicDetail(id), getMusicLyric(id)]);
      // 获取歌曲信息
      ctx.currentSong = resArr[0].songs[0];
      ctx.durationTime = resArr[0].songs[0].dt;
      ctx.perOnePercentDurationTime = resArr[0].songs[0].dt / 100;
      // 获取歌词
      ctx.lyric = parseLyric(resArr[1].lrc.lyric);

      // 是第一次打开小程序不需要执行下面的代码。
      if (!isFirst) {
        // 开始播放歌曲并且监听播放事件与数据
        this.dispatch("setUpAudioContextListenerAction");
        // 将当前歌曲储存在Storage，下次打开音乐播放器时继续播放这个歌单的这首歌
        // 第一次加载不需要储存
        wx.setStorage({
          key: "currentSong",
          data: {
            songId: ctx.id,
            indexInTrack: ctx.currentPlayMusicIndexInTrack,
          },
        });
      }
    },
    // ================================== 2.播放音乐及监听其事件 ============================
    setUpAudioContextListenerAction(ctx) {
      audioContext.stop();
      ctx.currentIndexOfLyric = 0;
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${ctx.id}.mp3`;
      audioContext.title = ctx.currentSong.name;
      audioContext.singer = ctx.currentSong.ar[0].name;
      audioContext.epname = " - " + ctx.currentSong.al.name;
      audioContext.coverImgUrl = ctx.currentSong.al.picUrl;

      ctx.isLoadedMusic = true; // 播放实例已经加载过音乐
      // 音乐播放是非常重要的模块,确保音乐能正确播放,打开音乐加载完自动播放,监听音乐加载完进行手动播放
      audioContext.autoplay = true; // 加载完自动播放
      audioContext.onCanplay(() => {
        // 监听其是否能播放, 能播放就播放
        audioContext.play();
        ctx.songPlayState = true;
      });
      // 页面加载获取上次使用的音量
      wx.getStorage({
        key: "volume",
      })
        .then((res) => {
          audioContext.volume = res.data;
          ctx.volume = res.data;
        })
        .catch((err) => {
          audioContext.volume = 1;
          ctx.volume = 1;
        });
      // 实时监听歌曲播放的进度
      audioContext.onTimeUpdate(() => {
        // 在slider被滑动的时候就不要再改变currentTime
        // console.log("isSliderChanging" + ctx.isSliderChanging);
        // 1.滑动播放slider
        if (ctx.isSliderChanging) return;
        const currentTime = audioContext.currentTime * 1000; // 统一使用毫秒计算
        ctx.currentTime = currentTime; // 给class="nowTime"显示
        ctx.sliderValue = (currentTime / ctx.durationTime) * 100; // 改变sliderValue

        // 2.匹配歌词
        for (
          let i = ctx.currentIndexOfLyric + 1; // 从上次匹配到的元素开始往下找
          i < ctx.lyric.length;
          i++
        ) {
          const line = ctx.lyric[i];
          // 当前播放的时间卡在这句歌词的前面,那么这句歌词前面一句就是正在播放的歌词
          if (currentTime <= line.time) {
            // i从当前播放的下一句开始找 === 下一句歌词(由它找到正在播放的歌词)
            // 如果找到匹配的歌词是同一句, 那就跳过整个for, 等待下一次currentTime变化再启动for循环再找.
            // 这里i和this.data.currentIndexOfLyric来自于正真歌词的下一句歌词.
            if (i === ctx.currentIndexOfLyric + 1) break; // 这个时间点匹配到歌词与正在播放的歌词是同一句
            ctx.currentLineOfLyric = ctx.lyric[i - 1].text;
            ctx.currentIndexOfLyric = i - 1;
            // 在歌词没有被用户拖动的时候 才继续赋值
            if (!ctx.isLyricDragging) {
              ctx.currentIndexOfLyric1 = i - 1; // 其实这个是正在播放的歌词的下一句歌词,我们使用currentTime去this.data.lyric找决定我们需要使用下一个句歌词的index
            }
            break;
          }
        }

        /**
         * 思考：既然sliderValue是一直需要计算变化的，为什么不放在html动态计算{{currentTime/durationTime * 100}}，我们只改变currentTime. 而要将sliderValue单独提出来计算。
         * 回答：不是每次currentTime改变都要sliderValue。例如在拖动slider的进度条时不需要计算sliderValue，进度条在我们手中控制，不需要别人来计算干扰，并且会浪费性能。
         */
      });
      // 监听歌曲播放完毕
      audioContext.onEnded(() => {
        this.dispatch("switchSong", { act: +1 });
      });
      // 歌曲暂停
      audioContext.onPause(() => {
        ctx.songPlayState = false;
      });
      // 歌曲开始播放
      audioContext.onPlay(() => {
        ctx.songPlayState = true;
      });
      // 用户点击x关闭当前播放的歌曲
      audioContext.onStop(() => {
        ctx.songPlayState = false;
        this.dispatch("jumpToMusicPlayTimeAction", {
          sliderValue: 0,
          withPlay: false,
        });
      });
      // 监听在状态栏的控制条点击了 上一首 下一首
      audioContext.onNext(() => {
        this.dispatch("switchSong", { act: +1 });
      });
      audioContext.onPrev(() => {
        this.dispatch("switchSong", { act: -1 });
      });
    },
    /**
     * 改变当前歌单
     * @param {context} ctx
     * @param {{Object, Array}} param1
     */
    changeCurrentPlayList(ctx, { playlist, playlistTracks }) {
      ctx.currentPlaylist = playlist;
      ctx.currentPlaylistTracks = playlistTracks;
      // 将当前歌单信息储存在Storage里
      // console.log(playlist, playlistTracks);
      // 第一次打开加载上次播放的音乐不需要储存
      if (ctx.currentPlaylist) {
        wx.setStorage({
          key: "currentPlayListId",
          data: ctx.currentPlaylist.id,
        });
      }
    },
    // ============================ 3.底部歌曲操作区域 ==============================
    // 将跳转到指定位置
    jumpToMusicPlayTimeAction(ctx, { sliderValue, withPlay = true }) {
      // 给歌曲设置当前时间 他的单位是秒
      // audioContext.pause();
      audioContext.seek((sliderValue * ctx.perOnePercentDurationTime) / 1000);
      // 拖动后松手后会执行这个函数，设置slider状态不在移动中。
      ctx.isSliderChanging = false;
      ctx.sliderValue = sliderValue;
      ctx.currentIndexOfLyric = 0; // 从头开始找歌词
      // 跳转完后是否要马上播放
      if (withPlay) {
        audioContext.play();
      }
    },
    // 改变播放模式
    changePlayModeAction(ctx, { pointedIndex } = { pointedIndex: null }) {
      const playModes = ["order", "random", "repeat"]; // 播放模式
      const playModesTexts = ["顺序播放", "随机播放", "循环播放"];
      const currentIndex = ctx.currentPlayModeIndex; // 当前index
      let NextIndex = 0; // 下一个播放播放模式index

      console.log(pointedIndex);
      // 可以指定播放模式
      if (pointedIndex) {
        NextIndex = pointedIndex;
      } else { 
        // 超过长度
        currentIndex + 1 === playModes.length
          ? (NextIndex = 0)
          : (NextIndex = currentIndex + 1);
      }

      // 计算当前模式
      ctx.currentPlayModeIndex = NextIndex;
      ctx.currentPlayMode = playModes[NextIndex];
      ctx.curerntPlayModeText = playModesTexts[NextIndex];
      // 改变后储存在Storage里面，供下次打开使用。
      wx.setStorageSync("playModeIndex", NextIndex);
    },
    // 切换上一曲与下一曲
    // act: +1 : -1; 上一首，下一首
    switchSong(ctx, { act }) {
      // 需要根据当前播放模式切换音乐
      let index = ctx.currentPlayMusicIndexInTrack;
      const listLength = ctx.currentPlaylistTracks.length;

      switch (ctx.currentPlayModeIndex) {
        case 0: // 顺序播放
          index = index + act;
          if (index >= listLength) {
            // 到达最后一首，跳到第一首
            index = 0;
          } else if (index < 0) {
            // 到达第一首
            index = listLength - 1;
          }
          break;
        case 1: // 随机循环
          index = Math.floor(Math.random() * listLength); // 随机算法
          break;
        case 2: // 单曲播放
          // 将当前音乐从头播放即可，不执行后面的操作
          this.dispatch("jumpToMusicPlayTimeAction", { sliderValue: 0 });
          return;
          break;
        default:
          break;
      }
      // 改变当前音乐
      ctx.currentPlayMusicIndexInTrack = index; // 当前index
      ctx.currentSong = ctx.currentPlaylistTracks[index]; // 当前音乐
      this.dispatch("getPlayMusicWithSongIdAction", { id: ctx.currentSong.id }); // 执行当前音乐
    },
    // 播放/暂停
    changePlayStateAction(ctx) {
      if (!ctx.isLoadedMusic) {
        this.dispatch("setUpAudioContextListenerAction"); // 用户第一次进来只会获取音乐数据而不会放在音乐实例上。
      }
      ctx.songPlayState = !ctx.songPlayState;
      ctx.songPlayState ? audioContext.play() : audioContext.pause();
    },
    // 移除播放列表中的歌曲
    removeSongFromPlaylistAction(ctx, { index }) {
      const playlist = ctx.currentPlaylistTracks;
      playlist.splice(index, 1);
      ctx.currentPlaylistTracks = playlist;
    },
    // ============================ 4.歌词页区域方法 ==============================
    /**
     * 尝试统一使用Store改变歌曲音量。
     *    err： 滑动音量slider时需要实时改变音量，通过Store改变发现会降低很多性能；
     * audioContext的一下方法还是直接使用实例来控制。
     * 使用playerStore.dispatch("changeVolume", { volume });是一条代码
     * 使用audioContext.volume = volume; 播放器实例只有一个，无论哪里使用都是一样。
     */
    changeVolume(ctx, { volume }) {},
  },
});



export { audioContext, playerStore };
