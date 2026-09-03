# Automated Test Script for Shiprocket Temporary Test Endpoint
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Testing POST /api/test/shiprocket/order Endpoint" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$endpoint = "http://127.0.0.1:5000/api/test/shiprocket/order"
$allPassed = $true

# -----------------------------------------------------------------------------
# Test 1: Standard Valid Payload (Exact user-requested structure)
# -----------------------------------------------------------------------------
Write-Host "`n[Test 1] Standard Valid Order Payload..." -ForegroundColor Yellow

$validPayload = @{
  order_id = "MC-TEST-001"
  customer = @{
    first_name = "Test"
    last_name = "Customer"
    email = "test@example.com"
    phone = "9999999999"
  }
  shipping_address = @{
    address = "Test Address"
    city = "Lucknow"
    state = "Uttar Pradesh"
    pincode = "226001"
    country = "India"
  }
  product = @{
    name = "Modi Classes Book"
    sku = "MODI-BOOK-001"
    quantity = 1
    price = 499
  }
  package = @{
    weight = 1
    length = 30
    breadth = 22
    height = 3
  }
} | ConvertTo-Json -Depth 6

try {
  $res1 = Invoke-RestMethod -Uri $endpoint -Method POST -Body $validPayload -ContentType "application/json"
  if ($res1.success -eq $true -and $res1.mode -eq "TEST" -and $res1.payload.sub_total -eq 499 -and $res1.payload.payment_method -eq "Prepaid" -and $res1.payload.pickup_location -eq "work") {
    Write-Host "[OK] PASSED: Generated valid TEST payload with pickup_location = '$($res1.payload.pickup_location)', sub_total = $($res1.payload.sub_total)" -ForegroundColor Green
    Write-Host "     Payload order_id: $($res1.payload.order_id)" -ForegroundColor Gray
    Write-Host "     Billing name: $($res1.payload.billing_customer_name) $($res1.payload.billing_last_name)" -ForegroundColor Gray
    Write-Host "     Dimensions: $($res1.payload.length)x$($res1.payload.breadth)x$($res1.payload.height) cm, $($res1.payload.weight) kg" -ForegroundColor Gray
  } else {
    Write-Host "[FAIL] Response did not match expected structure." -ForegroundColor Red
    $allPassed = $false
  }
} catch {
  Write-Host "[FAIL] Exception during Test 1: $($_.Exception.Message)" -ForegroundColor Red
  $allPassed = $false
}

# -----------------------------------------------------------------------------
# Test 2: Zero-Trust Backend Subtotal Calculation (2 units * 499 = 998, client passes fake total)
# -----------------------------------------------------------------------------
Write-Host "`n[Test 2] Zero-Trust Calculation (Client passes 2 units, fake total 10)..." -ForegroundColor Yellow

$calcPayload = @{
  order_id = "MC-TEST-002"
  customer = @{
    first_name = "Test"
    last_name = "Customer"
    email = "test@example.com"
    phone = "9999999999"
  }
  shipping_address = @{
    address = "Test Address"
    city = "Lucknow"
    state = "Uttar Pradesh"
    pincode = "226001"
    country = "India"
  }
  product = @{
    name = "Modi Classes Book"
    sku = "MODI-BOOK-001"
    quantity = 2
    price = 499
  }
  package = @{
    weight = 1
    length = 30
    breadth = 22
    height = 3
  }
  # Client trying to inject a fake total
  total = 10
  sub_total = 10
} | ConvertTo-Json -Depth 6

try {
  $res2 = Invoke-RestMethod -Uri $endpoint -Method POST -Body $calcPayload -ContentType "application/json"
  if ($res2.success -eq $true -and $res2.payload.sub_total -eq 998) {
    Write-Host "[OK] PASSED: Backend correctly computed sub_total = 998 (2 * 499) and ignored client-supplied total" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] Subtotal calculation mismatch. Received: $($res2.payload.sub_total)" -ForegroundColor Red
    $allPassed = $false
  }
} catch {
  Write-Host "[FAIL] Exception during Test 2: $($_.Exception.Message)" -ForegroundColor Red
  $allPassed = $false
}

# -----------------------------------------------------------------------------
# Test 3: Validation Error - Invalid Indian Pincode (e.g. 000000)
# -----------------------------------------------------------------------------
Write-Host "`n[Test 3] Validation Error Handling: Invalid Pincode (000000)..." -ForegroundColor Yellow

