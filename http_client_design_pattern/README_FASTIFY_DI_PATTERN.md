# Factories (makeX): Create dependency once and capture them in closure.

```js
//users routes/user.js

import { makeGetUser } from "../controller/getUser";
import { makeAuthHooks } from "../hooks/authHooks";

export async function useRoutes(fastify) {
  fastify.get(
    "/users",
    {
      preHandler: makeAuthHooks(fastify),
    },
    makeGetUsers(fastify),
  );
}
```

```js
//app.js

import fastify from "fastify";
import { userRoute } from "./routes/users.js";

const app = Fastify();

app.decorate("db", {
  users: {
    async findAll() {
      return [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
    },
  },
});

app.register(userRoutes);
app.listen({ port: 3000 });
```

```js
//hooks

export function makeAuthHook(fastify) {
  return async function authHook(request) {
    const token = request.headers.authorization;
    if (!token) {
      throw fastify.httpErrors.unauthorized();
    }
    request.user = {
      id: "123",
      name: "John",
    };
  };
}
```

```js
// controllers

import {makeUserService} from "../services/userServices.js"

export function makeGetUsers(fastify){

    //run once not on the very request
    const userService = makeUserService(fastify);

    return async function getUsers(request,reply){
        const users =. await userService.getUser();
        reply.send(users);
    }
}
```

```js
//service

export default function makeUserService(fastify) {
  async function getUsers() {
    return fastify.db.findAll();
  }

  async function getUserById(id) {
    return fastify.db.findById(id);
  }

  return {
    getUsers,
    getUserById,
  };
}
```

## Easy to unit Test

In production fastify instace looks like:

```js
const fastify = {
  db: {
    users: {
      findAll: async () => realDb.Query(...),
    },
  },
};

```

In unit test you dont want to call realdb, so you create fakeOne

```js
const fakeFastify = {
  db: {
    users: {
      findAll: async () => [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
    },
  },
};
```

```js
//For Prod
const handler = makeGetUsers(fastify);

//For Testing
const handler = fakeFastify(fastify);
```

## Easy to Swap Implementation to Other Db

Instead of changing you handlers, you only change what gets Injected **mySQL**

```js
const fastify = {
  db: {
    users: mySqlRepository,
  },
};
```

# DI Patterns Fastify

## Route Layer

```js
fastify.get(
  "/users",
  {
    preValidations:[Hook1,Hook2]
    preHandler: makeAuthHooks(fastify),
    schema: getUserScehma
  },
  makeGetUsers(fastify),
);
```

## Hook Chain

Each Hook does one Job and mutate request for the nextone in the chain

```js
export function makeAuthHook(fastify) {
  const validatSesion = makeValidatSesion(fastify);

  return async function authHook(request) {
    const token = await validatSesion(request.headers.authorization);
    if (!token) {
      throw fastify.httpErrors.unauthorized();
    }
    request.user = {
      id: "123",
      name: "John",
    };
  };
}
```

## Handler Layer

No business Logic here, just extract what needed from the reqeust and call the service.

```js
function handler(fastify) {
  const makeCall = makeServiceCall(fastify);

  return async function (req, reply) {
    const { userId } = request.user;
    return makeCall(userId);
  };
}
```

## Service Layer

Contains the actual Business Logic, It call the Repoistory layer, never AXIOS directly.

## Reposiotoy Layer (Data Acess Layer)

This is the only layer that knows about downstream services, including their URLs, headers, timeouts, and other details.

```js
function placeOrder(fastify) {
  const coreService = createCoreService(fastify.config, "posts/1", {
    timeout,
    retries: [
      {
        name: "SOME_CON_ERROR1",
        check: shouldRetryForError1,
      },
      {
        name: "SOME_CON_ERROR2",
        check: shouldRetryForError2,
      },
    ],
    baseUrl: "https://jsonplaceholder.typicode.com",
  });
  const validateResponse = makeValidation(schemaName);

  return async function (request, data, exHeaders) {
    const response = await coreService.post(reqeust, {
      data,
      extraHeaders: { a: 1, b: 2 },
    });
    validateResponse(response.data);
    return response.data;
  };
}
```

## InfraLayer

Generic http Transport

```js
function createCoreService(config, endpoint, { baseUrl, timeouts, retries }) {
  async function get(req, { data, extrHeaders }) {}
  async function post(req, { data, extrHeaders }) {}
  return { get, post };
}
```

# Core client service pattern

RequestContext tracks the state, timing, attempts, and logs of one HTTP request. It keeps all request-related information in one place, especially useful for retries.

`startAttempt()` and `attemptDuration()` are used to measure how long each individual HTTP attempt takes.

`duration()` → Total time for the entire request, including all attempts, retries, and retry delays.
`attemptDuration()` → Measures only the current API call.

`attemptDuration()` gets reset whenever `startAttempt()` is called, while `duration()` keeps counting from the original request start.

