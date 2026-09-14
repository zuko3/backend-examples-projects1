# EVENT DRIVEN APPLICATION DESIGN

# Step Planing & Architecture

## 1. Phase 1 (Lean but Real)

```text
Client → Fastify API (Cloud Run)
          ↓
      Cloud SQL
          ↓
    Pub/Sub (events)
          ↓
Multiple Event Consumers
```

---

## 2. GCP Component Decisions (with reasoning)

### 🖥️ Compute

Use:
👉 **Cloud Run**

Why:

- Zero infra management
- Scales automatically
- Perfect for Fastify APIs

Avoid for now:

- GKE → overkill early
- Compute Engine → manual ops burden

---

### 🗄️ Database

Use:
👉 **Cloud SQL**

Why:

- You need transactions (orders, payments)
- Strong consistency for core data

---

### 🔄 Messaging

Use:
👉 **Google Cloud Pub/Sub**

Why:

- Native GCP event backbone
- Decouples services cleanly

---

### 📊 Monitoring

Use:

- **Google Cloud Logging**
- **Google Cloud Trace**
- **Google Cloud Monitoring**

Later:

- **Looker Studio**

---

## 3. System Responsibilities (Clean Separation)

### Core Service (Fastify API)

- Accept requests
- Validate input
- Store data
- Emit events

### Event Consumers

- Payment processor
- Inventory manager
- Notification sender

---

## 4. API DESIGN (Production-grade)

### Endpoint: Create Order

### `POST /orders`

### Request

```json
{
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": 2
    }
  ],
  "totalAmount": 500
}
```

---

### Response (sync)

```json
{
  "orderId": "ord_123",
  "status": "CREATED",
  "message": "Order created successfully"
}
```

👉 Important:
We do **NOT** process payment here.

---

### Endpoint: Get Order

### `GET /orders/:orderId`

### Response

```json
{
  "orderId": "ord_123",
  "userId": "u1",
  "status": "CREATED | PAYMENT_SUCCESS | PAYMENT_FAILED",
  "items": [...],
  "totalAmount": 500,
  "createdAt": "timestamp"
}
```

---

## 5. DATABASE DESIGN (Cloud SQL)

### orders table

```sql
id (PK)
user_id
status
total_amount
created_at
```

### order_items table

```sql
id
order_id (FK)
product_id
quantity
```

---

## 6. EVENT DESIGN (CRITICAL)

### Event: OrderCreated

```json
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "timestamp": "ISO",
  "data": {
    "orderId": "ord_123",
    "userId": "u1",
    "items": [...],
    "totalAmount": 500
  }
}
```

👉 Always wrap payload in:

- metadata
- data

---

## 7. PUB/SUB STRUCTURE

### Topic:

- `order-events`

### Subscriptions:

- `payment-service-sub`
- `inventory-service-sub`
- `notification-service-sub`

---

## 8. EVENT FLOW

```text
POST /orders
   ↓
Save to Cloud SQL
   ↓
Publish → OrderCreated (Pub/Sub)
   ↓
 ┌──────────────┬─────────────
 │              │             │
Payment     Inventory     Notification
Consumer     Consumer       Consumer
```

---

## 9. EVENT CONSUMERS (Design)

Each consumer:

- Runs as **Cloud Run service**
- Subscribes to Pub/Sub
- Processes independently

---

### Payment Consumer

Input: `OrderCreated`

Output events:

- `PaymentSucceeded`
- `PaymentFailed`

---

### Inventory Consumer

Input: `OrderCreated`

Output:

- `InventoryReserved`
- `InventoryFailed`

---

### Notification Consumer

Input:

- ALL events

Output:

- None (side-effect only)

---

## 10. FAILURE HANDLING (Basic Version)

Start simple:

- If consumer fails → Pub/Sub retries
- After retries → Dead Letter Queue (later phase)

---

## 11. LOGGING STRATEGY

Log at every step:

- API request received
- Order saved
- Event published
- Consumer received event
- Consumer success/failure

Use:
👉 **Google Cloud Logging**

---

## 12. WHAT YOU WILL BUILD (PHASE PLAN)

### Phase 1

- Fastify API
- POST /orders
- Save to DB
- Publish event to Pub/Sub

---

### Phase 2

- Build 1 consumer (Payment)
- Handle OrderCreated

---

### Phase 3

- Add Inventory + Notification

---

### Phase 4

- Add retries + error handling
- Add order status updates

---

### Phase 5

- Idempotency
- Dead letter queues

---

## 13. PROJECT STRUCTURE (API Service)

