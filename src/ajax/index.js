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
                return (!str ? '' : str + '&') + item + '=' + data[item];
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

// test
document.getElementById('app').innerHTML = `<h1>Please press F12 to open console.</h1>`;

ajax({
    type: 'GET',
    url: 'https://cnodejs.org/api/v1/topic/5433d5e4e737cbe96dcef312',
}).then(res => {
    console.dir(res);
});
