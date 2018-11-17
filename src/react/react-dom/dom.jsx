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
