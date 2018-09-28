# 函数柯里化

> 柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。

例如：

```javascript
var fn = curry(function(a, b, c, d) {
	return [a, b, c, d];
});
fn(1)(2)(3)(4); // [1, 2, 3, 4]
```



## 用途

降低通用性，提高适用性 => 参数复用

```javascript
fn = function(a, b, c, d) { return [a, b, c, d]; }
fn(1, 2, 3, 4); // [1, 2, 3, 4];
fn(1, 2, 3, 5); // [1, 2, 3, 5];
var fn1 = curry(fn);
var fn2 = fn1(1)(2)(3);
fn2(4); // [1, 2, 3, 4];
fn2(5); // [1, 2, 3, 5];
```



## Step 1

先实现基本的功能

```javascript
function curry(fn) {
    var args = [].slice.call(arguments, 1);
    return function() {
        var newArgs = args.concat([].slice.call(arguments));
        return fn.apply(this, newArgs);
    }
}
// test
var fn = currying(function(a, b, c, d) {
    return [a, b, c, d];
}, 1, 2);
fn(3, 4) // [1, 2, 3, 4]
```



## Step 2

目前只实现了 `curry(fn, a, b)(c, d)` 还没有实现 `curry(fn)(a)(b)(c)(d)` 

```javascript
/**
 * 1.js
 */
function currying(fn) {
    var args = [].slice.call(arguments, 1);
    return function() {
        return fn.apply(this, args.concat([].slice.call(arguments)));
    }
}

function curry(fn, length) {
    // 取函数的参数个数
    length = length || fn.length;
    return function() {
        if (arguments.length < length) {
            // 参数不够，保存参数，返回一个传入若干参数的函数
            // apply.(this) 是保证 this 指向不变
            // length - arguments.length 为剩余参数
            return curry(currying.apply(this, [fn].concat([].slice.call(arguments))), length - arguments.length);
        } else {
            // 参数足够时，执行函数
            return fn.apply(this, arguments);
        }
    }
}

// test
var fn = curry(function(a, b, c, d) {
    return [a, b, c, d];
});
fn(1, 2)(3)(4); // [1, 2, 3, 4]
```



## Step 3

目前的 curry 函数实现的是从左到右传参，接下来实现不按序传参

```javascript
function curry(fn, args, argsNum, index) {
    length = fn.length;
    args = args || []; // 已传参数（包括占位符）
    argsNum = argsNum || 0; // 已传参数个数（不包括占位符）
    index = index || 0; // 无参数位置初始为 0
    return function() {
        var i, // 无参数的开始位置
            j, // 参数下标
            flag; // 是否需要记录无参数开始位置
        flag = true; // 每次调用重新计算
        j = 0; // 从第一个参数开始
        for (i = index; i < length; i ++) {
            // 找到第一个 未填参数 的位置
            if (typeof args[i] === 'undefined' || args[i] === curry.empty) {
                // 参数不为占位符
                if (arguments[j] !== curry.empty && typeof arguments[j] !== 'undefined') argsNum ++ ; // 已传参数计数
                else if (arguments[j] === curry.empty && flag) {
                    index = i; // 重新计算无参数的开始位置
                    flag = false;
                }
                args[i] = arguments[j]; // 替换参数
                j ++;
            }
        }
        if (argsNum < length) {
            // 参数未传完，返回 curry 函数
            return curry.call(this, fn, args, argsNum, index);
        } else {
            // 参数传完，立即执行
            return fn.apply(this, args);
        }
    }
}

curry.empty = Symbol('');
```

