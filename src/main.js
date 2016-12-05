import 'babel-polyfill';
import Http from './http';

/**
 * getImageRaw from a specific url
 *
 * @param {Object} options - the options object
 * @param {String} options.url - http or whatever
 * @param {String} [options.responseType="blob"] - possible values arraybuffer|blob
 * @param {String} [options.mimeType="image/jpeg"] - possible values "image/png"|"image/jpeg" used only if "blob" is set as responseType
 * @param {Function} [_onProgress=function(){}]
 * @return {Promise<Blob|ArrayBuffer|Error>}
 */
function getImageRaw(options, _onProgress = () => {}){
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.responseType = options.responseType || 'blob';        
        function transferComplete(){
            var result;
            switch (options.responseType){
            case 'blob':
                result = new Blob([this.response], { type: options.mimeType || 'image/jpeg' });
                resolve(result);
                break;
            case 'arraybuffer':
                result = this.response;
                resolve(result);
                break;
            default:
                result = this.response;
                resolve(result);
                break;

            }
        }

        request.addEventListener('progress', _onProgress, false);
        request.addEventListener('load', transferComplete, false);
        request.addEventListener('error', reject, false);
        request.addEventListener('abort', reject, false);

        request.send(null);
    });

}

/**
 * Make a jsonp request, remember only GET
 * The function create a tag script and append a callback param in querystring.
 * The promise will be reject after 3s if the url fail to respond
 *
 * @example
 * <pre>
 * request = new JSONPRequest("http://www.someapi.com/asd?somequery=1");
 * request.then((data) => {});
 * </pre> 
 * @param {String} url - the url with querystring but without &callback at the end or &function
 * @param {Number} timeout - ms range for the response
 * @return {Promise<Object|String>}
 * */
function JSONPRequest(url, timeout = 3000){
    var self = this;
    self.timeout = timeout;
    self.called = false;
    if (window.document) {
        var ts = Date.now();
        self.scriptTag = window.document.createElement('script');
        // url += '&callback=window.__jsonpHandler_' + ts;
        var _url = '';
        if (url && url !== '') {
            _url = queryfy(url, { callback: `window.__jsonpHandler_${ts}` });
        }

        self.scriptTag.src = _url;
        self.scriptTag.type = 'text/javascript';
        self.scriptTag.async = true;

        self.prom = new Promise((resolve, reject) => {
            var functionName = `__jsonpHandler_${ts}`;
            window[functionName] = function(data){
                self.called = true;
                resolve(data);
                self.scriptTag.parentElement.removeChild(self.scriptTag);
                delete window[functionName];
            };
            // reject after a timeout
            setTimeout(() => {
                if (!self.called){
                    reject('Timeout jsonp request ' + ts);
                    self.scriptTag.parentElement.removeChild(self.scriptTag);
                    delete window[functionName];
                }
            }, self.timeout);
        });
        // the append start the call
        window.document.getElementsByTagName('head')[0].appendChild(self.scriptTag);        
    }
}

/**
 * getJSON
 *
 * @param {String} url - for example http://jsonplaceholder.typicode.com/comments?postId=1
 * @return {Promise} the string error is the statuscode
 * */
function getJSON(url){
    url = encodeURI(url);
    var xhr = typeof XMLHttpRequest !== 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    var responseTypeAware = 'responseType' in xhr;

    xhr.open('GET', url, true);
    if (responseTypeAware) {
        xhr.responseType = 'json';
    }

    var daRequest = new Promise(function(resolve, reject){
        xhr.onreadystatechange = function(){
            var result;
            if (xhr.readyState === 4) {
                try {
                    result = responseTypeAware ? xhr.response : JSON.parse(xhr.responseText);
                    resolve(result);
                } catch (e){
                    reject(e);
                }
            }
        };
    });

    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xhr.send();
    return daRequest;
}

/**
 * @ngdoc object
 * @name Francis
 *
 * @description an http module to make requests over the net with retry and interval between them
 */
export {
    Http,
    getImageRaw,
    getJSON,
    JSONPRequest
};