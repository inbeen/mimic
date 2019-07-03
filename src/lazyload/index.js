const viewHeight = window.innerHeight || document.documentElement.clientHeight;
const imgs = document.getElementsByTagName('img');
let isDebounce = false, debounce = null;

function lazyLoad() {
    if (isDebounce) {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            isDebounce = false;
            lazyLoad();
        }, 50);
        return;
    }
    isDebounce = true;
    setTimeout(() => {
        isDebounce = false;
        lazyLoad();
    }, 50);
    for (let i = 0; i < imgs.length; i ++) {
        const distance = viewHeight - imgs[i].getBoundingClientRect().top;
        if ( distance >= 0 && !imgs[i].getAttribute('data-src-load') ) {
            imgs[i].src = imgs[i].getAttribute('data-src');
            imgs[i].setAttribute('data-src-load', '1');
        }
    }
}

// test
document.getElementById('app').innerHTML = `
<img data-src="http://qimg.mama.cn/trial/2019/05/2a957316ad271856a0fd1e7ae4e67c.jpg?imageMogr2/format/jpg/quality/90">
<div class='lazyload' style="margin: 500px 0">
    <img data-src="http://qimg.mama.cn/trial/2019/06/1a01e8f9d5478548e908d9f65dbaac.jpg?imageMogr2/format/jpg/quality/90">
</div>
<img data-src="http://qimg.mama.cn/trial/2019/06/03793a474fa5f35d01876be6401d74.png?imageMogr2/format/jpg/quality/90">`;

lazyLoad();
window.addEventListener('scroll', lazyLoad, false);
