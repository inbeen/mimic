# AJAX

> Asynchronous JavaScript and XML（异步的 JavaScript 和 XML）



## Step 1

先实现最基本的 ajax

```javascript
(function(global) {
    function ajax(options) {
        options = options || {};
        var xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.dir(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(options.data);
    }
    global.ajax = ajax;
})(window)
```



## Step 2

对其进行封装，拼接 GET 请求 url、设置请求头

```javascript
(function(global) {
    function ajax(options) {
        options = options || {};
        createXHR(options.type, options.url, options.data, options.headers);
    }
    // 创建 XmlHttpRequest 请求
    function createXHR(type, url, data, headers) {
        var xhr = new XMLHttpRequest();
        xhr.open(type, getUrlWithData(url, data, type), true);
        setHeaders(xhr, headers);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                console.dir(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(data);
    }
    // 拼接 url
    function getUrlWithData(url, data, type) {
        if (type.toLowerCase() !== 'get' || !data) {
            return url;
        }
        return url + (url.indexOf('?') > -1 ? '&' : '?') + objectToQueryString(data);
    }
    function objectToQueryString(data) {
        var dataAsQueryString = '';
        // data 为对象时
        Object.prototype.toString.call(data) === '[object Object]' ? (
            dataAsQueryString = Object.keys(data).reduce(function(str, item) {
                return (!str ? '' : '&') + item + data[item];
            }, '')
        ) : ( dataAsQueryString = data )
        return dataAsQueryString;
    }
    // 设置请求头(content-type)
    function setHeaders(xhr, headers) {
        headers = headers || {}
        if (!Object.keys(headers).some(function(key) {
            return key.toLocaleLowerCase() === 'content-type';
        })) {
            headers['content-type'] = 'application/x-www-form-urlencoded';
        }
        Object.keys(headers).forEach(function(key) {
            headers[key] && xhr.setRequestHeader(key, headers[key]);
        });
    }
    global.ajax = ajax;
})(window)
```



## Step 3

添加 Promise API

```javascript
(function(global) {
    function ajax(options) {
        options = options || {};
        return createXHR(options.type, options.url, options.data, options.headers);
    }
    function createXHR(type, url, data, headers) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(type, getUrlWithData(url, data, type), true);
            setHeaders(xhr, headers);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(data);
        });
    }
    function getUrlWithData(url, data, type) {
        if (type.toLowerCase() !== 'get' || !data) {
            return url;
        }
        return url + (url.indexOf('?') > -1 ? '&' : '?') + objectToQueryString(data);
    }
    function objectToQueryString(data) {
        var dataAsQueryString = '';
        Object.prototype.toString.call(data) === '[object Object]' ? (
            dataAsQueryString = Object.keys(data).reduce(function(str, item) {
                return (!str ? '' : '&') + item + data[item];
            }, '')
        ) : ( dataAsQueryString = data )
        return dataAsQueryString;
    }
    function setHeaders(xhr, headers) {
        headers = headers || {}
        if (!Object.keys(headers).some(function(key) {
            return key.toLocaleLowerCase() === 'content-type';
        })) {
            headers['content-type'] = 'application/x-www-form-urlencoded';
        }
        Object.keys(headers).forEach(function(key) {
            headers[key] && xhr.setRequestHeader(key, headers[key]);
        });
    }
    global.ajax = ajax;
})(window)
```



