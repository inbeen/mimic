# call apply bind

> call() 方法调用一个函数，其具有一个指定的 this 值和分别地提供的参数(参数的列表)。
>
> apply() 方法调用一个具有给定 this 值的函数，以及作为一个数组(或类似数组对象)提供的参数。
>
> Bind() 方法创建一个新的函数， 当这个新函数被调用时其 this 置为提供的值，其参数列表前几项置为创建时指定的参数序列。

举个栗子

```javascript
var foo = {
    value: true
};

function bar() {
    console.log(this.value);
}

bar.call(foo); // true
bar.apply(foo); // true
bar.bind(foo)(); // true
```

call apply bind 均改变了 this 的指向，指向其第一个参数，这里即 foo

此外，call 和 apply 还执行了函数 bar，而 bind 是返回一个函数



### Step 1

call apply 实现可分为：

* 将函数设为对象的属性，使得 this 指向对象
* 执行该函数
* 删除该属性，不改变原对象

bind 实现可分为：

* 对 bind() 的第一个参数进行 call / apply
* 将其作为一个函数的返回值
* 返回改函数

```javascript
Function.prototype.mycall = function(ctx) {
    ctx._fn = this;
    ctx._fn();
    delete ctx._fn;
}

Function.prototype.myapply = function(ctx) {
    ctx._fn = this;
    ctx._fn();
    delete ctx._fn;
}

Function.prototype.mybind = function(ctx) {
    var self = this;
    return function() {
        return self.apply(ctx);
    }
}
```



### Step 2

调用 call apply bind 给定参数，以下栗子

```javascript
var foo = {
    value: true
};

function bar(a, b) {
    console.log(a);
    console.log(b);
    console.log(this.value);
}

bar.call(foo, 1, 2);
// 1
// 2
// true
bar.apply(foo, [3, 4]);
// 3
// 4
// true
bar.bind(foo, 5)(6);
// 5
// 6
// true
```

* call() 传入的参数不确定，可通过 arguments 对象获取，存放于数组中
* apply() 传入的参数为数组，可直接获取第二个参数(须判断是否为数组)
* bind() 可传入部分参数，在执行的时候再传入剩余参数

此时 call 和 apply 的参数均为数组形式，执行函数可利用 eval() 执行字符串代码，连接所有参数

```javascript
Function.prototype.mycall = function(ctx) {
    ctx._fn = this;
    var args = [];
    for (var i = 1, l = arguments.length; i < l; i ++) {
        args.push('arguments[' + i + ']');
    }
    eval('ctx._fn(' + args + ')');
    delete ctx._fn;
}

Function.prototype.myapply = function(ctx, arr) {
    // 参数非数组
    if (typeof arr != 'object' || arr.length == undefined) {
        throw new TypeError('Uncaught TypeError: CreateListFromArrayLike called on non-object');
    }
    ctx._fn = this;
    if (!arr) {
        res = ctx._fn();
    } else {
        var args = [];
        for (var i = 0, l = arr.length; i < l; i ++) {
            args.push('arr[' + i + ']');
        }
        eval('ctx._fn(' + args + ')');
    }
    delete ctx._fn;
}
```

bind 可在 apply 的时候对参数进行连接

```javascript
Function.prototype.mybind = function (context) {
	var self = this;
	var args = Array.prototype.slice.call(arguments, 1);
	return function () {
		var bindArgs = Array.prototype.slice.call(arguments);
		return self.apply(context, args.concat(bindArgs));
	}
}
```



### Step 3

1. this 参数可为 null，当参数为 null 时，指向 window

   ```javascript
   var value = true;
   
   function bar() {
       console.log(this.value);
   }
   
   bar.call(null); // true
   bar.apply(null); // true
   ```

2. 函数可有返回值

   ```javascript
   var foo = {
       value: true
   }
   
   function bar() {
       return this.value;
   }
   
   console.log(bar.call(foo)); // true
   console.log(bar.apply(foo)); // true
   ```

   call apply 最终实现为：

   ```javascript
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
   ```

3. bind 返回的函数也能使用new操作符创建对象

   ```javascript
   var value = true;
   
   var foo = {
       value: true
   };
   
   function bar(a, b) {
       this.c = 'value of c';
       console.log(this.value);
       console.log(a);
       console.log(b);
   }
   
   bar.prototype.d = 'value of d';
   
   var bindFoo = bar.bind(foo, 1);
   
   var obj = new bindFoo(2);
   // undefined
   // 1
   // 2
   console.log(obj.c); // value of c
   console.log(obj.d); // value of d
   ```

   当 bind 返回的函数作为构造函数的时候，bind 时指定的 this 值会失效，this 指向 obj

   ```javascript
   Function.prototype.mybind = function(ctx) {
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
   ```

   当 bind 返回函数作为构造函数时，this 指向实例，将 bind 返回函数的 this 指向实例，让实例可获得来自绑定函数的属性

   当 bind 返回函数作为普通函数时，this 指向 window，将 bind 返回函数的 this 指向 bind 第一个参数，

4. 当调用的 bind 不是函数时，抛出错误

   ```javascript
   if (typeof this !== 'function') {
   	throw new Error('Uncaught TypeError: ' + this + '.bind is not callable');
   }
   ```

   bind 最终实现：

   ```javascript
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
   ```