$invalidPinPayload = @{
  order_id = "MC-TEST-003"
  customer = @{
    first_name = "Test"
    email = "test@example.com"
    phone = "9999999999"
  }
  shipping_address = @{
    address = "Test Address"
    city = "Lucknow"
    state = "Uttar Pradesh"
    pincode = "000000"
    country = "India"
  }
  product = @{
    name = "Modi Classes Book"
    sku = "MODI-BOOK-001"
    quantity = 1
    price = 499
  }
  package = @{
    weight = 1
    length = 30
    breadth = 22
    height = 3
  }
} | ConvertTo-Json -Depth 6

try {
  $null = Invoke-RestMethod -Uri $endpoint -Method POST -Body $invalidPinPayload -ContentType "application/json"
  Write-Host "[FAIL] Expected HTTP 400 Bad Request, but request succeeded." -ForegroundColor Red
  $allPassed = $false
} catch {
  $resp = $_.Exception.Response
  if ($resp.StatusCode.value__ -eq 400) {
    Write-Host "[OK] PASSED: Correctly returned HTTP 400 Bad Request for invalid Indian pincode" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] Expected HTTP 400 but got status code: $($resp.StatusCode.value__)" -ForegroundColor Red
    $allPassed = $false
  }
}

# -----------------------------------------------------------------------------
# Test 4: Validation Error - Invalid Phone Number (e.g. 12345)
# -----------------------------------------------------------------------------
Write-Host "`n[Test 4] Validation Error Handling: Invalid Phone (12345)..." -ForegroundColor Yellow

$invalidPhonePayload = @{
  order_id = "MC-TEST-004"
  customer = @{
    first_name = "Test"
    email = "test@example.com"
    phone = "12345"
  }
  shipping_address = @{
    address = "Test Address"
    city = "Lucknow"
    state = "Uttar Pradesh"
    pincode = "226001"
    country = "India"
  }
  product = @{
    name = "Modi Classes Book"
    sku = "MODI-BOOK-001"
    quantity = 1
    price = 499
  }
  package = @{
    weight = 1
    length = 30
    breadth = 22
    height = 3
  }
} | ConvertTo-Json -Depth 6

try {
  $null = Invoke-RestMethod -Uri $endpoint -Method POST -Body $invalidPhonePayload -ContentType "application/json"
  Write-Host "[FAIL] Expected HTTP 400 Bad Request, but request succeeded." -ForegroundColor Red
  $allPassed = $false
} catch {
  $resp = $_.Exception.Response
  if ($resp.StatusCode.value__ -eq 400) {
    Write-Host "[OK] PASSED: Correctly returned HTTP 400 Bad Request for invalid phone number" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] Expected HTTP 400 but got status code: $($resp.StatusCode.value__)" -ForegroundColor Red
    $allPassed = $false
  }
}

# -----------------------------------------------------------------------------
# Test 5: Validation Error - Negative Quantity / Price
# -----------------------------------------------------------------------------
Write-Host "`n[Test 5] Validation Error Handling: Negative Product Quantity..." -ForegroundColor Yellow

$invalidQtyPayload = @{
  order_id = "MC-TEST-005"
  customer = @{
    first_name = "Test"
    email = "test@example.com"
    phone = "9999999999"
  }
  shipping_address = @{
    address = "Test Address"
    city = "Lucknow"
    state = "Uttar Pradesh"
    pincode = "226001"
    country = "India"
  }
  product = @{
    name = "Modi Classes Book"
    sku = "MODI-BOOK-001"
    quantity = -1
    price = 499
  }
  package = @{
    weight = 1
    length = 30
    breadth = 22
    height = 3
  }
} | ConvertTo-Json -Depth 6

try {
  $null = Invoke-RestMethod -Uri $endpoint -Method POST -Body $invalidQtyPayload -ContentType "application/json"
  Write-Host "[FAIL] Expected HTTP 400 Bad Request, but request succeeded." -ForegroundColor Red
  $allPassed = $false
} catch {
  $resp = $_.Exception.Response
  if ($resp.StatusCode.value__ -eq 400) {
    Write-Host "[OK] PASSED: Correctly returned HTTP 400 Bad Request for negative quantity" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] Expected HTTP 400 but got status code: $($resp.StatusCode.value__)" -ForegroundColor Red
    $allPassed = $false
  }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
  Write-Host "ALL SHIPROCKET TEST ENDPOINT TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
} else {
  Write-Host "SOME TESTS FAILED. PLEASE CHECK OUTPUT ABOVE." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
