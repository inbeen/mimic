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
    padding: 10px 50px;'>重置防抖</button>
`;


var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    console.dir(e);
    container.innerHTML = count ++;
}

var userAction = debounce(getUserAction, 5000, true);

container.onmousemove = userAction;

document.getElementById('btn').addEventListener('click', function() {
    userAction.cancel();
});
