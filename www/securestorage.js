var SecureStorage;

var SUPPORTED_PLATFORMS = ['android', 'ios', 'windows'];

var _checkCallbacks = function (success, error) {
    if (typeof success != 'function') {
        throw new Error('SecureStorage failure: success callback parameter must be a function');
    }
    if (typeof error != 'function') {
        throw new Error('SecureStorage failure: error callback parameter must be a function');
    }
};

//Taken from undescore.js
var _isString = function isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
};

var _merge_options = function (defaults, options){	
    var res = {};	
    var attrname;	
     for (attrname in defaults) {	
        res[attrname] = defaults[attrname];	
    }	
    for (attrname in options) {	
        if (res.hasOwnProperty(attrname)) {	
            res[attrname] = options[attrname];	
        } else {	
            throw new Error('SecureStorage failure: invalid option ' + attrname);	
        }	
    }	
     return res;	
};

/**
 * Helper method to execute Cordova native method
 *
 * @param   {String}    nativeMethodName Method to execute.
 * @param   {Array}     args             Execution arguments.
 * @param   {Function}  success          Called when returning successful result from an action.
 * @param   {Function}  error            Called when returning error result from an action.
 *
 */
var _executeNativeMethod = function (success, error, nativeMethodName, args) {
    var fail;
    // args checking
    _checkCallbacks(success, error);

    // By convention a failure callback should always receive an instance
    // of a JavaScript Error object.
    fail = function(err) {
        // provide default message if no details passed to callback
        if (typeof err === 'undefined') {
            error(new Error('Error occured while executing native method.'));
        } else {
            // wrap string to Error instance if necessary
            error(_isString(err) ? new Error(err) : err);
        }
    };

    cordova.exec(success, fail, 'SecureStorage', nativeMethodName, args);
};

SecureStorage = function (success, error, service, options) {
    var platformId = cordova.platformId;
    if (this.options[platformId] && options && options[platformId]) {
        this.options[platformId] = _merge_options(this.options[platformId], options[platformId]);
    }

    this.service = service;

    try {
        _executeNativeMethod(success, error, 'init', [this.service, this.options[platformId]]);
    } catch (e) {
        error(e);
    }
    return this;
};

SecureStorage.prototype = {
    options: {
        android: {
            packageName: null
        }
    },

    get: function (success, error, key) {
        try {
            if (!_isString(key)) {
                throw new Error('Key must be a string');
            }
            _executeNativeMethod(success, error, 'get', [this.service, key]);
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            if (!_isString(value)) {
                throw new Error('Value must be a string');
            }
            _executeNativeMethod(success, error, 'set', [this.service, key, value]);
        } catch (e) {
            error(e);
        }
    },

    remove: function (success, error, key) {
        try {
            if (!_isString(key)) {
                throw new Error('Key must be a string');
            }
            _executeNativeMethod(success, error, 'remove', [this.service, key]);
        } catch (e) {
            error(e);
        }
    },

    keys: function (success, error) {
        try {
            _executeNativeMethod(success, error, 'keys', [this.service]);
        } catch (e) {
            error(e);
        }
    },

    clear: function (success, error) {
        try {
            _executeNativeMethod(success, error, 'clear', [this.service]);
        } catch (e) {
            error(e);
        }
    }
};

if (cordova.platformId === 'android') {
    SecureStorage.prototype.secureDevice = function (success, error) {
        try {
            _executeNativeMethod(success, error, 'secureDevice', []);
        } catch (e) {
            error(e);
        }
    }
}

if (!cordova.plugins) {
    cordova.plugins = {};
}

if (!cordova.plugins.SecureStorage) {
    cordova.plugins.SecureStorage = SecureStorage;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureStorage;
}
