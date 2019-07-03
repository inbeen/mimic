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

// test
document.getElementById('app').innerHTML = `
<span style='display: inline-block;width: 100px;text-align: right;margin-right: 10px; overflow: hidden;' v-html='a'></span>
<input type='text' style='margin-right: 20px;' v-model='a'>
<input type='text' v-model='a'>
<p>----------------------------------------------------------------------</p>
<button v-on:click="change(10, '测试'函数'参数')">click it!</button>
<div>The button above has been clicked <span>{{ clicks.count }}</span> times.</div>
<div>(Click the button above) Your scores: <span>{{ clicks.score }}</span></div>
<p>----------------------------------------------------------------------</p>
<div>数组的长度为：
    <span style='display: inline-block;width: 30px;text-align: right;margin-right: 10px;'>{{ arr.length }}</span>
    <button v-on:click="randomPush">点击我添加数组元素</button><br>
    数组第一个元素为：<span>{{ arr[0] }}</span><br>
</div>`;

window.vm = new window.MVVM({
    el: '#app',
    data: {
        a: '输入',
        clicks: {
            count: 0,
            score: 0
        },
        arr: ['按上面按钮添加']
    },
    methods: {
        change: function(n, s) {
            this.clicks.count ++;
            this.clicks.score += n;
            console.log(s);
        },
        randomPush: function() {
            this.arr.unshift(Math.random());
        }
    }
})
