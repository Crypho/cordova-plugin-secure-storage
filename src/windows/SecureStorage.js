var SecureStorageProxy = {

    init: function (win, fail, args) {
        setTimeout(win, 0);
    },

    get: function (win, fail, args) {
        try {
            var service = args[0];
            var key = args[1];

            var vault = new Windows.Security.Credentials.PasswordVault();
            var passwordCredential = vault.retrieve(service, key);

            win(passwordCredential.password);
        } catch (e) {
            fail('Failure in SecureStorage.get() - ' + e.message);
        }
    },

    set: function (win, fail, args) {
        try {
            var service = args[0];
            var key = args[1];
            var value = args[2];

            // Remarks: you can only store up to ten credentials per app in the Credential Locker.
            // If you try to store more than ten credentials, you will encounter an Exception.
            // https://msdn.microsoft.com/en-us/library/windows/apps/hh701231.aspx

            var vault = new Windows.Security.Credentials.PasswordVault();
            vault.add(new Windows.Security.Credentials.PasswordCredential(
                service, key, value));

            win(key);
        } catch (e) {
            fail('Failure in SecureStorage.set() - ' + e.message);
        }
    },

    remove: function (win, fail, args) {
        try {
            var service = args[0];
            var key = args[1];

            var vault = new Windows.Security.Credentials.PasswordVault();
            var passwordCredential = vault.retrieve(service, key);

            if (passwordCredential) {
                vault.remove(passwordCredential);
            }

            win(key);
        } catch (e) {
            fail('Failure in SecureStorage.remove() - ' + e.message);
        }
    },

    keys: function (win, fail, args) {
        try {
            var service = args[0];
            var vault = new Windows.Security.Credentials.PasswordVault();
            var passwordCredentials;

            try {
                passwordCredentials = vault.findAllByResource(service);
            } catch (e) {
                passwordCredentials = [];
            }
            passwordCredentials = passwordCredentials.map(function (passwordCredential) {
                return passwordCredential.userName;
            });

            win(passwordCredentials);
        } catch (e) {
            fail('Failure in SecureStorage.keys() - ' + e.message);
        }
    },

    clear: function (win, fail, args) {
        try {
            var service = args[0];
            var vault = new Windows.Security.Credentials.PasswordVault();
            var passwordCredentials;

            try {
                passwordCredentials = vault.findAllByResource(service);
            } catch (e) {
                passwordCredentials = [];
            }
            passwordCredentials.forEach(function (passwordCredential) {
                vault.remove(passwordCredential);
            });

            win();
        } catch (e) {
            fail('Failure in SecureStorage.clear() - ' + e.message);
        }
    },
};

require("cordova/exec/proxy").add("SecureStorage", SecureStorageProxy);
