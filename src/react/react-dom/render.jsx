import Component from '../react/component';
import { setAttribute } from './dom';

function render(element, container, dom) {
    return diff(dom, element, container);
}

function diff(dom, element, container) {
    const ret = diffNode(dom, element);
    if (container && ret.parentNode !== container) {
        container.appendChild(ret);
    }
    return ret;
}

function diffNode(dom, element) {
    let origin = dom;
    // 非法节点
    if (element === void 0 || element === null || typeof element === 'boolean') element = '';
    if (typeof element === 'number') element = String(element);
    // 对比文本节点
    if (typeof element === 'string') {
        // 当前 dom 为文本节点，直接更新文本
        if (dom && dom.nodeType === 3) {
            if (dom.textContent !== element) {
                dom.textContent = element;
            }
        // 当前 dom 不是文本节点，直接替换文本
        } else {
            origin = document.createTextNode(element);
            if (dom && dom.parentNode) {
                dom.parentNode.replaceChild(origin, dom);
            }
        }
        return origin;
    }
    // 对比组件
    if (typeof element.tag === 'function') {
        return diffComponent(dom, element);
    }
    // 挂载前 or 不同类型
    if (!dom || !isSameNodeType(dom, element)) {
        origin = document.createElement(element.tag);
        // 不同类型 - 挂载后更新
        if (dom) {
            [...dom.childNodes].map(origin.appendChild); // 原子节点移到新节点下
            if (dom.parentNode) {
                dom.parentNode.replaceChild(origin, dom); // 移除原节点
            }
        }
    }
    // 对比子节点
    if (element.children && element.children.length > 0 || (origin.childNodes && origin.childNodes.length > 0)) {
        diffChildren(origin, element.children);
    }
    // 对比属性
    diffAttributes(origin, element);
    return origin;
}

function diffComponent(dom, element) {
    let c = dom && dom._component;
    let originDom = dom;
    // 组件同类型，只需 set props
    if (c && c.constructor === element.tag) {
        setComponentProps(c, element.attrs);
        dom = c.base;
    // 组件异类型，替换组件
    } else {
        // 移除原来组件
        if (c) {
            unmountComponent(c);
            originDom = null;
        }
        // 渲染新的组件
        c = createComponent(element.tag, element.attrs);
        setComponentProps(c, element.attrs);
        dom = c.base;
        if (originDom && dom !== originDom) {
            originDom._component = null;
            removeNode(originDom);
        }
    }
    return dom;
}

function diffChildren(dom, vchildren) {
    const domChildren = dom.childNodes;
    const children = []; // 无 key
    const keyed = {}; // 有 key
    // 分类含 key 与否的节点
    if (domChildren.length > 0) {
        for (let i = 0; i < domChildren.length; i ++) {
            const child = domChildren[i];
            const key = child.key;
            if (key) {
                keyed[key] = child;
            } else {
                children.push(child);
            }
        }
    }
    if (vchildren && vchildren.length > 0) {
        let min = 0;
        let childrenLen = children.length;
        for (let i = 0; i < vchildren.length; i ++) {
            const vchild = vchildren[i];
            const key = vchild.key;
            let child;
            // 有 key, 匹配节点
            if (key) {
                if (keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                }
            // 无 key, 寻找相同类型节点
            } else if (min < childrenLen) {
                for (let j = min; j < childrenLen; j ++) {
                    let c = children[j];
                    if (c && isSameNodeType(c, vchild)) {
                        child = c;
                        children[j] = void 0;
                        // 优化 减少后面的比较
                        if (j === childrenLen - 1) childrenLen --;
                        if (j === min) min ++;
                        break;
                    }
                }
            }
            // 对比
            child = diff(child, vchild);
            // 更新
            const f = domChildren[i];
            if (child && child !== dom && child !== f) {
                // 对应位置为空，插入新节点
                if (!f) {
                    dom.appendChild(child);
                // 对应下一个位置，删除当前节点
                } else if (child === f.nextSibling) {
                    removeNode(f);
                // 新节点插入当前节点之前
                } else {
                    dom.insertBefore(child, f);
                }
            }
        }
    }
}

function diffAttributes(dom, element) {
    const origin = {}; // 当前属性
    const attrs = element.attrs; // 节点属性
    for (let i = 0; i < dom.attributes.length; i ++) {
        const attr = dom.attributes[i];
        origin[attr.name] = attr.value;
    }
    // 移除不存在属性
    for (let name in origin) {
        if (!(name in attrs)) {
            setAttribute(dom, name, void 0);
        }
    }
    // 更新存在的属性
    for (let name in attrs) {
        if (origin[name] !== attrs[name]) {
            setAttribute(dom, name, attrs[name]);
        }
    }
}

function isSameNodeType(dom, element) {
    if (typeof element === 'string' || typeof element === 'number') {
        return dom.nodeType === 3;
    }
    if (typeof element.tag === 'string') {
        return dom.nodeName.toLowerCase() === element.tag.toLowerCase();
    }
    return dom && dom._component && dom._component.constructor === element.tag;
}

function createComponent(component, props) {
    let instance;
    // 如果是类定义组件，返回实例
    if (component.prototype && component.prototype.render) {
        instance = new component(props);
    // 如果是函数定义组件，扩展为类定义组件
    } else {
        instance = new Component(props);
        instance.constructor = component;
        instance.render = function() {
            return this.constructor(props);
        }
    }
    return instance;
}

// 触发 WillMount 周期函数，设置 props
function setComponentProps(component, props) {
    if (!component.base) {
        if (component.componentWillMount) component.componentWillMount();
    } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(Props);
    }
    component.props = props;
    renderComponent(component);
}

// 渲染组件，触发组件生命周期
export function renderComponent(component) {
    let base;
    const renderer = component.render();
    if (component.base && component.componentWillUpdate) {
        component.componentWillUpdate();
    }
    base = diff(component.base, renderer);
    if (component.base) {
        if (component.componentDidUpdate) component.componentDidUpdate();
    } else if (component.componentDidMount) {
        component.componentDidMount();
    }
    component.base = base;
    base._component = component;
}

// 卸载组件，触发 WillUnMount
function unmountComponent(component) {
    if (component.componentWillUnMount) component.componentWillUnMount();
    removeNode(component.base);
}

// 移除节点
function removeNode(dom) {
    if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
    }
}

export default render;
