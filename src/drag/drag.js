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
