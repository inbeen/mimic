var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    console.dir(e);
    container.innerHTML = count ++;
}

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

var userAction = debounce(getUserAction, 5000, true);

container.onmousemove = userAction;

document.getElementById('btn').addEventListener('click', function() {
    userAction.cancel();
});
