const fs = require('fs');
const path = require('path');

const PRODUCTS = [
  {
    key: 'custom-adapter-gma',
    root: 'tapmind-custom-adapter-sdk-integration',
  },
  {
    key: 'custom-adapter-next-gen',
    root: path.join('next-gen-sdk-integration', 'next-gen-integration-sdk'),
  },
];

const WRAPPERS = ['native', 'unity', 'flutter', 'cocos'];
const NETWORKS = ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'];

function readConfig(root, engine, network) {
  for (const ext of ['mdx', 'md']) {
    const f = path.join(root, engine, network, `configuration.${ext}`);
    if (fs.existsSync(f)) {
      const raw = fs.readFileSync(f, 'utf8');
      const body = raw.replace(/^---[\s\S]*?---\n?/, '').replace(/^import\s+.+$/gm, '').trim();
      return { file: f, body, raw };
    }
  }
  return null;
}

function normalizeForCompare(body) {
  return body
    .replace(/\r\n/g, '\n')
    .replace(/<Info>|<\/Info>|<Callout[^>]*>|<\/Callout>/g, '')
    .replace(/<DocTag\w+\s*\/>/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '[IMAGE]')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function classifyLineDiff(a, b) {
  const rules = [
    { tag: 'platform', re: /\b(Android|ANDROID|IOS|iOS)\b/i },
    { tag: 'class-name', re: /(com\.tapmind\.|TapMindMediationAdapter|TapMindAdmobAdapter|TapMindGamAdapter|Android Class|IOS Class|iOS Class|Class Name|Class :)/i },
    { tag: 'doc-link', re: /https?:\/\// },
    { tag: 'snippet-order', re: /DocTag/ },
    { tag: 'prerequisite', re: /PREREQUISITE|Ad Unit must already/i },
    { tag: 'testing', re: /Testing instructions|LOGCAT|test mode/i },
    { tag: 'network-key', re: /Network Key|15c101ba1/i },
    { tag: 'completion-text', re: /completes our \*\*TapMind/i },
  ];
  for (const { tag, re } of rules) {
    if (re.test(a) || re.test(b)) return tag;
  }
  return 'other';
}

function diffLines(androidLines, iosLines) {
  const max = Math.max(androidLines.length, iosLines.length);
  const diffs = [];
  for (let i = 0; i < max; i++) {
    const a = androidLines[i] || '';
    const b = iosLines[i] || '';
    if (a !== b) {
      diffs.push({
        line: i + 1,
        android: a.slice(0, 160),
        ios: b.slice(0, 160),
        category: classifyLineDiff(a, b),
      });
    }
  }
  return diffs;
}

function summarizeDiffs(diffs) {
  const cats = {};
  for (const d of diffs) {
    cats[d.category] = (cats[d.category] || 0) + 1;
  }
  return cats;
}

function extractFields(body) {
  const platform = body.match(/Platform\s*:\s*(\w+)/i)?.[1];
  const androidClass = body.match(/Android Class:\s*([^\n]+)/i)?.[1]?.trim();
  const iosClass = body.match(/(?:IOS|iOS) Class:\s*([^\n]+)/i)?.[1]?.trim();
  const classLine = body.match(/Class\s*:\s*([^\n]+)/)?.[1]?.trim();
  const className = body.match(/Class Name\s*:\s*([^\n]+)/i)?.[1]?.trim();
  return { platform, androidClass, iosClass, classLine, className };
}

const results = [];
const mediationPatterns = {};

for (const product of PRODUCTS) {
  for (const wrapper of WRAPPERS) {
    for (const network of NETWORKS) {
      const androidEngine = `${wrapper}-android-engine`;
      const iosEngine = `${wrapper}-ios-engine`;
      const a = readConfig(product.root, androidEngine, network);
      const i = readConfig(product.root, iosEngine, network);
      if (!a && !i) continue;
      if (!a || !i) {
        results.push({
          product: product.key,
          wrapper,
          network,
          status: 'missing-side',
          hasAndroid: Boolean(a),
          hasIos: Boolean(i),
        });
        continue;
      }

      const aLines = normalizeForCompare(a.body);
      const iLines = normalizeForCompare(i.body);
      const identical = aLines.join('\n') === iLines.join('\n');
      const diffs = identical ? [] : diffLines(aLines, iLines);
      const categories = summarizeDiffs(diffs);

      const androidFields = extractFields(a.body);
      const iosFields = extractFields(i.body);

      const entry = {
        product: product.key,
        wrapper,
        network,
        status: identical ? 'identical' : 'different',
        androidWords: a.body.split(/\s+/).length,
        iosWords: i.body.split(/\s+/).length,
        diffCount: diffs.length,
        categories,
        sampleDiffs: diffs.slice(0, 8),
        androidFields,
        iosFields,
      };
      results.push(entry);

      const key = `${product.key}::${network}`;
      if (!mediationPatterns[key]) {
        mediationPatterns[key] = { identical: 0, different: 0, categoryTotals: {}, wrappers: [] };
      }
      mediationPatterns[key][identical ? 'identical' : 'different']++;
      mediationPatterns[key].wrappers.push({ wrapper, status: entry.status, diffCount: entry.diffCount });
      for (const [cat, n] of Object.entries(categories)) {
        mediationPatterns[key].categoryTotals[cat] = (mediationPatterns[key].categoryTotals[cat] || 0) + n;
      }
    }
  }
}

const reportPath = path.join(__dirname, 'configuration-android-ios-diff-report.json');
fs.writeFileSync(reportPath, JSON.stringify({ results, mediationPatterns }, null, 2));

console.log('CONFIGURATION ANDROID vs iOS — FULL REPORT\n');

for (const product of PRODUCTS) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(product.key.toUpperCase());
  console.log('='.repeat(70));
  const subset = results.filter((r) => r.product === product.key);
  for (const r of subset) {
    if (r.status === 'missing-side') {
      console.log(`\n[${r.wrapper}/${r.network}] SKIP — android:${r.hasAndroid} ios:${r.hasIos}`);
      continue;
    }
    console.log(`\n[${r.wrapper}/${r.network}] ${r.status.toUpperCase()} (${r.diffCount} line diffs, ${r.androidWords}/${r.iosWords} words)`);
    if (r.status === 'different') {
      console.log('  Categories:', JSON.stringify(r.categories));
      if (r.androidFields.classLine || r.androidFields.className || r.androidFields.androidClass) {
        console.log('  Android class fields:', JSON.stringify(r.androidFields));
      }
      if (r.iosFields.classLine || r.iosFields.className || r.iosFields.iosClass) {
        console.log('  iOS class fields:', JSON.stringify(r.iosFields));
      }
      for (const d of r.sampleDiffs.slice(0, 4)) {
        console.log(`  L${d.line} [${d.category}]`);
        console.log(`    A: ${d.android}`);
        console.log(`    I: ${d.ios}`);
      }
    }
  }
}

console.log(`\n\n${'='.repeat(70)}`);
console.log('MEDIATION-LEVEL SUMMARY (all wrappers combined)');
console.log('='.repeat(70));
for (const [key, pat] of Object.entries(mediationPatterns)) {
  console.log(`\n${key}`);
  console.log(`  identical wrappers: ${pat.identical}, different: ${pat.different}`);
  console.log(`  wrappers: ${pat.wrappers.map((w) => `${w.wrapper}(${w.status}${w.diffCount ? ',' + w.diffCount + ' diffs' : ''})`).join(', ')}`);
  console.log(`  diff categories: ${JSON.stringify(pat.categoryTotals)}`);
}
