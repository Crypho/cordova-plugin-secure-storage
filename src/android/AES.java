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
	private static final int VERSION_1 = 1;

	private static final int IV_SIZE = 12;
	private static final String CIPHER = "AES/CCM/NoPadding";
	private static final int KEY_SIZE = 256;

	private static final int VERSION = VERSION_1;

	public static JSONObject encrypt(Cipher encKeyCipher, byte[] msg, byte[] adata) throws Exception {
		SecretKeySpec secretKeySpec = generateKeySpec();
		byte[] encryptedKey = encKeyCipher.doFinal(secretKeySpec.getEncoded());
		byte[] iv = generateIV(IV_SIZE);
		Cipher cipher = createCipher(Cipher.ENCRYPT_MODE, secretKeySpec, new IvParameterSpec(iv));
		cipher.updateAAD(adata);

		JSONObject value = new JSONObject();
		value.put("iv", Base64.encodeToString(iv, Base64.DEFAULT));
		value.put("v", Integer.toString(VERSION));
		value.put("ks", Integer.toString(KEY_SIZE));
		value.put("cipher", "aes");
		value.put("adata", Base64.encodeToString(adata, Base64.DEFAULT));
		value.put("ct", Base64.encodeToString(cipher.doFinal(msg), Base64.DEFAULT));

		JSONObject result = new JSONObject();
		result.put("key", Base64.encodeToString(encryptedKey, Base64.DEFAULT));
		result.put("value", value);
		result.put("native", true);

		return result;
	}

	public static String decrypt(byte[] buf, byte[] key, byte[] iv, byte[] adata) throws Exception {
		SecretKeySpec secretKeySpec = new SecretKeySpec(key, "AES");
		Cipher cipher = createCipher(Cipher.DECRYPT_MODE, secretKeySpec, new IvParameterSpec(iv));
		cipher.updateAAD(adata);
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

	private static byte[] generateIV(int size) {
		byte[] iv = new byte[size];
		SecureRandom sr = new SecureRandom();
		sr.nextBytes(iv);
		return iv;
	}
}
