module.exports = {
    "env": {
        "browser": true,
        "jasmine": true
    },
    "globals": {
        "cordova": true,
        "module": true,
        "exports": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": [
            "warn"
        ],
        "no-multi-spaces": [
            "error"
        ],
        "eqeqeq": [
            "error",
            "smart"
        ],
        "no-loop-func": [
            "error"
        ],
        "no-param-reassign": [
            "error"
        ],
        "vars-on-top": [
            "warn"
        ],
        "no-use-before-define": [
            "error"
        ],
    }
};