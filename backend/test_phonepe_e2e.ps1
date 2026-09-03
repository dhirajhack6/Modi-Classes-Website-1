# End-to-End Test Script: PhonePe ₹499 Payment Verification & Controlled Shiprocket Dispatch
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "PhonePe ₹499 Payment & Controlled Shiprocket Dispatch Test" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://127.0.0.1:5000/api/test/phonepe"
$allPassed = $true

# -----------------------------------------------------------------------------
# STEP 1: Initiate Controlled Test Order MC-PHONEPE-TEST-001 for ₹499
# -----------------------------------------------------------------------------
Write-Host "`n[Step 1] Initiating Test Order MC-PHONEPE-TEST-001 (₹499)..." -ForegroundColor Yellow

try {
  $initRes = Invoke-RestMethod -Uri "$baseUrl/initiate-test-order" -Method POST -ContentType "application/json"
  if ($initRes.success -and $initRes.totalAmount -eq 499 -and $initRes.orderNumber -eq "MC-PHONEPE-TEST-001") {
    Write-Host "[OK] PASSED: Test order initiated for ₹499." -ForegroundColor Green
    Write-Host "     Order Number: $($initRes.orderNumber)" -ForegroundColor Gray
    Write-Host "     Amount: ₹$($initRes.totalAmount)" -ForegroundColor Gray
    Write-Host "     Gateway Order ID: $($initRes.gatewayOrderId)" -ForegroundColor Gray
    Write-Host "     Payment Method: $($initRes.paymentMethod)" -ForegroundColor Gray
    Write-Host "     COD Enabled: $($initRes.codEnabled)" -ForegroundColor Gray
  } else {
    Write-Host "[FAIL] Order initiation response invalid: $($initRes | ConvertTo-Json -Compress)" -ForegroundColor Red
    $allPassed = $false
  }
} catch {
  Write-Host "[FAIL] Order initiation failed: $($_.Exception.Message)" -ForegroundColor Red
  $allPassed = $false
}

# -----------------------------------------------------------------------------
# STEP 2: Negative Test - Amount Mismatch (e.g. ₹498, ₹500)
# -----------------------------------------------------------------------------
Write-Host "`n[Step 2] Testing Negative Scenario: Amount Mismatch (₹498 instead of ₹499)..." -ForegroundColor Yellow

$mismatchPayload = @{
  orderNumber = "MC-PHONEPE-TEST-001"
  reportedAmountRupees = 498
  transactionId = "TXN_MISMATCH_498"
} | ConvertTo-Json

try {
  $mismatchRes = Invoke-RestMethod -Uri "$baseUrl/verify-and-fulfill" -Method POST -Body $mismatchPayload -ContentType "application/json"
  Write-Host "[FAIL] Security Violation: Amount mismatch ₹498 was incorrectly accepted!" -ForegroundColor Red
  $allPassed = $false
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  if ($status -eq 400) {
    Write-Host "[OK] PASSED: Backend correctly rejected ₹498 with HTTP 400 Bad Request." -ForegroundColor Green
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errBody = $reader.ReadToEnd()
    Write-Host "     Rejection Reason: $errBody" -ForegroundColor Gray
  } else {
    Write-Host "[FAIL] Unexpected error status: $status" -ForegroundColor Red
    $allPassed = $false
  }
}

# Verify order is still PAYMENT_PENDING and no Shiprocket order exists
try {
  $checkRes = Invoke-RestMethod -Uri "$baseUrl/test-order-status?orderNumber=MC-PHONEPE-TEST-001" -Method GET
  if ($checkRes.order.paymentStatus -eq "PAYMENT_PENDING" -and -not $checkRes.order.shiprocketOrderId) {
    Write-Host "[OK] PASSED: Order remains PAYMENT_PENDING. Zero Shiprocket orders created." -ForegroundColor Green
  } else {
    Write-Host "[FAIL] Order state was prematurely modified!" -ForegroundColor Red
    $allPassed = $false
  }
} catch {
  Write-Host "[FAIL] Status check failed: $($_.Exception.Message)" -ForegroundColor Red
  $allPassed = $false
}

