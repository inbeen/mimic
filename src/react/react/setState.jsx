import { renderComponent } from '../react-dom/render';

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