```text
src/
  controllers/
  services/
  repositories/
  events/
    publisher.ts
  infra/
    db.ts
    pubsub.ts
  schemas/
```

---

### 👉 Start with ONLY:

1. Fastify setup
2. POST /orders
3. Cloud SQL connection
4. Publish to Pub/Sub

---

# Installation

mkdir ecommerce-event-driven
cd ecommerce-event-driven
npm init -y

npm install fastify pg uuid @google-cloud/pubsub dotenv

---

# Folder Structure

```text
src/
  server.js
  app.js
  routes/
    order.routes.js
  controllers/
    order.controller.js
  services/
    order.service.js
  repositories/
    order.repository.js
  infra/
    db.js
    pubsub.js
  events/
    publisher.js
```

---

# SQL Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id TEXT,
  status TEXT,
  total_amount INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# Environment Variables

Create `.env`

```env
GCP_PROJECT_ID=your-project-id
```

---

# Test API

```bash
curl -X POST http://localhost:3000/orders \
-H "Content-Type: application/json" \
-d '{
  "userId": "u1",
  "items": [{"productId": "p1", "quantity": 2}],
  "totalAmount": 500
}'
```

---

# Expected Flow - mentall Model

```text
Request hits API
   ↓
Order saved in DB
   ↓
Event published to Pub/Sub
```

# Common Mistakes

- Topic `order-events` not created → publish fails
- GCP auth not set → Pub/Sub errors
- DB not running → insert fails

---

# Payment Consumer

A **Payment Service** that listens to `OrderCreated` events from **Google Cloud Pub/Sub**

```text id="p2_flow"
Client → Fastify API → Pub/Sub
                           ↓
                     OrderCreated
                           ↓
                 Payment Consumer → logs payment result
```

---

# Choose Subscription Mode (important decision)

We use:

👉 **Push Subscription → Cloud Run endpoint**

Why:

- No polling logic
- Fully managed
- Industry standard on GCP

# Simulate request Payment Consumer:

```bash id="p2_test"
curl -X POST http://localhost:8080/pubsub \
-H "Content-Type: application/json" \
-d '{
  "message": {
    "data": "'$(echo -n '{"eventType":"OrderCreated","data":{"orderId":"123"}}' | base64)'"
  }
}'
``
```

# Event Contract (what payment service expects)

```json id="p2_event"
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "timestamp": "ISO",
  "data": {
    "orderId": "123",
    "userId": "u1",
    "items": [],
    "totalAmount": 500
  }
}
```

---

# What Payment Service DOES

Right now:

- Receives event
- Checks event type
- Processes payment (simulated)
- Logs result

---

# Mental Model Shift (this is the real lesson)

Before:

```text
API calls Payment directly
```

Now:

```text
API publishes event
Payment reacts independently
```

---

# Add Inventory Service & Notification Service

---

# Pub/Sub Setup

configure ONE topic, THREE subscriptions

```text
Topic: `order-events`

Subscriptions:

| Service      | Subscription name |
| ------------ | ----------------- |
| Payment      | payment-sub       |
| Inventory    | inventory-sub     |
| Notification  | notification-sub   |

Each subscription points to:

| Service      | Endpoint  |
| ------------ | --------- |
| Payment      | `/pubsub` |
| Inventory    | `/pubsub` |
| Notification  | `/pubsub` |
```

Before:

```
1 event → 1 consumer
```

Now:

```
1 event → 3 independent consumers
```

This is called: 👉 **Fan-out architecture**

```text
    OrderCreated published
               ↓
┌───────────────────────────
↓             ↓            ↓
Payment    Inventory     Notification
↓             ↓              ↓
process  reservestock   sendemail
```

---

# Real-World Behavior You’ll Notice

Now your system has:

1. Independent speed

- Notification is fastest
- Inventory slower
- Payment slowest

2. Independent failures

- Payment can fail
- Inventory can succeed
- Notification still runs

**Order is NOT blocked by any of them**

✔ One order triggers 3 services
✔ All services run independently
✔ No service calls another directly
✔ Logs show parallel processing

---

# Event-driven systems are eventually consistent

Event-driven systems are eventually consistent because updates happen asynchronously, so everything syncs up after a short delay instead of instantly.

- Systems are spread across servers
- Each part processes events at its own speed
- This makes the system faster and more scalable

---

# Eventual Consistency vs Strong Consistency

**Eventual Consistency**

- You see new picture immediately
- Your friend still sees old one for a few seconds
- After a bit → everyone sees the new one

**Strong Consistency**

