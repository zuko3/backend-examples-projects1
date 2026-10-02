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
