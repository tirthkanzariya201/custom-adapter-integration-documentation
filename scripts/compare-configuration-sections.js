const fs = require('fs');
const path = require('path');

function strip(t) {
  return t
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/^import\s+.+$/gm, '')
    .replace(/<DocTag\w+\s*\/>/g, 'SNIPPET')
    .replace(/<Info>|<\/Info>|<Callout[^>]*>|<\/Callout>/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, 'IMAGE')
    .replace(/com\.tapmind\.[^\s`"]+/g, 'CLASS')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(raw) {
  const classMatch = raw.match(/com\.tapmind\.[^\s`"]+/);
  const headings = [...raw.matchAll(/\*\*([^*]{4,80})\*\*/g)].map((m) => m[1].trim());
  const hasPrereq = /PREREQUISITES|Ad Unit must already/i.test(raw);
  const hasWaterfall = /WATERFALL|Yield Group|Custom Network|Levelplay|Instances/i.test(raw);
  const snippet = raw.match(/<DocTag(\w+)/)?.[1] || 'none';
  return {
    className: classMatch?.[0] || 'none',
    headings: headings.slice(0, 6),
    hasPrereq,
    hasWaterfall,
    snippet,
    wordCount: strip(raw).split(' ').length,
  };
}

function compareEngine(rootDir, eng) {
  const nets = ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'];
  const bodies = {};
  for (const n of nets) {
    const f = path.join(rootDir, eng, n, 'configuration.mdx');
    if (fs.existsSync(f)) bodies[n] = fs.readFileSync(f, 'utf8');
  }
  const present = Object.keys(bodies);
  if (!present.length) return null;

  const meta = {};
  for (const n of present) meta[n] = extractMeta(bodies[n]);

  const identicalGroups = [];
  const used = new Set();
  for (const a of present) {
    if (used.has(a)) continue;
    const group = [a];
    used.add(a);
    for (const b of present) {
      if (used.has(b)) continue;
      if (strip(bodies[a]) === strip(bodies[b])) {
        group.push(b);
        used.add(b);
      }
    }
    identicalGroups.push(group);
  }

  return { eng, present, meta, identicalGroups, bodies };
}

function reportProduct(label, rootDir) {
  console.log(`\n${'='.repeat(60)}\n${label}\n${'='.repeat(60)}`);
  const engines = fs
    .readdirSync(rootDir)
    .filter((d) => d.endsWith('-engine') && fs.statSync(path.join(rootDir, d)).isDirectory())
    .sort();

  for (const eng of engines) {
    const r = compareEngine(rootDir, eng);
    if (!r || r.present.length < 2) continue;
    console.log(`\n--- ${eng} ---`);
    console.log(`Networks: ${r.present.join(', ')}`);
    console.log(`Identical groups (after stripping imports/snippets): ${r.identicalGroups.map((g) => g.join('=')).join(' | ') || 'none'}`);
    for (const n of r.present) {
      const m = r.meta[n];
      console.log(`  ${n}:`);
      console.log(`    class: ${m.className}`);
      console.log(`    snippet: DocTag${m.snippet}`);
      console.log(`    words: ${m.wordCount}`);
      console.log(`    sections: ${m.headings.join(' → ')}`);
    }
  }
}

reportProduct('Custom Adapter GMA SDK', 'tapmind-custom-adapter-sdk-integration');
reportProduct('Custom Adapter Next-Gen SDK (native-android only in nav)', 'next-gen-sdk-integration/next-gen-integration-sdk/native-android-engine'.replace(/[/\\][^/\\]+$/, ''));

// Next-gen only native-android
const ng = compareEngine('next-gen-sdk-integration/next-gen-integration-sdk', 'native-android-engine');
if (ng) {
  console.log('\n--- next-gen native-android-engine (detail) ---');
  for (const n of ng.present) {
    console.log(`  ${n}: class ${ng.meta[n].className}, ${ng.meta[n].wordCount} words`);
  }
  console.log('  admob vs gam stripped equal:', strip(ng.bodies.admob) === strip(ng.bodies['google-ad-manager']));
}

// Cross-OS: same network android vs ios
console.log(`\n${'='.repeat(60)}\nCross-OS (same network, Android vs iOS config)\n${'='.repeat(60)}`);
const root = 'tapmind-custom-adapter-sdk-integration';
for (const wrapper of ['native', 'unity', 'flutter', 'cocos']) {
  for (const n of ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay']) {
    const a = path.join(root, `${wrapper}-android-engine`, n, 'configuration.mdx');
    const i = path.join(root, `${wrapper}-ios-engine`, n, 'configuration.mdx');
    if (!fs.existsSync(a) || !fs.existsSync(i)) continue;
    const same = strip(fs.readFileSync(a, 'utf8')) === strip(fs.readFileSync(i, 'utf8'));
    if (!same) {
      const ma = extractMeta(fs.readFileSync(a, 'utf8'));
      const mi = extractMeta(fs.readFileSync(i, 'utf8'));
      console.log(`${wrapper} ${n}: DIFFERENT (android class: ${ma.className}, ios class: ${mi.className})`);
    } else {
      console.log(`${wrapper} ${n}: IDENTICAL android/ios`);
    }
  }
}
