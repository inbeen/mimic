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
