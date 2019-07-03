function throttle(func, delay, options) {
    var ctx, args, timeout;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        func.apply(ctx, args);
        if (!timeout) ctx = args = null;
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
            if (!timeout) ctx = args = null;
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

// test

document.getElementById('app').innerHTML = `
<div id='container' style='
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 300px;
    background: #666;
    color: #fff;
    font-size: 50px;
    text-align: center;
    line-height: 300px;'></div>
<button id='btn' style='
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 25px;
    padding: 10px 50px;'>重置节流</button>
`;

var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    console.dir(e);
    container.innerHTML = count ++;
}

var userAction = throttle(getUserAction, 5000, {
    leading: true,
    trailing: false,
});

container.onmousemove = userAction;

document.getElementById('btn').addEventListener('click', function(e) {
    userAction.cancel();
});
