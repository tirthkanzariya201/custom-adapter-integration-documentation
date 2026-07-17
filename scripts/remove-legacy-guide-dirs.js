/**
 * Removes legacy guide directories after slug migration.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const guidesDir = path.join(rootDir, 'guides');

const LEGACY_DIRS = [
  'android/custom-adapter',
  'android/next-gen',
  'ios/custom-adapter',
  'flutter/custom-adapter',
  'react-native/custom-adapter',
  'unity/custom-adapter',
  'cocos/custom-adapter',
];

function rmDirRecursive(dir) {
  if (!fs.existsSync(dir)) return false;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) rmDirRecursive(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(dir);
  return true;
}

for (const rel of LEGACY_DIRS) {
  const full = path.join(guidesDir, rel);
  if (rmDirRecursive(full)) {
    console.log('Removed:', rel);
  }
}

const nativeNextGen = path.join(guidesDir, 'native', 'next-gen.mdx');
if (fs.existsSync(nativeNextGen)) {
  fs.unlinkSync(nativeNextGen);
  console.log('Removed: native/next-gen.mdx');
}