- You change picture
- Nobody sees anything until all systems update
- Then → everyone sees the new picture at the same time

**Strong consistency**

- “Don’t show the update until everyone agrees”
- So it often waits → like synchronous

**Eventual consistency**

- “Send update now, others will catch up later”
- So it’s asynchronous

---

# Instead of Cloud Functions, can I build my own consumer API that pulls messages, processes them, and ACKs them?”

👉 Yes. That is called a **pull-based consumer service**.

It will:

- Pull messages from **Google Cloud Pub/Sub**
- Process them
- ACK them manually

**Pub/Sub has 2 modes**

| Mode | Who receives message        | Who ACKs              |
| ---- | --------------------------- | --------------------- |
| Push | Pub/Sub → HTTP endpoint     | Your API responds 200 |
| Pull | Your service pulls messages | Your code ACKs        |

**Architecture**

```text
Pub/Sub Subscription
↓ (pull)
Consumer API (Fastify)
↓
Process event
↓
ACK message
```

**Create New Service**

```bash
mkdir event-consumer-service
cd event-consumer-service
npm init -y
npm install fastify @google-cloud/pubsub dotenv
```

**server.js**

```js
const Fastify = require("fastify");
const { PubSub } = require("@google-cloud/pubsub");

require("dotenv").config();
const app = Fastify({ logger: true });
const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT_ID,
});

const subscription = pubsub.subscription("order-events-sub");

function startConsumer() {
  console.log("🚀 Consumer started...");
  subscription.on("message", async (message) => {
    try {
      const data = JSON.parse(message.data.toString());
      console.log("📩 Received event:", data.eventType);
      console.log("TRACE:", data.traceId);
      await processEvent(data);
      // ACK → tells Pub/Sub message is done
      message.ack();
      console.log("✅ Message ACKED:", data.eventId);
    } catch (err) {
      console.error("❌ Processing failed:", err);
      // NACK → message will be retried
      message.nack();
    }
  });
}

async function processEvent(event) {
  if (event.eventType === "OrderCreated") {
    console.log("💳 Processing payment...");
    await new Promise((r) => setTimeout(r, 1000));
    console.log("✅ Payment complete");
  }
}

app.get("/start-consumer", async (req, reply) => {
  startConsumer();
  return { status: "consumer started" };
});

app.listen({ port: 4000, host: "0.0.0.0" }, () => {
  console.log("Consumer API running on port 4000");
});
```

**How ACK/NACK Works**

**ACK**

```js id="ack"
message.ack();
```

👉 Means:

- “I successfully processed this message”
- Pub/Sub removes it permanently

**NACK**

```js id="nack"
message.nack();
```

👉 Means:

- “I failed”
- Pub/Sub will retry delivery

**Comparison (Push vs Pull)**

| Feature     | Push    | Pull (yours) |
| ----------- | ------- | ------------ |
| Control     | Low     | High         |
| Scaling     | Auto    | You manage   |
| Retry       | Pub/Sub | You control  |
| Flexibility | Medium  | Very High    |

**Use pull consumers when**

- you want full control over processing
- you want custom retry logic
- you are building backend-heavy systems

**⚠️ One important warning (senior insight)**

Don’t run BOTH:

- push subscription
- pull consumer

on same subscription.

👉 You must choose ONE per subscription.

---

# 🚧 PHASE — Reliability Layer

Up until now:

- Events flow
- Services react

Now we fix & understand what breaks in real systems:

- 🔁 Failure handling & Retries (automatic + controlled)
- ☠️ Dead Letter Queue (DLQ)
- 🔒 Idempotency (no duplicate processing)
- 📊 Better observability

---

# 🔁 Retries (automatic + controlled)

**Automatic vs Controlled Retries in Google Pub/Sub**

**Automatic Retries**

- Pub/Sub automatically resends a message if you don’t acknowledge it
- You don’t need to enable anything
- Happens in both push and pull

**Controlled Retries**

- You decide how retries behaves.
- In push: set min/max delay between retries
- Use Dead Letter Queue (DLQ) to stop endless retries
- In pull: control via ack deadline (wait time before retry)
  - Pub/Sub gives you a message and says: "You have X seconds to confirm you handled it."
  - If you confirm (ack) → no retry
  - If you don’t confirm in time → Pub/Sub thinks something went wrong and sends the message again

```js
function handleMessage(message) {
  let acked = false;

  // Pub/Sub gives you time limit (ack deadline)
  setTimeout(() => {
    if (!acked) {
      retry(message); // no ack in time → retry
    }
  }, ACK_DEADLINE);

  // If processing finishes in time
  process(message);
  acked = true; // send ack → no retry
}
```

