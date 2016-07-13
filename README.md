# http-francis

[![Build Status](https://travis-ci.org/D-Mobilelab/http-francis.svg?branch=master)](https://travis-ci.org/D-Mobilelab/your_library)
[![Coverage Status](https://coveralls.io/repos/github/D-Mobilelab/http-francis/badge.svg?branch=master)](https://coveralls.io/github/D-Mobilelab/your_library?branch=master)
[![npm version](https://badge.fury.io/js/http-francis.svg)](https://badge.fury.io/js/your_library)
[![Bower version](https://badge.fury.io/bo/http-francis.svg)](https://badge.fury.io/bo/your_library)
[![GitHub version](https://badge.fury.io/gh/D-Mobilelab%http-francis.svg)](https://badge.fury.io/gh/D-Mobilelab%your_library)

http-francis description

## Usage
```
// insert here a simple example of http-francis
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

[http://d-mobilelab.github.io/http-francis/1.0.0](http://d-mobilelab.github.io/your_library/1.0.0)

Replace <i>1.0.0</i> with the version of the documentation you want to read.
