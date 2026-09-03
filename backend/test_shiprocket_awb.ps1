# Automated Test Script for Shiprocket Serviceability and AWB Assignment (Step 4 - TEST ONLY)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Step 4: Shiprocket Serviceability & AWB Assignment (TEST)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://127.0.0.1:5000/api/test/shiprocket"
$allPassed = $true

# -----------------------------------------------------------------------------
# Test 1: Serviceability Check
# -----------------------------------------------------------------------------
Write-Host "`n[Test 1] Querying Courier Serviceability (PIN: 226001, Weight: 1kg)..." -ForegroundColor Yellow

$servUrl = "$baseUrl/serviceability?delivery_pincode=226001&weight=1"
try {
  $servRes = Invoke-RestMethod -Uri $servUrl -Method GET -ContentType "application/json"
  
  Write-Host "[OK] PASSED: Serviceability retrieved successfully!" -ForegroundColor Green
  Write-Host "     Pickup Pincode: $($servRes.pickup_postcode)" -ForegroundColor Gray
  Write-Host "     Delivery Pincode: $($servRes.delivery_postcode)" -ForegroundColor Gray
  Write-Host "     Couriers Found: $($servRes.couriers_count)" -ForegroundColor Green
  Write-Host "     Recommended Courier ID: $($servRes.recommended_courier_company_id)" -ForegroundColor Green
  
  Write-Host "`nAvailable Courier Partners:" -ForegroundColor Cyan
  foreach ($c in $servRes.couriers) {
    Write-Host "  - ID: $($c.courier_company_id) | Name: $($c.courier_name) | Rate: Rs $($c.rate) | ETD: $($c.etd) | Rating: $($c.rating)" -ForegroundColor White
  }

  $selectedCourierId = $servRes.recommended_courier_company_id
  if (-not $selectedCourierId -and $servRes.couriers.Count -gt 0) {
    $selectedCourierId = $servRes.couriers[0].courier_company_id
  }

  # -----------------------------------------------------------------------------
  # Test 2: AWB Assignment
  # -----------------------------------------------------------------------------
  Write-Host "`n[Test 2] Testing AWB Assignment for Shipment 1555086694 using Courier ID $selectedCourierId..." -ForegroundColor Yellow

  $awbBody = @{
    shipment_id = 1555086694
    courier_company_id = $selectedCourierId
  } | ConvertTo-Json

  try {
    $awbRes = Invoke-RestMethod -Uri "$baseUrl/assign-awb" -Method POST -Body $awbBody -ContentType "application/json"
    Write-Host "[OK] PASSED: AWB assigned successfully!" -ForegroundColor Green
    Write-Host "     AWB Code: $($awbRes.shiprocket.awb_code)" -ForegroundColor Green
    Write-Host "     Courier: $($awbRes.shiprocket.courier_name)" -ForegroundColor Green
    Write-Host "     Status: $($awbRes.shiprocket.status)" -ForegroundColor Green
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP Status: $status" -ForegroundColor Yellow
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errBody = $reader.ReadToEnd()
    Write-Host "Shiprocket Response: $errBody" -ForegroundColor Gray
    
    # Check that error response is clean and safe
    if ($errBody -match "token|password|Bearer" -and -not ($errBody -match "No API token")) {
      Write-Host "[SECURITY ALERT] Secret token or password leaked in error response!" -ForegroundColor Red
      $allPassed = $false
    } else {
      Write-Host "[OK] PASSED: Error response is clean and does not expose secrets." -ForegroundColor Green
    }
  }

} catch {
  Write-Host "[FAIL] Serviceability request failed: $($_.Exception.Message)" -ForegroundColor Red
  $allPassed = $false
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
  Write-Host "STEP 4 VERIFICATION COMPLETED SAFELY" -ForegroundColor Green
} else {
  Write-Host "STEP 4 REPORTED ISSUES" -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