✔ For pull subscriptions:

- Pub/Sub retries automatically if you don’t ack the message
- Retry timing is mainly controlled by the ack deadline
- ❗ There are no explicit min/max retry delay settings here you control via ack deadline (wait time before retry)

✔ For push subscriptions:

- Pub/Sub retries automatically if your endpoint returns an error
- ✅ Here, min and max backoff timers do apply
- Minimum backoff: smallest wait before retry
- Maximum backoff: longest wait between retries
- Pub/Sub increases delay between retries (exponential backoff within those limits)

```text
Automatic retries apply to both push and pull
control exists in both, but push has explicit retry timing settings while pull relies on ack deadlines.
```

---

**In push subscriptions from google cloud pub/sub**

- 2xx response → message is ACKed
- Anything else 4XX, 5XX, timeout → message is retried

**Retry behavior details (Important in Real Systems)**

Pub/Sub retry is not just "try again later"—it has structure:

- Uses exponential backoff
- Honors retry policy settings (min/max backoff)
- Stops retrying when: message is ACKed or message retention period expires (default ~7 days)

**Uses exponential backoff**
👉 After each failure, Pub/Sub waits longer than last time before retrying.

- Instead of retrying like this: 1s → 1s → 1s → 1s ❌ (constant retry, bad)
- It does something like: 1s → 2s → 4s → 8s → 16s → ...

Why this matters:

- Prevents overload on your service
- Gives time for temporary issues (DB, API) to recover

**Honors retry policy (min/max backoff)**
👉 Pub/Sub waits before retrying, and you control how short or long that wait can be.

Example You configure:

- min backoff = 10 seconds
- max backoff = 60 seconds

so When your service fails What Pub/Sub will do:

- 1st retry → wait 10 sec (not less than min)
- 2nd retry → wait 20 sec
- 3rd retry → wait 40 sec
- 4th retry → wait 60 sec (hits max)
- 5th retry → wait 60 sec (stays at max)

👉 Key Idea Pub/Sub will:

- never retry faster than min
- never wait longer than max

**Common mistake**
Don’t blindly return 500 for all failures.

You should separate:

**✅ Retryable errors → return non-2xx**

- DB temporarily down
- external API timeout
- transient network issues

**❌ Non-retryable errors → return 2xx (ACK anyway)**

- malformed message
- validation failure
- duplicate / already processed

If you return 500 for bad data, Pub/Sub will retry forever → poison message loop.

**Recommended pattern Pseudo code**

```py
try:
    process(message)

    return 200  # ACK

except TransientError:
    return 500  # retry

except PermanentError:
    log_error()
    return 200  # ACK to avoid infinite retry
```

```text
Publisher → Pub/Sub → (HTTP push) → Your service
                                  ↑
                           THIS response matters
```

👉 Pub/Sub only looks at your endpoint’s HTTP response.

---

# Dead Letter Queue (DLQ)

If a message fails too many times → it goes to a backup topic.

**Setup in Pub/Sub**

Create topic:

- `order-events-dlq`

Attach to subscriptions:

- payment-sub
- inventory-sub
- notification-sub

**Why DLQ matters**

It prevents:

- infinite retries
- stuck messages
- silent data loss

**Updated Flow**

Here system is taking the original event (the message that kept failing) and moving it into a Dead Letter Queue (DLQ)

```text
OrderCreated
   ↓
Consumer fails repeatedly
   ↓
Retry exhausted
   ↓
Message → DLQ topic
```

---

# 🔒 Idempotency (no duplicate processing) google pubsub

In Google Cloud Pub/Sub, idempotency means designing your message processing so that handling the same message multiple times does not cause incorrect results. This matters because Pub/Sub guarantees at-least-once delivery, not exactly-once—so duplicates can and do happen.

**Pub/Sub may redeliver a message IF**

- Your subscriber fails before acknowledging
- The ack deadline expires
- There are network issues
- You explicitly nack a message

Your system must assume this message might arrive more than once

**Common Strategies**
**Use a unique message ID (deduplication key)**
Each Pub/Sub message has a messageId, or you can include your own unique ID in the payload.

Store processed IDs in a database:
If ID already exists → skip processing
If not → process and store ID

Example storage options:

- Cloud BigQuery
- Cloud SQL
- Cloud Memorystore

**Practical Tip**

Use a deduplication table with TTL:

- Keeps storage small
- Avoids infinite growth

**Bottom Line**

With Google Cloud Pub/Sub:

