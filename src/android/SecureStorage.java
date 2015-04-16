package com.crypho.plugins;

import android.util.Log;
import android.util.Base64;

import android.content.Context;
import android.content.Intent;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;
import org.json.JSONObject;
import javax.crypto.Cipher;

public class SecureStorage extends CordovaPlugin {
    private static final String TAG = "SecureStorage";

    private String ALIAS;

    private volatile CallbackContext initContext;
    private volatile boolean initContextRunning = false;

    @Override
    public void onResume(boolean multitasking) {
        if (initContext != null && !initContextRunning) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    initContextRunning = true;
                    try {
                        if (!RSA.isEntryAvailable(ALIAS)) {
                            RSA.createKeyPair(getContext(), ALIAS);
                        }
                        initContext.success();
                    } catch (Exception e) {
                        Log.e(TAG, "Init failed :", e);
                        initContext.error(e.getMessage());
                    } finally {
                        initContext = null;
                        initContextRunning = false;
                    }
                }
            });
        }
    }

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        if ("init".equals(action)) {
            ALIAS = getContext().getPackageName() + "." + args.getString(0);
            if (!RSA.isEntryAvailable(ALIAS)) {
                initContext = callbackContext;
                unlockCredentials();
            } else {
                callbackContext.success();
            }
            return true;
        }
        if ("encrypt".equals(action)) {
            final String encryptMe = args.getString(0);
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        byte[] encrypted = RSA.encrypt(encryptMe.getBytes(), ALIAS);
                        callbackContext.success(Base64.encodeToString(encrypted, Base64.DEFAULT));
                    } catch (Exception e) {
                        Log.e(TAG, "Encrypt failed :", e);
                        callbackContext.error(e.getMessage());
                    }
                }
            });
            return true;
        }
        if ("decrypt".equals(action)) {
            final byte[] decryptMe = args.getArrayBuffer(0);// getArrayBuffer does base64 decoding
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        byte[] decrypted = RSA.decrypt(decryptMe, ALIAS);
                        callbackContext.success(new String (decrypted));
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

    private void unlockCredentials() {
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                Intent intent = new Intent("com.android.credentials.UNLOCK");
                startActivity(intent);
            }
        });
    }

    private Context getContext(){
        return cordova.getActivity().getApplicationContext();
    }

    private void startActivity(Intent intent){
        cordova.getActivity().startActivity(intent);
    }
}
