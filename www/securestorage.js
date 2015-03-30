var sjcl = cordova.require('com.crypho.plugins.securestorage.sjcl');
var _AES_PARAM = {
    ks: 256,
    ts: 128,
    mode: 'ccm',
    cipher: 'aes'
 };

var _checkCallbacks = function (success, error) {

    if (typeof success != "function")  {
        console.log("SecureStorage failure: success callback parameter must be a function");
        return false;
    }

    if (typeof error != "function") {
        console.log("SecureStorage failure: error callback parameter must be a function");
        return false;
    }

    return true;
};

var SecureStorageiOS = function (success, error, service) {
    this.service = service;
    success();
    return this;
};

SecureStorageiOS.prototype = {

    get: function (success, error, key) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "get", [this.service, key]);
    },

    set: function (success, error, key, value) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "set", [this.service, key, value]);
    },

    remove: function(success, error, key) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "remove", [this.service, key]);
    }
};

var SecureStorageAndroid = function (success, error, service) {
    this.service = service;
    cordova.exec(success, error, "SecureStorage", "init", [this.service]);
    return this;
};

SecureStorageAndroid.prototype = {
    get: function (success, error, key) {
        if (!_checkCallbacks(success, error))
            return;
            // cordova.exec(success, error, "SecureStorage", "get", [this.service, key]);
    },

    set: function (success, error, key, value) {
        if (!_checkCallbacks(success, error))
            return;

        var AESKey = sjcl.random.randomWords(8);
        _AES_PARAM.adata = this.service;
        value = sjcl.encrypt(AESKey, value, _AES_PARAM);

        // Ecrypt the AES key
        cordova.exec(
            function (encKey) {
                localStorage.setItem('_SS_' + key, JSON.stringify({key: encKey, value: value}));
                success(key);
            },
            function (err) {
                error(err);
            },
            "SecureStorage", "encrypt", [sjcl.codec.base64.fromBits(AESKey)]);
    },

    remove: function(success, error, key) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "remove", [this.service, key]);
    }
};

var SecureStorage;

switch(cordova.platformId) {

    case 'ios':
        SecureStorage = SecureStorageiOS;
        break;

    case 'android':
        SecureStorage = SecureStorageAndroid;
        break;

    default:
        throw "Unsupported platform for SecureStorage";
}

if (!cordova.plugins) {
    cordova.plugins = {};
}

if (!cordova.plugins.SecureStorage) {
    cordova.plugins.SecureStorage = SecureStorage;
}

if (typeof module != 'undefined' && module.exports) {
  module.exports = SecureStorage;
}