import { Dep } from '../observer/index';

/**
 * @class Watcher
 * @classdesc 订阅类
 */
class Watcher {
    constructor(vm, expOrFn, callback) {
        this.vm = vm;
        expOrFn = expOrFn.trim();
        this.expOrFn = expOrFn;
        this.callback = callback;
        this.deps = {}
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = this.parseGetter(expOrFn);
        }
        this.value = this.get();
    }
    // 更新
    update() {
        this.run();
    }
    run() {
        let newVal = this.get();
        let oldVal = this.value;
        if (newVal === oldVal) {
            return;
        }
        this.value = newVal;
        // 执行 MVVM 实例的回调
        this.callback.call(this.vm, newVal);
    }
    get() {
        // 绑定订阅者
        Dep.target = this;
        // getter 触发 MVVM 实例 的 get 方法，从而触发 dep 的 depend 方法
        let value = this.getter.call(this.vm, this.vm);
        // 释放
        Dep.target = null;
        return value;
    }
    // 添加 Watcher 到 Dep.subs[]
    addDep(dep) {
        if (!this.deps.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.deps[dep.id] = dep;
        }
    }
    // 将 exp 表达式转化为 获取(表达式)值的函数
    parseGetter(exp) {
        if (/([a-z][\w\d]*)\[(.*)\]/.test(exp)) {
            // 转化 Array[index]
            let index = RegExp.$2;
            let key = RegExp.$1; 
            return function(obj) {
                return obj[key][index];
            }
        }
        else {
            // 转化 Object.key
            if (/[^\w.]$/.test(exp)) return;
            let exps = exp.split('.');
            return function(obj) {
                for (let i = 0; i < exps.length; i ++) {
                    if (!obj) return;
                    obj = obj[exps[i]];
                }
                return obj
            }
        }
    }
}

export default Watcher;
