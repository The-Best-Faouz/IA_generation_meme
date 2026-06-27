package com.klipapp.modules.notification

import android.accessibilityservice.AccessibilityServiceInfo
import android.app.Notification
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.view.accessibility.AccessibilityEvent
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

class NotificationListenerService : NotificationListenerService() {

    companion object {
        const val TAG = "KLIP_NotificationListener"
        var capturedNotifications: MutableList<Map<String, String>> = mutableListOf()
        var onNotificationCaptured: ((Map<String, String>) -> Unit)? = null
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val notification = sbn.notification
        val packageName = sbn.packageName
        val extras = notification.extras

        val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""

        if (title.isBlank() && text.isBlank()) return

        val data = mapOf(
            "packageName" to packageName,
            "title" to title,
            "text" to text,
            "subText" to subText,
            "bigText" to bigText,
            "timestamp" to System.currentTimeMillis().toString(),
            "key" to sbn.key
        )

        synchronized(capturedNotifications) {
            capturedNotifications.add(data)
            if (capturedNotifications.size > 200) {
                capturedNotifications.removeAt(0)
            }
        }

        onNotificationCaptured?.invoke(data)
        Log.d(TAG, "Notification from $packageName: $title - $text")
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}
}
