import {
    queryfy
} from 'docomo-utils';
var LOG = window.console;

var defaultOptions = {
    method: 'GET',
    url: '',
    attempt: 1,
    responseType: 'json', // json, document, "", text, blob, arraybuffer
    dataType: 'json', // the type of data sent(if any)
    callback: function(){},
    headers: {},
    data: null,
    withCredentials: false,
    async: true,
    mimeType: '', // image/png"|"image/jpeg|text/plain mimeType only used when responseType is blob!
    retryAfter: 0, // ms, used if attempt > 1
    onProgress: function(){}
};

/**
 * @name Francis#Http
 * @methodOf Francis
 * */
class Http {
    /**
     * @description an http class to make requests over the net with retry and interval between them
     * @param {object} requestParams - object where you can specify the options of the request
     * @param {string} [requestParams.type=GET] - the type of the request: possible values POST, GET, PUT, DELETE and JSONP
     * @param {string} requestParams.url - the url to request for
     * @param {object} [requestParams.headers={}] - the headers object
     * @param {string} [requestParams.timeout=2000] - the timeout of the request in ms
     * @param {string} [requestParams.attempt=1] - attempts. if it fails for some reason retry
     * @param {number} [requestParams.retryAfter=0] - the interval between requests in ms: 500 for example   
     * @param {boolean} [requestParams.async=true] - the request could be synchrounous, default async
     * @param {function} [callback=function(){}] - onend callback
     * @example
     * <pre>
     * npm install --save http-francis
     * 
     * import { Http, getImageRaw, JSONPRequest } from 'http-francis';
     * OR
     * var Http = require("http-francis").Http;
     * OR
     * <script src='http-francis.js'></script> 
     * // in global case window['http-francis'].Http
     *  var getTask = new Http({
     *       method: "GET",
     *       url: "https://someimageurl/image.png",
     *       responseType: "blob",
     *       mimeType: "image/png",
     *       onProgress:(percentage)=>{ 
     *           // there must be Content-Length header in the response to get the right percentage
     *           // otherwise percentage is a NaN
     *       }
     *   });
     *
     *   getTask.promise.then((response) => { 
     *       var imgTag = document.createElement("img");
     *       imgTag.src = response[0];
     *       document.body.appendChild(imgTag);       
     *   });
     * </pre> 
     */
    constructor(options, callback = () => {}){  
        var self = this;
        this.options = {...defaultOptions, ...options}
        this.calls = [];
        this.callback = callback;
        this.promise = new Promise((resolve, reject) => {
            self.do(resolve, reject);
        });
    }

    do(resolve, reject){
        var self = this;
        if (this.options.attempt === 0){      
            var lastCall = this.calls[this.calls.length - 1];
            reject({ status: lastCall.status, statusText: lastCall.statusText });
            self.callback(lastCall.status);
            clearTimeout(self.timeoutID);
            self.timeoutID = null;
            return;
        }

        if (this.options.method.toUpperCase() === 'JSONP'){
            var call = new JSONPRequest(this.options.url, this.options.timeout || 3000)
                            .prom.then((response) => {
                                resolve(response);
                                self.callback(response);
                            }).catch((reason) => {                                
                                reject(reason);
                                self.callback(reason);
                            });
            this.calls.push(call);
            return;
        }

        var xhr;
        if (Http.isXMLHttpRequestSupported()) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xhr = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        // store this request in the calls object
        this.calls.push(xhr);

        // OPEN
        xhr.open(this.options.method.toUpperCase(), this.options.url, this.options.async);

        // SENDING JSON?
        if (self.options.dataType === 'json'){
            self.options.data = JSON.stringify(self.options.data);
            xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
        }  

        // CUSTOM HEADERS
        if (this.options.headers){
            addCustomHeaders(this.options.headers, xhr);    
        }
        
        if (this.options.withCredentials && Http.isCORSSupported()){
            xhr.withCredentials = true;    
        }  

        // check responseType support
        var responseTypeAware = 'responseType' in xhr;

        if (responseTypeAware){    
            xhr.responseType = this.options.responseType;    
        }

        LOG.log('responseType setted to ', xhr.responseType);

        xhr.onreadystatechange = function(event){
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status >= 200 && xhr.status < 400) {                    
                    if (xhr.responseType === 'blob'){
                        LOG.log('BLOB CASE!');
                        
                        // try to infer mimetype from extension?
                        var blob = new Blob([xhr.response], { type: self.options.mimeType });
                        var fileReader = new FileReader();
                        
                        fileReader.onload = function(e){ 
                            var raw = e.target.result;    
                            resolve([raw, xhr.status, xhr]);
                        };
                        
                        fileReader.readAsDataURL(blob);
                        
                    } else {
                        var result = parseResponse.bind(self)(xhr);   
                        resolve(result);
                        self.callback(result);    
                    }               
                            
                    self.options.attempt = 0;
                } else {
                    // statusCode >= 400 retry                
                    self.timeoutID = setTimeout(function(){
                        self.options.attempt -= 1;
                        LOG.log('FAIL. ' + xhr.status + ' still more ', self.options.attempt, ' attempts');                        
                        self.do(resolve, reject);
                    }, self.options.retryAfter);                
                }
            }
        };

        xhr.onprogress = wrapProgress(self.options.onProgress);
        xhr.send(self.options.data);  
    }


    // Static Methods
    static isXMLHttpRequestSupported(){
        return !!window.XMLHttpRequest;
    }

    static isCORSSupported() {
        return 'withCredentials' in new XMLHttpRequest;
    }

    static isXDomainSupported() {
        return !!window.XDomainRequest;
    }
}

/**
 * parseResponse
 * @param {XMLHttpRequest} xhr - parse 
 * @returns {array} - [responseData, statusCode, xhr]
 */
function parseResponse(xhr){
    var parsed;
    var self = this;
    if (window.karma || window.parent.karma){
        // #]*§ WTF!!
        LOG.info('TESTING MODE');
        xhr.responseType = self.options.responseType;
    }                        
    LOG.log('responseType in readyState ', xhr.responseType);                                                                                
    if (xhr.responseType === 'json' || xhr.responseType === 'arraybuffer'){
        LOG.log('JSON CASE!', xhr.response);                        
        parsed = xhr.response;
    } else if (xhr.responseType === 'document'){
        LOG.log('DOCUMENT CASE!', xhr.responseXML);
        parsed = xhr.responseXML;
    } else if (xhr.responseType === 'text' || xhr.responseType === ''){
        LOG.log('TEXT CASE!');                
        parsed = xhr.responseText;
    } else {
        LOG.log('DEFAULT CASE!', xhr.responseText);
        parsed = xhr.responseText;
    }
    
    return [parsed, xhr.status, xhr];
}

function wrapProgress(fn){
    return function(progressEvent){
        if (progressEvent.lengthComputable) {
            var percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            return fn(percentComplete);            
        } else {
            return fn(NaN);
        }
    };
}

function addCustomHeaders(headersObj, xhr){
    for (var k in headersObj){
        if (headersObj.hasOwnProperty(k)){
            xhr.setRequestHeader(k, headersObj[k]);           
        }
    }
}

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

        var transferCanceled = reject;
        var transferFailed = reject;

        request.addEventListener('progress', _onProgress, false);
        request.addEventListener('load', transferComplete, false);
        request.addEventListener('error', transferFailed, false);
        request.addEventListener('abort', transferCanceled, false);

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
}
