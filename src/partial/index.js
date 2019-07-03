function partial(fn) {
    var args = [].slice.call(arguments, 1);
    return function() {
        var index = 0, length = args.length;
        for (var i = 0; i < length; i ++) {
            if (args[i] === partial.empty) {
                args[i] = arguments[index ++];
            }
        }
        while(index < arguments.length) args.push(arguments[index ++]);
        return fn.apply(this, args);
    }
}

partial.empty = Symbol('');

// test
document.getElementById('app').innerHTML = `<h1>Please press F12 to open console.</h1>`;

var fn = partial(function(a, b, c, d) {
    return [a, b, c, d];
}, partial.empty, 2, 3);
let a = fn(1, 4);
console.dir(a);
