# Set

> 实现 ES6 的 Set 数据结构，一种成员唯一的类数组。

Set 可以通过 new 生成 Set 数据结构，可接受数组作为参数初始化。

属性：

* size：返回 Set 实例的成员个数

方法：

* add(value)：添加，返回 Set 实例
* delete(value)：删除，返回 bool 值
* has(value)：是否包含，返回 bool 值
* clear()：清楚，无返回值
* keys()：返回键名的遍历器
* values()：返回键值的遍历器
* entries()：返回键值对的遍历器
* forEach()：使用回调函数遍历每个成员，无返回值



## Step 1

初始实现如下：

```javascript
(function(global) {
    function mySet(data) {
        this._values = [];
        this.size = 0;
        data && data.forEach(function(item) {
            this.add(item);
        }, this);
    }
    mySet.prototype._values = [];
    mySet.prototype['add'] = function(value) {
        if (this._values.indexOf(value) == -1) {
            this._values.push(value);
            this.size ++;
        }
        return this;
    }
    mySet.prototype['has'] = function(value) {
        return this._values.indexOf(value) !== -1;
    }
    mySet.prototype['delete'] = function(value) {
        var index = this._values.indexOf(value);
        if (index == -1) return false;
        this._values.splice(index, 1);
        this.size --;
        return true;
    }
    mySet.prototype['clear'] = function() {
        this._values = [];
        this.size = 0;
    }
    mySet.prototype['forEach'] = function(cb, thisArg) {
        thisArg = thisArg || global;
        for (var i = 0; i < this._values.length; i ++) {
            cb.call(thisArg, this._values[i], i, this);
        }
    }
    mySet.length = 0;
    global.mySet = mySet;
})(this)
```



## Step 2

Set 可以去重 NaN，而上面的判断重复采用的是 indexOf（本质是 ===，而 NaN === NaN 为 false），无法判断是否含有 NaN，因此需要去重 NaN

```javascript
(function(global) {
    var NaNSymbol = Symbol('NaN');
    var encodeVal = function(value) {
        return value !== value ? NaNSymbol : value;
    }
    var decodeVal = function(value) {
        return value === NaNSymbol ? NaN : value;
    }
    function mySet(data) {
        this._values = [];
        this.size = 0;
        data && data.forEach(function(item) {
            this.add(item);
        }, this);
    }
    mySet.prototype._values = [];
    mySet.prototype['add'] = function(value) {
        var value = encodeVal(value);
        if (this._values.indexOf(value) == -1) {
            this._values.push(value);
            this.size ++;
        }
        return this;
    }
    mySet.prototype['has'] = function(value) {
        return this._values.indexOf(encodeVal(value)) !== -1;
    }
    mySet.prototype['delete'] = function(value) {
        var index = this._values.indexOf(encodeVal(value));
        if (index == -1) return false;
        this._values.splice(index, 1);
        this.size --;
        return true;
    }
    mySet.prototype['clear'] = function() {
        this._values = [];
        this.size = 0;
    }
    mySet.prototype['forEach'] = function(cb, thisArg) {
        thisArg = thisArg || global;
        for (var i = 0; i < this._values.length; i ++) {
            cb.call(thisArg, this._values[i], i, this);
        }
    }
    mySet.length = 0;
    global.mySet = mySet;
})(this)
```



## Step 3

接下来实现剩余的 keys() values() entries()，这些和初始化都会涉及到迭代器

迭代器，是一个具有 next() 方法的对象，每次调用 next() 都返回一个含有 value done 两个属性的对象，value 表示当前值，done 表示遍历是否结束

```javascript
function makeIterator(array) {
    var nextIndex = 0;
    return {
        next: function() {
            return nextIndex < array.length ? {
                value: array[nextIndex ++],
                done: false
            } : {
                value: void 0, // void 0 即 undefined 可减少占用空间(3字节)
                done: true
            }
        }
    }
}
var iterator = makeIterator([1, 2, 3]);
console.log(iterator.next()); // { done: false, value: 1 }
console.log(iterator.next()); // { done: false, value: 2 }
console.log(iterator.next()); // { done: false, value: 3 }
console.log(iterator.next()); // { done: true, value: undefined }
```

