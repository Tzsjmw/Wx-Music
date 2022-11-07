// 1.将歌词字符串转化成一个个数组，每个数组就是一行歌词。
// 2.用正则表达式匹配每行歌词的时间
export function parseLyric(lyricString) {
  const lyricStrings = lyricString.split("\n"); // 将歌词从字符串变为数组
  lyricStrings.pop(); // 删除最后一行,最后一行没有啥也没有
  const timeRegExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/; // 匹配每行歌词的正则

  const timeStampMapLytic = [];
  for (let i = 0; i < lyricStrings.length; i++) {
    const line = lyricStrings[i];
    const timeOfLine = timeRegExp.exec(line);
    const minute = timeOfLine[1] * 60 * 1000; // 分
    const second = timeOfLine[2] * 1000; // 秒
    const millsecond =
      timeOfLine[3].length === 2 ? timeOfLine[3] * 10 : timeOfLine[3] * 1; // 毫秒
    const totalTime = minute + second + millsecond;
    // 获取歌词文本
    const lyricText = line.replace(timeOfLine[0], "");
    timeStampMapLytic.push({ index: i, time: totalTime, text: lyricText });
  }
  return timeStampMapLytic;
}
