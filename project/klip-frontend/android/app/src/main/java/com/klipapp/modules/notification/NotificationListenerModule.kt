package com.klipapp.modules.notification

import android.app.Activity
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.service.notification.StatusBarNotification
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationListenerModule(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    private var isListening = false

    override fun getName(): String = "NotificationListenerModule"

    @ReactMethod
    fun isPermissionGranted(promise: Promise) {
        try {
            val cn = ComponentName(reactApplicationContext, NotificationListenerService::class.java)
            val flat = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                "enabled_notification_listeners"
            )
            val granted = flat?.contains(cn.flattenToString()) == true
            promise.resolve(granted)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestPermission() {
        val cn = ComponentName(reactApplicationContext, NotificationListenerService::class.java)
        val flat = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            "enabled_notification_listeners"
        )
        if (flat?.contains(cn.flattenToString()) != true) {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun startListening() {
        if (!isListening) {
            NotificationListenerService.onNotificationCaptured = { data ->
                if (reactApplicationContext.hasActiveReactInstance()) {
                    val map = Arguments.createMap()
                    data.forEach { (k, v) -> map.putString(k, v) }
                    reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onNotification", map)
                }
            }
            isListening = true
        }
    }

    @ReactMethod
    fun stopListening() {
        isListening = false
        NotificationListenerService.onNotificationCaptured = null
    }

    @ReactMethod
    fun getCapturedNotifications(promise: Promise) {
        try {
            val array = Arguments.createArray()
            synchronized(NotificationListenerService.capturedNotifications) {
                NotificationListenerService.capturedNotifications.forEach { data ->
                    val map = Arguments.createMap()
                    data.forEach { (k, v) -> map.putString(k, v) }
                    array.pushMap(map)
                }
            }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("FETCH_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun clearCapturedNotifications() {
        synchronized(NotificationListenerService.capturedNotifications) {
            NotificationListenerService.capturedNotifications.clear()
        }
    }
}
