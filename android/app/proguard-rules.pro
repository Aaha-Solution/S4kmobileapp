# =========================
# ✅ Stripe SDK - Required Rules
# =========================
-keep class com.stripe.android.** { *; }
-dontwarn com.stripe.android.**

-keep class com.reactnativestripesdk.** { *; }
-dontwarn com.reactnativestripesdk.**

-keep class com.stripe.android.pushProvisioning.** { *; }
-dontwarn com.stripe.android.pushProvisioning.**

# =========================
# ✅ Video Playback - Prevent ExoPlayer/OkHttp stripping
# =========================
-keep class com.google.android.exoplayer2.** { *; }
-dontwarn com.google.android.exoplayer2.**

-keep class com.brentvatne.react.** { *; }
-dontwarn com.brentvatne.react.**

-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# Required to retain annotations used by libraries like Gson, Retrofit, etc.
-keepattributes *Annotation*
