# Installation

{% hint style="info" %}
**App Prerequisite**

* minSdkVersion of 24 or higher
* compileSdkVersion of 36 or higher
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

Open the `pubspec.yaml` file.

Find the dependencies block and add from below for respective mediation platform.

```
dependencies  
tap_mind_ads_admob: ^0.0.11
```



