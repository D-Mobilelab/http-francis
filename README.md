# http-francis

[![Build Status](https://travis-ci.org/D-Mobilelab/http-francis.svg?branch=master)](https://travis-ci.org/D-Mobilelab/http-francis)
[![Coverage Status](https://coveralls.io/repos/github/D-Mobilelab/http-francis/badge.svg?branch=master)](https://coveralls.io/github/D-Mobilelab/http-francis?branch=master)
[![npm version](https://badge.fury.io/js/http-francis.svg)](https://badge.fury.io/js/http-francis)
[![Bower version](https://badge.fury.io/bo/http-francis.svg)](https://badge.fury.io/bo/http-francis)
[![GitHub version](https://badge.fury.io/gh/D-Mobilelab%http-francis.svg)](https://badge.fury.io/gh/D-Mobilelab%http-francis)

an http class to make requests over the net with retry and interval between them

## Usage
```
var Francis = require('http-francis');
var francis = new Francis.Http({
    method:"GET", // JSONP, POST, DELETE, PUT
    url:"https://httpbin.org/get"
});
```

## Installation

### NPM
```
npm install --save http-francis
```
You can found the library ready for production on <i>node_modules/http-francis/dist/dist.js</i>

### Bower
```
bower install --save http-francis
```
You can found the library ready for production on <i>bower_components/http-francis/dist/dist.js</i>

## Example
```
var Francis = require('http-francis');
var francis = new Francis.Http({
    method:"GET", // JSONP, POST, DELETE, PUT
    url:"https://httpbin.org/get"
});

francis.promise.then((response) => { 
    response // [data, xhr.status, xhr]
 })
```

## Retrieve an image as base64
```
var Francis = require('http-francis');
var francis = new Francis.Http({
    method: "GET",
    url: "https://someimageurl/image.png",
    responseType: "blob",
    mimeType: "image/png",
    onProgress:(percentage)=>{ 
        // there must be Content-Length header in the response to get the right percentage
        // otherwise percentage is a NaN
    }
});

francis.promise.then((response) => { 
    var imgTag = document.createElement("img");
    imgTag.src = response[0];
    document.body.appendChild(imgTag);
    
 })
```

## Documentation

To read documentation, go to:

[http://d-mobilelab.github.io/http-francis/0.1.2](http://d-mobilelab.github.io/http-francis/0.1.2)

Replace <i>0.1.2</i> with the version of the documentation you want to read.
