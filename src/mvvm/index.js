import { observe } from './observer/index';
import Compile from './compile/index';

/**
 * @class MVVM
 * @classdesc MVVM类
 */
class MVVM {
    constructor(options) {
        this.$options = options;
        let data = this._data = this.$options.data;
        let self = this;
        Object.keys(data).forEach(key => {
            self._proxyData(key);
        });
        // 监听 MVVM 实例的 data 属性
        observe(data);
        // 解析、绑定
        new Compile(options.el || document.body, this);
    }
    /**
     * 属性代理
     * @param {string} key 
     * @desc 重写 MVVM 实例 get 和 set 以直接获取或设置 data 的属性
     */
    _proxyData(key) {
        let self = this;
        Object.defineProperty(self, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                return self._data[key];
            },
            set: function(val) {
                self._data[key] = val;
            }
        });
    }
}

window.MVVM = MVVM;

export default MVVM;
