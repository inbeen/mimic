# 防抖与节流

> 前端经常会遇到事件的频繁触发，如鼠标事件、滚动事件和动画等。
>
> 动画的最短时间为16ms（1桢），改变动画事件的触发间隔须大于该时间，否则会造成卡顿。
>
> 渲染页面的时候，事件触发的间隔须大于渲染的时间，否则也会造成卡顿。
>
> 为了解决这个问题，一般有两种方案：
>
> 1. debounce 防抖
> 2. throttle 节流

## 防抖

原理：限制下次事件触发之前必须等待的时间间隔，将若干个事件触发合成一次，并在给定时间间隔之后仅被触发一次。（每次触发事件时都取消之前的回调方法）

根据原理，可以得到基本的防抖：

```javascript
function debounce(func, delay) {
    var timeout;
    return function() {
        clearTimeout(timeout)
        timeout = setTimeout(func, delay);
    }
}
```

上面的实现改变了其 this 的指向且 event 对象丢失，修复后：

```javascript
function debounce(func, delay) {
    var timeout;
    return function() {
        var ctx = this;
        var args = arguments;
        clearTimeout(timeout)
        timeout = setTimeout(function(){
            func.apply(ctx, args);
        }, delay);
    }
}
```

某些场景下，需要立即执行，修改如下：

```javascript
function debounce(func, delay, immediate) {
    var timeout;
    return function() {
        var ctx = this;
        var args = arguments;
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(function() {
                timeout = null;
            }, delay);
            if (callNow) func.apply(ctx, args);
        } else {
            timeout = setTimeout(function() {
                func.apply(ctx, args);
            }, delay);
        }
    };
}
```

func 有可能是有返回值的，且只有当 immediate 为 true 时返回函数的结果，当 immediate 为 false 时，在setTimeout执行前，均返回 undefined。所以这里只对 immediate 为 true 时，返回执行结果。

```javascript
function debounce(func, delay, immediate) {
    var timeout, res;
    return function() {
        var ctx = this;
        var args = arguments;
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(function() {
                timeout = null;
            }, delay);
            if (callNow) res = func.apply(ctx, args);
        } else {
            timeout = setTimeout(function() {
                func.apply(ctx, args);
            }, delay);
        }
        return res;
    };
}
```

某些场景，有可能需要取消防抖。如，防抖的时间间隔为5秒，想在5秒内再触发一次，须取消防抖。最终实现为：

```javascript
function debounce(func, delay, immediate) {
    var timeout, res;
    var debounced = function() {
        var ctx = this;
        var args = arguments;
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(function() {
                timeout = null;
            }, delay);
            if (callNow) res = func.apply(ctx, args);
        } else {
            timeout = setTimeout(function() {
                func.apply(ctx, args);
            }, delay);
        }
        return res;
    };
    debounced.cancel = function() {
        clearTimeout(timeout);
        timeout = null;
    };
    return debounced;
}
```



## 节流

原理：保证在规定时间内一定会执行一次真正的事件处理函数。（通过判断是否到达一定时间来触发函数）

根据原理，可以得到基本的节流：

```javascript
function throttle(func, delay) {
    var ctx, args;
    var previous = 0;
    return function() {
        var now = +new Date();
        ctx = this;
        args = arguments;
        if (now - previous > delay) {
            func.apply(ctx, args);
            previous = now;
        }
    }
}
```

有些场景需要停止触发后再执行一次，修改如下：

```javascript
function throttle(func, delay) {
    var timeout, ctx, args;
    var previous = 0;
    var later = function() {
        previous = +new Date();
        timeout = null;
        func.apply(ctx, args)
    };
    var throttled = function() {
        var now = +new Date();
        var remain = delay - (now - previous);
        ctx = this;
        args = arguments;
        if (remain <= 0 || remain > delay) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(ctx, args);
        } else if (!timeout) {
            timeout = setTimeout(later, remain);
        }
    };
    return throttled;
}
```

优化下，允许选择是否立即触发，停止后是否触发。

```javascript
function throttle(func, delay, options) {
    var timeout, ctx, args;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        func.apply(ctx, args);
        if (!timeout) ctx = args = null;
    };

    var throttled = function() {
        var now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        var remain = delay - (now - previous);
        ctx = this;
        args = arguments;
        if (remain <= 0 || remain > delay) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(ctx, args);
            if (!timeout) ctx = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remain);
        }
    };
    return throttled;
}
```

添加取消方法后，最终实现如下：

```javascript
function throttle(func, delay, options) {
    var ctx, args, timeout;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        func.apply(ctx, args);
    }
    var throttled = function() {
        var now = new Date();
        if (!previous && options.leading === false) previous = now;
        var remain = delay - (now - previous);
        ctx = this;
        args = arguments;
        if (remain <= 0 || remain > delay) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(ctx, args);
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remain);
        }
    }
    throttled.cancel = function() {
        clearTimeout(timeout);
        previous = 0;
        timeout = null;
    }
    return throttled;
}
```

