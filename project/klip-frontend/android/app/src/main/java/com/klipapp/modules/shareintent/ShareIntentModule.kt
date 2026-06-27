package com.klipapp.modules.shareintent

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ShareIntentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var pendingIntent: Intent? = null

    override fun getName(): String = "ShareIntentModule"

    @ReactMethod
    fun getSharedContent(promise: Promise) {
        try {
            val activity = currentActivity ?: run {
                promise.resolve(null)
                return
            }
            val intent = pendingIntent ?: activity.intent ?: run {
                promise.resolve(null)
                return
            }

            if (intent.action != Intent.ACTION_SEND && intent.action != Intent.ACTION_SEND_MULTIPLE) {
                promise.resolve(null)
                return
            }

            val result = Arguments.createMap()

            when {
                intent.hasExtra(Intent.EXTRA_TEXT) && intent.type?.startsWith("text/") == true -> {
                    result.putString("type", "text")
                    result.putString("text", intent.getStringExtra(Intent.EXTRA_TEXT))
                }
                intent.hasExtra(Intent.EXTRA_STREAM) && intent.action == Intent.ACTION_SEND -> {
                    val uri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                    val mimeType = intent.type ?: ""
                    when {
                        mimeType.startsWith("image/") -> {
                            result.putString("type", "image")
                            result.putString("imageUri", uri.toString())
                        }
                        mimeType.startsWith("video/") -> {
                            result.putString("type", "video")
                            result.putString("videoUri", uri.toString())
                        }
                        else -> {
                            result.putString("type", "image")
                            result.putString("imageUri", uri.toString())
                        }
                    }
                }
                intent.action == Intent.ACTION_SEND_MULTIPLE -> {
                    val uris = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
                    if (uris != null && uris.isNotEmpty()) {
                        result.putString("type", "multiple")
                        val uriArray = Arguments.createArray()
                        uris.forEach { uriArray.pushString(it.toString()) }
                        result.putArray("uris", uriArray)
                    } else {
                        promise.resolve(null)
                        return
                    }
                }
                else -> {
                    promise.resolve(null)
                    return
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SHARE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun clearSharedContent() {
        pendingIntent = null
        currentActivity?.intent?.action = null
    }

    fun handleNewIntent(intent: Intent) {
        pendingIntent = intent
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onNewShareIntent", null)
        }
    }
}
