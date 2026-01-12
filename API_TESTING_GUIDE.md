# API Testing Guide

## Prerequisites
- **Base URL**: `https://domain.doofs.tech/api/v1`
- **API Key**: `doofs_live_mt4Emc3sUqeOebI7xCiryiHQyawljPZS` (This is your key from our session)

---

## Method 1: Testing with cURL (Terminal)

### 1. List Your Domains
Run this command in PowerShell or Terminal:
```powershell
curl.exe -X GET "https://domain.doofs.tech/api/v1/domains" -H "Authorization: Bearer doofs_live_mt4Emc3sUqeOebI7xCiryiHQyawljPZS"
```

### 2. Create a New Domain
Replace `my-app` with your desired subdomain:
```powershell
curl.exe -X POST "https://domain.doofs.tech/api/v1/domains" -H "Authorization: Bearer doofs_live_mt4Emc3sUqeOebI7xCiryiHQyawljPZS" -H "Content-Type: application/json" -d "{\"subdomain\": \"my-app-test\"}"
```
*(Note: Inner quotes are escaped with `\` for PowerShell)*

---

## Method 2: Testing with Postman

### 1. Setup Request
1. Open Postman.
2. Click **+** to create a new request tab.
3. Set the **Method** to `GET`.
4. Enter Request URL: `https://domain.doofs.tech/api/v1/domains`

### 2. Configure Authorization
1. Click on the **Auth** tab (below the URL bar).
2. Select **Type**: `Bearer Token`.
3. Paste your API Key in the **Token** field:
   `doofs_live_mt4Emc3sUqeOebI7xCiryiHQyawljPZS`

### 3. Send GET Request
1. Click the blue **Send** button.
2. You should see a JSON response in the body section below with your domains.

### 4. Create a Domain (POST) in Postman
1. Change **Method** to `POST`.
2. URL: `https://domain.doofs.tech/api/v1/domains`
3. Go to **Body** tab.
4. Select **raw** and then **JSON** from the dropdown (instead of Text).
5. Enter JSON:
   ```json
   {
     "subdomain": "postman-test"
   }
   ```
6. Click **Send**.
