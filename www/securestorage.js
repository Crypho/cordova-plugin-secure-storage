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

//Taken from undescore.js
var _isString = function isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
};

var _checkIsString = function(value){
    if (!_isString(value)) {
        throw new Error('Value is not a String');
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

SecureStorageiOS = function (success, error, service) {
    this.service = service;
    try {
        _executeNativeMethod(
            success,
            error,
            'init',
            [this.service]
        );
    } catch (e) {
        error(e);
    }
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
            _checkIsString(value);
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

// SecureStorage for Windows web interface and proxy parameters are the same as on iOS
// so we don't create own definition for Windows and simply re-use iOS
SecureStorageWindows = function (success, error, service) {
    this.service = service;
    setTimeout(success, 0);
    return this;
};
SecureStorageWindows.prototype = SecureStorageiOS.prototype;

SecureStorageAndroid = function (success, error, service, options) {
    var self = this;
    if (options) {
        this.options = _merge_options(this.options, options);
    }

    this.service = service;
    try {
        _executeNativeMethod(
            function (native_aes_supported) {
                var checkMigrateToNativeAES;

                checkMigrateToNativeAES = function () {
                    self.options.native = native_aes_supported && self.options.native;
                    if (!self.options.native){
                        success();
                    } else {
                        _executeNativeMethod(
                            function () {
                                success();
                            },
                            function() {
                                self._migrate_to_native_aes(success);
                            },
                            'fetch',
                            ['_SS_MIGRATED_TO_NATIVE']
                        );
                    }
                };

                if (self.options.migrateLocalStorage){
                    self._migrate_to_native_storage(success);
                } else {
                    _executeNativeMethod(
                        function () {
                            checkMigrateToNativeAES();
                        },
                        function() {
                            self._migrate_to_native_storage(checkMigrateToNativeAES);
                        },
                        'fetch',
                        ['_SS_MIGRATED_TO_NATIVE_STORAGE']
                    );
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
        native: true,
        migrateLocalStorage: false
    },

    get: function (success, error, key) {
        try {
            if (this.options.native) {
                this._native_get(success, error, key);
            } else {
                this._sjcl_get(success, error, key);
            }
        } catch (e) {
            error(e);
        }
    },

    set: function (success, error, key, value) {
        try {
            _checkIsString(value);
            if (this.options.native) {
                this._native_set(success, error, key, value);
            } else {
                this._sjcl_set(success, error, key, value);
            }
        } catch (e) {
            error(e);
        }
    },

    keys: function (success, error) {
        try {
            _executeNativeMethod(
                function (ret) {
                    var i, len = ret.length, keys = [];
                    for (i = 0; i < len; ++i) {
                        if (ret[i] && ret[i].slice(0, 4) === '_SS_') {
                            keys.push(ret[i].slice(4));
                        }
                    }
                    success(keys);
                },
                error,
                'keys',
                [this.service]
            );
        } catch (e) {
            error(e);
        }
    },

    remove: function (success, error, key) {
        try {
            _executeNativeMethod(
                function () {
                    success(key);
                },
                error,
                'remove',
                [this.service, '_SS_' + key]
            );
        } catch (e) {
            error(e);
        }
    },

    secureDevice: function (success, error) {
        try {
            _executeNativeMethod(
                success,
                error,
                'secureDevice',
                []
            );
        } catch (e) {
            error(e);
        }
    },

    clear: function (success, error) {
        try {
            _executeNativeMethod(
                success,
                error,
                'clear',
                [this.service]
            );
        } catch (e) {
            error(e);
        }
    },

    _fetch: function (success, error, key) {
        _executeNativeMethod(
            function (value) {
                success(value);
            },
            error,
            'fetch',
            [this.service, '_SS_' + key]
        );
    },

    _sjcl_get: function (success, error, key) {
        var payload;
        var self = this;
        _executeNativeMethod(
            function (value) {
                payload = JSON.parse(value);
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
                    [self.service, payload.key]
                );
            },
            error,
            'fetch',
            [this.service, '_SS_' + key]
        );
    },

    _sjcl_set: function (success, error, key, value) {
        var AESKey, encValue;
        var self = this;

        AESKey = sjcl_ss.random.randomWords(8);
        _AES_PARAM.adata = this.service;
        encValue = sjcl_ss.encrypt(AESKey, value, _AES_PARAM);
        // Encrypt the AES key
        _executeNativeMethod(
            function (encKey) {
                _executeNativeMethod(
                    function () {
                        success(key);
                    },
                    error,
                    'store',
                    [self.service, '_SS_' + key, JSON.stringify({key: encKey, value: encValue})]
                );
            },
            error,
            'encrypt_rsa',
            [this.service, sjcl_ss.codec.base64.fromBits(AESKey)]
        );
    },

    _native_get: function (success, error, key) {
        _executeNativeMethod(
            success,
            error,
            'get',
            [this.service, '_SS_' + key]
        );
    },

    _native_set: function (success, error, key, value) {
        _executeNativeMethod(
            function () {
                success(key);
            },
            error,
            'set',
            [this.service, '_SS_' + key, value]
        );
    },

    _migrate_to_native_storage: function (success) {
        var key;
        var secureStorageData = [];
        var entriesCnt = 0;
        var entriesProcessed = 0;
        var entryMigrated;
        var migrated;
        var migrateEntry;
        var self = this;

        migrated = function () {
            _executeNativeMethod(
                function () {
                    success();
                },
                function () {
                },
                'store',
                [self.service, '_SS_MIGRATED_TO_NATIVE_STORAGE', '1']
            );
        };

        entryMigrated = function () {
            entriesProcessed++;
            if (entriesProcessed === entriesCnt) {
                migrated();
            }
        };

        migrateEntry = function (key, value) {
            _executeNativeMethod(
                function () {
                    localStorage.removeItem(key);
                    entryMigrated();
                },
                function () {
                },
                'store',
                [self.service, key, value]
            );
        };

        for (key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.indexOf('_SS_') === 0) {
                entriesCnt++;
                secureStorageData[key] = localStorage.getItem(key);
            }
        }
        if (entriesCnt === 0) {
            migrated();
        } else {
            for (key in secureStorageData) {
                if (secureStorageData.hasOwnProperty(key)) {
                    migrateEntry(key, secureStorageData[key]);
                }
            }
        }
    },

    _migrate_to_native_aes: function (success) {
        var self = this;
        var keysCnt, keysProcessed;
        var keyProcessed;
        var migrated;
        var migrateKey;
        var i;
        var self = this;

        migrated = function () {
            _executeNativeMethod(
                function () {
                    success();
                },
                function () {
                },
                'store',
                [self.service, '_SS_MIGRATED_TO_NATIVE', '1']
            );
        };

        keyProcessed = function () {
            keysProcessed++;
            if (keysProcessed === keysCnt) {
                migrated();
            }
        };

        migrateKey = function (key) {
            var payload;
            _executeNativeMethod(
                function (value) {
                    payload = JSON.parse(value);
                    if (!payload.native) {
                        self._sjcl_get(
                            function (value) {
                                self._native_set(
                                    function () {
                                        keyProcessed();
                                    },
                                    function () {},
                                    key.replace('_SS_', ''),
                                    value
                                );
                            },
                            function () {},
                            key.replace('_SS_', '')
                        );
                    } else {
                        keyProcessed();
                    }
                },
                function () {
                },
                'fetch',
                [self.service, key]
            );
        };

        _executeNativeMethod(
            function (keys) {
                keysProcessed = 0;
                keysCnt = keys.length;
                if (keysCnt === 0) {
                    migrated();
                } else {
                    for (i = 0; i < keysCnt; i++) {
                        migrateKey(keys[i]);
                    }
                }
            },
            function () {
            },
            'keys',
            [self.service]
        );
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
            _checkIsString(value);
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
    },

    keys: function (success, error) {
        var i, len, key, keys = [];
        try {
            _checkCallbacks(success, error);
            for (i = 0, len = localStorage.length; i < len; ++i) {
                key = localStorage.key(i);
                if ('_SS_' === key.slice(0, 4)) {
                    keys.push(key.slice(4));
                }
            }
            success(keys);
        } catch (e) {
            error(e);
        }
    },

    clear: function (success, error) {
        var i, key;
        try {
            _checkCallbacks(success, error);
            i = localStorage.length;
            while (i-- > 0) {
                key = localStorage.key(i);
                if (key && '_SS_' === key.slice(0, 4)) {
                    localStorage.removeItem(key);
                }
            }
            success();
        } catch (e) {
            error(e);
        }
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
