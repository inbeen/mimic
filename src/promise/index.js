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

// test
document.getElementById('app').innerHTML = `<h1>Please press F12 to open console.</h1>`;

function getPromise(url) {
    return new myPromise(function(resolve, reject) {
        var image = new Image();
        image.onload = function() {
            resolve(url);
        }
        image.onerror = function() {
            reject(new Error('Invalid path ' + url));
        }
        image.src = url;
    });
}
var p1 = getPromise('https://cdn.v2ex.com/gravatar/aa7c77bd8d97c61e926634d07e731719?s=48&d=retro');
var p2 = getPromise('http://cnd.asda.com/asdaasdasdafgafaer.png');
// p1.then(function(res) {
//   console.dir(res);
//   return res;
// }).then(function(res) {
//   console.dir(res);
//   return res;
// }).then(function(res) {
//   console.dir(res);
//   return res;
// }).finally(function() {
//   console.log(1);
// });
p2.then(function(res) {
    console.log(1);
    return res;
}).catch(function(e) {
    console.log(2);
    return e;
}).finally(function() {
    console.log(3);
p1.then(function(res) {
    console.dir(res);
})
});
// myPromise.race([p1, p1, p1]).then(res => console.dir(res));
// Promise.all([p2, p2, p2]).then(res => console.dir(res));
