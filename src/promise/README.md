# Promise

> Promise 对象用于表示一个异步操作的最终状态（完成或失败），以及其返回的值。

Promise 对象有三种状态，pending(进行中) resolved(fulfilled 已成功) rejected(已失败)，状态改变后执行相应的回调函数。

## Step 1

控制台输出 Promise 和 new Promise，可发现，Promise 有 all race reject resolve 方法，原型链上有 then catch finally 方法，实例有 value status 属性。

resolve 和 reject 均改变状态和值

```javascript
(function(window) {
    function myPromise(resolver) {
        // 判断是否为回调函数
        if (typeof resolver !== 'function') {
            throw new TypeError('Promise resolver ' + resolver + ' is not a function');
        }
        // 判断是否是 new 实例
        if (!(this instanceof myPromise)) throw new TypeError(this + ' is not a promise');
        var self = this;
        self.status = 'pending';
        self.value = void 0;
        function resolve(value) {
            if (self.status === 'pending') {
                self.status = 'resolved';
                self.value = value;
            }
        }
        function reject(reason) {
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.value = reason;
            }
        }
        try {
            resolver(resolve, reject);
        } catch(e) {
            reject(e);
        }
    }
    myPromise.prototype.constructor = myPromise;
    myPromise.prototype.then = function() {}
    myPromise.prototype.catch = function() {}
    myPromise.prototype.finally = function() {}
    myPromise.all = function() {}
    myPromise.race = function() {}
    window.myPromise = myPromise;
})(window);
```



## Step 2

Promise 对象的 then 方法，返回一个 Promise 对象 (catch 可在 then 基础上实现)

若 then 的回调非函数，返回一个值为结果的 Promise 对象

```javascript
(function(window) {
    function myPromise(resolver) {
        // ...
        // resolves 和 rejects 用于存放回调，待 Promise 状态改变时调用
        // 数组存放，是因为 all 方法会有多个回调
        self.resolves = [];
        self.rejects = [];
        function resolve(value) {
            // 值为 Promise，返回结果
            if (value instanceof myPromise) {
                return value.then(resolve, reject);
            }
            if (self.status === 'pending') {
                self.status = 'resolved';
                self.value = value;
                for (var i = 0; i < self.resolves.length; i ++) {
                    self.resolves[i](value);
                }
            }
        }
        function reject(reason) {
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.value = reason;
                for (var i = 0; i < self.rejects.length; i ++) {
                    self.rejects[i](reason);
                }
            }
        }
        // ...
    }
    // ...
    myPromise.prototype.then = function(onResolved, onRejected) {
        var self = this;
        // 回调非函数，返回结果
        onResolved = typeof onResolved === 'function' ? onResolved : function(value) { return value; }
        onRejected = typeof onRejected === 'function' ? onRejected : function(reason) { throw reason; }
        // 状态未改变时，把回调放入数组，待状态改变调用
        if (self.status === 'pending') {
            return new myPromise(function(resolve, reject) {
                self.resolves.push(function(value) {
                    try {
                        var res = onResolved(self.value);
                        if (res instanceof Promise) {
                            res.then(resolve, reject);
                        }
                        resolve(res);
                    } catch(e) {
                        reject(e);
                    }
                });
                self.rejects.push(function(reason) {
                    try {
                        var res = onRejected(self.value)
                        if (res instanceof Promise) {
                            res.then(resolve, reject);
                        }
                        reject(res);
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }
        // 状态为 resolved
        if (self.status === 'resolved') {
            return new myPromise(function(resolve, reject) {
                try {
                    var res = onResolved(self.value);
                    // 如果 onResolved 返回 Promise 对象，取新对象的结果，否则直接返回结果
                    if (res instanceof myPromise) {
                        res.then(resolve, reject);
                    }
                    resolve(res);
                } catch(e) {
                    reject(e);
                }
            });
        }
        // 状态为 rejected
        if (self.status === 'rejected') {
            return new myPromise(function(resolve, reject) {
                try {
                    var res = onRejected(self.value);
                    // 如果 onResolved 返回 Promise 对象，取新对象的结果，否则直接返回结果
                    if (res instanceof myPromise) {
                        res.then(resolve, reject);
                    }
                    reject(res);
                } catch(e) {
                    reject(e);
                }
            });
        }
    }
    // resolve 直接返回结果，不影响；reject 执行 onRejected，实现 catch error
    myPromise.prototype.catch = function(onRejected) {
        return this.then(null, onRejected);
    }
    // ...
})(window);
```



