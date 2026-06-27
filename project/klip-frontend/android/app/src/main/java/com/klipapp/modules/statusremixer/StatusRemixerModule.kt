package com.klipapp.modules.statusremixer

import android.net.Uri
import android.os.Environment
import android.util.Log
import com.facebook.react.bridge.*
import java.io.File

class StatusRemixerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StatusRemixerModule"

    @ReactMethod
    fun scanStatuses(promise: Promise) {
        try {
            val statusDir = File(
                Environment.getExternalStorageDirectory(),
                "WhatsApp/Media/.Statuses"
            )

            if (!statusDir.exists() || !statusDir.isDirectory) {
                promise.resolve(Arguments.createArray())
                return
            }

            val result = Arguments.createArray()
            val files = statusDir.listFiles { file ->
                val name = file.name.lowercase()
                file.isFile && (name.endsWith(".jpg") || name.endsWith(".jpeg") ||
                        name.endsWith(".png") || name.endsWith(".webp") ||
                        name.endsWith(".mp4"))
            }

            if (files != null) {
                files.sortByDescending { it.lastModified() }
                files.forEach { file ->
                    val item = Arguments.createMap()
                    item.putString("uri", Uri.fromFile(file).toString())
                    item.putString("fileName", file.name)
                    item.putDouble("timestamp", file.lastModified().toDouble())
                    item.putString("type", if (file.name.lowercase().endsWith(".mp4")) "video" else "image")
                    result.pushMap(item)
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            Log.w("StatusRemixer", "Scan failed", e)
            promise.resolve(Arguments.createArray())
        }
    }
}
