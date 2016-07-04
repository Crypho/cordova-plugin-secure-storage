var SecureStorage, SecureStorageiOS, SecureStorageAndroid, SecureStorageWindows, SecureStorageBrowser;
var sjcl_ss = cordova.require('cordova-plugin-secure-storage.sjcl_ss');
var _AES_PARAM = {
    ks: 256,
    ts: 128,
    mode: 'ccm',
    cipher: 'aes'
};

var _checkCallbacks = function (success, error) {
    if (typeof success != 'function') {
        throw new Error('SecureStorage failure: success callback parameter must be a function');
    }
    if (typeof error != 'function') {
        throw new Error('SecureStorage failure: error callback parameter must be a function');
    }
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
    // args checking
    _checkCallbacks(success, error);

    // By convention a failure callback should always receive an instance
    // of a JavaScript Error object.
    var fail = function(err) {
        // provide default message if no details passed to callback
        if (typeof err === 'undefined') {
            err = new Error("Error occured while executing native method.");
        }
        // wrap string to Error instance if necessary
        error(typeof err === 'string' ? new Error(err) : err);
    };

    cordova.exec(success, fail, 'SecureStorage', nativeMethodName, args);
};

SecureStorageiOS = function (success, error, service) {
    this.service = service;
    setTimeout(success, 0);
    return this;
};

SecureStorageiOS.prototype = {
    get: function (success, error, key) {
        try {
            _executeNativeMethod(success, error, 'get', [this.service, key]);
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            _executeNativeMethod(success, error, 'set', [this.service, key, value]);
        } catch (e) {
            error(e);
        }
    },

    remove: function (success, error, key) {
        try {
            _executeNativeMethod(success, error, 'remove', [this.service, key]);
        } catch (e) {
            error(e);
        }
    }
};

// SecureStorage for Windows web interface and proxy parameters are the same as on iOS
// so we don't create own definition for Windows and simply re-use iOS
SecureStorageWindows = SecureStorageiOS;

SecureStorageAndroid = function (success, error, service, options) {
    var self = this;

    if (options) {
        this.options = _merge_options(this.options, options);
    }

    this.service = service;
    try {
        _executeNativeMethod(
            function (native_aes_supported) {
                self.options.native = native_aes_supported && self.options.native;
                if (!self.options.native){
                    success();
                } else {
                    if (!localStorage.getItem('_SS_MIGRATED_TO_NATIVE')) {
                        self._migrate_to_native(success);
                    } else {
                        success();
                    }
                }
            },
            error,
            'init',
            [this.service]
        );
    } catch (e) {
        error(e);
    }
    return this;
};

SecureStorageAndroid.prototype = {
    options: {
        native: true
    },

    get: function (success, error, key) {
        if (this.options.native) {
            this._native_get(success, error, key);
        } else {
            this._sjcl_get(success, error, key);
        }
    },

    set: function (success, error, key, value) {
        if (this.options.native) {
            this._native_set(success, error, key, value);
        } else {
            this._sjcl_set(success, error, key, value);
        }
    },

    remove: function (success, error, key) {
        localStorage.removeItem('_SS_' + key);
        success(key);
    },

    _sjcl_get: function (success, error, key) {
        var payload, encAESKey;

        try {
            payload = this._get_payload(key);
            encAESKey = payload.key;
            _executeNativeMethod(
                function (AESKey) {
                    var value, AESKeyBits;
                    try {
                        AESKeyBits = sjcl_ss.codec.base64.toBits(AESKey);
                        value = sjcl_ss.decrypt(AESKeyBits, payload.value);
                        success(value);
                    } catch (e) {
                        error(e);
                    }
                },
                error,
                'decrypt_rsa',
                [encAESKey]
            );
        } catch (e) {
            error(e);
        }
    },

    _sjcl_set: function (success, error, key, value) {
        var AESKey, encValue;

        try {
            AESKey = sjcl_ss.random.randomWords(8);
            _AES_PARAM.adata = this.service;
            encValue = sjcl_ss.encrypt(AESKey, value, _AES_PARAM);
            // Encrypt the AES key
            _executeNativeMethod(
                function (encKey) {
                    localStorage.setItem('_SS_' + key, JSON.stringify({key: encKey, value: encValue}));
                    success(key);
                },
                error,
                'encrypt_rsa',
                [sjcl_ss.codec.base64.fromBits(AESKey)]
            );
        } catch (e) {
            error(e);
        }
    },

    _native_get: function (success, error, key) {
        var payload, AESkey, value;

        try {
            payload = this._get_payload(key);
            AESkey = payload.key;
            value = payload.value;
            _executeNativeMethod(
                success,
                error,
                'decrypt',
                [AESkey, value.ct, value.iv, value.adata]
            );
        } catch (e) {
            error(e);
        }
    },

    _native_set: function (success, error, key, value) {
        try {
            _executeNativeMethod(
                function (result) {
                    localStorage.setItem('_SS_' + key, JSON.stringify(result));
                    success(key);
                },
                error,
                'encrypt',
                [value, this.service]
            );
        } catch (e) {
            error(e);
        }
    },

    _get_payload: function (key) {
        var payload = localStorage.getItem('_SS_' + key);

        if (!payload) {
            throw new Error('Key "' + key + '" not found.');
        }
        return JSON.parse(payload);
    },

    _migrate_to_native: function (success) {
        var keysLeft, payload, i, key, migrated, sjcl_get_success, sjcl_get_error;
        var self = this;
        var migrateKeys = [];

        migrated = function () {
            localStorage.setItem('_SS_MIGRATED_TO_NATIVE', '1');
            success();
        };

        for (key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                if (key.startsWith('_SS_')) {
                    payload = JSON.parse(localStorage.getItem(key));
                    //Just in case init was interrupted and rerun
                    if (!payload.native) {
                        migrateKeys.push(key.replace('_SS_', ''));
                    }
                }
            }
        }

        if (migrateKeys.length === 0) {
            migrated();
            return;
        }

        sjcl_get_success = function (value) {
            self._native_set(
                function (key) {
                    //Remove processed key
                    keysLeft.splice(keysLeft.indexOf(key), 1);
                    if (keysLeft.length === 0) {
                        migrated();
                    }
                },
                function () {},
                key,
                value
            );
        };

        sjcl_get_error = function () {};

        keysLeft = migrateKeys.slice();
        for (i = 0; i < migrateKeys.length; i++) {
            key = migrateKeys[i];
            this._sjcl_get(
                sjcl_get_success,
                sjcl_get_error,
                key
            );
        }
    }
};

SecureStorageBrowser = function (success, error, service) {
    this.service = service;
    setTimeout(success, 0);
    return this;
};

SecureStorageBrowser.prototype = {

    get: function (success, error, key) {
        var value;
        try {
            _checkCallbacks(success, error);
            value = localStorage.getItem('_SS_' + key);
            if (!value) {
                error(new Error('Key "' + key + '" not found.'));
            } else {
                success(value);
            }
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            _checkCallbacks(success, error);
            localStorage.setItem('_SS_' + key, value);
            success(key);
        } catch (e) {
            error(e);
        }
    },
    remove: function (success, error, key) {
        localStorage.removeItem('_SS_' + key);
        success(key);
    }
};

switch (cordova.platformId) {
case 'ios':
    SecureStorage = SecureStorageiOS;
    break;
case 'android':
    SecureStorage = SecureStorageAndroid;
    break;
case 'windows':
    SecureStorage = SecureStorageWindows;
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
