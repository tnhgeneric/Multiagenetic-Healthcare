param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('local', 'preview')]
    [string]$Mode
)

$appJsonPath = Join-Path $PSScriptRoot "..\app.json"
$appConfigPath = Join-Path $PSScriptRoot "..\app.config.js"

# Backup files if they don't exist
$appJsonBackup = Join-Path $PSScriptRoot "..\app.json.backup"
$appConfigBackup = Join-Path $PSScriptRoot "..\app.config.js.backup"

if (-not (Test-Path $appJsonBackup)) {
    Copy-Item $appJsonPath $appJsonBackup
    Write-Host "Created backup of app.json"
}
if (-not (Test-Path $appConfigBackup)) {
    Copy-Item $appConfigPath $appConfigBackup
    Write-Host "Created backup of app.config.js"
}

function Update-JsonConfig {
    param([string]$mode)
    
    $jsonContent = Get-Content $appJsonPath -Raw | ConvertFrom-Json
    
    if ($mode -eq 'local') {
        # Remove EAS project ID for local development
        $jsonContent.expo.extra.PSObject.Properties.Remove('eas')
    }
    else {
        # Add EAS project ID for preview build
        $jsonContent.expo.extra | Add-Member -NotePropertyName 'eas' -NotePropertyValue @{
            projectId = "02f6bd36-17ba-45cd-bc53-09ee53642672"
        } -Force
    }
    
    $jsonContent | ConvertTo-Json -Depth 10 | Set-Content $appJsonPath
}

function Update-AppConfig {
    param([string]$mode)
    
    $configContent = Get-Content $appConfigPath -Raw
    
    if ($mode -eq 'local') {
        # Comment out EAS config for local development
        $configContent = $configContent -replace '(\s+)eas:\s*{[\s\S]*?projectId:\s*["\']84aac15a-f152-4b01-b164-c2f7488e6948["\'][\s\S]*?}',
            '$1// EAS config commented out for local development
$1// eas: {
$1//   projectId: "84aac15a-f152-4b01-b164-c2f7488e6948"
$1// }'
    }
    else {
        # Restore EAS config for preview build
        $configContent = $configContent -replace '(\s+)//\s*EAS config commented out for local development[\s\S]*?//\s*}',
            '$1eas: {
$1  projectId: "84aac15a-f152-4b01-b164-c2f7488e6948"
$1}'
    }
    
    Set-Content $appConfigPath $configContent
}

try {
    Write-Host "Switching to $Mode configuration..."
    
    Update-JsonConfig -mode $Mode
    Write-Host "Updated app.json"
    
    Update-AppConfig -mode $Mode
    Write-Host "Updated app.config.js"
    
    if ($Mode -eq 'local') {
        Write-Host "`nConfiguration set for local development. You can now run: npx expo start"
    }
    else {
        Write-Host "`nConfiguration set for preview build. You can now run: eas build --profile preview --platform android"
    }
    
    # Clear Metro cache
    $metroCachePath = Join-Path $env:TEMP "metro-*"
    Remove-Item -Path $metroCachePath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cleared Metro cache"
}
catch {
    Write-Host "An error occurred: $_"
    Write-Host "`nRestoring from backup..."
    
    if (Test-Path $appJsonBackup) {
        Copy-Item $appJsonBackup $appJsonPath -Force
    }
    if (Test-Path $appConfigBackup) {
        Copy-Item $appConfigBackup $appConfigPath -Force
    }
    
    Write-Host "Restored from backup"
    exit 1
}