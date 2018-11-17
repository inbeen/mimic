import Component from '../react/component';

function render(element, container) {
    return container.appendChild(_render(element));
}

function _render(element) {
    // 非法 element
    if (element === void 0 || element === null || typeof element === 'boolean') element = '';
    if (typeof element === 'number') element = String(element);
    // element 为字符串，渲染文本
    if (typeof element === 'string') {
        const textNode = document.createTextNode(element);
        return textNode;
    }
    if (typeof element.tag === 'function') {
        const component = createComponent(element.tag, element.attrs);
        setComponentProps(component, element.attrs);
        return component.base;
    }
    const dom = document.createElement(element.tag);
    if (element.attrs) {
        Object.keys(element.attrs).forEach(key => {
            const value = element.attrs[key];
            setAttribute(dom, key, value);
        });
    }
    // 递归渲染子节点
    element.children.forEach(child => render(child, dom));
    return dom;
}

function setAttribute(dom, name, value) {
    // 属性名为 类
    if (name === 'className') name = 'class';
    // 属性名为 onXXX
    if (/on\w+/.test(name)) {
        name = name.toLowerCase();
        dom[name] = value || '';
    // 属性名为 style
    } else if (name === 'style') {
        if (!value || typeof value === 'string') {
            dom.style.cssText = value || '';
        } else if (value && typeof value === 'object') {
            for (let name in value) {
                dom.style[name] = typeof value[name] === 'number' ? value[name] + 'px' : value[name];
            }
        }
    // 属性名为 普通属性
    } else {
        if (name in dom) {
            dom[name] = value || '';
        }
        if (value) {
            dom.setAttribute(name, value);
        } else {
            dom.removeAttribute(name);
        }
    }
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
    base = _render(renderer);
    if (component.base) {
        if (component.componentDidUpdate) component.componentDidUpdate();
    } else if (component.componentDidMount) {
        component.componentDidMount();
    }
    if (component.base && component.base.parentNode) {
        component.base.parentNode.replaceChild(base, component.base);
    }
    component.base = base;
    base._component = component;
}

export default render;
