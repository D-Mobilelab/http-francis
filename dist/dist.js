(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Francis = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Logger = new function () {

    var _Logger = this;

    var levels = ['log', 'table', 'info', 'warn', 'error'];

    var config = {};

    this.getConfig = function getConfig() {
        return JSON.parse(JSON.stringify(config));
    };

    var emit = function emit(level, args) {
        console[level](args);
    };

    this.init = function init(options) {
        var typeOfenabled = _typeof(options.enabled);
        var typeOfLevel = _typeof(options.level);
        var typeOfLevels = _typeof(options.levels);
        var typeOfEmit = _typeof(options.emit);

        if (typeOfenabled === 'boolean') {
            config.enabled = options.enabled;
        } else if (typeOfenabled !== 'undefined') {
            throw new Error('Logger :: illegal type for enabled - expected boolean, got ' + typeOfenabled);
        }

        if (typeOfLevel === 'string') {
            if (levels.indexOf(options.level) === -1) {
                throw new Error('Logger :: unknown level ' + options.level);
            } else {
                for (var i = 0; i < levels.length; i++) {
                    config[levels[i]] = levels.indexOf(options.level) <= i;
                }
            }
        } else if (typeOfLevel !== 'undefined') {
            throw new Error('Logger :: illegal type for level - expected string, got ' + typeOfLevel);
        }

        if (typeOfLevels === 'object') {
            var level;

            for (level in options.levels) {
                typeOfLevel = _typeof(options.levels[level]);
                if (typeOfLevel !== 'boolean') {
                    throw new Error('Logger :: illegal value type for level "' + level + '"' + ' - expected boolean, got "' + typeOfLevel + '"');
                }

                if (levels.indexOf(level) === -1) {
                    throw new Error('Logger :: unknown log level "' + level + '"');
                }
            }

            for (level in options.levels) {
                config[level] = !!options.levels[level];
            }
        } else if (typeOfLevels !== 'undefined') {
            throw new Error('Logger :: illegal type for levels - expected object, got ' + typeOfLevels);
        }

        if (typeOfEmit === 'function') {
            emit = options.emit;
        } else if (typeOfEmit !== 'undefined') {
            throw new Error('Logger :: illegal type for emit - expected function, got ' + typeOfEmit);
        }
    };

    this.log = function log() {
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.log) {
            emit('log', args);
        }
    };

    this.table = function table() {
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.table) {
            emit('table', args);
        }
    };

    this.info = function info() {
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.info) {
            emit('info', args);
        }
    };

    this.warn = function warn() {
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.warn) {
            emit('warn', args);
        }
    };

    this.error = function error() {
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.error) {
            emit('error', args);
        }
    };

    this.isEnabled = function () {
        return !!config.enabled;
    };

    _Logger.init({
        level: 'log',
        enabled: true
    });
}();

module.exports = Logger;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JSONPRequest = exports.getJSON = exports.getImageRaw = exports.Http = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _baseLogger = require('../node_modules/logger-pro/src/base-logger.js');

var _baseLogger2 = _interopRequireDefault(_baseLogger);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_baseLogger2.default.init({ enabled: true, level: 'log' });
var LOG = _baseLogger2.default;

var defaultOptions = {
    method: 'GET',
    url: '',
    attempt: 1,
    responseType: 'json',
    dataType: 'json',
    callback: function callback() {},
    headers: {},
    data: null,
    withCredentials: false,
    async: true,
    mimeType: '',
    retryAfter: 0,
    onProgress: function onProgress() {}
};

