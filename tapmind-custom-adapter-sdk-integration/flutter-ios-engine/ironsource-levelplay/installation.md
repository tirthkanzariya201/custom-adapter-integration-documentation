# Installation

{% hint style="info" %}
**App Prerequisite**

* Ensure your `ios/Podfile` sets the minimum iOS version:
  * platform :ios, '15.0' # Minimum required by TapMind SDK
* Ensure **Google Mobile Ads SDK** is already integrated; if not, install it before adding the TapMinds adapter.
{% endhint %}

### Configuration Steps

**Update Pod file as per below**

```
target 'Runner' do
 use_frameworks! :linkage => :static             
 
  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))
  target 'RunnerTests' do
    inherit! :search_paths
  end
end
```

Open the `pubspec.yaml` file.

Find the dependencies block and add from below for respective mediation platform.

```
dependencies  
tapmind_ads_ironsource: ^0.0.8
```

#### Import Google Mobile Ads SDK <a href="#import" id="import"></a>

```
dependencies  
google_mobile_ads: ^7.0.0
```

**Update Info.plist**

In your app's `ios/Runner/Info.plist` file, add a `GADApplicationIdentifier` key with a string value of your AdMob app ID, as [identified in the AdMob web interface](https://support.google.com/admob/answer/7356431):

```
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-################~##########</string>
```

You must pass the same value when you initialize the plugin in your Dart code.

See the [iOS guide](https://developers.google.com/admob/ios/quick-start#update_your_infoplist) for more information about configuring `Info.plist` and setting up t
