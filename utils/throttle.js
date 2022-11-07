// 节流
// 回调函数 间隔时间 options{第一次是否立即触发, 最后一次点击后又点击了1次,后面点击这次是否到时间后给他触发}
/**
 *
 * @param {Function} fn
 * @param {Number} interval
 */
export default function throttle(fn, interval = 1000, options = { leading: true, trailing: false }) {
  // 1.记录上一次的开始时间
  const { leading, trailing, resultCallback } = options
  let lastTime = 0
  let timer = null

  // 2.事件触发时, 真正执行的函数
  const _throttle = function(...args) {
    return new Promise((resolve, reject) => {
      // 2.1.获取当前事件触发时的时间
      const nowTime = new Date().getTime()
      if (!lastTime && !leading) lastTime = nowTime

      // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
      const remainTime = interval - (nowTime - lastTime)
      if (remainTime <= 0) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        // 2.3.真正触发函数
        const result = fn.apply(this, args)
        if (resultCallback) resultCallback(result)
        resolve(result)
        // 2.4.保留上次触发的时间
        lastTime = nowTime
        return
      }

      if (trailing && !timer) {
        timer = setTimeout(() => {
          timer = null
          lastTime = !leading ? 0: new Date().getTime()
          const result = fn.apply(this, args)
          if (resultCallback) resultCallback(result)
          resolve(result)
        }, remainTime)
      }
    })
  }

  _throttle.cancel = function() {
    if(timer) clearTimeout(timer)
    timer = null
    lastTime = 0
  }

  return _throttle
}
/* interval为1000ms
使用这句 lastTime = 0m，情况下;
0ms   第一次点击 立即执行一次被回调的函数   √
134ms 第二次点击 开启定时器setTimeout(fn, 866ms);
....  这里被节流函数拦截
1000ms 分毫不差 此时已经有了定时器, 定时器执行, 执行回调函数, 将timerOfTrailing置为null, lastTime = 0;   √
1178ms 第n次点击 根据remainTime判断,此时lastTime为0,必会进入判断执行一次回调函数.   √
1297ms 第n+1次点击 开启定时器setTimeout(fn, 881ms);
....  这里被节流函数拦截
重复...
*/