var Http = function () {
    function Http(options) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

        _classCallCheck(this, Http);

        var self = this;
        this.options = (0, _utils.extend)(defaultOptions, options);
        this.calls = [];
        this.callback = callback;
        this.promise = new Promise(function (resolve, reject) {
            self.do(resolve, reject);
        });
    }

    _createClass(Http, [{
        key: 'do',
        value: function _do(resolve, reject) {
            var self = this;
            if (this.options.attempt === 0) {
                var lastCall = this.calls[this.calls.length - 1];
                reject({ status: lastCall.status, statusText: lastCall.statusText });
                self.callback(lastCall.status);
                clearTimeout(self.timeoutID);
                self.timeoutID = null;
                return;
            }

            if (this.options.method.toUpperCase() === 'JSONP') {
                var call = new JSONPRequest(this.options.url).prom.then(function (response) {
                    resolve(response);
                    self.callback(response);
                }).catch(function (reason) {
                    reject(reason);
                    self.callback(reason);
                });
                this.calls.push(call);
                return;
            }

            var xhr;
            if (Http.isXMLHttpRequestSupported()) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }

            this.calls.push(xhr);

            xhr.open(this.options.method.toUpperCase(), this.options.url, this.options.async);

            if (self.options.dataType === 'json') {
                self.options.data = JSON.stringify(self.options.data);
                xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
            }

            if (this.options.headers) {
                addCustomHeaders(this.options.headers, xhr);
            }

            if (this.options.withCredentials && Http.isCORSSupported()) {
                xhr.withCredentials = true;
            }

            var responseTypeAware = 'responseType' in xhr;

            if (responseTypeAware) {
                xhr.responseType = this.options.responseType;
            }

            LOG.log('responseType setted to ', xhr.responseType);

            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        if (xhr.responseType === 'blob') {
                            LOG.log('BLOB CASE!');

                            var blob = new Blob([xhr.response], { type: self.options.mimeType });
                            var fileReader = new FileReader();

                            fileReader.onload = function (event) {
                                var raw = event.target.result;
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
                        self.timeoutID = setTimeout(function () {
                            self.options.attempt -= 1;
                            console.log('FAIL. ' + xhr.status + ' still more ', self.options.attempt, ' attempts');
                            self.do(resolve, reject);
                        }, self.options.retryAfter);
                    }
                }
            };

            xhr.onprogress = wrapProgress(self.options.onProgress);
            xhr.send(self.options.data);
        }
    }], [{
        key: 'isXMLHttpRequestSupported',
        value: function isXMLHttpRequestSupported() {
            return !!window.XMLHttpRequest;
        }
    }, {
        key: 'isCORSSupported',
        value: function isCORSSupported() {
            return 'withCredentials' in new XMLHttpRequest();
        }
    }, {
        key: 'isXDomainSupported',
        value: function isXDomainSupported() {
            return !!window.XDomainRequest;
        }
    }]);

    return Http;
}();

function parseResponse(xhr) {
    var parsed;
    var self = this;
    if (window.karma || window.parent.karma) {
        LOG.info('TESTING MODE');
        xhr.responseType = self.options.responseType;
    }
    LOG.log('responseType in readyState ', xhr.responseType);
    if (xhr.responseType === 'json' || xhr.responseType === 'arraybuffer') {
        LOG.log('JSON CASE!', xhr.response);
        parsed = xhr.response;
    } else if (xhr.responseType === 'document') {
        LOG.log('DOCUMENT CASE!', xhr.responseXML);
        parsed = xhr.responseXML;
    } else if (xhr.responseType === 'text' || xhr.responseType === '') {
        LOG.log('TEXT CASE!');
        parsed = xhr.responseText;
    } else {
        LOG.log('DEFAULT CASE!', xhr.responseText);
        parsed = xhr.responseText;
    }

    return [parsed, xhr.status, xhr];
}

function wrapProgress(fn) {
    return function (progressEvent) {
        if (progressEvent.lengthComputable) {
            var percentComplete = Math.round(progressEvent.loaded / progressEvent.total * 100);
            return fn(percentComplete);
        } else {
            return fn('loading');
        }
    };
}

function addCustomHeaders(headersObj, xhr) {
    for (var k in headersObj) {
        if (headersObj.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, headersObj[k]);
        }
    }
}

