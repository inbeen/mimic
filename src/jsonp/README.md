# JSONP

> 利用 <script> 元素的这个开放策略，网页可以得到从其他来源动态产生的 JSON 资料



## 实现

```javascript
var jsonpCount = 0; // 计数
function jsonp(url, data, callback) {
    // 存储，用于回调
    window['__jsonp' + jsonpCount] = typeof callback == 'function' ? callback : function() {}
    var script = document.createElement('script'); // 创建 script
    script.src = getUrlWithData(url, data); // 获取链接
    jsonpCount ++;
    document.body.insertBefore(script, document.body.lastChild); // 发起请求
    // 请求结束，恢复原 DOM
    script.onload = function() {
        this.parentNode.removeChild(this);
    }
    // 拼接 url 和 data
    function getUrlWithData(url, data) {
        if (!data) {
            return url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=__jsonp' + jsonpCount;
        }
        url += (url.indexOf('?') > -1 ? '&' : '?') + objectToQueryString(data);
        return url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=__jsonp' + jsonpCount;
    }
    // 转化 对象 => 字符串
    function objectToQueryString(data) {
        var dataAsQueryString = '';
        Object.prototype.toString.call(data) === '[object Object]' ? (
            dataAsQueryString = Object.keys(data).reduce(function(str, item) {
                return (!str ? '' : str + '&') + item + '=' + data[item];
            }, '')
        ) : ( dataAsQueryString = data )
        return dataAsQueryString;
    }
}
```

