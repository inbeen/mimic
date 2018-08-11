import Watcher from "../watcher";

/**
 * @class Complier
 * @classdesc 解析类
 */
class Compile {
    constructor(el, vm) {
        // el 可为 类名、Id、dom节点
        this.$el = this.isElementNode(el) ? el : document.querySelector(el);
        // MVVM 实例
        this.$vm = vm;
        if (this.$el) {
            this.$fragment = this.nodeFragment(this.$el);
            this.compileElement(this.$fragment);
            // 将文档碎片放回 dom
            this.$el.appendChild(this.$fragment);
        }
    }
    compileElement(el) {
        let self = this;
        let childNodes = el.childNodes;
        // 遍历 dom 节点
        [].slice.call(childNodes).forEach(node => {
            let reg = /\{\{((?:.|\n)+?)\}\}/;
            let text = node.textContent;
            // 解析元素节点
            if (self.isElementNode(node)) {
                self.compile(node);
            }
            // 解析文本节点
            if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, RegExp.$1.trim());
            }
            // 解析子节点
            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        });
    }
    // 新建文档碎片，优化对 dom 的直接操作
    nodeFragment(el) {
        let fragment = document.createDocumentFragment();
        let child;
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }
    // 指令解析
    compile(node) {
        let attrs = node.attributes;
        let self = this;
        // 遍历节点属性
        [].slice.call(attrs).forEach(attr => {
            let name = attr.name;
            if (self.isDirective(name)) {
                let exp = attr.value;
                let dir = name.substring(2);
                // 事件指令
                if (this.isEventDirective(dir)) {
                    compileUtil.eventHandle(node, self.$vm, exp, dir);
                }
                // 普通指令
                else {
                    compileUtil[dir] && compileUtil[dir](node, self.$vm, exp);
                }
                node.removeAttribute(name);
            }
        });
    }
    // 文本解析
    compileText(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    }
    // 元素节点判定
    isElementNode(node) {
        return node.nodeType === 1;
    }
    // 文本节点判定
    isTextNode(node) {
        return node.nodeType === 3;
    }
    // 指令判定
    isDirective(attr) {
        return attr.indexOf('v-') === 0;
    }
    // 事件判定
    isEventDirective(dir) {
        return dir.indexOf('on') === 0;
    }
    // 遍历判定
    isIterationDirective(dir) {
        return dir.indexOf('for') === 0;
    }
}

let $elm;
let timer = null;
// 处理指令
const compileUtil = {
    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');
        let self = this;
        let val = this._getVmVal(vm, exp);
        // 监听 input 事件
        node.addEventListener('input', function(e) {
            let newVal = e.target.value;
            let $elm = e.target;
            if (val === newVal) {
                return;
            }
            // 异步渲染
            clearTimeout(timer);
            timer = setTimeout(() => {
                self._setVmVal(vm, exp, newVal);
                val = newVal;
            });
        });
    },
    bind: function(node, vm, exp, dir) {
        let updateFn = updater[dir + 'Updater'];
        updateFn && updateFn(node, this._getVmVal(vm, exp));
        new Watcher(vm, exp, function(value) {
            updateFn && updateFn(node, value);
        });
    },
    eventHandle: function(node, vm, exp, dir) {
        let eventType = dir.split(':')[1];
        let [func, params] = this._getFnParams(exp);
        let fn = vm.$options.methods && vm.$options.methods[func];
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm, ...params), false);
        }
    },
    // 拆分函数调用表达式
    // eq. func(1, 2, 'abc') => func, [1, 2, 'abc']
    _getFnParams: function(exp) {
        if (/([a-z][\w\d]*)\((.*)\)/.test(exp)) {
            let fnName = RegExp.$1;
            let res = RegExp.$2.match(/[\w\d'"\u4e00-\u9fa5]+/g);
            let fnParams = res ? res : [];
            fnParams = fnParams.map(param => {
                if (/\d+/.test(param)) {
                    return parseInt(param);
                }
                else {
                    if (/'.*'/.test(param) || /".*"/.test(param)) param = param.slice(1, -1);
                    return param;
                }
            });
            return [fnName, fnParams]
        }
        return [exp, []];
    },
    /**
     * 获取 mvvm 实例的 value
     * @param  {MVVM}   vm   mvvm实例
     * @param  {string} exp  表达式
     */
    _getVmVal: function(vm, exp) {
        let val = vm;
        if (/([a-z][\w\d]*)\[(.*)\]/.test(exp)) {
            // 获取 Object.key
            let index = parseInt(RegExp.$2);
            val = val[RegExp.$1];
            val = val[index];
        } else {
            // 获取 Object.key
            let exps = exp.split('.');
            exps.forEach(key => {
                key = key.trim();
                val = val[key];
            });
        }
        return val;
    },
    /**
     * 设置 mvvm 实例的 value
     * @param  {MVVM}   vm    mvvm实例
     * @param  {string} exp   表达式
     * @param  {any}    value 新值
     */
    _setVmVal: function(vm, exp, value) {
        let val = vm;
        if (/([a-z][\w\d]*)\[(.*)\]/.test(exp)) {
            // 设置 Array[index]
            let index = parseInt(RegExp.$2);
            val = val[RegExp.$1];
            val[index] = value;
        } else {
            // 设置 Object.key
            let exps = exp.split('.');
            exps.forEach((key, index) => {
                key = key.trim();
                if (index < exps.length - 1) {
                    val = val[key];
                } else {
                    val[key] = value;
                }
            }); 
        }
    }
}

// 渲染
const updater = {
    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value;
    },
    textUpdater: function(node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    classUpdater: function(node, value) {
    },
    modelUpdater: function(node, value) {
        // 不对当前操作的元素进行渲染操作
        if ($elm === node) {
            return false;
        }
        // 解除当前操作的元素，避免无法渲染
        $elm = undefined;
        node.value = typeof value === 'undefined' ? '' : value;
    }
}

export default Compile;
