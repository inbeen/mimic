/**
 * 实现 call 和 apply 方法
 */

Function.prototype.mycall = function(ctx) {
    var ctx = ctx || window;
    ctx._fn = this;
    var args = [];
    for (var i = 1, l = arguments.length; i < l; i ++) {
        args.push('arguments[' + i + ']');
    }
    var res = eval('ctx._fn(' + args + ')');
    delete ctx._fn;
    return res;
}

Function.prototype.myapply = function(ctx, arr) {
    // 参数非数组
    if (typeof arr != 'object' || arr.length == undefined) {
        throw new TypeError('Uncaught TypeError: CreateListFromArrayLike called on non-object');
    }
    var ctx = ctx || window;
    ctx._fn = this;
    var res;
    if (!arr) {
        res = ctx._fn();
    } else {
        var args = [];
        for (var i = 0, l = arr.length; i < l; i ++) {
            args.push('arr[' + i + ']');
        }
        res = eval('ctx._fn(' + args + ')');
    }
    delete ctx._fn;
    return res;
}

Function.prototype.mybind = function(ctx) {
    if (typeof this !== 'function') {
        throw new Error('Uncaught TypeError: ' + this + '.bind is not callable');
    }
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);
    var fNOOP = function() {};
    var func = function() {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(this instanceof fNOOP ? this : ctx, args.concat(bindArgs));
    }
    fNOOP.prototype = this.prototype;
    func.prototype = new fNOOP();
    return func;
}
