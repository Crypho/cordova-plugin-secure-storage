package com.crypho.plugins;

import android.util.Log;
import android.util.Base64;

import org.json.JSONException;
import org.json.JSONObject;

import java.security.Key;
import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.KeyGenerator;

public class AES {
	private static final String CIPHER_MODE = "CCM";
	private static final int KEY_SIZE = 256;
	private static final int VERSION = 1;
	private static final Cipher CIPHER = getCipher();

	public static JSONObject encrypt(byte[] msg, byte[] adata) throws Exception {
		byte[] iv, ct, secretKeySpec_enc;
		synchronized (CIPHER) {
			SecretKeySpec secretKeySpec = generateKeySpec();
			secretKeySpec_enc = secretKeySpec.getEncoded();
			initCipher(Cipher.ENCRYPT_MODE, secretKeySpec, null, adata);
			iv = CIPHER.getIV();
			ct = CIPHER.doFinal(msg);
		}

		JSONObject value = new JSONObject();
		value.put("iv", Base64.encodeToString(iv, Base64.DEFAULT));
		value.put("v", Integer.toString(VERSION));
		value.put("ks", Integer.toString(KEY_SIZE));
		value.put("cipher", "AES");
		value.put("mode", CIPHER_MODE);
		value.put("adata", Base64.encodeToString(adata, Base64.DEFAULT));
		value.put("ct", Base64.encodeToString(ct, Base64.DEFAULT));

		JSONObject result = new JSONObject();
		result.put("key", Base64.encodeToString(secretKeySpec_enc, Base64.DEFAULT));
		result.put("value", value);
		result.put("native", true);

		return result;
	}

	public static String decrypt(byte[] buf, byte[] key, byte[] iv, byte[] adata) throws Exception {
		SecretKeySpec secretKeySpec = new SecretKeySpec(key, "AES");
		synchronized (CIPHER) {
			initCipher(Cipher.DECRYPT_MODE, secretKeySpec, iv, adata);
			return new String(CIPHER.doFinal(buf));
		}
	}

	private static SecretKeySpec generateKeySpec() throws Exception {
	    KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
	    keyGenerator.init(KEY_SIZE, new SecureRandom());
	    SecretKey sc = keyGenerator.generateKey();
	    return new SecretKeySpec(sc.getEncoded(), "AES");
	}

	private static void initCipher(int cipherMode, Key key, byte[] iv, byte[] adata) throws Exception {
		if (iv != null) {
			CIPHER.init(cipherMode, key, new IvParameterSpec(iv));
		} else {
			CIPHER.init(cipherMode, key);
		}
		CIPHER.updateAAD(adata);
	}

	private static Cipher getCipher() {
		try {
			return Cipher.getInstance("AES/" + CIPHER_MODE + "/NoPadding");
		} catch (Exception e) {
			return null;
		}
	}
}
