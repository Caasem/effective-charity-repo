# Muslim Philanthropy Network - API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

---

## Auth Endpoints

### POST /auth/register
Register a new donor
```json
{
  "email": "donor@example.com",
  "password": "secure_password",
  "firstName": "Ahmed",
  "lastName": "Said",
  "userType": "individual"
}
```

### POST /auth/login
Login and receive JWT token
```json
{
  "email": "donor@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "donor@example.com",
    "firstName": "Ahmed",
    "role": "donor"
  }
}
```

### POST /auth/logout
Logout (invalidate token)

---

## Initiative Endpoints

### GET /initiatives
List all initiatives with pagination and filters

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `category` (string): food, healthcare, shelter, education, etc
- `location` (string): country or region
- `search` (string): search title/description
- `sort` (string): latest, trending, funding, urgency

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Emergency Food Distribution - Sudan",
      "description": "...",
      "category": "food",
      "location": "Sudan",
      "fundingGoal": 50000,
      "fundingRaised": 37500,
      "fundingPercentage": 75,
      "donorCount": 1243,
      "urgency": "high",
      "status": "active",
      "organisation": {
        "id": "uuid",
        "name": "Islamic Relief",
        "logo": "url",
        "verified": true
      },
      "needs": [
        {
          "id": "uuid",
          "name": "Food Packages",
          "quantityRequired": 500,
          "quantityFulfilled": 325,
          "unit": "packs"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### GET /initiatives/:id
Get single initiative with full details

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Emergency Food Distribution - Sudan",
    "description": "...",
    "category": "food",
    "location": "Sudan",
    "country": "Sudan",
    "coordinates": {
      "lat": 15.5527,
      "lng": 32.5599
    },
    "fundingGoal": 50000,
    "fundingRaised": 37500,
    "donorCount": 1243,
    "urgency": "high",
    "startDate": "2024-09-01",
    "endDate": "2024-12-31",
    "status": "active",
    "organisation": {
      "id": "uuid",
      "name": "Islamic Relief",
      "verified": true,
      "rating": 4.8
    },
    "needs": [
      {
        "id": "uuid",
        "name": "Food Packages",
        "quantityRequired": 500,
        "quantityFulfilled": 325
      }
    ],
    "evidence": [
      {
        "id": "uuid",
        "type": "photo",
        "url": "...",
        "title": "Distribution Day 1",
        "verified": true
      }
    ],
    "impactUpdates": [
      {
        "id": "uuid",
        "title": "Week 1 Summary",
        "content": "...",
        "publishedAt": "2024-09-08"
      }
    ]
  }
}
```

---

## Donation Endpoints

### POST /donations
Create a new donation

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "initiativeId": "uuid",
  "amount": 100.00,
  "givingType": "sadaqah",
  "paymentMethod": "stripe",
  "stripePaymentIntentId": "pi_xxx",
  "isAnonymous": false,
  "isPublic": true,
  "email": "donor@example.com"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "amount": 100.00,
    "currency": "GBP",
    "givingType": "sadaqah",
    "status": "completed",
    "receiptUrl": "...",
    "createdAt": "2024-09-10T14:23:00Z"
  }
}
```

### GET /donations/history
Get donation history for authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "initiative": {
        "id": "uuid",
        "title": "Emergency Food Distribution - Sudan"
      },
      "amount": 100.00,
      "givingType": "sadaqah",
      "status": "completed",
      "createdAt": "2024-09-10"
    }
  ],
  "stats": {
    "totalDonated": 4250.00,
    "initiativeCount": 8,
    "memberSince": "2024-03-15"
  }
}
```

---

## Payments - Stripe Integration

### POST /payments/create-payment-intent
Create a Stripe payment intent for a donation

**Body:**
```json
{
  "amount": 10000, // in pence
  "currency": "gbp",
  "initiativeId": "uuid"
}
```

**Response:**
```json
{
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "publishableKey": "pk_test_xxx"
  }
}
```

### POST /payments/webhook
Stripe webhook for payment confirmations
(Automatically updates donation status)

---

## User Endpoints

### GET /users/profile
Get authenticated user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "email": "donor@example.com",
    "firstName": "Ahmed",
    "lastName": "Said",
    "avatar": "url",
    "role": "donor",
    "stats": {
      "totalDonated": 4250.00,
      "initiativeCount": 8,
      "memberSince": "2024-03-15"
    }
  }
}
```

### PUT /users/profile
Update user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Said",
  "phone": "+44...",
  "location": "London, UK",
  "avatar": "url"
}
```

---

## Search & Recommendations

### GET /search
Global search across initiatives and charities

**Query Parameters:**
- `q` (string): search query
- `type` (string): initiative, charity, all

**Response:**
```json
{
  "data": {
    "initiatives": [...],
    "charities": [...]
  }
}
```

### GET /recommendations
Get recommended initiatives for authenticated user

Based on:
- Past donations
- Categories of interest
- Geographic preference

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input",
  "details": { "field": "error message" }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Initiatives, donations, user profiles
- Stripe payment integration
- JWT authentication
