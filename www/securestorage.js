var _checkCallbacks = function (success, error) {

    if (typeof success != "function")  {
        console.log("SecureStorage failure: success callback parameter must be a function");
        return false;
    }

    if (typeof error != "function") {
        console.log("SecureStorage failure: error callback parameter must be a function");
        return;
    }

};

var SecureStorage = {

    get: function (success, error, key) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "remove", [key]);
    },

    set: function (success, error, key, value) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "remove", [key, value]);
    },

    remove: function(success, error, key) {
        if (_checkCallbacks(success, error))
            cordova.exec(success, error, "SecureStorage", "remove", [key]);
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