function getImageRaw(options) {
    var _onProgress = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.responseType = options.responseType || 'blob';
        function transferComplete() {
            var result;
            switch (options.responseType) {
                case 'blob':
                    result = new Blob([this.response], { type: options.mimeType || 'image/jpeg' });
                    break;
                case 'arraybuffer':
                    result = this.response;
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

function JSONPRequest(url) {
    var self = this;
    self.timeout = 3000;
    self.called = false;
    if (window.document) {
        var ts = Date.now();
        self.scriptTag = window.document.createElement('script');

        var _url = '';
        if (url && url !== '') {
            _url = (0, _utils.queryfy)(url, { callback: 'window.__jsonpHandler_' + ts });
        }

        self.scriptTag.src = _url;
        self.scriptTag.type = 'text/javascript';
        self.scriptTag.async = true;

        self.prom = new Promise(function (resolve, reject) {
            var functionName = '__jsonpHandler_' + ts;
            window[functionName] = function (data) {
                self.called = true;
                resolve(data);
                self.scriptTag.parentElement.removeChild(self.scriptTag);
                delete window[functionName];
            };

            setTimeout(function () {
                if (!self.called) {
                    reject('Timeout jsonp request ' + ts);
                    self.scriptTag.parentElement.removeChild(self.scriptTag);
                    delete window[functionName];
                }
            }, self.timeout);
        });

        window.document.getElementsByTagName('head')[0].appendChild(self.scriptTag);
    }
}

function getJSON(url) {
    url = encodeURI(url);
    var xhr = typeof XMLHttpRequest !== 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    var responseTypeAware = 'responseType' in xhr;

    xhr.open('GET', url, true);
    if (responseTypeAware) {
        xhr.responseType = 'json';
    }

    var daRequest = new Promise(function (resolve, reject) {
        xhr.onreadystatechange = function () {
            var result;
            if (xhr.readyState === 4) {
                try {
                    result = responseTypeAware ? xhr.response : JSON.parse(xhr.responseText);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            }
        };
    });

    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xhr.send();
    return daRequest;
}

exports.Http = Http;
exports.getImageRaw = getImageRaw;
exports.getJSON = getJSON;
exports.JSONPRequest = JSONPRequest;

},{"../node_modules/logger-pro/src/base-logger.js":1,"./utils":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function Iterator(array) {
    var nextIndex = 0;

    return {
        next: function next(reset) {
            if (reset) {
                nextIndex = 0;
            }
            return nextIndex < array.length ? { value: array[nextIndex++], done: false } : { done: true };
        }
    };
}

function queryfy(_api, query) {
    var previousQuery = dequeryfy(_api);
    var qs = '',
        finalQuery,
        api = _api.slice(0);

    if (api.indexOf('?') > -1) {
        api = api.slice(0, api.indexOf('?'));
    }

    api += '?';
    finalQuery = extend(previousQuery, query);

    for (var key in finalQuery) {
        qs += encodeURIComponent(key);

        if (finalQuery[key]) {
            qs += '=' + encodeURIComponent(finalQuery[key]);
        }
        qs += '&';
    }

    if (qs.length > 0) {
        qs = qs.substring(0, qs.length - 1);
    }
    return [api, qs].join('');
}

function dequeryfy(_url) {
    var param = decodeURIComponent(_url.slice(0));

    var query = param.split('?')[1];
    if (!query) {
        return {};
    }

    var keyvalue = query.split('&');

    return keyvalue.reduce(function (newObj, _keyvalue) {
        var splitted = _keyvalue.split('=');
        var key = splitted[0];
        var value = splitted[1];
        newObj[key] = value;
        return newObj;
    }, {});
}

function extend(o1, o2) {

    if (getType(o1) !== 'object' || getType(o2) !== 'object') {
        throw new Error('Cannot merge different type');
    }
    var newObject = {};
    for (var k in o1) {
        if (o1.hasOwnProperty(k)) {
            newObject[k] = o1[k];
        }
    }

    for (var j in o2) {
        if (o2.hasOwnProperty(j)) {
            newObject[j] = o2[j];
        }
    }
    return newObject;
}

function getType(obj) {
    return {}.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}

exports.Iterator = Iterator;
exports.extend = extend;
exports.queryfy = queryfy;
exports.dequeryfy = dequeryfy;
exports.getType = getType;

},{}]},{},[2])(2)
});