# 偏函数

> 偏函数是指固定一个函数的一些参数，然后产生另一个更小元的函数。

与柯里化不同的是：

柯里化是将一个多参数函数转换成多个单参数函数，也就是将一个 n 元函数转换成 n 个一元函数。

偏函数则是固定一个函数的一个或者多个参数，也就是将一个 n 元函数转换成一个 n - x 元函数。



## Step 1

```javascript
function partial(fn) {
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments)));
    }
}
// test
var fn = partial(function(a, b, c, d) {
    return [a, b, c, d];
}, 1, 2);
let a = fn(3, 4); // [1, 2, 3, 4]
```



## Step 2

接下来实现占位符

```javascript
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
var fn = partial(function(a, b, c, d) {
    return [a, b, c, d];
}, partial.empty, 2, 3);
let a = fn(1, 4); // [1, 2, 3, 4]
```

