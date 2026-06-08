# Installation

<Info>
**App Prerequisite**

* minSdkVersion of 23 or higher
* compileSdkVersion of 36 or higher
</Info>

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
implementation("io.github.tapmind-tech:customadapter-ironsource:2.1.5")
    // Add AdMob SDK dependency
    implementation ("com.google.android.gms:play-services-ads:25.0.0")
}
```

#### Import Google Mobile Ads SDK <a href="#import" id="import"></a>

Add your AdMob app ID, as [identified in the AdMob web interface](https://support.google.com/admob/answer/7356431), to your app's `AndroidManifest.xml` file. To do so, add a `<meta-data>` tag with `android:name="com.google.android.gms.ads.APPLICATION_ID"`. You can find your **app ID** in the AdMob web interface. For `android:value`, insert your own AdMob app ID, surrounded by quotation marks.

```xml
<manifest>
  <application>
    <!-- Sample AdMob app ID: ca-app-pub-3940256099942544~3347511713 -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="SAMPLE_APP_ID"/>
  </application>
</manifest>
```

Replace SAMPLE\_APP\_ID with your AdMob app ID. While testing, use the sample app ID shown in the previous example.

Also, note that failure to add the `<meta-data>` tag exactly as shown results in a crash with the message:

```
Missing application ID.
```

####