- Duplicate deliveries usually happen soon after the original
- You cannot rely on exactly-once delivery
- You must design idempotent consumers, The safest pattern = unique ID + atomic storage check "Process this message only if this ID has never been seen before."

**Cloud SQL**

```sql
CREATE TABLE processed_messages (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
INSERT INTO processed_messages (event_id)
VALUES ('123')
ON CONFLICT DO NOTHING;
```

```py
rows_affected = execute_insert()

if rows_affected == 0:
    # duplicate → skip
else:
    # first time → process message
```

**Why this works**

- The PRIMARY KEY constraint guarantees atomicity
- No race conditions even with multiple consumers

**Using Cloud Memorystore, Redis(Fast, TTL-Based)**

```bash
SET event:123 "1" NX EX 3600
```

- NX = only set if not exists
- EX = expire after 1 hour

```bash
if SET returns OK:
    process
else:
    duplicate → skip
```

Best for:

- High throughput
- Short deduplication windows "means you only remember processed message IDs for a limited period of time, not forever, Keeping every processed ID forever = unbounded storage growth"

---

# Logging Strategy

Now log everything, In each service

```js
console.log("EVENT_RECEIVED", event.eventId);
console.log("PROCESS_START", event.eventType);
console.log("PROCESS_SUCCESS");
console.log("PROCESS_FAILED");
```

**Better Event Contract**

```json
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "version": 1,
  "timestamp": "ISO",
  "data": {
    "orderId": "123"
  }
}
```

---

# DLQ Implementation

Dead Letter Queue (DLQ) is configured at the subscription level, not based on whether it is push or pull.

You can attach:

- deadLetterTopic
- maxDeliveryAttempts

**⚙️ How DLQ works in pull subscriptions**

For a pull subscription, The Flow is:

- Your consumer application pulls messages
- Your code processes the message
- Your code explicitly responds:
  - ACK → success
  - NACK or no ACK → failure

- Pub/Sub retries delivery until:
  - maxDeliveryAttempts is reached
- Then message goes to DLQ topic

**⚙️ How DLQ works in push subscriptions**

1. Pub/Sub sends the message to your HTTP endpoint

```text
Pub/Sub → HTTPS POST → your service
```

2. Your endpoint controls success/failure via HTTP status codes:

- ✅ Success
  - HTTP 2xx (e.g., 200, 204)
  - Pub/Sub treats it as ACK
  - Message is removed permanently

- ❌ Failure
  - HTTP non-2xx (e.g., 500, 400, 503)
  - Pub/Sub treats it as NACK
  - Message will be retried

3. Retry behavior If delivery fails

- Pub/Sub retries automatically
- It uses exponential backoff
- Retries continue until maxDeliveryAttempts reached

4. Dead Letter Queue (DLQ) trigger:

- Once retries exceed maxDeliveryAttempts, Pub/Sub publishes the message to the deadLetterTopic
- At This point message is removed from main subscription
- At This point It is available in the DLQ topic for inspection/reprocessing

👉 In push subscriptions, DLQ is triggered when Pub/Sub cannot get a successful HTTP (2xx) response after exhausting all retry attempts.

**⚠️ Important real-world nuances**

- Timeouts count as failures

- 2xx is the ONLY success signal, Even if your app fails internally but returns 200: 👉 Pub/Sub assumes success (no retry, no DLQ)

- DLQ is not immediate, Messages are not instantly moved to DLQ — only after retry exhaustion.

- Ordering is not preserved in DLQ, it is a separate topic; ordering guarantees don’t carry over.

---

We’re upgrading your **pull consumer** to handle failures safely.

In **Google Cloud Pub/Sub**

- `ack()` → message is permanently removed
- `nack()` → message is retried automatically
- Too many failures → message can be routed to DLQ (if configured)

👉 In real systems, YOU must design:

- retry limits
- failure classification
- DLQ routing logic, Dead Letter Queue publishing

**1. Create DLQ TOPIC**
Create a new topic:
This is your failure sink

```text
order-events-dlq
```

**2. ADD retry Metadata to event**

We enhance event structure:

```json
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "traceId": "uuid",
  "retryCount": 0,
  "data": {}
}
```

**3. Update Pull Consumer Logic**
Now we replace your basic handler with **retry-aware processing**

**Core constants**

```js
const MAX_RETRIES = 3;
const dlqTopic = pubsub.topic("order-events-dlq");
```

**Updated message handler**

