var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    console.dir(e);
    container.innerHTML = count ++;
}

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

var userAction = throttle(getUserAction, 5000, {
    leading: true,
    trailing: false,
});

container.onmousemove = userAction;

document.getElementById('btn').addEventListener('click', function(e) {
    userAction.cancel();
});
