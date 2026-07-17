# Preview Native Android single-page navigation POC locally.
# Does NOT deploy. Restores production docs.json on exit (Ctrl+C or normal stop).

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$backup = Join-Path $root "docs.json.production-backup"
$pocNav = Join-Path $root "docs.native-android-poc.json"
$pocPage = Join-Path $root "tapmind-custom-adapter-sdk-integration/native-android-engine/integration-guide.poc.mdx"

if (-not (Test-Path $pocNav)) { throw "Missing docs.native-android-poc.json" }
if (-not (Test-Path $pocPage)) {
    Write-Host "Building POC page..."
    node (Join-Path $root "scripts/build-native-android-poc.js")
}

Copy-Item (Join-Path $root "docs.json") $backup -Force
Copy-Item $pocNav (Join-Path $root "docs.json") -Force

Write-Host ""
Write-Host "POC preview active. Open:"
Write-Host "  http://localhost:3456/tapmind-custom-adapter-sdk-integration/native-android-engine/integration-guide.poc"
Write-Host ""
Write-Host "Left sidebar: Native-Android tab -> single 'Native Android' page"
Write-Host "Right sidebar: TOC from H2/H3 headings (desktop 1280px+)"
Write-Host ""
Write-Host "Press Ctrl+C to stop. Production docs.json will be restored."
Write-Host ""

try {
    jamdesk dev --no-open --port 3456
}
finally {
    if (Test-Path $backup) {
        Copy-Item $backup (Join-Path $root "docs.json") -Force
        Remove-Item $backup -Force
        Write-Host "Restored production docs.json"
    }
}