```js
subscription.on("message", async (message) => {
  const data = JSON.parse(message.data.toString());
  try {
    console.log("📩 Event:", data.eventType);
    console.log("Retry count:", data.retryCount || 0);
    await processEvent(data);
    // success → ACK
    message.ack();
    console.log("✅ ACK:", data.eventId);
  } catch (err) {
    console.error("❌ Processing failed:", err.message);
    const retryCount = (data.retryCount || 0) + 1;
    if (retryCount >= MAX_RETRIES) {
      console.log("☠️ Sending to DLQ:", data.eventId);
      await sendToDLQ(data, err.message);
      // IMPORTANT: ACK so Pub/Sub stops retrying
      message.ack();
      return;
    }
    // re-publish with updated retry count
    await republishWithRetry(data, retryCount);
    // ACK original message to avoid duplicate retry loop
    message.ack();
  }
});
```

**4.Retry Re-publish Logic**

```js
async function republishWithRetry(event, retryCount) {
  const updatedEvent = {
    ...event,
    retryCount,
  };
  await pubsub.topic("order-events").publishMessage({
    data: Buffer.from(JSON.stringify(updatedEvent)),
  });
  console.log("🔁 Retried event published:", event.eventId);
}
```

**5.DLQ Publisher**

```js
async function sendToDLQ(event, errorMessage) {
  const dlqEvent = {
    ...event,
    failedAt: new Date().toISOString(),
    error: errorMessage,
  };
  await dlqTopic.publishMessage({
    data: Buffer.from(JSON.stringify(dlqEvent)),
  });
  console.log("☠️ Sent to DLQ:", event.eventId);
}
```

**Final Retry Flow**

```text
Message received
   ↓
Process succeeds → ACK
OR
Process fails
   ↓
Retry < MAX → republish
   ↓
Retry exceeds → DLQ
   ↓
ACK original message
```

**Critical Senior Insight**
You now have TWO retry Layers:

1. Pub/Sub retry (infrastructure level)
2. Your application retry (business logic level)

👉 This is intentional but dangerous if misused. If Both layers are keep retrying too much, you can end up with

- the same task running many times
- duplicated work & unexpected side effects

In Real Systems?

- limit Pub/Sub retries (keep infrastructure retries low)
- control retries in the application-level (because your code understands the situation better)

---

# Real Production Behavior You Now Have

Your system now handles:

- At-least-once delivery: Messages may be received more than once (duplicates can happen)
- Safe reprocessing: Idempotency ensures duplicates don’t cause repeated effects
- Failure isolation: If one service fails, others continue working normally
- Message durability: Dead-letter queue (DLQ) stores failed or unprocessable messages for later review or handling

**Mental Model Shift (VERY IMPORTANT)**

Before:

```text
If service fails → system fails
```

Now:

```text
If service fails → system recovers automatically
```

That is distributed systems thinking.

**What you just learned (this is senior-level thinking)**

You now understand:

- Idempotency
- At-least-once delivery
- Retry storms
- Failure isolation
- DLQ patterns

This is literally what backend interviews + real systems test.

**Failure isolation in event-driven applications**
If one service fails while processing an event, other services can still consume and process the same or different events normally. The failure is contained to that service, preventing system-wide Breakdown.

## What your system now includes

- ✔ Event-driven architecture
- ✔ Outbox pattern
- ✔ Pull-based consumers
- ✔ Idempotency
- ✔ Retry system (application-level)
- ✔ DLQ system

**This is already production-grade backend design**

---

# Outbox Pattern (fix “DB wrote but event not sent” problem)

The Outbox Pattern is a reliable way to fix a classic distributed systems issue,
Your database transaction succeeds, but publishing the event fails (we are talking about a failure at the publisher side, not the consumer.)

This leads to inconsistency—your system state changed, but other services never hear about it.

**Dual-write problem**

```text
DB write succeeds
BUT Pub/Sub publish fails
→ SYSTEM INCONSISTENCY ❌
```

OR

```text
Event published
BUT DB transaction failed
→ INVALID EVENT ❌
```

**Solution is OUTBOX PATTERN**
We stop publishing events directly.

Instead:

- Step A - Write order + event into DB in SAME transaction
- Step B - Background worker publishes events to Pub/Sub

**Updated Architecture**

```text
POST /orders
   ↓
DB Transaction
   ├── orders table
   ├── outbox_events table
   ↓
Outbox Worker
   ↓
Pub/Sub
```

**🧱 How It Works**

1. Inside your service transaction

```text
BEGIN;

INSERT INTO orders (id, status) VALUES (123, 'CREATED');

INSERT INTO outbox (id, event_type, payload, status)
VALUES ('evt-1', 'OrderCreated', '{...}', 'PENDING');

COMMIT;
```

