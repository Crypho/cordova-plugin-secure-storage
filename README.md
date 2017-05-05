
# SecureStorage plugin for Apache Cordova

[![NPM](https://nodei.co/npm/cordova-plugin-secure-storage.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/cordova-plugin-secure-storage/)

## Introduction

This plugin is for use with [Apache Cordova](http://cordova.apache.org/) and allows your application to securely store secrets
such as usernames, passwords, tokens, certificates or other sensitive information (strings) on iOS & Android phones and Windows devices.

### Supported platforms

  * Android
  * iOS
  * Windows (Windows 8.x/Store, Windows 10/UWP and Windows Phone 8.1+)

### Contents

- [Installation](#installation)
- [Plugin API](#plugin-api)
- [LICENSE](#license)

## <a name="installation"></a>Installation

Below are the methods for installing this plugin automatically using command line tools. For additional info, take a look at the [Plugman Documentation](https://cordova.apache.org/docs/en/latest/plugin_ref/plugman.html), [`cordova plugin` command](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/index.html#cordova-plugin-command) and [Cordova Plugin Specification](https://cordova.apache.org/docs/en/latest/plugin_ref/spec.html).

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

## <a name="plugin_api"></a> Plugin API

#### Create a namespaced storage.

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

#### Get all keys from the storage.

```js
ss.keys(
    function (keys) { console.log('Got keys ' + keys.join(', ')); },
    function (error) { console.log('Error, ' + error); });
```

#### Clear all keys from the storage.

```js
ss.clear(
    function () { console.log('Cleared'); },
    function (error) { console.log('Error, ' + error); });
```

## Platform details

#### iOS
On iOS secrets are stored directly in the KeyChain through the [SAMKeychain](https://github.com/soffes/samkeychain) library.

##### Configuration
On iOS it is possible to configure the accessibility of the keychain by setting the `KeychainAccessibility` preference in the `config.xml` to one of the following strings:
 * AfterFirstUnlock
 * AfterFirstUnlockThisDeviceOnly
 * WhenUnlocked (default)
 * WhenUnlockedThisDeviceOnly
 * WhenPasscodeSetThisDeviceOnly (this option is available only on iOS8 and later)

For reference what these settings mean, see [Keychain Item Accessibility Constants](https://developer.apple.com/reference/security/keychain_services/keychain_item_accessibility_constants).

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

* A random 256-bit AES key is generated.
* The AES key encrypts the value.
* The AES key is encrypted with a device-generated RSA (RSA/ECB/PKCS1Padding) from the Android KeyStore.
* The combination of the encrypted AES key and value are stored in ``SharedPreferences``.

The inverse process is followed on ``get``.

Native AES is used when available, otherwise encryption is provided by the [sjcl](https://github.com/bitwiseshiftleft/sjcl) library. API level 19 (Android 4.4 KitKat) is required on Android.

##### Users must have a secure screen-lock set.

The plugin will only work correctly if the user has sufficiently secure settings on the lock screen. If not, the plugin will fail to initialize and the failure callback will be called on ``init()``. This is because in order to use the Android Credential Storage and create RSA keys the device needs to be somewhat secure.

In case of failure to initialize, the app developer should inform the user about the security requirements of her app and initialize again after the user has changed the screen-lock settings. To facilitate this, we provide ``secureDevice`` which will bring up the screen-lock settings and will call the success or failure callbacks depending on whether the user locked the screen appropriately.

For example, this would keep asking the user to enable screen lock forever. Obviously adapt to your needs :)

```js
var ss;
var _init = function () {
    ss = new cordova.plugins.SecureStorage(
        function () {
            console.log('OK');
        },
        function () {
            navigator.notification.alert(
                'Please enable the screen lock on your device. This app cannot operate securely without it.',
                function () {
                    ss.secureDevice(
                        function () {
                            _init();
                        },
                        function () {
                            _init();
                        }
                    );
                },
                'Screen lock is disabled'
            );
        },
        'my_app');
};
_init();

```

##### Android keystore deletion on security setting change

Changing the lock screen type on Android erases the keystore (issues [61989](https://code.google.com/p/android/issues/detail?id=61989) and [210402](https://code.google.com/p/android/issues/detail?id=210402)). This is also described in the [Android Security: The Forgetful Keystore](https://doridori.github.io/android-security-the-forgetful-keystore/) blog post.

This means that any values saved using the plugin could be lost if the user changes security settings. The plugin should therefore be used as a secure credential cache and not persistent storage on Android.

#### Windows
Windows implementation is based on [PasswordVault](https://msdn.microsoft.com/en-us/library/windows/apps/windows.security.credentials.passwordvault.aspx) object from the [Windows.Security.Credentials](https://msdn.microsoft.com/en-us/library/windows/apps/windows.security.credentials.aspx) namespace.
The contents of the locker are specific to the app so different apps and services don't have access to credentials associated with other apps or services.

**Limitations:** you can only store up to ten credentials per app. If you try to store more than ten credentials, you will
encounter an error. Read [documentation](https://msdn.microsoft.com/en-us/library/windows/apps/hh701231.aspx) for more details.

#### Browser
The browser platform is supported as a mock only. Key/values are stored unencrypted in localStorage.

## FAQ

* I get the error ``cordova.plugins.SecureStorage is not a function``, what gives?

    You can instantiate the plugin only after the ``deviceready`` event is fired. The plugin is not available before that. Also make sure you use the plugin after its success callback has fired.

* Do my users really need to set a PIN code on their android devices to use the plugin?

    Yes, sorry. Android will not allow the creation of cryptographic keys unless the user has enabled at least PIN locking on the device.

## Testing

### Setup

1. Create a cordova app.
2. Change the start page in config.xml with ``<content src="cdvtests/index.html" />``
3. Add your platforms.
4. Add the ``cordova-plugin-test-framework`` plugin:

```
cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-test-framework.git
```

5. Finally add the secure storage plugin as well as the tests from its location

```
cordova plugin add PATH_TO_SECURE_STORAGE_PLUGIN
cordova plugin add PATH_TO_SECURE_STORAGE_PLUGIN/tests
```

### Running the tests

Just run the app for all platforms. Remember, if you have changes to test you will need to remove the secure storage plugin and add it again for the changes to be seen by the app.


## <a name="license"></a> LICENSE

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