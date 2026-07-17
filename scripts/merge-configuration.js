/**
 * Reversible merged Configuration sections (Android + iOS) — Option C.
 *
 * Shared steps once; platform differences in highlighted Callouts.
 *
 * ENABLED by default for Custom Adapter GMA / AdMob.
 * To DISABLE and restore separate Android + iOS sections:
 *   Run: MERGE_CONFIG_ADMOB_GMA=0 node scripts/build-wrapper-product-guides.js
 */

const MERGE_ADMOB_GMA_CONFIGURATION =
  process.env.MERGE_CONFIG_ADMOB_GMA === '1';

const MERGE_RULES = [
  {
    id: 'admob-gma',
    product: 'custom-adapter',
    network: 'admob',
    enabled: () => MERGE_ADMOB_GMA_CONFIGURATION,
  },
];

function extractAdapterClass(body) {
  const match = body.match(/Class\s*:\s*([^\n`]+)/);
  return match ? match[1].trim() : '';
}

/**
 * Option C — inline shared flow + prominent platform callouts (AdMob GMA).
 */
function mergeAdmobGmaConfiguration(androidBody, iosBody) {
  const androidClass = extractAdapterClass(androidBody);
  const iosClass = extractAdapterClass(iosBody);

  return `<Callout type="warning">
**Read this first — Android vs iOS**

This section covers **both** platforms in one flow. Follow the **highlighted boxes** below and pick the line that matches **your** build target (**Android** or **iOS**). All other steps are the same for both.
</Callout>

**CREATING CUSTOM EVENTS FOR WATERFALL**

1. Under the **Mediation** tab : Click on **Create Mediation group** section
2. Select your target platform and ad format, then Continue — see the platform box below
3. In the Name field : Type in as provided in the **G-sheet**
4. Click on **Add ad units**
5. Select the app and the Ad units that you want to use custom targeting on.

<Callout type="warning">
**Android or iOS — mediation group (Step 2)**

- **Android app:** Select **Android**, then choose your ad format and Continue
- **iOS app:** Select **IOS**, then choose your ad format and Continue
</Callout>

<Callout type="info">
**Add Custom Event** → **Create Mediation Group** → **Select Android or IOS** → **Add Name** → **Add Ad units** → **Select app and Ad units**
</Callout>

**AD SOURCES (WATERFALL SECTION)**

1. Click on Water fall source
2. Click on Setup ad Source and then at the Bottom left Click on custom event
3. Select the App for the setup — see the platform box below
4. Select ad unit and add the parameters as follows

<Callout type="warning">
**Android or iOS — waterfall app (Step 3)**

- **Android app:** Select the App for the setup **(Android)**
- **iOS app:** Select the App for the setup **(IOS)**
</Callout>

For the Below details Please reach out TapMind Account Manger

<Callout type="warning">
**Android or iOS — custom event class**

Use the same mapping name, eCPM, and parameter for both platforms. **Only the Class value changes:**

- **Android:** \`${androidClass}\`
- **iOS:** \`${iosClass}\`

\`\`\`
Mapping name : As Per the G-sheet Provided
ecpm : As Per the G-sheet Provided
Class : (use the value for your platform above)
Parameter : { "placementName": "As Per the G-sheet Provided" }
\`\`\`
</Callout>

<Callout type="info">
**Ad Sources → Add Custom Event → Enter Label → Set eCPM → Add Mapping → Enter Mapping Name → Enter Class Name → Add Parameter**
</Callout>

The above setup completes our **TapMind x ADMOB** integration. You should see an Ad if test setup is complete and working fine.

<DocTagAdmobGam />

<Callout type="info">
Official Google Documentation for creating a custom event : [https://support.google.com/admob/answer/13407144](https://support.google.com/admob/answer/13407144)
</Callout>`;
}

function shouldMergeConfiguration(productKey, networkKey) {
  const rule = MERGE_RULES.find(
    (r) => r.product === productKey && r.network === networkKey && r.enabled(),
  );
  return rule ? rule.id : null;
}

function mergeConfiguration(mergeId, androidBody, iosBody) {
  if (mergeId === 'admob-gma') {
    return mergeAdmobGmaConfiguration(androidBody, iosBody);
  }
  throw new Error(`Unknown merge configuration id: ${mergeId}`);
}

function getMergeStatus() {
  return MERGE_RULES.filter((r) => r.enabled()).map(
    (r) => `${r.product}/${r.network} (option-c)`,
  );
}

module.exports = {
  MERGE_ADMOB_GMA_CONFIGURATION,
  shouldMergeConfiguration,
  mergeConfiguration,
  mergeAdmobGmaConfiguration,
  getMergeStatus,
};