2. Outbox Publisher (background worker)

- Reads PENDING events from the outbox
- Publishes them to a message broker
- Marks them as SENT (or deletes them)

**Before Non-Atomic**

```text
Save Order → Publish Event
```

**Now Atomic**

```text
Save Order + Save Event (atomic)
```

**⚙️ Implementation Options**
Option A: Polling Publisher

- Simple cron/job polls DB every few seconds
- Easy but adds slight delay

**Outbox Worker**
This outbox worker is a separate process.

```js
const pool = require("./src/infra/db");
const { PubSub } = require("@google-cloud/pubsub");

const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT_ID,
});

const TOPIC = "order-events";

async function publishPendingEvents() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM outbox_events WHERE status = 'PENDING' LIMIT 10`,
    );
    for (const event of res.rows) {
      await pubsub.topic(TOPIC).publishMessage({
        data: Buffer.from(JSON.stringify(JSON.parse(event.payload))),
      });
      await client.query(
        `UPDATE outbox_events SET status = 'SENT' WHERE id = $1`,
        [event.id],
      );
      console.log("Published event:", event.id);
    }
  } catch (err) {
    console.error("Outbox worker error:", err);
  } finally {
    client.release();
  }
}
setInterval(publishPendingEvents, 3000);
```

**⚠️ Common Pitfalls**

- Not making consumers idempotent
- Letting outbox table grow forever (need cleanup/TTL)
- ❌ Publishing inside the main transaction (defeats purpose)
- ❌ No retry/backoff strategy in publisher

**🚫 What “publishing inside the main transaction” means**
❌ Wrong

```
BEGIN TX

saveOrder()
publishEventToKafka()   ← ❌ here
insertOutboxRow()

COMMIT
```

You’re back to a dual-write situation:

- Database = one system
- Message broker = another system

✅ Correct approach

```
BEGIN TX

saveOrder()
insertOutboxRow()

COMMIT
```

**✅ Use Outbox Pattern when**

- You update the DB and must emit an event (e.g., order created → Payments, orders, inventory/shipping services depend on it)

- You’re using event-driven microservices, Other services rely on your events to stay consistent

**❌ When you don’t need it**

- Events are non-critical (logs, analytics, metrics—losing a few is okay)
- You can tolerate occasional inconsistency(event missing isn’t a big deal)

**If my DB update succeeds but the event is never sent… is that a serious problem?**

- Yes → use Outbox ✅
- No → skip it ❌

**Now You Guarantee**

- **✔ No lost events** - Even if Pub/Sub fails → event is stored
- **✔ No phantom events** - Event only exists if DB commit succeeded
- **✔ Retry possible** - Worker keeps trying until success

---

**Final Architecture**

- Client → sends request (place order)
- Fastify API → receives it
- PostgreSQL → saves:
  - order
  - event (outbox)
- Outbox Worker → reads event & sends it
- Pub/Sub (e.g., Apache Kafka) → distributes event
- Consumers → do work (payment, inventory, notification) && DB (idempotency) ensures each event is processed only once

**IDENTITY + IDEMPOTENCY**
Each service Like payment, inventory, etc checks the database first.

- If the event was already handled → skip
- If not → process it and save the ID

The database prevents duplicates by not allowing the same event ID twice.

👉 Store processed events in DB, each consumer has a Table

```sql
CREATE TABLE processed_events (
  event_id UUID PRIMARY KEY,
  processed_at TIMESTAMP DEFAULT NOW()
);
```

👉 Consumer

```js
const res = await pool.query(
  `INSERT INTO processed_events (event_id)
   VALUES ($1)
   ON CONFLICT (event_id) DO NOTHING
   RETURNING event_id`,
  [event.eventId],
);
if (res.rowCount === 0) {
  // Already processed
  return;
}
// Safe to process
await processEvent(event);
```

👉 Then after success

```js
await pool.query("INSERT INTO processed_events (event_id) VALUES ($1)", [
  event.eventId,
]);
```

**Why this works**

- First time event arrives → insert succeeds ✅ → process runs
- Duplicate arrives → insert fails (already exists) ❌ → skipped

👉 The database guarantees uniqueness using PRIMARY KEY

```text
Consumers → Postgres (idempotency tracking)

