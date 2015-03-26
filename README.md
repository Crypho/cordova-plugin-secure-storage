# SecureStorage plugin for iOS & Android

## Introduction

This plugin is for use with [Cordova](http://incubator.apache.org/cordova/) and allows your application to securely store secrets on iOS & Android phones.

On iOS secrets are stored directly in the KeyChain.

### Contents

- [Installation](#installation)
- [Plugin API](#plugin-api)
- [LICENSE](#license)

##<a name="installation"></a>Installation

Below are the methods for installing this plugin automatically using command line tools. For additional info, take a look at the [Plugman Documentation](https://github.com/apache/cordova-plugman/blob/master/README.md) and [Cordova Plugin Specification](https://github.com/alunny/cordova-plugin-spec).

### Cordova

The plugin can be installed via the Cordova command line interface:

* Navigate to the root folder for your phonegap project.
* Run the command:

```sh
cordova plugin add com.crypho.plugins.securestorage
```

or if you want to be running the development version,

```sh
cordova plugin add https://github.com/Crypho/com.crypho.plugins.securestorage.git
```

##<a name="plugin_api"></a> Plugin API

####Create a namespaced storage.

```js

var ss = new cordova.plugins.SecureStorage('my_app');

```
#### Set a key/value in the storage.

```js
ss.set(
    function (key) { console.log('Set ' + key); },
    function (error) { console.log('Error ' + error); },
    'mykey', 'myvalue');
```

where ``key`` and ``value`` are both strings.

#### Get a key's value from the storage.

```js
ss.get(
    function (value) { console.log('Success, got ' + value); },
    function (error) { console.log('Error ' + error); },
    'mykey');
```

#### Remove a key from the storage.

```js
ss.remove(
    function (key) { console.log('Removed ' + key); },
    function (error) { console.log('Error, ' + error); },
    'mykey');
```

##<a name="license"></a> LICENSE

    The MIT License

    Copyright (c) 2015 Crypho AS.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

    libscrypt is Copyright (c) 2013, Joshua Small under the BSD license. See src/libscrypt/LICENSE
