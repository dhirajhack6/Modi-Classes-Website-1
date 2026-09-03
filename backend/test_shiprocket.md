# Modi Classes - Shiprocket Local Test Endpoint Documentation

## Overview
A temporary test endpoint has been created for local integration testing:

- **Endpoint**: `POST http://localhost:5000/api/test/shiprocket/order`
- **Purpose**: Validates test order data and generates the exact Shiprocket-compatible adhoc order creation payload.
- **Safety**: 
  - **Zero** external Shiprocket API calls are executed.
  - **Zero** shipments, AWBs, or pickups are scheduled.
  - **Zero** database modifications or order table inserts.
  - **Zero** credentials or secret tokens exposed.
  - Subtotal and order amounts are strictly computed by the backend.

---

## 1. Postman Instructions

1. Open Postman.
2. Click **Import** (top left) and select `backend/postman_shiprocket_test.json` from this repository.
3. Or manually create a new request:
   - **Method**: `POST`
   - **URL**: `http://localhost:5000/api/test/shiprocket/order`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body**: Select `raw` -> `JSON`, and paste:

```json
{
  "order_id": "MC-TEST-001",
  "customer": {
    "first_name": "Test",
    "last_name": "Customer",
    "email": "test@example.com",
    "phone": "9999999999"
  },
  "shipping_address": {
    "address": "Test Address",
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "pincode": "226001",
    "country": "India"
  },
  "product": {
    "name": "Modi Classes Book",
    "sku": "MODI-BOOK-001",
    "quantity": 1,
    "price": 499
  },
  "package": {
    "weight": 1,
    "length": 30,
    "breadth": 22,
    "height": 3
  }
}
```

---

## 2. cURL Example

```bash
curl -X POST http://localhost:5000/api/test/shiprocket/order \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "MC-TEST-001",
    "customer": {
      "first_name": "Test",
      "last_name": "Customer",
      "email": "test@example.com",
      "phone": "9999999999"
    },
    "shipping_address": {
      "address": "Test Address",
      "city": "Lucknow",
      "state": "Uttar Pradesh",
      "pincode": "226001",
      "country": "India"
    },
    "product": {
      "name": "Modi Classes Book",
      "sku": "MODI-BOOK-001",
      "quantity": 1,
      "price": 499
    },
    "package": {
      "weight": 1,
      "length": 30,
      "breadth": 22,
      "height": 3
    }
  }'
```

---

## 3. PowerShell Example

```powershell
$body = @{
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
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/test/shiprocket/order" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 6
```

---

## 4. Expected Responses

### Success Response (HTTP 200)

```json
{
  "success": true,
  "mode": "TEST",
  "message": "Shiprocket payload generated successfully. No real shipment was created.",
  "payload": {
    "order_id": "MC-TEST-001",
    "order_date": "2026-09-02 00:30",
    "pickup_location": "work",
    "channel_id": "",
    "comment": "Prepaid Order MC-TEST-001 - Modi Classes Book",
    "billing_customer_name": "Test",
    "billing_last_name": "Customer",
    "billing_address": "Test Address",
    "billing_address_2": "",
    "billing_city": "Lucknow",
    "billing_pincode": "226001",
    "billing_state": "Uttar Pradesh",
    "billing_country": "India",
    "billing_email": "test@example.com",
    "billing_phone": "9999999999",
    "shipping_is_billing": true,
    "order_items": [
      {
        "name": "Modi Classes Book",
        "sku": "MODI-BOOK-001",
        "units": 1,
        "selling_price": 499,
        "discount": 0,
        "tax": 0
      }
    ],
    "payment_method": "Prepaid",
    "shipping_charges": 0,
    "giftwrap_charges": 0,
    "transaction_charges": 0,
    "total_discount": 0,
    "sub_total": 499,
    "length": 30,
    "breadth": 22,
    "height": 3,
    "weight": 1
  }
}
```

### Validation Error Response (HTTP 400)

```json
{
  "success": false,
  "error": "Validation failed for test order payload.",
  "details": [
    "shipping_address.pincode must be a valid 6-digit Indian postal code (100000 - 999999)."
  ]
}
```

---

## 5. Live Test Order Creation Endpoint

- **Endpoint**: `POST http://localhost:5000/api/test/shiprocket/create-order`
- **Purpose**: Creates an adhoc test order directly in Shiprocket.
- **Safety**:
  - **No** courier partner assigned.
  - **No** AWB code generated.
  - **No** pickup request created.
  - **No** production orders or payment records modified.
  - Subtotal strictly computed by backend.
  - Duplicate order ID protection (e.g. `MC-TEST-002`).

### Example Request Body

```json
{
  "order_id": "MC-TEST-002",
  "customer": {
    "first_name": "Test",
    "last_name": "Customer",
    "email": "test@example.com",
    "phone": "9999999999"
  },
  "shipping_address": {
    "address": "Test Address",
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "pincode": "226001",
    "country": "India"
  },
  "product": {
    "name": "Modi Classes Book",
    "sku": "MODI-BOOK-001",
    "quantity": 1,
    "price": 499
  },
  "package": {
    "weight": 1,
    "length": 30,
    "breadth": 22,
    "height": 3
  }
}
```

### Expected Success Response (HTTP 200)

```json
{
  "success": true,
  "mode": "TEST",
  "message": "Shiprocket test order created successfully.",
  "shiprocket": {
    "order_id": "12345678",
    "shipment_id": "12345679",
    "status": "NEW",
    "status_code": 1
  }
}
```

### Expected Error Response (e.g. Missing Credentials or Auth Failure)

```json
{
  "success": false,
  "mode": "TEST",
  "message": "Shiprocket order creation failed.",
  "error": "Shiprocket credentials are not configured in backend/.env. Please configure SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD (or SHIPROCKET_API_TOKEN)."
}
```