```

---

**How To When Table Grow Huge**
Don’t just let it grow forever, In production systems you either clean up or expire, or move to a faster system like Redis.

Common strategies:

1. TTL / cleanup (most common)

Delete old records, "Only keep last 7 days of history"

```DELETE FROM processed_events
WHERE processed_at < NOW() - INTERVAL '7 days';``
```

2. Use Redis instead (for short-term idempotency) Instead of DB:

Store event_id in Redis with expiry (like 1–24 hours)Automatically disappears
👉 Very common in high-scale systems

**Phase5**
We have a fault-tolerant event-driven order system using:

- Fastify
- Pub/Sub
- Postgres
- Worker-based architecture

---

# OBSERVABILITY (Traces + Metrics)

- 📈 Metrics → request count, latency, failures
- 🔍 Logs → structured event logs
- 🧭 Traces → request flow across services

**📊 Google Cloud Monitoring**

- Focus: Metrics (numbers over time)
- Tracks things like CPU usage, memory, request rates, uptime.
- Lets you create dashboards and alerts.
- Think: "Is my system healthy right now?"

**🧾 Google Cloud Logging**

- Focus: Logs (text/event records)
- Collects logs from apps, VMs, containers, etc.
- Helps with debugging and auditing.
- Think: "What exactly happened?"

**🔍 Google Cloud Trace**

- Focus: Request tracing (latency across services)
- Shows how a request travels through microservices.
- Identifies bottlenecks and slow components.
- Think: "Where is my request slowing down?"

**🧩 How they work together**

- Monitoring → detects issues (e.g., latency spike)
- Logging → shows detailed events/errors
- Trace → pinpoints performance bottlenecks

**What you are solving**

Right now you CANNOT answer:

- Where did the request slow down?
- Did Pub/Sub delay or service delay?
- Which consumer failed most?
- End-to-end order lifecycle timing?

👉 Observability fixes this.

**Add STRUCTURED LOGGING (FIRST STEP)**
In Fastify API order service, Replace random logs with structured logs

```js
app.addHook("onRequest", async (req) => {
  req.log.info({
    type: "REQUEST_RECEIVED",
    path: req.url,
    method: req.method,
  });
});
```

```js
req.log.info({
  type: "ORDER_CREATED",
  orderId: result.orderId,
});
```

**ADD TRACE CONTEXT (VERY IMPORTANT)**
We introduce a **traceId** that flows across everything.

```js
const { v4: uuidv4 } = require("uuid");
const traceId = uuidv4();
```

Attach it to everything:

```js
{
  traceId,
  orderId,
  eventType: "OrderCreated"
}
```

**Propagate traceId through Pub/Sub**
In your publisher

```js
const event = {
  eventId: uuidv4(),
  traceId,
  eventType: "OrderCreated",
  data: payload,
};
```

**Consumer Logging (critical)**
Every service MUST log traceId:

```js
console.log("TRACE:", event.traceId);
console.log("EVENT:", event.eventType);
```

Now you can follow ONE request across all services.

**ENABLE CLOUD LOGGING (automatic)**
All logs go to Google Cloud Logging. No setup needed if deployed on Cloud Run.

**CREATE DASHBOARDS (Looker Studio)**
Looker Studio is a free data visualization and reporting tool from Google.

- 📊 Create interactive dashboards and reports
- 🔗 Connect to data sources (Google Sheets, BigQuery, etc.)
- 📈 Turn raw data into charts, graphs, and insights
- 🤝 Share reports with others in real time

**Build dashboards**

1. System Overview

- Number of orders generated every minute
- Payment success rate
- Inventory success rate

2. Latency Dashboard

- API latency
- Consumer processing time

3. Failure Dashboard

- Failed payments
- DLQ events
- Retry counts

**TRACE VIEW (MOST POWERFUL PART)**
You will see

```text
Order API
  ↓
Pub/Sub publish
  ↓
Payment service
  ↓
Inventory service
  ↓
Notification service
```

Each Steps shows latency, status, errors.

**WHAT YOU JUST BUILT (IMPORTANT)**

- ✔ Distributed tracing system
- ✔ Centralized logging
- ✔ Dashbaords to track Metrics

Now you can answer:

- Why is order processing slow
- Which service is failing most
- Where are retries happening
- What is system throughput?

---

# FINAL SYSTEM EVOLUTION

```text
Fastify API
   ↓ (traceId)
Outbox + Pub/Sub
   ↓
Consumers
   ↓
Logs + Metrics + Traces
   ↓
Dashboards (Looker Studio)
```

**🚀 Real production backend level**

Built across phases:

- Event-driven architecture
- Outbox pattern
- Idempotency
- Retry + DLQ
- Observability (logs + metrics + traces)

This is literally 70–80% of real backend systems.
