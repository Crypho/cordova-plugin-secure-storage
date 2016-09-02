package com.crypho.plugins;

import java.util.Set;

import android.content.SharedPreferences;
import android.content.Context;

public class SharedPreferencesHandler {
	private SharedPreferences prefs;
	private static final String MIGRATED_TO_NATIVE_KEY = "_SS_MIGRATED_TO_NATIVE";
	private static final String MIGRATED_TO_NATIVE_STORAGE_KEY = "_SS_MIGRATED_TO_NATIVE_STORAGE";

	public SharedPreferencesHandler (String prefsName, Context ctx){
		prefs = ctx.getSharedPreferences(prefsName, 0);
	}

    void store(String key, String value){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(key, value);
        editor.commit();
    }

    String fetch (String key){
        return prefs.getString(key, null);
    }

    void remove (String key){
        SharedPreferences.Editor editor = prefs.edit();
        editor.remove(key);
        editor.commit();
    }

    Set keys (){
    	Set res = prefs.getAll().keySet();
    	res.remove(MIGRATED_TO_NATIVE_KEY);
    	res.remove(MIGRATED_TO_NATIVE_STORAGE_KEY);
        return res;
    }

    void clear (){
        SharedPreferences.Editor editor = prefs.edit();
        editor.clear();
        editor.commit();
    }
}