function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        configurable: true,
        writable: true
    })
}
// 拷贝原生数组的方法
let arrayMethods = Object.create(Array.prototype);
[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'slice',
    'sort',
    'reverse'
].forEach(method => {
    // 获取原生数组的方法
    let original = arrayMethods[method];
    // 重写原生数组的方法
    def(arrayMethods, method, function() {
        // 操作方法的参数
        let args = [...arguments];
        let result = original.apply(this, args);
        let ob = this.__ob__;
        let inserted;
        switch(method) {
            case 'push':
                inserted = args;
                break;
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }
        // 监听插入的数据
        if (inserted) {
            ob.observeArray(inserted);
        }
        // 通知订阅者，数组数据变化
        ob.dep.notify();
        return result;
    });
});

/**
 * @class Observer
 * @classdesc 发布类
 */
class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();
        // 绑定 value 的 __ob__ 为 Observer
        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            value.__proto__ = arrayMethods;
        } else {
            this.walk(value);
        }
    }
    // 遍历调用 observeProperty
    walk(obj) {
        Object.keys(obj).forEach(key => {
            this.observeProperty(obj, key, obj[key]);
        });
    }
    observeArray(items) {
        for (let i = 0; i < items.length; i ++) {
            observe(items[i]);
        }
    }
    // 重写对象的 setter, getter 方法 
    observeProperty(obj, key, val) {
        let dep = new Dep();
        // 监听 子属性(对象) 的数据变化
        let childOb = observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true, // 可遍历
            configurable: true, // 可修改
            get: function() {
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                    }
                }
                return val;
            },
            set: function(newVal) {
                // 确保新旧不等、新旧皆不为 NaN
                if (newVal === val || (newVal !== newVal && val !== val)) {
                    return;
                }
                val = newVal;
                // 监听新的子属性
                childOb = observe(newVal);
                // 数据变化时，通知所有订阅者
                dep.notify();
            }
        });
    }
}

/**
 * 监听对象的数据变化
 * @param {Object} obj 监听的对象
 * @returns {Observer} 发布类
 */
function observe(obj) {
    if (!obj || typeof obj !== 'object') {
        return;
    }
    return new Observer(obj);
}

let depId = 0;
/**
 * @class Dep
 * @classdesc 依赖类
 */
class Dep {
    constructor() {
        this.id = depId ++; // 订阅者 唯一标识
        this.subs = []; // 订阅者 数组
    }
    /**
     * 添加订阅者
     * @param {Watcher} 订阅者
     */
    addSub(sub) {
        this.subs.push(sub);
    }
    /**
     * 移除订阅者
     * @param {Watcher} 订阅者
     */
    removeSub(sub) {
        let index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    }
    // 通知所有的订阅者，更新数据
    notify() {
        this.subs.forEach(sub => {
            sub.update();
        });
    }
    // 添加 发布者
    depend() {
        Dep.target.addDep(this);
    }
}
Dep.target = null;

export {
    Observer,
    observe,
    Dep
}
