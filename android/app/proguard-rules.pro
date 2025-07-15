# Stripe SDK - Prevent R8 from stripping required classes
-keep class com.stripe.android.** { *; }
-dontwarn com.stripe.android.**

# React Native Stripe SDK integration
-keep class com.reactnativestripesdk.** { *; }
-dontwarn com.reactnativestripesdk.**

# Specifically keep PushProvisioning classes
-keep class com.stripe.android.pushProvisioning.** { *; }
-dontwarn com.stripe.android.pushProvisioning.**
