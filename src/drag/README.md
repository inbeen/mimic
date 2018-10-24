# Drag

> 实现简单的拖拽元素方法



## 实现

```javascript
var dragData = {
    top: 0, // 记录拖拽元素的纵向偏移
    left: 0, // 记录拖拽元素的横向偏移
    differX: 0, // 记录鼠标与横向偏移的差值
    differY: 0, // 记录鼠标与纵向偏移的差值
    flag: false // 记录是否处于点击状态
};

function drag(el, direction) {
    // el 传入需为 DOM 对象
    if (typeof el != 'object') throw new TypeError('el is not a object');
    // 记录偏移
    dragData.left = el.offsetLeft;
    dragData.top = el.offsetTop;
    el.onmousedown = function(ev) {
        // 记录差值
        dragData.differX = ev.clientX - dragData.left;
        dragData.differY = ev.clientY - dragData.top;
        dragData.flag = true;
    };
    document.onmouseup = function() {
        // 更新偏移
        dragData.left = el.offsetLeft;
        dragData.top = el.offsetTop;
        dragData.flag = false;
    };
    document.onmousemove = function(ev) {
        if (!dragData.flag) return;
        // 拖拽方向
        if (direction != 'vertical') el.style.left = ev.clientX - dragData.differX + 'px';
        if (direction != 'horizontal') el.style.top = ev.clientY - dragData.differY + 'px';
    };
}
```



为实现拖拽多个，写成类并用监听事件

```javascript
function Drag(el, direction) {
    if (typeof el != 'object') throw new TypeError('el is not a object');
    this.top = 0;
    this.left = 0;
    this.differX = 0;
    this.differY = 0;
    this.left = el.offsetLeft;
    this.top = el.offsetTop;
    var self = this;
    el.onmousedown = function(ev) {
        self.differX = ev.clientX - self.left;
        self.differY = ev.clientY - self.top;
        self.flag = true;
    };
    document.addEventListener('mouseup', function(ev){
        self.left = el.offsetLeft;
        self.top = el.offsetTop;
        self.flag = false;
    });
    document.addEventListener('mousemove', function(ev){
        if (self.flag) {
            if (direction != 'vertical') el.style.left = ev.clientX - self.differX + 'px';
            if (direction != 'horizontal') el.style.top = ev.clientY - self.differY + 'px';
        }
    });
}
```

