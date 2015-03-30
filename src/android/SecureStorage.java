package com.crypho.plugins;

import android.content.ComponentName;
import android.util.Log;
import android.util.Base64;

import android.content.Context;
import android.content.Intent;
import android.security.KeyPairGeneratorSpec;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;

import java.math.BigInteger;
import java.security.Key;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.util.Calendar;

import javax.crypto.Cipher;
import javax.security.auth.x500.X500Principal;

public class SecureStorage extends CordovaPlugin {
    private static final String TAG = "SecureStorage";
    private static final String KEYSTORE_PROVIDER = "AndroidKeyStore";

    private static final String ALGORITHM = "RSA";
    private String CIPHER_MODE = "ECB";
    private String CIPHER_PADDING = "PKCS1Padding";

    private String ALIAS = null;
    private CallbackContext inιtializationContext;
    private boolean inιtializing = false;

    @Override
    public void onResume(boolean multitasking) {
        if (inιtializing) {
            inιtializing = false;
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        createKeyPair(ALIAS);
                        inιtializationContext.success();
                    } catch (Exception e) {
                        Log.e(TAG, "Init failed :", e);
                        inιtializationContext.error(e.getMessage());
                    }
                }
            });
        }
    }

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        if ("init".equals(action)) {
            inιtializing = true;
            inιtializationContext = callbackContext;
            ALIAS = getContext().getPackageName() + "." + args.getString(0);
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    Intent intent = new Intent("com.android.credentials.UNLOCK");
                    startActivity(intent);
                }
            });
            return true;
        }
        if ("encrypt".equals(action)) {
            final String encryptMe = args.getString(0);
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        String encrypted = encrypt(encryptMe);
                        callbackContext.success(encrypted);
                    } catch (Exception e) {
                        Log.e(TAG, "Encrypt failed :", e);
                        callbackContext.error(e.getMessage());
                    }
                }
            });
            return true;
        }
        if ("decrypt".equals(action)) {
            final byte[] decryptMe = args.getArrayBuffer(0);
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        String decrypted = decrypt(decryptMe);
                        callbackContext.success(decrypted);
                    } catch (Exception e) {
                        Log.e(TAG, "Decrypt failed :", e);
                        callbackContext.error(e.getMessage());
                    }
                }
            });
            return true;
        }
        return false;
    }

    private String encrypt(String msg) throws Exception {
        Cipher cipher = createCipher(Cipher.ENCRYPT_MODE);
        byte[] encrypted = cipher.doFinal(msg.getBytes());
        return Base64.encodeToString(encrypted, Base64.DEFAULT);
    }

    private String decrypt(final byte[] encrypted) throws Exception {
        Cipher cipher = createCipher(Cipher.DECRYPT_MODE);
        return new String(cipher.doFinal(encrypted)).trim();
    }

    private boolean createKeyPair(String alias) throws Exception {
        if (getKeyStoreEntry() != null) { //Key Already exists
            return true;
        }
        Context ctx = getContext();
        Calendar notBefore = Calendar.getInstance();
        Calendar notAfter = Calendar.getInstance();
        notAfter.add(Calendar.YEAR, 100);
        String principalString = String.format("CN=%s, OU=%s", ALIAS, ctx.getPackageName());
        KeyPairGeneratorSpec spec = new KeyPairGeneratorSpec.Builder(ctx)
            .setAlias(ALIAS)
            .setSubject(new X500Principal(principalString))
            .setSerialNumber(BigInteger.ONE)
            .setStartDate(notBefore.getTime())
            .setEndDate(notAfter.getTime())
            .setEncryptionRequired()
            .setKeySize(2048)
            .setKeyType(ALGORITHM)
            .build();
        KeyPairGenerator kpGenerator = KeyPairGenerator.getInstance(ALGORITHM, KEYSTORE_PROVIDER);
        kpGenerator.initialize(spec);
        kpGenerator.generateKeyPair();
        return true;
    }

    private Cipher createCipher(int cipherMode) throws Exception {
        KeyStore.PrivateKeyEntry keyEntry = getKeyStoreEntry();
        Key key;
        switch (cipherMode) {
            case Cipher.ENCRYPT_MODE:
                key = keyEntry.getCertificate().getPublicKey();
                break;
            case  Cipher.DECRYPT_MODE:
                key = keyEntry.getPrivateKey();
                break;
            default : throw new Exception("Invalid cipher mode parameter");
        }
        Cipher cipher = Cipher.getInstance(ALGORITHM + "/" + CIPHER_MODE +"/" + CIPHER_PADDING);
        cipher.init(cipherMode, key);
        return cipher;
    }

    private KeyStore.PrivateKeyEntry getKeyStoreEntry() {
        try {
            KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
            keyStore.load(null, null);
            return (KeyStore.PrivateKeyEntry) keyStore.getEntry(ALIAS, null);
        } catch (Exception e) {
            return null;
        }
    }

    private Context getContext(){
        return cordova.getActivity().getApplicationContext();
    }

    private void startActivity(Intent intent){
        cordova.getActivity().startActivity(intent);
    }
}