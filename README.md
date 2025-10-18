
# ProfileMe

ProfileMe is a minimal Node.js/Express router module that returns a static user profile combined with a cat fact fetched from an external API. The router is implemented in [index.js](index.js) and exported for mounting into an Express application.

Files in this workspace:
- [index.js](index.js)
- [package.json](package.json)
- [readMe](readMe)

Important exported/defined symbols in this workspace:
- [`index.user`](index.js) — the static user object returned by the endpoint.
- [`index.router`](index.js) — the Express Router instance.
- [`index.router.get('/profile', ...)`](index.js) — route handler for the profile endpoint.
- [`index.module.exports`](index.js) — exports the router from the module.

Table of contents
- Project overview
- Installation
- Usage / Examples
- API: Endpoint details
- Response schema (success and error)
- Integration example (server snippet)
- Dependencies
- Notes & troubleshooting
- License & acknowledgements
- Contact

Project overview
---------------
[index.js](index.js) defines:
- a static `user` object (`[`index.user`](index.js)`),
- an Express `router` (`[`index.router`](index.js)`),
- a GET handler mounted at `/profile` (`[`index.router.get('/profile', ...)`](index.js)`) which:
  - fetches a cat fact from `https://catfact.ninja/fact` using Axios,
  - returns a JSON response combining the static user with the fetched cat fact,
  - handles errors and returns an error JSON with HTTP 500 on failure.

Installation
------------
1. Ensure Node.js (v16+) and npm are installed.
2. From the project root run:
```sh
npm install
```
This installs the dependencies listed in [package.json](package.json).

Usage
-----
index.js exports an Express Router. You can mount it into an Express app. Example endpoints depend on where you mount the router (see Integration example below).

API: Endpoint details
---------------------
GET /profile
- Location: path declared inside [`index.router.get('/profile', ...)`](index.js). Final URL depends on mount path.
- Method: GET
- Behavior:
  - On success returns HTTP 200 with JSON:
    - status: "success"
    - user: the static [`index.user`](index.js) object
    - timestamp: ISO 8601 string
    - catFact: text string fetched from the external API
  - On error returns HTTP 500 with JSON:
    - status: "error"
    - user: the static user (still included)
    - timestamp: ISO 8601 string
    - fact: fallback text
    - error: error message

Example success response
```json
{
  "status": "success",
  "user": {
    "name": "Opeyemi Eesuola",
    "email": "eesuolap@gmail.com",
    "stack": "NodeJs, Express, MongoDB, PostgreSQL, Prisma"
  },
  "timestamp": "2025-01-01T12:00:00.000Z",
  "catFact": "Cats have five toes on their front paws, but only four toes on their back paws."
}
```

Example error response
```json
{
  "status": "error",
  "user": {
    "name": "Opeyemi Eesuola",
    "email": "eesuolap@gmail.com",
    "stack": "NodeJs, Express, MongoDB, PostgreSQL, Prisma"
  },
  "timestamp": "2025-01-01T12:00:00.000Z",
  "fact": "Could not fetch cat fact at this time.",
  "error": "Network Error"
}
```

Integration example
-------------------
Below is a minimal example showing how to mount the exported router into a full Express server. Place this in a new file (e.g. `server.js`) at the project root or run inline for testing.

```javascript
// Example server (create server.js)
const express = require('express');
const cors = require('cors');

// require the router exported by index.js
const profileRouter = require('./index.js'); // uses module.exports from index.js

const app = express();
app.use(cors());
app.use(express.json());

// Mount router at root so endpoint is GET /profile
app.use('/', profileRouter);

// Alternatively mount at /api to expose GET /api/profile
// app.use('/api', profileRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ProfileMe server listening on port ${PORT}`);
});
```

Quick test with curl (after running server)
```sh
# If mounted at root:
curl http://localhost:3000/profile

# If mounted at /api:
curl http://localhost:3000/api/profile
```

Dependencies
------------
See [package.json](package.json) for declared dependencies:
- express (^5.1.0)
- axios (^1.12.2)
- cors (^2.8.5)

Development notes & suggestions
------------------------------
- Currently [index.js](index.js) exports an Express Router and is not a standalone server. Use the integration example to run it.
- The router fetches cat facts from an external service (catfact.ninja). Consider:
  - adding a configurable timeout for the Axios request,
  - caching responses if high traffic is expected,
  - gracefully degrading when the external API is unavailable.
- Add a start script in [package.json](package.json) if you add a server entrypoint:
```json
"scripts": {
  "start": "node server.js"
}
```
- Unit tests: add tests for the route handler, mocking the Axios call to assert both success and failure flows.
- Logging: the route currently logs errors to console. Consider using a structured logger (winston/pino) for production.

Troubleshooting
---------------
- If you get a `Cannot find module 'express'` or similar, run `npm install` in the project root.
- If cat fact fetch fails, confirm network access and that `https://catfact.ninja/fact` is reachable.
- If mounting the router, ensure the mount path matches your curl/test URL.

License & acknowledgements
--------------------------
- License declared in [package.json](package.json): ISC
- External API used: https://catfact.ninja/

Contact
-------
Project author metadata is not present in [package.json](package.json). For local development see the static email in the code: [`index.user.email`](index.js).

Change log
----------
- Initial implementation: single router exported from [index.js](index.js) that combines static user data with an external cat fact.
