# Installation

{% hint style="info" %}
**App Prerequisites**

* minSdkVersion 23 or higher
* compileSdkVersion 36 or higher
{% endhint %}

### Configuration Steps

Ensure your `android/build.gradle` (project-level) includes the required repositories:

```
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' } 
    }
}
```

Open the `build.gradle` (Module: app) file.

Find the dependencies block and add from below for respective mediation platform.

```
dependencies {
    // Add TapMind SDK AdMob Adapter dependency
implementation("io.github.tapmind-tech:customadapter-admob:2.1.9")
    // Add AdMob SDK dependency
    implementation ("com.google.android.gms:play-services-ads:25.0.0")
}
```

