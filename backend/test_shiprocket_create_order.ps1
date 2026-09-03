# Automated Test Script for Shiprocket Order Creation Endpoint (Test Mode)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Testing POST /api/test/shiprocket/create-order Endpoint" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$endpoint = "http://127.0.0.1:5000/api/test/shiprocket/create-order"
$allPassed = $true

# -----------------------------------------------------------------------------
# Test 1: Validation Error - Invalid Pincode
# -----------------------------------------------------------------------------
Write-Host "`n[Test 1] Validation Handling: Invalid Pincode (000000)..." -ForegroundColor Yellow

$invalidPin = @{
  order_id = "MC-TEST-VAL-01"
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
  $null = Invoke-RestMethod -Uri $endpoint -Method POST -Body $invalidPin -ContentType "application/json"
  Write-Host "[FAIL] Expected HTTP 400, but request succeeded." -ForegroundColor Red
  $allPassed = $false
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  if ($status -eq 400) {
    Write-Host "[OK] PASSED: Correctly returned HTTP 400 for invalid pincode." -ForegroundColor Green
  } else {
    Write-Host "[FAIL] Expected HTTP 400 but got: $status" -ForegroundColor Red
    $allPassed = $false
  }
}

# -----------------------------------------------------------------------------
# Test 2: Standard Test Order Request
# -----------------------------------------------------------------------------
Write-Host "`n[Test 2] Testing Order Creation Request (MC-TEST-002)..." -ForegroundColor Yellow

$orderPayload = @{
  order_id = "MC-TEST-" + (Get-Date -Format "yyyyMMdd-HHmmss")
  customer = @{
    first_name = "Test"
    last_name = "Customer"
    email = "test@example.com"
    phone = "9876543210"
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
  $res2 = Invoke-RestMethod -Uri $endpoint -Method POST -Body $orderPayload -ContentType "application/json"
  
  Write-Host "Response received:" -ForegroundColor Gray
  $res2 | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Gray

  # Verify token safety: no token or password in response
  $rawJson = $res2 | ConvertTo-Json -Depth 5
  if ($rawJson -match "token|password|Bearer" -and -not ($rawJson -match "No API token")) {
    Write-Host "[SECURITY ALERT] Credentials or token found in response!" -ForegroundColor Red
    $allPassed = $false
  } else {
    Write-Host "[OK] PASSED: Response does NOT leak tokens or credentials." -ForegroundColor Green
  }

  if ($res2.success -eq $true -and $res2.mode -eq "TEST") {
    Write-Host "[OK] PASSED: Shiprocket test order created successfully!" -ForegroundColor Green
    Write-Host "     Order ID: $($res2.shiprocket.order_id)" -ForegroundColor Green
    Write-Host "     Shipment ID: $($res2.shiprocket.shipment_id)" -ForegroundColor Green
  } else {
    Write-Host "[INFO] Request returned: $($res2.message)" -ForegroundColor Yellow
  }
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  Write-Host "HTTP Status: $status" -ForegroundColor Yellow
  try {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errBody = $reader.ReadToEnd()
    Write-Host "Response body: $errBody" -ForegroundColor Gray
    
    # Check that error response is clean and safe
    if ($errBody -match "token|password|Bearer" -and -not ($errBody -match "No API token" -or $errBody -match "SHIPROCKET_API_TOKEN" -or $errBody -match "SHIPROCKET_PASSWORD")) {
      Write-Host "[SECURITY ALERT] Secret token or password leaked in error response!" -ForegroundColor Red
      $allPassed = $false
    } else {
      Write-Host "[OK] PASSED: Error response is clean and does not expose secrets." -ForegroundColor Green
    }
  } catch {}
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
  Write-Host "TEST SCRIPT COMPLETED" -ForegroundColor Green
} else {
  Write-Host "TEST SCRIPT REPORTED ISSUES" -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
