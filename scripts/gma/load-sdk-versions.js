const fs = require('fs');
const path = require('path');

const SDK_VERSIONS_PATH = path.join(__dirname, '..', '..', 'sdk-versions.json');

function loadSdkVersions() {
  return JSON.parse(fs.readFileSync(SDK_VERSIONS_PATH, 'utf8'));
}

module.exports = { loadSdkVersions, SDK_VERSIONS_PATH };
