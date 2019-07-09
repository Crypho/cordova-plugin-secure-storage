package com.crypho.plugins;

import android.annotation.TargetApi;
import android.content.Context;
import android.os.Build;
import android.security.keystore.KeyInfo;
import android.security.keystore.UserNotAuthenticatedException;
import android.util.Log;

import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.security.KeyPairGeneratorSpec;


import java.math.BigInteger;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.spec.AlgorithmParameterSpec;
import java.security.spec.RSAKeyGenParameterSpec;
import java.util.Calendar;

import javax.crypto.Cipher;
import javax.security.auth.x500.X500Principal;

public class RSA {
    private static final String KEYSTORE_PROVIDER = "AndroidKeyStore";
    private static final Cipher CIPHER = getCipher();
    private static final Integer CERT_VALID_YEARS = 100;
    private static final Boolean IS_API_23_AVAILABLE = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M;
    private static final String TAG = "SecureStorage";

    public static byte[] encrypt(byte[] buf, String alias) throws Exception {
        return runCipher(Cipher.ENCRYPT_MODE, alias, buf);
    }

    public static byte[] decrypt(byte[] buf, String alias) throws Exception {
        return runCipher(Cipher.DECRYPT_MODE, alias, buf);
    }

    public static void createKeyPair(Context ctx, String alias, Integer userAuthenticationValidityDuration) throws Exception {
        AlgorithmParameterSpec spec = IS_API_23_AVAILABLE ? getInitParams(alias, userAuthenticationValidityDuration) : getInitParamsLegacy(ctx, alias);

        KeyPairGenerator kpGenerator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, KEYSTORE_PROVIDER);
        kpGenerator.initialize(spec);
        kpGenerator.generateKeyPair();
    }

    /**
     * Check if Encryption Keys are available and secure.
     *
     * @param alias
     * @return boolean
     */
    public static boolean encryptionKeysAvailable(String alias) {
        try {
            Key privateKey = loadKey(Cipher.DECRYPT_MODE, alias);
            if (privateKey == null) {
                return false;
            }
            KeyInfo keyInfo;
            KeyFactory factory = KeyFactory.getInstance(privateKey.getAlgorithm(), KEYSTORE_PROVIDER);
            keyInfo = factory.getKeySpec(privateKey, KeyInfo.class);
            return keyInfo.isInsideSecureHardware();
        } catch (Exception e) {
            Log.i(TAG, "Checking encryption keys failed.", e);
            return false;
        }
    }

    /**
     * Check if we need to prompt for User's Credentials
     *
     * @param alias
     * @return
     */
    public static boolean userAuthenticationRequired(String alias) {
        try {
            // Do a quick encrypt/decrypt test
            byte[] encrypted = encrypt(alias.getBytes(), alias);
            decrypt(encrypted, alias);
            return false;
        } catch (UserNotAuthenticatedException noAuthEx) {
            return true;
        } catch (Exception e) {
            // Other
            return false;
        }
    }

    private static byte[] runCipher(int cipherMode, String alias, byte[] buf) throws Exception {
        Key key = loadKey(cipherMode, alias);
        synchronized (CIPHER) {
            CIPHER.init(cipherMode, key);
            return CIPHER.doFinal(buf);
        }
    }

    private static Key loadKey(int cipherMode, String alias) throws Exception {
        KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
        keyStore.load(null, null);

        if (!keyStore.containsAlias(alias)) {
            throw new Exception("KeyStore doesn't contain alias: " + alias);
        }

        Key key;
        switch (cipherMode) {
            case Cipher.ENCRYPT_MODE:
                key = keyStore.getCertificate(alias).getPublicKey();
                if (key == null) {
                    throw new Exception("Failed to load the public key for " + alias);
                }
                break;
            case Cipher.DECRYPT_MODE:
                key = keyStore.getKey(alias, null);
                if (key == null) {
                    throw new Exception("Failed to load the private key for " + alias);
                }
                break;
            default:
                throw new Exception("Invalid cipher mode parameter");
        }
        return key;
    }

    private static Cipher getCipher() {
        try {
            return Cipher.getInstance("RSA/ECB/PKCS1Padding");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Generate Encryption Keys Parameter Spec
     *
     * @param alias String
     * @return AlgorithmParameterSpec
     * @// TODO: 2019-07-08 Fix setUserAuthenticationValidityDurationSeconds workaround
     */
    @TargetApi(Build.VERSION_CODES.M)
    private static AlgorithmParameterSpec getInitParams(String alias, Integer userAuthenticationValidityDuration) {
        Calendar notAfter = Calendar.getInstance();
        notAfter.add(Calendar.YEAR, CERT_VALID_YEARS);

        return new KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_DECRYPT | KeyProperties.PURPOSE_ENCRYPT)
                .setCertificateNotBefore(Calendar.getInstance().getTime())
                .setCertificateNotAfter(notAfter.getTime())
                .setAlgorithmParameterSpec(new RSAKeyGenParameterSpec(2048, RSAKeyGenParameterSpec.F4))
                .setUserAuthenticationRequired(true)
                .setUserAuthenticationValidityDurationSeconds(userAuthenticationValidityDuration)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1)
                .setBlockModes(KeyProperties.BLOCK_MODE_ECB)
                .build();
    }

    /**
     * Generate Encryption Keys Parameter Spec
     * Fallback to legacy (pre API 23) Spec Generator
     */
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private static AlgorithmParameterSpec getInitParamsLegacy(Context ctx, String alias) throws Exception {
        Calendar notAfter = Calendar.getInstance();
        notAfter.add(Calendar.YEAR, CERT_VALID_YEARS);

        return new KeyPairGeneratorSpec.Builder(ctx)
                .setAlias(alias)
                .setSubject(new X500Principal(String.format("CN=%s, OU=%s", alias, ctx.getPackageName())))
                .setSerialNumber(BigInteger.ONE)
                .setStartDate(Calendar.getInstance().getTime())
                .setEndDate(notAfter.getTime())
                .setEncryptionRequired()
                .setKeySize(2048)
                .setKeyType(KeyProperties.KEY_ALGORITHM_RSA)
                .build();
    }
}