package com.crypho.plugins;

import android.content.Context;
import android.util.Log;

import android.security.KeyPairGeneratorSpec;

import java.math.BigInteger;
import java.security.Key;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.util.Calendar;

import javax.crypto.Cipher;
import javax.security.auth.x500.X500Principal;

public class RSA {
	private static final String KEYSTORE_PROVIDER = "AndroidKeyStore";
	private static final Cipher CIPHER = getCipher();

	public static byte[] encrypt(byte[] buf, String alias) throws Exception {
		synchronized (CIPHER) {
			initCipher(Cipher.ENCRYPT_MODE, alias);
			return CIPHER.doFinal(buf);
		}
	}

	public static byte[] decrypt(byte[] encrypted, String alias) throws Exception {
		synchronized (CIPHER) {
			initCipher(Cipher.DECRYPT_MODE, alias);
			return CIPHER.doFinal(encrypted);
		}
	}

	public static void createKeyPair(Context ctx, String alias) throws Exception {
		Calendar notBefore = Calendar.getInstance();
		Calendar notAfter = Calendar.getInstance();
		notAfter.add(Calendar.YEAR, 100);
		String principalString = String.format("CN=%s, OU=%s", alias, ctx.getPackageName());
		KeyPairGeneratorSpec spec = new KeyPairGeneratorSpec.Builder(ctx)
			.setAlias(alias)
			.setSubject(new X500Principal(principalString))
			.setSerialNumber(BigInteger.ONE)
			.setStartDate(notBefore.getTime())
			.setEndDate(notAfter.getTime())
			.setEncryptionRequired()
			.setKeySize(2048)
			.setKeyType("RSA")
			.build();
		KeyPairGenerator kpGenerator = KeyPairGenerator.getInstance("RSA", KEYSTORE_PROVIDER);
		kpGenerator.initialize(spec);
		kpGenerator.generateKeyPair();
	}

	public static void initCipher(int cipherMode, String alias) throws Exception {
		KeyStore.PrivateKeyEntry keyEntry = getKeyStoreEntry(alias);
		if (keyEntry == null) {
			throw new Exception("Failed to load key for " + alias);
		}
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
		CIPHER.init(cipherMode, key);
	}


	public static boolean isEntryAvailable(String alias) {
		try {
			return getKeyStoreEntry(alias) != null;
		} catch (Exception e) {
			return false;
		}
	}

	private static KeyStore.PrivateKeyEntry getKeyStoreEntry(String alias) throws Exception {
		KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
		keyStore.load(null, null);
		return (KeyStore.PrivateKeyEntry) keyStore.getEntry(alias, null);
	}

	private static Cipher getCipher() {
		try {
			return Cipher.getInstance("RSA/ECB/PKCS1Padding");
		} catch (Exception e) {
			return null;
		}
	}
}