```js
const axios = require("axios");
const crypto = require("crypto");

class RequestContext {
  constructor({ method, url, data, headers }) {
    this.id = crypto.randomUUID();
    this.method = method;
    this.url = url;
    this.data = data;
    // withAuthorization or withoutAuthorization, depending on whether authentication headers are required.
    this.headers = headers;
    this.startedAt = Date.now();
    this.attempt = 0;
  }

  startAttempt() {
    this.attempt += 1;
    this.attemptStartedAt = Date.now();
  }

  duration() {
    return Date.now() - this.startedAt;
  }

  attemptDuration() {
    return Date.now() - this.attemptStartedAt;
  }

  log(logger, event, meta = {}) {
    logger.info({
      event,
      requestId: this.id,
      method: this.method,
      url: this.url,
      attempt: this.attempt,
      ...meta,
    });
  }
}
```

Waits for a specified time before the next retry attempt.

```js
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

Decides whether the failed API request should be tried again or not.

```js
function shouldRetry(error, attempt, retries) {
  if (attempt >= retries) {
    return false;
  }

  // Network errors / timeout
  if (!error.response) {
    return true;
  }

  // Retry common transient HTTP errors
  return [408, 429, 500, 502, 503, 504].includes(error.response.status);
}
```

Calculates how long to wait before the next retry. code uses exponential backoff + jitter

```js
function getRetryDelay(attempt, retryConfig = {}) {
  const { baseDelay = 300, maxDelay = 5000 } = retryConfig;

  // Exponential backoff
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

  // Small jitter to avoid retry storms
  return delay + Math.floor(Math.random() * 100);
}
```

creates and configures the HTTP service/client that your application will use to make API requests

```js
function createCoreService(
  config = {},
  endpoint = "",
  {
    baseUrl = "",
    timeouts = {},
    retries = 3,
    retryConfig = {},
    logger = console,
  } = {},
) {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: timeouts.request || 10000,
    ...config,
  });

  async function request(method, req, options = {}) {
    const { data, extraHeaders = {}, params, signal } = options;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    const url = endpoint ? `${endpoint}${req}` : req;

    const context = new RequestContext({
      method,
      url,
      data,
      // withAuthorization or withoutAuthorization, depending on whether authentication headers are required.
      headers,
    });
    context.log(logger, "request_started");

    // We use lastError so that after all retry attempts fail, we can throw the actual error from the final attempt.
    let lastError;
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      context.startAttempt();

      try {
        context.log(logger, "request_attempt");
        const response = await client.request({
          method,
          url,
          data,
          params,
          headers: {
            ...headers,
            "x-request-id": context.id,
          },
          signal,
        });

        context.log(logger, "response_received", {
          status: response.status,
          durationMs: context.duration(),
          attemptDurationMs: context.attemptDuration(),
        });

        return response;
      } catch (error) {
        lastError = error;
        const retry = shouldRetry(error, attempt, retries + 1);
        context.log(logger, "request_failed", {
          status: error.response?.status,
          code: error.code,
          message: error.message,
          durationMs: context.duration(),
          retry,
        });

        if (!retry) {
          break;
        }

        const delay = getRetryDelay(attempt, retryConfig);
        context.log(logger, "request_retrying", {
          delayMs: delay,
        });
        await sleep(delay);
      }
    }

    context.log(logger, "request_exhausted", {
      status: lastError?.response?.status,
      durationMs: context.duration(),
    });

    throw lastError;
  }

  async function get(req, options = {}) {
    return request("GET", req, options);
  }

  async function post(req, options = {}) {
    return request("POST", req, options);
  }

  async function put(req, options = {}) {
    return request("PUT", req, options);
  }

  async function patch(req, options = {}) {
    return request("PATCH", req, options);
  }

  async function del(req, options = {}) {
    return request("DELETE", req, options);
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
  };
}
```

## Usage

```js
const api = createCoreService(
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
  "/users",
  {
    baseUrl: "https://api.example.com",
    timeouts: {
      request: 5000,
    },
    retries: 3,
    retryConfig: {
      baseDelay: 300,
      maxDelay: 3000,
    },
    logger: console,
  },
);

const response = await api.get("/123", {
  params: {
    include: "profile",
  },
});
```

HTTP client often needs different timeout controls.

```js
timeouts: {
  request: 5000,
  connect: 2000,
  socket: 5000,
}
```

## Retry logic

Successful API call exits after the first successful attempt

```js
for attempt = 1
    ↓
context.startAttempt()
    ↓
client.request(...)
    ↓
SUCCESS?
    ↓ yes
context.log("response_received")
    ↓
return response  ← exits request() ← completely for loop never reaches attempt 2

```

first call fails, second succeeds

```js
attempt 1
   ↓
  503
   ↓
catch
   ↓
shouldRetry(...) → true
   ↓
sleep(...)
   ↓
attempt 2
   ↓
  200
   ↓
return response

```

## Exponential backoff

Exponential backoff means increasing the wait time after each failed retry.
Instead of retrying at a fixed interval the delay increases.

If a server is temporarily overloaded, immediately retrying again and again can make the problem worse.
Exponential backoff gives the server more time to recover.

```js
Attempt 1 → 300ms
Attempt 2 → 600ms
Attempt 3 → 1200ms
Attempt 4 → 2400ms
Attempt 5 → 3000ms  ← maxDelay reached
```
