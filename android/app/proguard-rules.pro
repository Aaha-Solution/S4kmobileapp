# =========================
#  Stripe SDK - Required Rules
# =========================
#-keep class com.stripe.android.** { *; }
#-dontwarn com.stripe.android.**

#-keep class com.reactnativestripesdk.** { *; }
#-dontwarn com.reactnativestripesdk.**

#-keep class com.stripe.android.pushProvisioning.** { *; }
#-dontwarn com.stripe.android.pushProvisioning.**
# =========================
#  NitroModules - CRITICAL (ADD THIS FIRST!)
# =========================
-keep class com.margelo.nitro.** { *; }
-keepclassmembers class com.margelo.nitro.** { *; }
-dontwarn com.margelo.nitro.**

# Keep all Nitro hybrid objects
-keep class **HybridRn** { *; }
-keep class **Hybrid** { *; }

# NitroModules IAP specific
-keep class com.margelo.nitro.iap.** { *; }
-keepclassmembers class com.margelo.nitro.iap.** { *; }

# Keep all native interfaces
-keepclasseswithmembers class * {
    native <methods>;
}

# Keep annotation classes
-keep @interface com.facebook.proguard.annotations.DoNotStrip
-keep @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @interface androidx.annotation.Keep

# Apply annotations
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}

-keep @androidx.annotation.Keep class *
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# =========================
#  React Native Core & Hermes
# =========================
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }

# Keep all React Native modules
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# =========================
#  App Registration
# =========================
-keep class com.smile4kids.** { *; }
-keepclassmembers class com.smile4kids.** { *; }

-keep class com.facebook.react.bridge.NativeModule { *; }
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.bridge.BaseJavaModule { *; }

-keep class com.smile4kids.MainApplication { *; }
-keep class com.smile4kids.MainActivity { *; }

-keep class com.facebook.react.ReactApplication { *; }
-keep class com.facebook.react.ReactNativeHost { *; }
-keep class com.facebook.react.PackageList { *; }
-keep class com.facebook.react.ReactPackage { *; }

-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

-keepattributes SourceFile,LineNumberTable

# =========================
#  Video Playback - Prevent ExoPlayer/OkHttp stripping
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

# =========================
#  React Native IAP & Play Billing - CRITICAL FOR AAB
# =========================
-keep class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# Keep all IAP-related interfaces - CRITICAL!
-keep interface com.android.billingclient.api.** { *; }
-keep class com.android.billingclient.api.** { *; }

# RN-IAP native classes
-keep class com.dooboolab.** { *; }
-keepclassmembers class com.dooboolab.** { *; }
-dontwarn com.dooboolab.**

# RN-IAP alternate package names - IMPORTANT!
-keep class com.dooboolab.rniap.** { *; }
-keepclassmembers class com.dooboolab.rniap.** { *; }

# Keep IAP callback interfaces
-keep interface com.dooboolab.** { *; }

-keep class com.facebook.react.bridge.** { *; }
-dontwarn com.facebook.react.bridge.**

# =========================
# BuildConfig - CRITICAL FOR AAB!
# =========================
-keep class **.BuildConfig { *; }
-keep class com.smile4kids.BuildConfig { *; }
-keepclassmembers class **.BuildConfig {
    public static <fields>;
}

# =========================
# Prevent over-optimization - CRITICAL!
# =========================
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# =========================
# Keep line numbers for crash debugging
# =========================
-renamesourcefileattribute SourceFile

# =========================
# Serializable & Parcelable - AAB needs these!
# =========================
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# =========================
# Enum classes - IMPORTANT!
# =========================
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# =========================
# R classes - Resource IDs
# =========================
-keepclassmembers class **.R$* {
    public static <fields>;
}

# =========================
# Nimbus JOSE JWT - for IAP receipt verification
# =========================
-keep class com.nimbusds.** { *; }
-dontwarn com.nimbusds.**
-keep class net.minidev.json.** { *; }
-dontwarn net.minidev.json.**

# =========================
# JavaScript Interface
# =========================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# =========================
# Kotlin specific
# =========================
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# =========================
# Additional dontwarn for clean builds
# =========================
-dontwarn com.facebook.react.**
-dontwarn okio.**
-dontwarn okhttp3.**

# =========================
# DEBUGGING - Uncomment these to diagnose ProGuard issues
# =========================
# -printconfiguration proguard-config.txt
# -printusage proguard-usage.txt
# -printseeds proguard-seeds.txt
# -printmapping proguard-mapping.txt