package com.klipapp.modules.clipboard

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ClipboardModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var isMonitoring = false
    private val handler = Handler(Looper.getMainLooper())
    private var lastClipContent: String? = null
    private val monitorRunnable = object : Runnable {
        override fun run() {
            if (!isMonitoring) return
            checkClipboard()
            handler.postDelayed(this, 2000)
        }
    }

    override fun getName(): String = "KLIPClipboardModule"

    @ReactMethod
    fun getContent(promise: Promise) {
        try {
            val clipboard = reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = clipboard.primaryClip
            if (clip != null && clip.itemCount > 0) {
                val text = clip.getItemAt(0).text?.toString()
                promise.resolve(text)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("CLIPBOARD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startMonitoring() {
        if (isMonitoring) return
        isMonitoring = true
        val clipboard = reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        lastClipContent = clipboard.primaryClip?.getItemAt(0)?.text?.toString()
        handler.post(monitorRunnable)
    }

    @ReactMethod
    fun stopMonitoring() {
        isMonitoring = false
        handler.removeCallbacks(monitorRunnable)
    }

    private fun checkClipboard() {
        try {
            val clipboard = reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = clipboard.primaryClip
            if (clip != null && clip.itemCount > 0) {
                val text = clip.getItemAt(0).text?.toString()
                if (text != null && text != lastClipContent && text.isNotBlank()) {
                    lastClipContent = text
                    if (reactContext.hasActiveReactInstance()) {
                        val map = Arguments.createMap()
                        map.putString("text", text)
                        map.putDouble("timestamp", System.currentTimeMillis().toDouble())
                        reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            .emit("onClipboardChange", map)
                    }
                }
            }
        } catch (_: Exception) {}
    }
}
