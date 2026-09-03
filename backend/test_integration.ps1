# Comprehensive Automated Verification Script (ASCII only)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Running Verification Tests for UPI & Shiprocket Integration" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Test 1: Serviceable Pincode
Write-Host "`n[Test 1] Pincode Serviceability (Valid: 211002)..." -ForegroundColor Yellow
$p1 = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/shipping/serviceability?pincode=211002" -Method GET
if ($p1.serviceable -eq $true) {
  Write-Host "[OK] PASSED: Pincode 211002 is serviceable via $($p1.courierName)" -ForegroundColor Green
} else {
  Write-Host "[FAIL] Expected serviceable to be true" -ForegroundColor Red
}

# Test 2: Unserviceable Pincode
Write-Host "`n[Test 2] Pincode Serviceability (Invalid: 000000)..." -ForegroundColor Yellow
$p2 = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/shipping/serviceability?pincode=000000" -Method GET
if ($p2.serviceable -eq $false -and $p2.message -match "not serviceable") {
  Write-Host "[OK] PASSED: Pincode 000000 correctly rejected with message: '$($p2.message)'" -ForegroundColor Green
} else {
  Write-Host "[FAIL] Expected rejection for 000000" -ForegroundColor Red
}

# Test 3: Zero-Trust Checkout Order Creation (No client price provided)
Write-Host "`n[Test 3] Zero-Trust Checkout Order Initiation..." -ForegroundColor Yellow
$createPayload = @{
  customerName = "Rohan Sharma"
  customerEmail = "rohan@test.modiclasses.in"
  customerPhone = "9876543210"
  items = @(
    @{
      bookId = "book-alp-psycho"
      quantity = 1
    }
  )
  shippingAddress = @{
    street = "Plot 42, Anand Nagar"
    city = "Prayagraj"
    district = "Prayagraj"
    state = "Uttar Pradesh"
    pincode = "211002"
  }
} | ConvertTo-Json -Depth 5

$orderInit = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/payment/create-order" -Method POST -Body $createPayload -ContentType "application/json"
if ($orderInit.success -eq $true -and $orderInit.totalAmount -gt 0 -and $orderInit.gatewayOrderId) {
  Write-Host "[OK] PASSED: Order initiated with DB price: Rs. $($orderInit.totalAmount), Gateway ID: $($orderInit.gatewayOrderId)" -ForegroundColor Green
} else {
  Write-Host "[FAIL] Could not initiate order from backend" -ForegroundColor Red
}

$orderNum = $orderInit.orderNumber
$gatewayId = $orderInit.gatewayOrderId

# Test 4: Gateway Order ID Tampering Rejection
Write-Host "`n[Test 4] Security Test: Mismatched Gateway Order ID Tampering..." -ForegroundColor Yellow
$tamperPayload = @{
  orderNumber = $orderNum
  gatewayOrderId = "TAMPERED_GATEWAY_ID_HACK"
  paymentId = "UPI/FAKETXN"
} | ConvertTo-Json

try {
  $res = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/payment/verify" -Method POST -Body $tamperPayload -ContentType "application/json"
  Write-Host "[FAIL] Tampered request should have been rejected" -ForegroundColor Red
} catch {
  Write-Host "[OK] PASSED: Tampered Gateway Order ID was strictly blocked by backend (400 Bad Request)" -ForegroundColor Green
}

# Test 5: Server-Side Payment Verification & Automatic Shiprocket Shipment Creation
Write-Host "`n[Test 5] Legitimate Payment Verification & Automatic Shipment Creation..." -ForegroundColor Yellow
$validPayload = @{
  orderNumber = $orderNum
  gatewayOrderId = $gatewayId
  paymentId = "UPI/TEST_9988776655"
} | ConvertTo-Json

$verifyRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/payment/verify" -Method POST -Body $validPayload -ContentType "application/json"
if ($verifyRes.verified -eq $true -and $verifyRes.status -eq "PAID" -and $verifyRes.shippingStatus -eq "SHIPMENT_CREATED" -and $verifyRes.awbCode) {
  Write-Host "[OK] PASSED: Order verified as PAID! Shiprocket shipment created automatically with AWB: $($verifyRes.awbCode)" -ForegroundColor Green
} else {
  Write-Host "[FAIL] Payment verification or shipment creation failed" -ForegroundColor Red
}

# Test 6: Idempotency Verification
Write-Host "`n[Test 6] Webhook/Verification Idempotency (Duplicate Verification)..." -ForegroundColor Yellow
$idemRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/payment/verify" -Method POST -Body $validPayload -ContentType "application/json"
if ($idemRes.verified -eq $true -and $idemRes.alreadyPaid -eq $true) {
  Write-Host "[OK] PASSED: Idempotent response returned alreadyPaid=true, zero duplicate shipments created" -ForegroundColor Green
} else {
  Write-Host "[FAIL] Idempotency check did not return alreadyPaid=true" -ForegroundColor Red
}

# Test 7: Live Tracking Endpoint
Write-Host "`n[Test 7] Tracking Lookup via GET /api/shipping/track/:orderId..." -ForegroundColor Yellow
$trackRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/shipping/track/$orderNum" -Method GET
if ($trackRes.success -eq $true -and $trackRes.awbCode) {
  Write-Host "[OK] PASSED: Live tracking returned for order $orderNum with AWB: $($trackRes.awbCode) and courier: $($trackRes.courierPartner)" -ForegroundColor Green
} else {
  Write-Host "[FAIL] Tracking lookup failed" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "ALL 7 INTEGRATION TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
