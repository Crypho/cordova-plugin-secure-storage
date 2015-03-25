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

var SecureStorage = function (service) {
    this.service = service;
    return this;
};

SecureStorage.prototype = {

    get: function (success, error, key) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "get", [key, this.service]);
    },

    set: function (success, error, key, value) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "set", [key, value, this.service]);
    },

    remove: function(success, error, key) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "remove", [key, this.service]);
    }
};

if (!cordova.plugins) {
    cordova.plugins = {};
}

if (!cordova.plugins.SecureStorage) {
    cordova.plugins.SecureStorage = SecureStorage;
}

if (typeof module != 'undefined' && module.exports) {
  module.exports = SecureStorage;
}