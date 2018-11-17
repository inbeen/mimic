# React

> 此项目为简易版 React，旨在学习

## 渲染

React 使用 JSX 替代常规的 JS，可以书写HTML：

```jsx
const a = <a className='b'>c</a>;
```

本质上，JSX是语法糖，上面代码会被babel转换成如下：

```js
const a = React.createElement('a', {className: 'b'}, 'c');
```

所以，我们需要实现 React.createElement



### React.createElement

从 JSX 转译的结果看，createElement 方法的参数如下：

```js
// createElement(tag, attrs, child1, child2, child3, ...);
function createElement(tag, attrs, ...children) {
    return {
        tag, // 标签，如: a, b, h1, div 等
        attrs, // 属性，如: className, id 等
        children, // 子节点
    }
}
```

将定义的 createElement 放到对象 React 中

```jsx
const React = {
    createElement
}
console.dir(<a className='b'>c</a>);
```

输出为（这就是 虚拟DOM）：

![](https://i.loli.net/2018/11/17/5bf00d630c11f.jpg)

### ReacDOM.render

render 负责将虚拟 DOM 渲染成真实的 DOM ，参数分别为：虚拟 DOM 和挂载元素

```jsx
ReactDOM.render(
    <a className='b'>c</h1>,
    document.getElementById('root')
);
```

实现如下：

```jsx
function render(element, container) {
    // 文本节点
    if (typeof element ==='string') {
        const textNode = document.createTextNode(element);
        return container.appendChild(textNode);
    }
    const dom = document.createElement(element.tag);
    if (element.attrs) {
        Object.keys(element.attrs).forEach(key => {
            const value = element.attrs[ key ];
            setAttribute(dom, key, value); // 设置属性
        });
    }
    element.children.forEach(child => render(child, dom)); // 渲染子节点
    return container.appendChild(dom); // 挂载
}
```

setAttribute 用于渲染属性，具体实现如下

```jsx
export function setAttribute(dom, name, value) {
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
```

重新渲染时，需要清空原来的内容

```jsx
const ReactDOM = {
    render: (element, container) => {
        container.innerHTML = '';
        return render(element, container);
    }
}
```

测试结果：

```jsx
function now() {
    const element = (
        <h1>Now: {new Date().toLocaleTimeString()}</h1>
    );
    ReactDOM.render(
        element,
        document.getElementById('root')
    );
}
setInterval(now, 1000);
```



## 组件

实现了基础的 JSX 渲染功能，接下来实现 React 的组件功能。

### Component

定义组件的方式分2种：函数和类。

如果渲染的是组件不是具体标签，虚拟DOM 的 tag 值将是 函数 而不是 字符串。

类定义组件需要继承 React.Component

```jsx
class Counter extends React.Component {
    render() {
        return <div>Counter</div>
    }
}
```

类 React.Component 的实现

```jsx
class Component {
    constructor(props = {}) {
        this.isReactComponent = true;
        this.state = {};
        this.props = props;
    }
    setState(stateChange) {
        Object.assign(this.state, stateChange);
        renderComponent(this);
    }
}
```

组件内部的渲染变化，需要使用 setState 来触发， 这里通过更新 state 并调用 renderComponent 来实现

此外，还需要修改之前的 ReactDOM.render，需要改成可渲染组件

```jsx
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
```



### 生命周期

上面用到了 createComponent 和 setComponentProps ，用以下面实现组件的生命周期。

````jsx
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
````

renderComponent 用以渲染组件，setState 直接调用该方法更新渲染

```jsx
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
```

至此，实现了组件化

测试：

```jsx
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            num: 0,
        }
    }
    componentWillUpdate() {
        console.log('update');
    }
    componentWillMount() {
        console.log('mount');
    }
    onClick() {
        for (let i = 0; i < 10; i ++) {
            this.setState({num: this.state.num + 1});
            console.log(0);
        }
    }
    render() {
        return (
            <div onClick={() => this.onClick()}>
                <h1>计数君: {this.state.num}</h1>
                <button>计数</button>
            </div>
        )
    }
}

ReactDOM.render(
    <Counter/>,
    document.getElementById('root')
);
```



## diff 算法

前面实现的渲染都是整个组件或者元素，DOM 操作十分消耗性能，React 为减少此开销，使用了 diff 算法，通过对比渲染前后的变化，进行局部更新。

diff 分 虚拟对比虚拟 和 真实对比虚拟，大部分类 React 框架都是 虚拟对比虚拟，这里用的是真实对比虚拟

### 实现

虚拟 DOM，分为三种：文本、原生DOM、组件

### 对比文本节点

文本节点比较简单，分当前 DOM 为文本 和 不是文本两种

```jsx
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
```



### 对比非文本节点

分两种情况：

1、DOM 不存在，即新增节点，或者新旧节点类型不同，那就新建一个 DOM 元素，将原节点并将原来的子节点（如果有的话）移动到新建的 DOM 节点下

2、DOM 存在，和虚拟 DOM 同类型，先不做处理，等待子节点对比。

```jsx
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

function isSameNodeType(dom, element) {
    if (typeof element === 'string' || typeof element === 'number') {
        return dom.nodeType === 3;
    }
    if (typeof element.tag === 'string') {
        return dom.nodeName.toLowerCase() === element.tag.toLowerCase();
    }
    return dom && dom._component && dom._component.constructor === element.tag;
}
```



### 对比属性

```jsx
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
```



### 对比子节点

子节点是数组，可能只改变顺序，所以需要添加标记来对比（即 key）

```jsx
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



// 移除节点
function removeNode(dom) {
    if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
    }
}
```



### 对比组件

```jsx
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

// 卸载组件，触发 WillUnMount
function unmountComponent(component) {
    if (component.componentWillUnMount) component.componentWillUnMount();
    removeNode(component.base);
}
```

此外，还需要修改此前的 renderComponent

```jsx
function renderComponent(component) {
    // ...
    base = diff(component.base, renderer);
    // ...
    // 注释下面
    // if (component.base && component.base.parentNode) {
    //     component.base.parentNode.replaceChild(base, component.base);
    // }
    // ...
}
```

重写 ReactDOM.render

```jsx
function render(element, container, dom) {
    return diff(dom, element, container);
}
```

diff 实现：

```jsx
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
```

完整实现请看[这里](https://github.com/inbeen/mimic/blob/master/src/react/react-dom/render.js)



## 异步 setState

在实际中可以会产生以下代码：

```jsx
for (let i = 0; i < 10; i ++) {
    this.setState({num: this.state.num + 1});
}
```

这段代码会重新渲染10次，非常消耗性能，因此需要对其优化。

React 采用的是异步更新队列，将多次 setState 合并为1个，但是会产生一个问题，无法拿到上一次改变的值，所以允许函数形式传参。

```jsx
const setStateQueue = [];
function enqueueSetState(stateChange, component) {
    setStateQueue.push({ stateChange, component });
}

setState(stateChange) {
    enqueueSetState(stateChange, this);
}
```

添加至更新列表后，需要清空并渲染组件。清空列表需区分参数为函数与否。

```jsx
// 清空队列
function flush() {
    let setState, render;
    while (setState = setStateQueue.shift()) {
        const { stateChange, component } = setState;
        if (!component.prevState) {
            component.prevState = Object.assign({}, component.state);
        }
        if (typeof stateChange === 'function') {
            Object.assign(component.state, stateChange(component.prevState, component.props));
        } else {
            Object.assign(component.state, stateChange);
        }
        // 更新
        component.prevState = component.state;
    }
}
```

渲染组件仍需要一个队列来保存需要渲染的组件。

因此，完整的实现如下：

```jsx
const setStateQueue = [];
const renderQueue = [];

// 延迟执行
function defer(fn) {
    return Promise.resolve().then(fn);
}

export function enqueueSetState(stateChange, component) {
    if (setStateQueue.length === 0) {
        defer(flush);
    }
    setStateQueue.push({ stateChange, component });
    // 去重 渲染组件
    if (!renderQueue.some(item => item === component)) {
        renderQueue.push(component);
    }
}

// 清空队列
function flush() {
    let setState, render;
    while (setState = setStateQueue.shift()) {
        const { stateChange, component } = setState;
        if (!component.prevState) {
            component.prevState = Object.assign({}, component.state);
        }
        if (typeof stateChange === 'function') {
            Object.assign(component.state, stateChange(component.prevState, component.props));
        } else {
            Object.assign(component.state, stateChange);
        }
        // 更新
        component.prevState = component.state;
    }
    while (render = renderQueue.shift()) {
        renderComponent(render);
    }
}
```

