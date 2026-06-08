---
description: This is guide to set up TapMind with applovin using custom networks
---

# Configuration

{% hint style="info" %}
**PREREQUISITES**

* An Ad Unit must already be in place which will be used for targeting.
{% endhint %}

#### **APPLOVIN CONFIGURATION**

Please go through the below steps to integrate **TapMinds** as a demand partner with your **APPLOVIN** account. To begin with the integration, login to your **APPLOVIN** account and follow the below steps.

1. In the MAX Dashboard, select [MAX > Mediation > Manage > Networks](https://dash.applovin.com/o/mediation/networks/).
2. Click on **Click here to add a Custom Network** at the bottom of the page. The Create Custom Network page appears.

```
Custom Network: TapMind Market Place
Android Class: com.tapmind.tech.TapMindMediationAdapterApplovin
```

3. Click on **Save**.

{% hint style="info" %}
**MAX → Mediation → Manage → Networks → Click Add Custom Network → Select Network Type (SDK) → Enter Android Class Name → Save**
{% endhint %}

**ADDING YIELD PARTNER**

1. Open [MAX > Mediation > Manage > Ad Units](https://dash.applovin.com/o/mediation/ad_units/) in the MAX dashboard.
2. Select the Ad Unit of type(Banner, Interstital or Rewarded) to which you want to add **TapMind** as a custom adapter.
3. Select **TapMind** from the custom network menu to **enable** and enter the information for each placement. Below are the test setup details

Contact your account manager to see what values you need to set for the **final list of production setup (Placement ID**, **Custom Parameters** and **CPM Price)**.

```
App ID = Leave it blank (its optional)
Placement ID = "As Per the G-sheet Provided"
eCPM: As Per the G-sheet Provided
Custom Parameters = {"placementName":"As Per the G-sheet Provided"}
```

4. Click on “Save” and save the configuration.

{% hint style="info" %}
**MAX → Mediation → Manage Ad Units → Select Ad Unit → Select TapMind → Enter Placement ID → Enter eCPM → Enter Custom Parameters → Save**
{% endhint %}

{% include "../../../.gitbook/includes/doc-tag-applovin.md" %}

The above setup completes our **TapMind x Applovin** integration. You should see an Ad if test setup is complete and working fine.
