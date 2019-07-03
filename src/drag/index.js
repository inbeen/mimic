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

// test
document.getElementById('app').innerHTML = `
<div id='drag' style='
    position: absolute;
    width: 50px;
    height: 50px;
    right: 200px;
    top: 100px;
    background: #4396ea;
    cursor: move;'></div>
<div id='drag1' style='
    position: absolute;
    width: 50px;
    height: 50px;
    left: 200px;
    top: 100px;
    background: #666;
    cursor: move;'></div>
`;

var test = document.getElementById('drag');
var test1 = document.getElementById('drag1');
new Drag(test, '');
new Drag(test1, '');
