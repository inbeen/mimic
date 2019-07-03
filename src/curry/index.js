// function currying(fn) {
//     var args = [].slice.call(arguments, 1);
//     return function() {
//         return fn.apply(this, args.concat([].slice.call(arguments)));
//     }
// }

function curry(fn, args, argsNum, index) {
    length = fn.length;
    args = args || [];
    argsNum = argsNum || 0;
    index = index || 0;
    return function() {
        var i,
            j,
            flag;
        flag = true;
        j = 0;
        for (i = index; i < length; i ++) {
            if (typeof args[i] === 'undefined' || args[i] === curry.empty) {
                if (arguments[j] !== curry.empty && typeof arguments[j] !== 'undefined') argsNum ++ ;
                else if (arguments[j] === curry.empty && flag) {
                    index = i;
                    flag = false;
                }
                args[i] = arguments[j];
                j ++;
            }
        }
        if (argsNum < length) {
            return curry.call(this, fn, args, argsNum, index);
        } else {
            return fn.apply(this, args);
        }
    }
}

curry.empty = Symbol('');

// test
document.getElementById('app').innerHTML = `<h1>Please press F12 to open console.</h1>`;

var fn = curry(function(a, b, c, d) {
    return [a, b, c, d];
});
let a = fn(1, curry.empty, 3)(2, 4);
console.dir(a);
