var sjcl_ss = cordova.require('cordova-plugin-secure-storage.sjcl_ss');
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
    setTimeout(success, 0);
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
        var payload = localStorage.getItem('_SS_' + key);
        if (!payload) {
            error('Key "' + key + '"not found.');
            return;
        }
        try {
            payload = JSON.parse(payload);
            var AESKey = payload.key;
            cordova.exec(
                function (AESKey) {
                    try {
                        AESKey = sjcl_ss.codec.base64.toBits(AESKey);
                        var value = sjcl_ss.decrypt(AESKey, payload.value);
                        success(value);
                    } catch (e) {
                        error(e);
                    }
                },
                error, "SecureStorage", "decrypt", [AESKey]);
        } catch (e) {
            error(e);
        }

    },

    set: function (success, error, key, value) {
        if (!_checkCallbacks(success, error))
            return;

        var AESKey = sjcl_ss.random.randomWords(8);
        _AES_PARAM.adata = this.service;
        value = sjcl_ss.encrypt(AESKey, value, _AES_PARAM);

        // Ecrypt the AES key
        cordova.exec(
            function (encKey) {
                localStorage.setItem('_SS_' + key, JSON.stringify({key: encKey, value: value}));
                success(key);
            },
            function (err) {
                error(err);
            },
            "SecureStorage", "encrypt", [sjcl_ss.codec.base64.fromBits(AESKey)]);
    },

    remove: function(success, error, key) {
        localStorage.removeItem('_SS_' + key);
        success(key);
    }
};


var SecureStorageBrowser = function (success, error, service) {
    this.service = service;
    setTimeout(success, 0);
    return this;
};

SecureStorageBrowser.prototype = {

    get: function (success, error, key) {
        if (!_checkCallbacks(success, error))
            return;
        var value = localStorage.getItem('_SS_' + key);
        if (!value) {
            error('Key "' + key + '"not found.');
        } else {
            success(value);
        }
    },

    set: function (success, error, key, value) {
        if (!_checkCallbacks(success, error))
            return;

        localStorage.setItem('_SS_' + key, value);
        success(key);
    },

    remove: function(success, error, key) {
        localStorage.removeItem('_SS_' + key);
        success(key);
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

    case 'browser':
        SecureStorage = SecureStorageBrowser;
        break;

    default:
        SecureStorage = null;
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
