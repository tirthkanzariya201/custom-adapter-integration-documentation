# Configuration

{% hint style="info" %}
**PREREQUISITES**

* An Ad Unit must already be in place which will be used for targeting.
{% endhint %}

#### **Levelplay UI CONFIGURATION**

**From Levelplay UI (Operational / Configuration Process)**

**Create a** TapMind **waterfall Network**

Please go through the below steps to integrate **TapMind** as a demand partner with your **IRONSOURCE-LEVELPLAY** account. To begin with the integration, login to your **IRONSOURCE-LEVELPLAY** account and follow the below steps.

1. On the Ironsource platform, select Monetize → Setup → SDK Networks.
2. Select Available Networks → Manage Networks. In the dropdown list of available networks, select Custom Adapte&#x72;**.**

<figure><img src="../../../.gitbook/assets/image (9).jpeg" alt=""><figcaption></figcaption></figure>

3. To enable the **TapMind Adapter**, input <mark style="background-color:$primary;">**Network Key**</mark> <mark style="background-color:$primary;">15c11cb1d</mark>,then click on the Enter key, and save. The name of the network should appear as **TapMind**.
4. Click save, your TapMind network is now ready.

{% hint style="info" %}
**Login LevelPlay → Monetize → Setup → SDK Networks → Available Networks → Manage Networks → Select Custom Adapter → Enter Network Key → Press Enter → Save → TapMind Network Created**
{% endhint %}

{% include "../../../.gitbook/includes/doc-tag-ironsource.md" %}

{% hint style="info" %}
It is highly recommended to enter the Rate (that has been provided by TapMind for each placement id), as this determines the correct order in the waterfalls. Repeat the above setup for each ad-format type. To start with, only add one instance for each format only, and use the discussed eCPM rate for waterfall.
{% endhint %}

#### Setup Instances

1. In the Left Side Navigation Menu click Instances under Setup.
2. Click TapMind Network listed under Custom.
3. Click on Ad Instance and select Ad type as Per the G-sheet Provided.

For the Below details Please reach out TapMind Account Manger

```
Instance Name : As Per the G-sheet Provided
ecpm : As Per the G-sheet Provided
```

{% hint style="info" %}
**Setup → Instances → Select TapMind (Custom) → Add Ad Instance → Select Ad Type (from sheet) → Enter Instance Name (from sheet) → Select Mediation Groups → Enter Rate (from sheet)**
{% endhint %}

### **Testing instructions** <a href="#setup-instances-for-banner" id="setup-instances-for-banner"></a>

Before deploying the TapMind SDK and adapter to your live application, you can perform testing with the test mode. This will guarantee a high fill rate (99.99%) during the integration testing process, ensuring that the implementation is functioning correctly. It is crucial to disable the test mode before going live, as failing to do so will result in financial loss.
