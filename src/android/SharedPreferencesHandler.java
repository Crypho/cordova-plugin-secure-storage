package com.crypho.plugins;

import java.util.Set;
import java.util.HashSet;
import java.util.Iterator;

import android.content.SharedPreferences;
import android.content.Context;

public class SharedPreferencesHandler {
	private SharedPreferences prefs;

	public SharedPreferencesHandler (String prefsName, Context ctx){
		prefs = ctx.getSharedPreferences(prefsName  + "_SS", 0);
	}

    void store(String key, String value){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("_SS_" + key, value);
        editor.commit();
    }

    String fetch (String key){
        return prefs.getString("_SS_" + key, null);
    }

    void remove (String key){
        SharedPreferences.Editor editor = prefs.edit();
        editor.remove("_SS_" + key);
        editor.commit();
    }

    Set keys (){
        Set res = new HashSet<String>();
    	Iterator<String> iter = prefs.getAll().keySet().iterator();
        while (iter.hasNext()) {
            String key = iter.next();
            if (key.startsWith("_SS_")  && !key.startsWith("_SS_MIGRATED_")) {
                res.add(key.replaceFirst("^_SS_", ""));
            }
        }
        return res;
    }

    void clear (){
        SharedPreferences.Editor editor = prefs.edit();
        editor.clear();
        editor.commit();
    }
}