## Step 3

Promise 的回调需异步调用，否则结果有可能与预期不同。

```javascript
(function(window) {
    function myPromise(resolver) {
        // ...
        function resolve(value) {
            if (value instanceof myPromise) {
                return value.then(resolve, reject);
            }
            // 异步调用
            setTimeout(function() {
                if (self.status === 'pending') {
                    self.status = 'resolved';
                    self.value = value;
                    for (var i = 0; i < self.resolves.length; i ++) {
                        self.resolves[i](value);
                    }
                }
            });
        }
        function reject(reason) {
            // 异步调用
            setTimeout(function() {
                if (self.status === 'pending') {
                    self.status = 'rejected';
                    self.value = reason;
                    for (var i = 0; i < self.rejects.length; i ++) {
                        self.rejects[i](reason);
                    }
                }
            });
        }
        // ...
    }
    // ...
    myPromise.prototype.then = function(onResolved, onRejected) {
        // ...
        if (self.status === 'resolved') {
            return new myPromise(function(resolve, reject) {
                // 异步调用
                setTimeout(function() {
                    try {
                        var res = onResolved(self.value);
                        if (res instanceof myPromise) {
                            res.then(resolve, reject);
                        }
                        resolve(res);
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }
        if (self.status === 'rejected') {
            return new myPromise(function(resolve, reject) {
                // 异步调用
                setTimeout(function() {
                    try {
                        var res = onRejected(self.value);
                        if (res instanceof myPromise) {
                            res.then(resolve, reject);
                        }
                        reject(res);
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }
    }
    // ...
})(window);
```



## Step 4

实现 all finally race

```javascript
// all 方法
myPromise.all = function(arr) {
    if (typeof arr === 'object' && arr.length !== void 0 && arr[Symbol.iterator] && typeof arr[Symbol.iterator] === 'function') {
        return new myPromise(function(resolve, reject) {
            var result = []; // 结果
            var resolveNum = 0; // resolve 个数
            var resolved = function(index) {
                return function(value) {
                    result[index] = value;
                    resolveNum ++;
                    if (resolveNum == arr.length) {
                        resolve(result);
                    }
                }
            }
            for (var i = 0; i < arr.length; i ++) {
                arr[i].then(resolved(i), function(reason) {
                    reject(reason);
                });
            }
        });
    } else {
        // 非数组、不可迭代
        return new myPromise(function(resolve, reject) {
            reject(new TypeError(arr + ' is not iterable'));
        });
    }
}
myPromise.race = function(arr) {
    if (typeof arr === 'object' && arr.length !== void 0 && arr[Symbol.iterator] && typeof arr[Symbol.iterator] === 'function') {
        return new myPromise(function(resolve, reject) {
            for (var i = 0; i < arr.length; i ++) {
                // 谁先谁 resolve
                arr[i].then(function(value) {
                    resolve(value);
                }, function(reason) {
                    reject(reason);
                });
            }
        });
    } else {
        return new myPromise(function(resolve, reject) {
            reject(new TypeError(arr + ' is not iterable'));
        });
    }
}
myPromise.prototype.finally = function(callback) {
    // 不管成功与否，都执行 callback
    return this.then(function(value) {
        callback(value);
    }, function(reason) {
        callback(reason);
    });
}
```



## final

至此，简单版的 Promise 的最终实现：