此外 for of 遍历涉及到了迭代器，可 for of 迭代的必须含有 Symbol.iterator 属性，否则会报错 Uncaught TypeError: iterator is not iterable。

```javascript
var arr = [1, 2, 3];
arr[Symbol.iterator] = function() {
    return makeIterator(this);
};
for (var v of arr) {
    console.log(v);
}
// 1
// 2
// 3
```

完成了迭代器的实现，还需要实现 for of

```javascript
function forOf(obj, cb) {
    var iterator, result;
    if (typeof obj[Symbol.iterator] !== 'function') throw new TypeError(obj + 'is not iterable');
    if (typeof cb !== 'function') throw new TypeError(cb + 'is not a function');
    iterator = obj[Symbol.iterator]();
    result = iterator.next();
    while(!result.done) {
        cb(result.value);
        result = iterator.next();
    }
}
forOf(arr, function(value) {
    console.log(value);
});
// 1
// 2
// 3
```

Set 最终实现如下：

```javascript
(function(global) {
    var NaNSymbol = Symbol('NaN');
    var encodeVal = function(value) {
        return value !== value ? NaNSymbol : value;
    }
    var decodeVal = function(value) {
        return (value === NaNSymbol) ? NaN : value;
    }
    var makeIterator = function(array, iterator) {
        var nextIndex = 0;
        var obj = {
            next: function() {
                return nextIndex < array.length ? {
                    value: iterator(array[nextIndex ++]),
                    done: false
                } : {
                    value: void 0,
                    done: true
                }
            }
        }
        obj[Symbol.iterator] = function() {
            return obj;
        }
        return obj;
    }
    var forOf = function(obj, cb) {
        var iterator, result;
        if (typeof obj[Symbol.iterator] !== 'function') throw new TypeError(obj + ' is not iterable');
        if (typeof cb !== 'function') throw new TypeError(cb + ' is not a function');
        iterator = obj[Symbol.iterator]();
        result = iterator.next();
        while (!result.done) {
            cb(result.value);
            result = iterator.next();
        }
    }
    function mySet(data) {
        this._values = [];
        this.size = 0;
        var self = this;
        forOf(data, function(item) {
            self.add(item);
        })
    }
    mySet.prototype._values = [];
    mySet.prototype['add'] = function(value) {
        var value = encodeVal(value);
        if (this._values.indexOf(value) == -1) {
            this._values.push(value);
            this.size ++;
        }
        return this;
    }
    mySet.prototype['has'] = function(value) {
        return this._values.indexOf(encodeVal(value)) !== -1;
    }
    mySet.prototype['delete'] = function(value) {
        var index = this._values.indexOf(encodeVal(value));
        if (index == -1) return false;
        this._values.splice(index, 1);
        this.size --;
        return true;
    }
    mySet.prototype['clear'] = function() {
        this._values = [];
        this.size = 0;
    }
    mySet.prototype['values'] = mySet.prototype['keys'] = function() {
        return makeIterator(this._values, function(value) {
            return decodeVal(value);
        });
    }
    mySet.prototype['entries'] = function() {
        return makeIterator(this._values, function(value) {
            return [decodeVal(value), decodeVal(value)];
        });
    }
    mySet.prototype[Symbol.iterator] = function() {
        return this.values();
    }
    mySet.prototype['forEach'] = function(cb, thisArg) {
        thisArg = thisArg || global;
        var iterator = this.entries();
        var self = this;
        forOf(iterator, function(item) {
            cb.call(thisArg, item[1], item[0], self);
        });
    }
    mySet.length = 0;
    global.mySet = mySet;
})(this)
```

