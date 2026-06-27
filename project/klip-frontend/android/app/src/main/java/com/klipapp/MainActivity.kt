package com.klipapp

import android.content.Intent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.klipapp.modules.shareintent.ShareIntentModule

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "KlipApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    val module = reactNativeHost.reactInstanceManager
        ?.currentReactContext
        ?.getNativeModule(ShareIntentModule::class.java)
    module?.handleNewIntent(intent)
  }
}