# -----------------------------------------------------------------------------
# STEP 3: Genuine ₹499 Payment Verification & Controlled Shiprocket Trigger
# -----------------------------------------------------------------------------
Write-Host "`n[Step 3] Genuine Payment Verification (₹499) & Shiprocket Order Creation..." -ForegroundColor Yellow

$validPayload = @{
  orderNumber = "MC-PHONEPE-TEST-001"
  reportedAmountRupees = 499
  transactionId = "TXN_PHONEPE_SUCCESS_991"
} | ConvertTo-Json

try {
  $fulfillRes = Invoke-RestMethod -Uri "$baseUrl/verify-and-fulfill" -Method POST -Body $validPayload -ContentType "application/json"
  
  if ($fulfillRes.success -and $fulfillRes.order.paymentStatus -eq "PAID") {
    Write-Host "[OK] PASSED: Payment verified and updated to PAID." -ForegroundColor Green
    Write-Host "     Payment Transaction ID: $($fulfillRes.order.paymentTransactionId)" -ForegroundColor Gray
    Write-Host "     Payment Verified At: $($fulfillRes.order.paymentVerifiedAt)" -ForegroundColor Gray
    Write-Host "     Fulfillment Status: $($fulfillRes.order.fulfillmentStatus)" -ForegroundColor Green
    Write-Host "     Shiprocket Order ID: $($fulfillRes.order.shiprocketOrderId)" -ForegroundColor Green
    Write-Host "     Shiprocket Shipment ID: $($fulfillRes.order.shiprocketShipmentId)" -ForegroundColor Green
    
    # Strictly verify that AWB and Pickup were NOT generated
    if (-not $fulfillRes.order.awbCode -and -not $fulfillRes.order.pickupStatus) {
      Write-Host "[OK] PASSED: Zero AWB assigned and zero pickup requested (Controlled test scope maintained)." -ForegroundColor Green
    } else {
      Write-Host "[FAIL] Scope violation: AWB or pickup was automatically triggered!" -ForegroundColor Red
      $allPassed = $false
    }
  } else {
    Write-Host "[FAIL] Payment verification/fulfillment failed: $($fulfillRes.message)" -ForegroundColor Red
    $allPassed = $false
  }
} catch {
  Write-Host "[FAIL] Verification request error: $($_.Exception.Message)" -ForegroundColor Red
  $allPassed = $false
}

# -----------------------------------------------------------------------------
# STEP 4: Idempotency Verification (Re-send payment verification)
# -----------------------------------------------------------------------------
Write-Host "`n[Step 4] Testing Idempotency (Duplicate Verification Callback)..." -ForegroundColor Yellow

try {
  $replayRes = Invoke-RestMethod -Uri "$baseUrl/verify-and-fulfill" -Method POST -Body $validPayload -ContentType "application/json"
  
  if ($replayRes.success -and $replayRes.alreadyProcessed -eq $true) {
    Write-Host "[OK] PASSED: Idempotent replay recognized. No duplicate order created." -ForegroundColor Green
    Write-Host "     Same Shiprocket Order ID: $($replayRes.order.shiprocketOrderId)" -ForegroundColor Gray
    Write-Host "     Same Shipment ID: $($replayRes.order.shiprocketShipmentId)" -ForegroundColor Gray
  } else {
    Write-Host "[FAIL] Idempotency check failed: $($replayRes | ConvertTo-Json -Compress)" -ForegroundColor Red
    $allPassed = $false
  }
} catch {
  Write-Host "[FAIL] Idempotency request failed: $($_.Exception.Message)" -ForegroundColor Red
  $allPassed = $false
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
  Write-Host "ALL PHONEPE END-TO-END TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
} else {
  Write-Host "TESTS COMPLETED WITH ISSUES." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
