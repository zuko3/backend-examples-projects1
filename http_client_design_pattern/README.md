# HttpClient abstraction

This is a very important backend design concept, because once you understand why an HttpClient abstraction exists, you'll start seeing the same architectural idea everywhere: separate business logic from infrastructure/side effects.

# What problem are we actually solving?

Imagine your application needs to call several external services:

```
Your Backend
   │
   ├── Payment Service
   ├── Email Service
   ├── Shipping Service
   ├── User Service
   └── OpenAI API
```

You might write this everywhere:

```
OrderService
    ↓
Axios
    ↓
Payment API

---

UserService
    ↓
Axios
    ↓
User API

---

NotificationService
    ↓
Axios
    ↓
Email API
```

Why add another HttpClient layer? Because sending an HTTP request is different from carrying out a business operation.

# Think about the responsibility of each layer

OrderService "Create an order and charge the customer."

It should not need to care about:

- Axios
- HTTP headers
- timeouts
- retries
- authentication tokens
- logging
- tracing
- error normalization
- circuit breakers
- request IDs
- metrics
- connection configuration
- HTTP status codes
- Caching

Those are HTTP/infrastructure concerns.

So we separate them.

```
Business Logic
↓
HttpClient
↓
Axios
↓
Internet
```

The important idea is

- The (Business layer) says WHAT it wants to do.
- The (HTTP Infrastructure layer) handles HOW the HTTP request happens.

`Don't let your business logic know unnecessary details about the technology used to perform an operation.`

# The architecture in one picture

```
                     YOUR APPLICATION
┌────────────────────────────────────────────────────┐
│                                                    │
│   Controller                                       │
│       │                                            │
│       ▼                                            │
│   UserService                                      │
│       │                                            │
│       ▼                                            │
│   UserClient                                       │
│       │                                            │
│       ▼                                            │
│   HttpClient                                       │
│       │                                            │
│       ├── Timeout                                  │
│       ├── Retry                                    │
│       ├── Authentication                           │
│       ├── Logging                                  │
│       ├── Error normalization                      │
│       ├── Request ID                               │
│       └── Tracing                                  │
│       │                                            │
│       ▼                                            │
│     Axios                                          │
│       │                                            │
└───────┼────────────────────────────────────────────┘
        │
        ▼
   EXTERNAL API
```

# What we're building [DEMO PROJECT]

## Endpoint

```
GET /users/:id
```

## If User comes from an external API

```
HTTP Request
     ↓
Controller
     ↓
UserService
     ↓
UserClient
     ↓
HttpClient
     ↓
Axios
     ↓
External User API
```

## If User comes from your database

```
HTTP Request
     ↓
Controller
     ↓
UserService
     ↓
UserRepository
     ↓
PostgreSQL
```

## Folder structure

```
http-client-demo/
│
├── src/
│   │
│   ├── config/
│   │   └── env.js
│   │
│   ├── controllers/
│   │   └── user.controller.js
│   │
│   ├── clients/
│   │   └── user.client.js
│   │
│   ├── services/
│   │   └── user.service.js
│   │
├── http/
│   ├── http-client.js
│   ├── http-errors.js
│   └── retry.js
│   │
│   ├── routes/
│   │   └── user.routes.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Each folder has a clear purpose.

```
config       → configuration
controllers  → HTTP endpoints
services     → business logic
clients      → external API knowledge
http         → generic HTTP infrastructure
routes       → route definitions
```

# The easiest way to remember it

```
| -------------------------- | ------------------------------------- |
| Concern                    | Usually belongs to                    |
| -------------------------- | ------------------------------------- |
| Business rules             | **Service**                           |
| HTTP endpoint              | **Controller / Routes**               |
| External API URL           | **Client**                            |
| HTTP communication         | **HttpClient**                        |
| Axios                      | **HttpClient**                        |
| HTTP errors                | **HttpClient**                        |
| Error normalization        | **HttpClient / infrastructure**       |
| Timeout                    | **HttpClient**                        |
| Retry                      | **HttpClient / Retry component**      |
| Exponential backoff        | **Retry component**                   |
| Authentication headers     | **HttpClient / Auth component**       |
| HTTP logging               | **HttpClient / HTTP instrumentation** |
| Application logging        | **Service/Application**               |
| Request ID                 | **Middleware + HttpClient**           |
| Distributed tracing        | **Infrastructure / instrumentation**  |
| Metrics                    | **Infrastructure / instrumentation**  |
| External API rate limits   | **HttpClient / client**               |
| Incoming API rate limiting | **API middleware**                    |
| Circuit breaker            | **Infrastructure**                    |
| Response validation        | **Client**                            |
| Business validation        | **Service**                           |
| Database queries           | **Repository**                        |
| Database errors            | **Repository**                        |
| Caching                    | **Cache layer / Service**             |
| Environment variables      | **Config**                             |
| -------------------------- | ------------------------------------- |
```
