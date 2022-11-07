import { HYEventStore } from "hy-event-store";

import { getRankings, getPlaylistDetail } from "../service/api_music";

export const rankingMap = [
  "surgeRanking",
  "newRanking",
  "originalRanking",
  "hotRanking",
];

export const rankingStore = new HYEventStore({
  state: {
    hotRanking: {}, // 热门榜
    surgeRanking: {}, // 飙升榜
    newRanking: {}, // 新歌榜
    originalRanking: {}, // 原创版
  },
  actions: {
    getRankingDataAction(ctx) {
      // 发送请求获取所有排行榜歌单信息
      getRankings().then((res) => {
        // 分别储存到共享变量里。
        rankingMap.forEach((item, index) => {
          const id = res.list[index].id;
          // 根据排行榜歌单id发送请求获取歌曲 0新歌 1热门 2原创 3飙升
          getPlaylistDetail(id).then((result) => {
            ctx[item] = result.playlist;
          });
        });
      });
    },

  },
});
