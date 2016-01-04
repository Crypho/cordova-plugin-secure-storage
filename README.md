# SecureStorage plugin for iOS & Android

## Introduction

This plugin is for use with [Cordova](http://incubator.apache.org/cordova/) and allows your application to securely store secrets on iOS & Android phones.

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
cordova plugin add cordova-plugin-secure-storage
```

or if you want to be running the development version,

```sh
cordova plugin add https://github.com/crypho/cordova-plugin-secure-storage.git
```

##<a name="plugin_api"></a> Plugin API

####Create a namespaced storage.

```js
var ss = new cordova.plugins.SecureStorage(
    function () { console.log('Success')},
    function (error) { console.log('Error ' + error); },
    'my_app');

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

##Platform details

#### iOS
On iOS secrets are stored directly in the KeyChain through the [SSKeychain](https://github.com/soffes/sskeychain) library.

##### Configuration
It it possible to configure the accessibility of the keychain by setting the `KeychainAccessibility` preference in the `config.xml` to one of the following strings:
 * AfterFirstUnlock
 * AfterFirstUnlockThisDeviceOnly
 * WhenUnlocked
 * WhenUnlockedThisDeviceOnly
 * Always
 * AlwaysThisDeviceOnly
 * WhenPasscodeSetThisDeviceOnly (this option is available only on iOS8 and later)

For reference what these settings mean, see [Keychain Item Accessibility Constants](https://developer.apple.com/library/ios/documentation/Security/Reference/keychainservices/#//apple_ref/doc/constant_group/Keychain_Item_Accessibility_Constants).

For example, include in your ``config.xml`` the following:

```xml
    <platform name="ios">
        <preference name="KeychainAccessibility" value="WhenUnlocked"/>
    </platform>
```

#### iOS 7 Support

iOS 7 is supported without ``WhenPasscodeSetThisDeviceOnly`` option. 

How to test the plugin using iOS 7 simulator:
 * Download and install Xcode 6 into a separate folder, e.g. /Application/Xcode 6/
 * Run ``$ xcode-select --switch  <path to Xcode6>/Contents/Developer``
 * Build Cordova app with the plugin and run it in iOS 7 simulator



#### Android
On Android there does not exist an equivalent of the iOS KeyChain. The ``SecureStorage`` API is implemented as follows:

* A random 256-bit AES key is generated in the browser.
* The AES key encrypts the value.
* The AES key is encrypted with a device-generated RSA (RSA/ECB/PKCS1Padding) from the Android KeyStore.
* The combination of the encrypted AES key and value are stored in ``localStorage``.

The inverse process is followed on ``get``. AES is provided by the [sjcl](https://github.com/bitwiseshiftleft/sjcl) library.

#### Browser
The browser platform is supported as a mock only. Key/values are stored unencrypted in localStorage.

## FAQ

* I get the error ``cordova.plugins.SecureStorage is not a function``, what gives?

    You can instantiate the plugin only after the ``deviceready`` event is fired. The plugin is not available before that. Also make sure you use the plugin after its success callback has fired.

* Do my users really need to set a PIN code on their android devices to use the plugin?

    Yes, sorry. Android will not allow the creation of cryptographic keys unless the user has enabled at least PIN locking on the device.

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
