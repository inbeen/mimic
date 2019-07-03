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
    mySet.prototype.length = 0;
    global.mySet = mySet;
})(window)

// test
document.getElementById('app').innerHTML = `<h1>Please press F12 to open console.</h1>`;

var set1 = new mySet([1, 2, 3, NaN, NaN]);
var set2 = new mySet(new Set([4, 5, 6]));
set2.forEach((v, i) => {
    console.log(v, i);
});