```javascript
(function(window) {
    function myPromise(resolver) {
        if (typeof resolver !== 'function') {
            throw new TypeError('Promise resolver ' + resolver + ' is not a function');
        }
        if (!(this instanceof myPromise)) throw new TypeError(this + ' is not a promise');
        var self = this;
        self.status = 'pending';
        self.value = void 0;
        self.resolves = [];
        self.rejects = [];
        function resolve(value) {
            if (value instanceof myPromise) {
                return value.then(resolve, reject);
            }
            setTimeout(function() {
                if (self.status === 'pending') {
                    self.status = 'resolved';
                    self.value = value;
                    for (var i = 0; i < self.resolves.length; i ++) {
                        self.resolves[i](value);
                    }
                }
            });
        }
        function reject(reason) {
            setTimeout(function() {
                if (self.status === 'pending') {
                    self.status = 'rejected';
                    self.value = reason;
                    for (var i = 0; i < self.rejects.length; i ++) {
                        self.rejects[i](reason);
                    }
                }
            });
        }
        try {
            resolver(resolve, reject);
        } catch(e) {
            reject(e);
        }
    }
    myPromise.prototype.constructor = myPromise;
    myPromise.prototype.then = function(onResolved, onRejected) {
        var self = this;
        onResolved = typeof onResolved === 'function' ? onResolved : function(value) { return value; }
        onRejected = typeof onRejected === 'function' ? onRejected : function(reason) { throw reason; }
        if (self.status === 'pending') {
            return new myPromise(function(resolve, reject) {
                self.resolves.push(function(value) {
                    try {
                        var res = onResolved(self.value);
                        if (res instanceof Promise) {
                            res.then(resolve, reject);
                        }
                        resolve(res);
                    } catch(e) {
                        reject(e);
                    }
                });
                self.rejects.push(function(reason) {
                    try {
                        var res = onRejected(self.value)
                        if (res instanceof Promise) {
                            res.then(resolve, reject);
                        }
                        reject(res);
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }
        if (self.status === 'resolved') {
            return new myPromise(function(resolve, reject) {
                setTimeout(function() {
                    try {
                        var res = onResolved(self.value);
                        if (res instanceof myPromise) {
                            res.then(resolve, reject);
                        }
                        resolve(res);
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }
        if (self.status === 'rejected') {
            return new myPromise(function(resolve, reject) {
                setTimeout(function() {
                    try {
                        var res = onRejected(self.value);
                        if (res instanceof myPromise) {
                            res.then(resolve, reject);
                        }
                        reject(res);
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }
    }
    myPromise.prototype.catch = function(onRejected) {
        return this.then(null, onRejected);
    }
    myPromise.prototype.finally = function(callback) {
        return this.then(function(value) {
            callback();
        }, function(reason) {
            callback();
        });
    }
    myPromise.all = function(arr) {
        if (typeof arr === 'object' && arr.length !== void 0 && arr[Symbol.iterator] && typeof arr[Symbol.iterator] === 'function') {
            return new myPromise(function(resolve, reject) {
                var result = [];
                var resolveNum = 0;
                var resolved = function(index) {
                    return function(value) {
                        result[index] = value;
                        resolveNum ++;
                        if (resolveNum == arr.length) {
                            resolve(result);
                        }
                    }
                }
                for (var i = 0; i < arr.length; i ++) {
                    arr[i].then(resolved(i), function(reason) {
                        reject(reason);
                    });
                }
            });
        } else {
            return new myPromise(function(resolve, reject) {
                reject(new TypeError(arr + ' is not iterable'));
            });
        }
    }
    myPromise.race = function(arr) {
        if (typeof arr === 'object' && arr.length !== void 0 && arr[Symbol.iterator] && typeof arr[Symbol.iterator] === 'function') {
            return new myPromise(function(resolve, reject) {
                for (var i = 0; i < arr.length; i ++) {
                    arr[i].then(function(value) {
                        resolve(value);
                    }, function(reason) {
                        reject(reason);
                    });
                }
            });
        } else {
            return new myPromise(function(resolve, reject) {
                reject(new TypeError(arr + ' is not iterable'));
            });
        }
    }
    window.myPromise = myPromise;
})(window);
```

