package com.crypho.plugins;

import android.annotation.TargetApi;
import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyInfo;
import android.security.keystore.KeyProperties;

import android.security.KeyPairGeneratorSpec;

import java.math.BigInteger;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import javax.crypto.Cipher;
import javax.security.auth.x500.X500Principal;

public class RSA {
	private static final String KEYSTORE_PROVIDER = "AndroidKeyStore";
	private static final Cipher CIPHER = getCipher();
	private static final String DATE_NOT_BEFORE = "notBefore";
	private static final String DATE_NOT_AFTER = "notAfter";

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

	@TargetApi(19)
	public static KeyPair createKeyPairLegacy(Context ctx, String alias) throws Exception {
		HashMap<String, Date> certDates = getCertificateDates();
		KeyPairGeneratorSpec spec = new KeyPairGeneratorSpec.Builder(ctx)
			.setAlias(alias)
			.setSubject(new X500Principal(getPrincipalString(alias, ctx)))
			.setSerialNumber(BigInteger.ONE)
			.setStartDate(certDates.get(DATE_NOT_BEFORE))
			.setEndDate(certDates.get(DATE_NOT_AFTER))
			.setEncryptionRequired()
			.setKeySize(2048)
			.setKeyType("RSA")
			.build();
		KeyPairGenerator kpGenerator = KeyPairGenerator.getInstance("RSA", KEYSTORE_PROVIDER);
		kpGenerator.initialize(spec);
		return kpGenerator.generateKeyPair();
	}

	@TargetApi(23)
	public static KeyPair createKeyPair(Context ctx, String alias, boolean secureHardwareOnly) throws Exception {
		HashMap<String, Date> certDates = getCertificateDates();
		KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(
			KeyProperties.KEY_ALGORITHM_RSA, KEYSTORE_PROVIDER);

		KeyGenParameterSpec spec = new KeyGenParameterSpec.Builder(alias,
			KeyProperties.PURPOSE_SIGN | KeyProperties.PURPOSE_DECRYPT | KeyProperties.PURPOSE_ENCRYPT)
			.setCertificateSubject(new X500Principal(getPrincipalString(alias, ctx)))
			.setCertificateSerialNumber(BigInteger.ONE)
			.setCertificateNotBefore(certDates.get(DATE_NOT_BEFORE))
			.setCertificateNotAfter(certDates.get(DATE_NOT_AFTER))
			.setKeySize(2048)
			.setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1)
			.setUserAuthenticationRequired(true)
			.build();

		keyPairGenerator.initialize(spec);
		KeyPair keyPair = keyPairGenerator.generateKeyPair();

		if (secureHardwareOnly) {
			PrivateKey privateKey = keyPair.getPrivate();
			KeyFactory factory = KeyFactory.getInstance(privateKey.getAlgorithm(), KEYSTORE_PROVIDER);

			KeyInfo keyInfo = factory.getKeySpec(privateKey, KeyInfo.class);
			boolean keyInfoGeneratedInSecureHardware = keyInfo.isInsideSecureHardware();

			if (!keyInfoGeneratedInSecureHardware) {
				// Clean up by deleting key
				KeyStore store = KeyStore.getInstance(KEYSTORE_PROVIDER);
				store.load(null, null);
				store.deleteEntry(alias);

				throw new Exception("Failed to create Private Key in Hardware-backed Secure Storage.");
			}
		}

		return keyPair;
	}

	private static HashMap<String, Date> getCertificateDates() {
		Calendar notBefore = Calendar.getInstance();
		Calendar notAfter = Calendar.getInstance();
		notAfter.add(Calendar.YEAR, 100);

		HashMap<String, Date> map = new HashMap<>();
		map.put(DATE_NOT_BEFORE, notBefore.getTime());
		map.put(DATE_NOT_AFTER, notAfter.getTime());

		return map;
	}

	private static String getPrincipalString(String alias, Context ctx) {
		return String.format("CN=%s, OU=%s", alias, ctx.getPackageName());
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
