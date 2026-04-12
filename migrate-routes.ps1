# Route Rename Migration Script
# This script performs all route renames for RESTful best practices
# Usage: Run from project root directory

$ErrorActionPreference = "Stop"
$clientSrc = "client\src"

Write-Host "=== Route Rename Migration ===" -ForegroundColor Cyan

# Step 1: Delete dead routes
Write-Host "`n[1/4] Deleting dead routes..." -ForegroundColor Yellow
$deadRoutes = @(
    "$clientSrc\routes\tim-penyusun\sop-saya.tsx",
    "$clientSrc\routes\tim-penyusun\daftar-sop.tsx",
    "$clientSrc\routes\tim-penyusun\initiate-proyek.tsx"
)

foreach ($route in $deadRoutes) {
    if (Test-Path $route) {
        Remove-Item $route -Force
        Write-Host "  Deleted: $route" -ForegroundColor Green
    }
}

# Step 2: Rename route files
Write-Host "`n[2/4] Renaming route files..." -ForegroundColor Yellow

$routeRenames = @{
    # Tim Penyusun
    "$clientSrc\routes\tim-penyusun\manajemen-sop.tsx" = "$clientSrc\routes\tim-penyusun\sop.tsx"
    "$clientSrc\routes\tim-penyusun\pelaksana-sop.tsx" = "$clientSrc\routes\tim-penyusun\pelaksana.tsx"
    "$clientSrc\routes\tim-penyusun\detail-sop.`$id.tsx" = "$clientSrc\routes\tim-penyusun\sop.`$id.tsx"
    "$clientSrc\routes\tim-penyusun\koordinator\ttd-elektronik.tsx" = "$clientSrc\routes\tim-penyusun\koordinator\tte.tsx"
    
    # Kepala OPD
    "$clientSrc\routes\kepala-opd\pantau-sop.tsx" = "$clientSrc\routes\kepala-opd\sop.tsx"
    "$clientSrc\routes\kepala-opd\detail-sop.`$id.tsx" = "$clientSrc\routes\kepala-opd\sop.`$id.tsx"
    "$clientSrc\routes\kepala-opd\ttd-elektronik.tsx" = "$clientSrc\routes\kepala-opd\tte.tsx"
    
    # Biro Organisasi
    "$clientSrc\routes\biro-organisasi\grafik-evaluasi-tahunan.tsx" = "$clientSrc\routes\biro-organisasi\grafik-evaluasi.tsx"
    "$clientSrc\routes\biro-organisasi\manajemen-opd.tsx" = "$clientSrc\routes\biro-organisasi\opd.tsx"
    "$clientSrc\routes\biro-organisasi\manajemen-tim-penyusun.tsx" = "$clientSrc\routes\biro-organisasi\tim-penyusun.tsx"
    "$clientSrc\routes\biro-organisasi\manajemen-tim-evaluasi.tsx" = "$clientSrc\routes\biro-organisasi\tim-evaluasi.tsx"
    "$clientSrc\routes\biro-organisasi\manajemen-evaluasi-sop\route.tsx" = "$clientSrc\routes\biro-organisasi\evaluasi\route.tsx"
    "$clientSrc\routes\biro-organisasi\manajemen-evaluasi-sop\index.tsx" = "$clientSrc\routes\biro-organisasi\evaluasi\index.tsx"
    "$clientSrc\routes\biro-organisasi\manajemen-evaluasi-sop\detail.`$id.tsx" = "$clientSrc\routes\biro-organisasi\evaluasi\`$id.tsx"
    "$clientSrc\routes\biro-organisasi\ttd-elektronik.tsx" = "$clientSrc\routes\biro-organisasi\tte.tsx"
    "$clientSrc\routes\biro-organisasi\detail-sop.`$id.tsx" = "$clientSrc\routes\biro-organisasi\sop.`$id.tsx"
    
    # Tim Evaluasi
    "$clientSrc\routes\tim-evaluasi\evaluasi\route.tsx" = "$clientSrc\routes\tim-evaluasi\penilaian\route.tsx"
    "$clientSrc\routes\tim-evaluasi\evaluasi\index.tsx" = "$clientSrc\routes\tim-evaluasi\penilaian\index.tsx"
    "$clientSrc\routes\tim-evaluasi\evaluasi\opd.`$opdId.tsx" = "$clientSrc\routes\tim-evaluasi\penilaian\`$opdId.tsx"
}

