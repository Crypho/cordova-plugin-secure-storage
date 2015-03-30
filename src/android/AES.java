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
	private static final String CIPHER = "AES/GCM/NoPadding";
	private static final int KEY_SIZE = 256;

	public static JSONObject encrypt(byte[] msg, Cipher encKeyCipher) throws Exception {
		SecretKeySpec secretKeySpec = generateKeySpec();
		byte[] encryptedKey = encKeyCipher.doFinal(secretKeySpec.getEncoded());

		Cipher cipher = createCipher(Cipher.ENCRYPT_MODE, secretKeySpec, null);
		byte[] encrypted = cipher.doFinal(msg);
		byte[] iv = cipher.getIV();

		JSONObject result = new JSONObject();
		result.put("key", Base64.encodeToString(encryptedKey, Base64.DEFAULT));
		result.put("value", Base64.encodeToString(encrypted, Base64.DEFAULT));
		result.put("iv", Base64.encodeToString(iv, Base64.DEFAULT));
		return result;
	}

	public static String decrypt(byte[] buf, byte[] key, byte[] iv) throws Exception {
		SecretKeySpec secretKeySpec = new SecretKeySpec(key, "AES");
		Cipher cipher = createCipher(Cipher.DECRYPT_MODE, secretKeySpec, new IvParameterSpec(iv));
		return new String(cipher.doFinal(buf));
	}

	private static SecretKeySpec generateKeySpec() throws Exception {
	    KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
	    keyGenerator.init(KEY_SIZE, new SecureRandom());
	    SecretKey sc = keyGenerator.generateKey();
	    return new SecretKeySpec(sc.getEncoded(), "AES");
	}

	private static Cipher createCipher(int cipherMode, Key key, IvParameterSpec iv) throws Exception {
		Cipher cipher = Cipher.getInstance(CIPHER);
		cipher.init(cipherMode, key, iv);
		return cipher;
	}
}