var jsonpCount = 0;
function jsonp(url, data, callback) {
    window['__jsonp' + jsonpCount] = typeof callback == 'function' ? callback : function() {}
    var script = document.createElement('script');
    script.src = getUrlWithData(url, data);
    jsonpCount ++;
    document.body.insertBefore(script, document.body.lastChild);
    script.onload = function() {
        this.parentNode.removeChild(this);
    }
    function getUrlWithData(url, data) {
        if (!data) {
            return url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=__jsonp' + jsonpCount;
        }
        url += (url.indexOf('?') > -1 ? '&' : '?') + objectToQueryString(data);
        return url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=__jsonp' + jsonpCount;
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
}

// test
jsonp('http://api.douban.com/v2/movie/top250', {
    start: 1,
    count: 5
}, function(res) {
    console.dir(res);
});
jsonp('http://api.douban.com/v2/movie/top250?start=1&count=1');
