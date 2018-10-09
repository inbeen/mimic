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
