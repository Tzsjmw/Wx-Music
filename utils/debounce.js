// 防抖
export function debounce(fn, delay = 500, immediate = false) {
  let timer = null;
  let isInvoke = false;

  function _debounce(...agrs) {
    if (immediate && !isInvoke) {
      fn.apply(this, agrs);
      isInvoke = true;
    } else {
      clearTimeout(timer); // 闭包
      timer = setTimeout(() => {
        // 这个作为 元素input 的回调函数, 该函数的this就会指向input元素.
        // 箭头函数不绑定this,自动去它的上层作用域找, 外层就是addEventListener传入的第二个参数,一个函数,它的this是正确的,指向的是触发事件的元素.
        fn.apply(this, agrs);
        isInvoke = false;
      }, delay);
    }
  }

  _debounce.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return _debounce;
}