foreach ($entry in $routeRenames.GetEnumerator()) {
    $oldPath = $entry.Key
    $newPath = $entry.Value
    
    if (Test-Path $oldPath) {
        # Create parent directory if needed
        $parentDir = Split-Path $newPath -Parent
        if (!(Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
        
        Move-Item $oldPath $newPath -Force
        Write-Host "  Renamed: $oldPath -> $newPath" -ForegroundColor Green
    }
}

# Step 3: Rename page directories
Write-Host "`n[3/4] Renaming page directories..." -ForegroundColor Yellow

$dirRenames = @{
    # Tim Penyusun
    "$clientSrc\pages\tim-penyusun\manajemen-sop" = "$clientSrc\pages\tim-penyusun\sop"
    "$clientSrc\pages\tim-penyusun\pelaksana-sop" = "$clientSrc\pages\tim-penyusun\pelaksana"
    "$clientSrc\pages\tim-penyusun\detail-sop" = "$clientSrc\pages\tim-penyusun\sop-detail"
    
    # Kepala OPD
    "$clientSrc\pages\kepala-opd\pantau-sop" = "$clientSrc\pages\kepala-opd\sop"
    "$clientSrc\pages\kepala-opd\detail-sop" = "$clientSrc\pages\kepala-opd\sop-detail"
    "$clientSrc\pages\kepala-opd\ttd-elektronik" = "$clientSrc\pages\kepala-opd\tte"
    
    # Biro Organisasi
    "$clientSrc\pages\biro-organisasi\grafik-evaluasi-tahunan" = "$clientSrc\pages\biro-organisasi\grafik-evaluasi"
    "$clientSrc\pages\biro-organisasi\manajemen-opd" = "$clientSrc\pages\biro-organisasi\opd"
    "$clientSrc\pages\biro-organisasi\manajemen-tim-penyusun" = "$clientSrc\pages\biro-organisasi\tim-penyusun"
    "$clientSrc\pages\biro-organisasi\manajemen-tim-evaluasi" = "$clientSrc\pages\biro-organisasi\tim-evaluasi"
    "$clientSrc\pages\biro-organisasi\manajemen-evaluasi-sop" = "$clientSrc\pages\biro-organisasi\evaluasi"
    "$clientSrc\pages\biro-organisasi\ttd-elektronik" = "$clientSrc\pages\biro-organisasi\tte"
    "$clientSrc\pages\biro-organisasi\detail-sop" = "$clientSrc\pages\biro-organisasi\sop-detail"
    
    # Tim Evaluasi
    "$clientSrc\pages\tim-evaluasi\evaluasi" = "$clientSrc\pages\tim-evaluasi\penilaian"
}

foreach ($entry in $dirRenames.GetEnumerator()) {
    $oldPath = $entry.Key
    $newPath = $entry.Value
    
    if (Test-Path $oldPath) {
        Move-Item $oldPath $newPath -Force
        Write-Host "  Renamed: $oldPath -> $newPath" -ForegroundColor Green
    }
}

Write-Host "`n=== Migration Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update all ROUTES.* references in your code editor" -ForegroundColor White
Write-Host "2. Run: cd client && npm run build" -ForegroundColor White
Write-Host "3. Fix any remaining import errors" -ForegroundColor White
Write-Host ""
Write-Host "Constant mapping:" -ForegroundColor White
Write-Host "  MANAJEMEN_SOP -> SOP" -ForegroundColor Gray
Write-Host "  PELAKSANA (pelaksana-sop) -> PELAKSANA (pelaksana)" -ForegroundColor Gray
Write-Host "  KOORDINATOR_TTD -> KOORDINATOR_TTE" -ForegroundColor Gray
Write-Host "  PANTAU_SOP -> SOP" -ForegroundColor Gray
Write-Host "  TTD -> TTE" -ForegroundColor Gray
Write-Host "  GRAFIK_EVALUASI_TAHUNAN -> GRAFIK_EVALUASI" -ForegroundColor Gray
Write-Host "  MANAJEMEN_OPD -> OPD" -ForegroundColor Gray
Write-Host "  MANAJEMEN_TIM_PENYUSUN -> TIM_PENYUSUN" -ForegroundColor Gray
Write-Host "  MANAJEMEN_TIM_EVALUASI -> TIM_EVALUASI" -ForegroundColor Gray
Write-Host "  MANAJEMEN_EVALUASI_SOP -> EVALUASI" -ForegroundColor Gray
Write-Host "  DETAIL_EVALUASI -> DETAIL_EVALUASI (path changed)" -ForegroundColor Gray
Write-Host "  EVALUASI -> PENILAIAN" -ForegroundColor Gray
Write-Host "  DETAIL_EVALUASI_OPD -> DETAIL_PENILAIAN_OPD" -ForegroundColor Gray
