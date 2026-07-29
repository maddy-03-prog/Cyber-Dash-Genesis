# Cyber Dash: Genesis Automated Deployment Verification Script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " CYBER DASH: GENESIS - AUTOMATED DEPLOYMENT AUDIT " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $baseDir) { $baseDir = Get-Location }
$frontendDir = Join-Path $baseDir "frontend"
$backendDir = Join-Path $baseDir "backend"

$script:issuesFound = 0
$script:filesChecked = 0

function Test-FilePresence ($path, $description) {
    $script:filesChecked++
    if (Test-Path $path) {
        Write-Host "[OK] $description found: $path" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL 404] $description MISSING: $path" -ForegroundColor Red
        $script:issuesFound++
        return $false
    }
}

# 1. Verify Core HTML Files
Write-Host "--- 1. Checking HTML Pages ---" -ForegroundColor Yellow
Test-FilePresence "$frontendDir\index.html" "Frontend index.html"
Test-FilePresence "$frontendDir\404.html" "Frontend 404.html"
Test-FilePresence "$frontendDir\offline.html" "Frontend offline.html"

# 2. Verify Stylesheets
Write-Host "`n--- 2. Checking CSS Stylesheets ---" -ForegroundColor Yellow
Test-FilePresence "$frontendDir\css\theme.css" "Frontend theme.css"
Test-FilePresence "$frontendDir\css\style.css" "Frontend style.css"
Test-FilePresence "$frontendDir\css\landing.css" "Frontend landing.css"
Test-FilePresence "$frontendDir\css\responsive.css" "Frontend responsive.css"

# 3. Verify JavaScript Modules (All 29 Modules)
Write-Host "`n--- 3. Checking JavaScript Modules (29 Modules) ---" -ForegroundColor Yellow
$jsModules = @(
    "api.js", "constants.js", "storage.js", "audio.js", "input.js", "particle.js",
    "progression.js", "combat.js", "drone_pet.js", "stagethemes.js", "story.js",
    "grade.js", "worldmap.js", "npc.js", "hq.js", "customizer.js",
    "player.js", "coop_ai.js", "multiplayer.js", "enemy.js", "obstacle.js",
    "boss.js", "powerup.js", "world.js", "ui.js", "devmode.js",
    "game.js", "main.js", "landing.js"
)

foreach ($js in $jsModules) {
    Test-FilePresence "$frontendDir\js\$js" "JS Module $js"
}

# 4. Verify Backend & PWA Configs
Write-Host "`n--- 4. Checking Netlify, Backend & PWA Configs ---" -ForegroundColor Yellow
Test-FilePresence "$baseDir\netlify.toml" "Root netlify.toml"
Test-FilePresence "$frontendDir\_redirects" "Frontend _redirects"
Test-FilePresence "$frontendDir\manifest.json" "Frontend manifest.json"
Test-FilePresence "$frontendDir\sw.js" "Frontend sw.js"
Test-FilePresence "$frontendDir\robots.txt" "Frontend robots.txt"
Test-FilePresence "$frontendDir\sitemap.xml" "Frontend sitemap.xml"
Test-FilePresence "$backendDir\server.js" "Backend server.js"
Test-FilePresence "$backendDir\package.json" "Backend package.json"

# 5. Verify HTML Links & Script Tags in index.html
Write-Host "`n--- 5. Verifying HTML Script & Link References ---" -ForegroundColor Yellow
$indexContent = Get-Content "$frontendDir\index.html" -Raw

$scriptRegex = '<script\s+src="([^"]+)">'
$scriptMatches = [regex]::Matches($indexContent, $scriptRegex)

foreach ($match in $scriptMatches) {
    $src = $match.Groups[1].Value
    if ($src.StartsWith("http://") -or $src.StartsWith("https://")) {
        Write-Host "[OK] Remote CDN script: $src" -ForegroundColor Green
    } else {
        $localPath = Join-Path $frontendDir ($src -replace '/', '\')
        Test-FilePresence $localPath "Local script reference ($src)" | Out-Null
    }
}

$linkRegex = '<link\s+[^>]*href="([^"]+)"'
$linkMatches = [regex]::Matches($indexContent, $linkRegex)

foreach ($match in $linkMatches) {
    $href = $match.Groups[1].Value
    # Strip query parameters like ?v=1.0.1
    $cleanHref = ($href -split '\?')[0]
    if ($cleanHref.StartsWith("http://") -or $cleanHref.StartsWith("https://")) {
        Write-Host "[OK] Remote link reference: $href" -ForegroundColor Green
    } else {
        $localPath = Join-Path $frontendDir ($cleanHref -replace '/', '\')
        Test-FilePresence $localPath "Local stylesheet/asset reference ($href)" | Out-Null
    }
}

# Summary
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host " AUDIT SUMMARY " -ForegroundColor Cyan
Write-Host " Total Files Checked: $script:filesChecked" -ForegroundColor White
if ($script:issuesFound -eq 0) {
    Write-Host " Total Issues Found: $script:issuesFound (PASS - PRODUCTION READY)" -ForegroundColor Green
} else {
    Write-Host " Total Issues Found: $script:issuesFound (FAIL - REPAIR NEEDED)" -ForegroundColor Red
}
Write-Host "==================================================" -ForegroundColor Cyan
