export function queryRect(selectorOfElement) {
  return new Promise((resolve, reject) => {
    // 有些时候有些元素获取不到。嵌套比较深的元素，例如：.lyricsPageLyricItem
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select(selectorOfElement).boundingClientRect((res) => {
        if (res.width || res.height) {
          resolve(res);
        } else {
          reject({ msg: "queryRect获取失败", code: 0 });
        }
      });
      query.exec();
    }, 300);
  });
}


export default function (selector){
  return new Promise((resolve)=>{
    const query=wx.createSelectorQuery()
    query.select(selector).boundingClientRect()
    // query.exec(resolve)
    query.exec((res)=>{
      resolve(res)
    })
  })
}