const PLATFORM_VALUES_CALLOUT = `<Callout type="info">
**Platform-specific values**

The steps below apply to **both Android and iOS**. When copying adapter class names or platform-specific parameters, use the **Android** or **iOS** tab for your build target.
</Callout>

`;

function stripForCompare(body) {
  return body
    .replace(/<Callout[^>]*>[\s\S]*?<\/Callout>/g, '')
    .replace(/<DocTag\w+\s*\/>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function bodiesEquivalent(a, b) {
  return stripForCompare(a) === stripForCompare(b);
}

function neutralizePlatformText(body) {
  let out = body;
  out = out.replace(
    /Select \*\*Android\*\* and type of Ad format and Continue/gi,
    'Select **Android** or **iOS** (depending on your target platform) and type of Ad format and Continue',
  );
  out = out.replace(
    /Select \*\*IOS\*\* and type of Ad format and Continue/gi,
    'Select **Android** or **iOS** (depending on your target platform) and type of Ad format and Continue',
  );
  out = out.replace(
    /Select the App for the setup \(Android\)/gi,
    'Select the App for the setup (Android or iOS, depending on your target platform)',
  );
  out = out.replace(
    /Select the App for the setup \(IOS\)/gi,
    'Select the App for the setup (Android or iOS, depending on your target platform)',
  );
  out = out.replace(/\*\*Select Android\*\*(?= →)/g, '**Select Android or iOS**');
  out = out.replace(/→ \*\*Select Android\*\*/g, '→ **Select Android or iOS**');
  out = out.replace(/→ \*\*Select IOS\*\*/g, '→ **Select Android or iOS**');
  out = out.replace(/→ Select Android →/g, '→ Select Android or iOS →');
  out = out.replace(/→ Select IOS →/g, '→ Select Android or iOS →');
  out = out.replace(/Enter Android Class Name/g, 'Enter Class Name (Android or iOS)');
  out = out.replace(/Enter iOS Class Name/g, 'Enter Class Name (Android or iOS)');
  out = out.replace(/Platform \(Android\)/g, 'Platform (Android or iOS)');
  out = out.replace(/Platform \(IOS\)/g, 'Platform (Android or iOS)');
  return out;
}

function stripCodeFence(block) {
  return block.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '').trim();
}

function buildPlatformTabs(androidInner, iosInner) {
  return `<Tabs>
<Tab title="Android">

\`\`\`
${androidInner}
\`\`\`

</Tab>
<Tab title="iOS">

\`\`\`
${iosInner}
\`\`\`

</Tab>
</Tabs>`;
}

function mergeWrapperConfiguration(androidBody, iosBody, networkKey) {
  if (!androidBody && !iosBody) return { body: '', hasTabs: false };
  if (!iosBody) return { body: androidBody, hasTabs: false };
  if (!androidBody) return { body: iosBody, hasTabs: false };

  if (networkKey === 'levelplay' || bodiesEquivalent(androidBody, iosBody)) {
    return { body: androidBody, hasTabs: false };
  }

  const androidBlocks = [...androidBody.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]);
  const iosBlocks = [...iosBody.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]);

  let merged = neutralizePlatformText(androidBody);
  let hasTabs = false;

  for (let i = androidBlocks.length - 1; i >= 0; i--) {
    const aBlock = androidBlocks[i];
    const iBlock = iosBlocks[i];
    if (!iBlock) continue;
    const aInner = stripCodeFence(aBlock);
    const iInner = stripCodeFence(iBlock);
    if (aInner !== iInner) {
      merged = merged.replace(aBlock, buildPlatformTabs(aInner, iInner));
      hasTabs = true;
    }
  }

  if (hasTabs) {
    merged = `${PLATFORM_VALUES_CALLOUT}${merged}`;
  }

  return { body: merged, hasTabs };
}

module.exports = {
  mergeWrapperConfiguration,
  neutralizePlatformText,
  bodiesEquivalent,
};
