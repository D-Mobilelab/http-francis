# http-francis

## [!!!] This repository has been deprecated, we suggest to use [https://github.com/docomodigital/js-fetcher](https://github.com/docomodigital/js-fetcher) instead

[![Build Status](https://travis-ci.org/D-Mobilelab/http-francis.svg?branch=master)](https://travis-ci.org/D-Mobilelab/http-francis)
[![Coverage Status](https://coveralls.io/repos/github/D-Mobilelab/http-francis/badge.svg?branch=master)](https://coveralls.io/github/D-Mobilelab/http-francis?branch=master)
[![npm version](https://badge.fury.io/js/http-francis.svg)](https://badge.fury.io/js/http-francis)
[![Bower version](https://badge.fury.io/bo/http-francis.svg)](https://badge.fury.io/bo/http-francis)
[![GitHub version](https://badge.fury.io/gh/D-Mobilelab%http-francis.svg)](https://badge.fury.io/gh/D-Mobilelab%http-francis) [![Greenkeeper badge](https://badges.greenkeeper.io/D-Mobilelab/http-francis.svg)](https://greenkeeper.io/)

-   retry
-   attempts
-   promise based

### Commands

-   npm run build
-   npm run test
-   npm run test:watch    // run tests while typing
-   npm run documentation // generate docs folder with .html, append docs to the readme.md

### Release a new version

-   npm version patch|minor|major
    This will generate the docs/<version> and dist/

# API

## Francis#Http

## constructor

an http class to make requests over the net with retry and interval between them

**Parameters**

-   `requestParams` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** object where you can specify the options of the request
    -   `requestParams.type` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** the type of the request: possible values POST, GET, PUT, DELETE and JSONP (optional, default `GET`)
    -   `requestParams.url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the url to request for
    -   `requestParams.headers` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** the headers object (optional, default `{}`)
    -   `requestParams.timeout` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** the timeout of the request in ms (optional, default `2000`)
    -   `requestParams.attempt` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** attempts. if it fails for some reason retry (optional, default `1`)
    -   `requestParams.retryAfter` **\[[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)]** the interval between requests in ms: 500 for example (optional, default `0`)
    -   `requestParams.async` **\[[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)]** the request could be synchrounous, default async (optional, default `true`)
-   `options`  
-   `callback` **\[[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** onend callback (optional, default `function(){}`)

**Examples**

```javascript
<pre>
npm install --save http-francis

import { Http, getImageRaw, JSONPRequest } from 'http-francis';
OR
var Http = require("http-francis").Http;
OR
<script src='http-francis.js'></script> 
// in global case window['http-francis'].Http
 var getTask = new Http({
      method: "GET",
      url: "https://someimageurl/image.png",
      responseType: "blob",
      mimeType: "image/png",
      onProgress:(percentage)=>{ 
          // there must be Content-Length header in the response to get the right percentage
          // otherwise percentage is a NaN
      }
  });

  getTask.promise.then((response) => { 
      var imgTag = document.createElement("img");
      imgTag.src = response[0];
      document.body.appendChild(imgTag);       
  });
</pre>
```

## parseResponse

parseResponse

**Parameters**

-   `xhr` **[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)** parse

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** [responseData, statusCode, xhr]

## getImageRaw

getImageRaw from a specific url

**Parameters**

-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the options object
    -   `options.url` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** http or whatever
    -   `options.responseType` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** possible values arraybuffer|blob (optional, default `"blob"`)
    -   `options.mimeType` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** possible values "image/png"|"image/jpeg" used only if "blob" is set as responseType (optional, default `"image/jpeg"`)
-   `_onProgress` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]**  (optional, default `function(){}`)

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) \| [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) \| [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))>** 

## JSONPRequest

Make a jsonp request, remember only GET
The function create a tag script and append a callback param in querystring.
The promise will be reject after 3s if the url fail to respond

**Parameters**

-   `url` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the url with querystring but without &callback at the end or &function
-   `timeout` **\[[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)](default 3000)** ms range for the response

**Examples**

```javascript
<pre>
request = new JSONPRequest("http://www.someapi.com/asd?somequery=1");
request.then((data) => {});
</pre>
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))>** 

## getJSON

getJSON

**Parameters**

-   `url` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** for example <http://jsonplaceholder.typicode.com/comments?postId=1>

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** the string error is the statuscode

## Francis

an http module to make requests over the net with retry and interval between them
