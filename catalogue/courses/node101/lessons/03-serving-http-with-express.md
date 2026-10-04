---
lesson_id: node101-03
course_id: node101
pathway: software-developer
title: Serving HTTP with Express
order: 3
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Serve HTTP responses from an Express application
---

## What actually travels between a browser and a server

Before you write a line of Express, you need an accurate picture of what a web server does, because Express is a thin convenience layer over exactly this and nothing more.

A browser opens a TCP connection to your server and sends a block of text called an HTTP **request**. Your server sends back another block of text called a **response**, and that is the whole transaction. Both have the same shape: a first line, a set of headers, a blank line, and an optional body.

A request your browser sends when you visit the events board looks roughly like this:

```http
GET /events HTTP/1.1
Host: localhost:3000
User-Agent: Mozilla/5.0
Accept: text/html,application/json
```

Four parts are doing work there.

The **method** — `GET` — states what kind of operation this is. `GET` means "give me a representation of this thing, and do not change anything." `POST` means "here is some data, do something with it." `PUT` and `PATCH` mean "replace" and "modify." `DELETE` means what it says. The methods are a contract, not a technicality: a `GET` is expected to be *safe*, meaning a browser, a crawler, or a link preview bot can issue one at any time without consequence. If you ever write a `GET` route that deletes something, some prefetcher will eventually find it and delete everything you own. This lesson only uses `GET`; the others arrive when there is a body to send.

The **path** — `/events` — identifies which resource is wanted. It is the part after the host, and it is what Express matches routes against.

The **headers** are key/value metadata about the request: which host was asked for, what client is asking, what content types it will accept, what cookies it carries. They are not the content; they describe it.

The **body** is the content, and a `GET` normally has none. A form submission or a JSON payload arrives here. Express does not read the body for you by default — turning those bytes into a JavaScript object requires a body parser, which is lesson 05's subject. For now, every request you handle has an empty body.

The response comes back in the same shape:

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 137

<!doctype html><html>...</html>
```

The first line carries the **status code**, and status codes are how a server tells a client what happened without the client having to read the body. Learn these five families:

- **2xx — it worked.** `200 OK` for a normal response, `201 Created` when you made something new, `204 No Content` when it worked and there is deliberately nothing to send back.
- **3xx — look somewhere else.** `301 Moved Permanently` and `302 Found` are redirects; the client should follow the `Location` header.
- **4xx — the client got it wrong.** `400 Bad Request` for malformed input, `401 Unauthorized` and `403 Forbidden` for authentication and permission, `404 Not Found` when the path names nothing, `405 Method Not Allowed` when the path exists but not for that method.
- **5xx — the server got it wrong.** `500 Internal Server Error` is the catch-all for "your code threw."
- **1xx** you will almost never write by hand.

The distinction between 4xx and 5xx is not cosmetic and it is the one people get wrong most often. A 4xx says *you asked for something impossible or invalid; asking again the same way will fail the same way.* A 5xx says *your request was fine, I broke.* Returning `500` for a missing record teaches monitoring systems to page someone at 3am for a typo in a URL. Returning `200` with a body that says "error" is worse still, because every automated client in the world will believe the `200`.

`Content-Type` deserves special attention, because it is the header that decides how the client interprets your bytes. The same string `{"id":1}` is a JSON object if you send `application/json` and a paragraph of literal text if you send `text/plain`. Express sets this header for you based on which response method you call, which is a large part of why you use Express rather than writing raw sockets.

Two more properties of HTTP shape everything you write on top of it.

**It is stateless.** Each request carries everything the server needs to answer it, and the protocol itself remembers nothing between one request and the next. Two requests from the same browser, one second apart, arrive as two unrelated events. Anything that feels like continuity — being logged in, a shopping cart, a wizard that remembers step one — is built *on top of* HTTP by sending an identifier back and forth in a cookie or a header. This is what makes a server scalable, because any process can answer any request, and it is also why you cannot store per-visitor state in a module-level variable, as lesson 02 warned.

**One connection carries many requests.** A modern browser opens a connection and reuses it for the page, the stylesheet, the images, and the fetches that follow. You will never manage that yourself — Node's HTTP server handles it — but it explains something you will see in logs: a single visitor loading one page can produce a dozen entries, including one for `/favicon.ico` that you never wrote a route for. That stray `404` in your terminal is the browser asking for a tab icon, not a bug.

You will also notice that everything in this lesson is plain `http://`, not `https://`. Encryption is real and mandatory in production, but it is almost never handled by your Node process. The hosting platform terminates TLS at its edge and forwards a plain HTTP request to your app on an internal network. Your code writes the same response either way; deployment configuration is what makes it arrive encrypted. That is the last lesson's business, and until then `http://localhost` is exactly right.

![The path an HTTP request takes from the browser through an Express application and back as a response](./img/request-response-cycle.png)

The loop you are about to build is exactly that picture: a request arrives, Express matches it to a function you wrote, your function builds a response, and Express writes it back down the connection. Everything else in this course adds stages to that loop without changing its shape.

## The smallest Express application

Open the `events-board` project you set up in the last lesson and replace `src/server.js` with this:

```javascript
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Community Events Board");
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
```

That is a complete web server. Run it with `npm start` and open `http://localhost:3000` in a browser.

Four things happen in those nine lines, and it is worth being precise about each.

`express()` is a factory. It returns `app`, which is both an object with methods you configure and — this surprises people — a function with the signature `(req, res)`. That signature is exactly what Node's built-in `node:http` module expects for a request listener, which is how the two connect. Express is not replacing Node's HTTP server; it is producing a very well-organized request handler to give to it.

`app.get(path, handler)` registers a **route**: "when a `GET` request arrives whose path matches `/`, call this function." The handler receives two arguments, `req` and `res`, which are the request and the response from the previous section, wrapped in objects with convenience methods. Registering a route does not run anything — it adds an entry to a list Express consults later, once per incoming request.

`res.send(...)` builds and transmits the response. It sets a status of `200`, guesses a `Content-Type` from what you passed it, computes `Content-Length`, writes the body, and ends the response.

`app.listen(3000, callback)` is the line that makes the process into a server. It creates an `http.Server`, hands it `app` as the request listener, and binds it to port 3000. The callback fires once the socket is open. Notice that the process no longer exits after running the file, unlike the skeleton from lesson 02 — an open listening socket is pending work, so Node stays alive. Press Ctrl+C to stop it.

Now add a second route so there is something more interesting than a greeting. Keep the in-memory events array from the previous lesson:

```javascript
import express from "express";

const app = express();

const events = [
  { id: 1, title: "Neighborhood Cleanup", date: "2026-08-02", venue: "Rosa Parks Park" },
  { id: 2, title: "Intro to Soldering", date: "2026-08-09", venue: "Maker Space" },
  { id: 3, title: "Community Potluck", date: "2026-08-16", venue: "Fellowship Hall" },
];

app.get("/", (req, res) => {
  res.send("Community Events Board");
});

app.get("/events", (req, res) => {
  const lines = events.map((event) => `${event.date} — ${event.title} (${event.venue})`);
  res.send(lines.join("\n"));
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", eventCount: events.length });
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
```

Three routes, three shapes of response. `/events` sends text. `/health` sends JSON. `/` sends a string. Restart and visit each one.

That `/health` route is not filler. A **health check** is a path a hosting platform or load balancer requests every few seconds to decide whether your process is alive and should keep receiving traffic. It should be cheap, it should not depend on anything slow, and it should return a `2xx` when the app is functioning. You will need one when this app is deployed, and adding it now costs three lines.

One caution about the events array: it lives in the process's memory. Restart the server and any change is gone. That is fine for this course by design — persistence belongs to a later course — but do not mistake it for a store. It is a fixture that lets you build the HTTP layer without a database in the way.

## Inside the request object

The `req` object is Express's wrapper around Node's incoming message, with useful properties added. You will not need all of it today, but you should know what is on it, because half of debugging a route is knowing where to look.

```javascript
app.get("/inspect", (req, res) => {
  console.log("method:", req.method);
  console.log("path:", req.path);
  console.log("full url:", req.originalUrl);
  console.log("host header:", req.get("host"));
  console.log("accepts json?", req.accepts("json"));
  console.log("ip:", req.ip);
  res.send("check your terminal");
});
```

- **`req.method`** is the HTTP method as an uppercase string. Inside `app.get` it is always `"GET"`, which makes it look useless — it becomes useful in code that handles more than one method.
- **`req.path`** is the path with any query string stripped. **`req.originalUrl`** is the whole thing including the query string. When a route seems not to match, log both; the difference is usually the answer.
- **`req.get(name)`** reads a request header, case-insensitively. `req.get("content-type")` and `req.get("Content-Type")` are the same call. There is also `req.headers`, a plain lowercase-keyed object, but `req.get` is more forgiving.
- **`req.accepts(type)`** consults the `Accept` header and tells you what the client would prefer. A browser asks for HTML; `curl` asks for anything. You will use this properly when the same route can answer in two formats.
- **`req.query`** is the parsed query string as an object, and **`req.params`** holds values captured from the path pattern. Both belong to the next lesson, which is entirely about getting data out of the URL.
- **`req.body`** is `undefined` right now, and it will stay `undefined` until you add a body-parsing middleware in lesson 05. This trips up everyone who tries to read a form post too early. The bytes are arriving on the socket; nothing has been asked to read them.
- **`req.ip`** is the client address, subject to proxy configuration you will meet at deployment.

Two habits are worth building immediately. First, **log the request, not your assumption about the request.** A handler that "isn't being called" is very often being called with a path you did not expect. Second, **treat everything on `req` as untrusted input.** It arrives from outside your program, and anyone can send anything. A path, a header, and a query value are all strings a stranger typed. You will validate them properly in later lessons; the mindset starts now.

## Shaping the response

`res` is where most of your route code actually lives, and Express gives you a small set of methods that cover nearly everything.

**`res.send(body)`** is the general-purpose one. It inspects what you pass it and behaves accordingly:

```javascript
res.send("plain words");                 // Content-Type: text/html; charset=utf-8
res.send("<h1>Events</h1>");             // Content-Type: text/html; charset=utf-8
res.send({ ok: true });                  // Content-Type: application/json
res.send(Buffer.from("raw bytes"));      // Content-Type: application/octet-stream
```

Note the first case. A bare string is sent as `text/html`, not `text/plain` — Express assumes strings are markup. That is usually what you want and occasionally a surprise.

**`res.json(value)`** serializes with `JSON.stringify` and sets `Content-Type: application/json` explicitly. Passing an object to `res.send` does the same thing, but write `res.json` anyway when you mean JSON. It states the intent in the code, and intent is what the next person reads.

**`res.status(code)`** sets the status. It returns `res`, so it chains:

```javascript
app.get("/events/archive", (req, res) => {
  res.status(404).send("No archived events yet");
});
```

Calling `res.status(404)` alone does nothing visible — it sets a number on an object. Nothing is sent until you call a terminating method like `send`, `json`, `end`, or `sendStatus`. A route that only calls `res.status(404)` leaves the browser spinning until it times out, which is a genuinely confusing bug the first time you cause it.

**`res.sendStatus(code)`** is the shorthand for "this status and its standard name as the body": `res.sendStatus(403)` sends `403` with the body `Forbidden`. The one exception is `204 No Content`, which by definition never carries a body. `res.sendStatus(204)` sends the status and nothing else, because Node drops the body.

**`res.set(name, value)`** sets a response header:

```javascript
app.get("/events.txt", (req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.set("Cache-Control", "public, max-age=60");
  res.send(events.map((event) => `${event.date} ${event.title}`).join("\n"));
});
```

Setting `Content-Type` explicitly is the fix for the `text/html` default above. `Cache-Control` tells clients and proxies how long they may reuse this response — sixty seconds is a reasonable answer for a list that changes rarely, and it means a burst of visitors does not all hit your process.

**`res.type(mime)`** is a shortcut for setting just `Content-Type`, accepting either a full MIME type or an extension: `res.type("txt")`, `res.type("json")`, `res.type("text/csv")`.

**`res.end()`** ends the response with no body. You rarely call it directly — `res.sendStatus(204)` is clearer when you mean "done, nothing to say" — but it is the underlying method the others eventually reach, and you will see it in other people's code.

Choosing the status is a design decision, not a formality, so make it deliberately for each route. For the events board: the list at `/events` is `200` whether it holds five events or zero, because an empty list is a successful answer to a valid question. A request for an event that does not exist is `404`. A request that is malformed — a limit of `banana`, a date that is not a date — is `400`. A route you have not written yet is `501 Not Implemented`, which is more honest than a `404` because it tells the client the path is real and the feature is coming. And anything that reaches your code and throws is `500`. Write the status explicitly even when it is `200`; `res.status(200).json(...)` costs nothing and states what you decided.

One header Express sets that you did not ask for is `X-Powered-By: Express`. It advertises your framework to anyone scanning, which is free information for an attacker and of no value to you. Turn it off in one line near the top of the file:

```javascript
app.disable("x-powered-by");
```

When you send HTML from a string, remember that anything you interpolate into it is markup, not text. Dropping an event title into a heading with a template literal works fine until a title contains an angle bracket and your page renders wrong — or worse, until the value came from a visitor and contains a script tag. String-built HTML is acceptable for the placeholder pages in this lesson because every value is one you wrote yourself. It stops being acceptable the moment the data is not yours, which is one of the reasons lesson 06 introduces a template engine that escapes values for you.

Three rules about responses that will save you real time:

1. **Send exactly one response per request.** Every terminating method ends the response. Calling `res.send` twice, or calling `res.json` after `res.send`, throws `Cannot set headers after they are sent to the client` — Express is telling you the response is already on the wire and cannot be amended. The usual cause is a missing `return`:

   ```javascript
   app.get("/events/next", (req, res) => {
     if (events.length === 0) {
       res.status(404).send("No events scheduled");
       // missing return — execution continues into the line below
     }
     res.json(events[0]);
   });
   ```

   Write `return res.status(404).send(...)`. The `return` value is not used for anything; it exists to stop the function.

2. **Set headers before you send the body.** Headers go out first, so `res.set` after `res.send` is too late and will throw the same error.

3. **A route that does not respond hangs.** If your handler falls off the end without sending anything, Express does not answer. There is no timeout by default. Every path through every handler must reach exactly one terminating call.

## Choosing a port from the environment

Hardcoding `3000` works on your laptop and fails on every hosting platform there is. Hosts assign your process a port and communicate it through an environment variable — almost always `PORT` — and expect you to listen on that one. Bind to the wrong port and the platform sees a dead process and kills it.

Read it from `process.env`, with a local fallback:

```javascript
import process from "node:process";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
```

Two details matter here. **Environment variables are always strings.** `process.env.PORT` is `"8080"`, not `8080`. `app.listen` tolerates the string, but the moment you compare or arithmetic it, the string will bite you — coerce with `Number()` at the boundary and be done with it. And **`||` gives you the fallback for free**, because `Number(undefined)` is `NaN`, which is falsy, as is `Number("")`.

Set it temporarily to prove it works:

```bash
PORT=4000 npm start
```

This is the first piece of **configuration** in the app, and configuration is anything that changes between environments: ports, hostnames, log levels, and later, credentials. The rule is that configuration comes from the environment and never from a literal in your source. The immediate practical benefit is that the same committed code runs identically on your machine and on the host. The longer-term benefit is that when a secret eventually appears, the mechanism for handling it already exists and does not involve a commit.

Keep local values in the `.env` file that your `.gitignore` already excludes, and load them with Node's built-in support:

```bash
node --env-file=.env src/server.js
```

Which brings the whole startup together:

```javascript
import express from "express";
import process from "node:process";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// routes registered here

const server = app.listen(PORT, () => {
  console.log(`events-board listening on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server");
  server.close(() => process.exit(0));
});
```

That last block is worth having early. `SIGTERM` is the signal a host sends when it wants your process to stop — during a deploy, a restart, or a scale-down. `server.close()` stops accepting new connections and lets in-flight requests finish before exiting. Without it, the platform waits, gives up, and kills the process mid-request. Ten lines now, no mysterious truncated responses later.

One thing that surprises people testing this locally: pressing Ctrl+C in the terminal does **not** send `SIGTERM`. It sends `SIGINT`, a different signal, so the handler above never runs and Node simply exits. To send the signal a host would send, find the process id and send it yourself from a second terminal:

```bash
pgrep -f "src/server.js"     # prints the process id, e.g. 48213
kill -TERM 48213
```

If you also want Ctrl+C to shut down cleanly, register the same function for both signals: `process.on("SIGINT", shutdown)` and `process.on("SIGTERM", shutdown)`.

## A dev loop, and testing what you built

Stopping and restarting the server by hand after every edit gets old within an hour, and worse, it makes you doubt your own changes — half of "my fix didn't work" is a server still running the old code.

Node has a built-in watcher:

```bash
node --watch src/server.js
```

It restarts the process whenever a file it has loaded changes. Put it in `package.json` so nobody has to remember it:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  }
}
```

`nodemon` does the same job and predates the built-in flag by years. You will find it in most existing projects:

```bash
npm install --save-dev nodemon
```

```json
{
  "scripts": {
    "dev": "nodemon src/server.js"
  }
}
```

It has more configuration — which extensions to watch, which directories to ignore, a delay before restarting. For this project `--watch` is enough, and it is one fewer dependency. Use `nodemon` when you join a project that already uses it.

Either way, watch the terminal. When the restart output appears, your change is live. When it does not, the process crashed on startup and the error is right there.

The browser is a fine way to check an HTML page and a poor way to check anything else. It only issues `GET`s from the address bar, it hides headers and status codes unless you open developer tools, and it aggressively caches. **`curl` shows you the truth.**

```bash
curl http://localhost:3000/events
```

That prints the body only. Add `-i` to see the status line and headers, which is what you actually need when debugging:

```bash
curl -i http://localhost:3000/health
```

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 30
ETag: W/"1e-yQxJ2..."

{"status":"ok","eventCount":3}
```

Read every line of that. The status is `200`. The `Content-Type` proves `res.json` set the header. The `Content-Length` proves the body was fully written: `{"status":"ok","eventCount":3}` is exactly 30 bytes. `ETag` is a cache validator Express adds automatically; the `1e` at its start is that same length in hexadecimal. `X-Powered-By` is there because this output came from a server without the `app.disable("x-powered-by")` line from the previous section. Add it, and the header disappears from your output.

Useful flags:

```bash
curl -i http://localhost:3000/events            # status + headers + body
curl -s http://localhost:3000/health            # quiet: body only, no progress meter
curl -H "Accept: application/json" http://localhost:3000/events   # send a header
curl -X POST http://localhost:3000/events       # use a different method
curl -v http://localhost:3000/                  # full request and response, verbose
```

Try that `-X POST` against your `/events` route. You will get a `404`, with a body that says `Cannot POST /events`. That is Express telling you something precise: `app.get` registered a handler for the `GET` method only, and a `POST` to the same path matches nothing. Method and path together identify a route — that is the foundation of the next lesson.

A last debugging note. When a route returns something you did not expect, work outward in this order: is the server running the code you just wrote (check the restart output), is the request reaching the route (log inside the handler), and is the response what you think it is (`curl -i`, not the browser). Nearly every problem at this stage is answered by one of those three checks, and guessing is slower than all of them combined.

## Practice

Extend the `events-board` project into a real, inspectable HTTP server.

1. Replace `src/server.js` with an Express app that creates `app`, keeps the in-memory `events` array, and listens on `Number(process.env.PORT) || 3000`, logging the URL it is listening on.
2. Add `GET /` returning a short HTML string that names the service — a heading and one sentence is enough.
3. Add `GET /events` that returns a plain-text list of all events, one per line, with `Content-Type: text/plain; charset=utf-8` set explicitly via `res.set`. Confirm the header with `curl -i` and explain in a comment why `res.send` alone would have sent `text/html`.
4. Add `GET /health` that returns JSON with `status`, `eventCount`, and `uptime` (use `process.uptime()`), with an explicit `200`.
5. Add `GET /events/next` that returns the earliest event as JSON, or a `404` with a short message when the array is empty. Make sure the `404` branch returns — then deliberately remove the `return`, reproduce the `Cannot set headers after they are sent to the client` error by emptying the array, read it, and put the `return` back.
6. Add `GET /events.txt` that sets `Cache-Control: public, max-age=60` alongside the text body, and verify both headers with `curl -i`.
7. Add a `dev` script using `node --watch`. With it running, change the text of the `/` route and confirm the new text appears without you restarting anything.
8. Start the server with `PORT=4100 npm start` and confirm it binds to 4100 and that 3000 now refuses connections.
9. Using `curl -i`, capture the status line and `Content-Type` for every route you wrote, plus one `curl -X POST http://localhost:3000/events`. Paste the eight results into `NOTES.md` and write one sentence for the `POST` result explaining why it is a `404`.
10. Add the `SIGTERM` handler that calls `server.close()`. Start the server, then from a second terminal send it `SIGTERM` with `kill -TERM <pid>` (find the pid with `pgrep -f "src/server.js"`) and confirm your shutdown message prints. Then press Ctrl+C on a fresh run and note that the message does *not* print, because Ctrl+C sends `SIGINT`. Register the same handler for `SIGINT` if you want both to shut down cleanly.

**Deliverable:** a committed `src/server.js` serving five routes on a port read from the environment, a `dev` script that restarts on change, and a `NOTES.md` holding your annotated `curl -i` output.

## Check your understanding

1. A handler calls `res.status(404)` and nothing else. What does the browser see?
   *Nothing. It spins until it times out. `res.status` only sets a number; no response is sent until a terminating method such as `send`, `json`, `end`, or `sendStatus` runs.*
2. `res.send("Events")` and `res.send({ ok: true })`: which `Content-Type` does each produce?
   *`text/html; charset=utf-8` for the string, `application/json; charset=utf-8` for the object.*
3. A request for an event that does not exist: `404` or `500`? Why does the choice matter?
   *`404`. The client asked for something that isn't there; the server did not break. Returning `500` makes monitoring page someone for typos in URLs.*
4. Your app works locally and the host reports "no open port detected." What should you check first?
   *That the app listens on `Number(process.env.PORT)` rather than a hard-coded `3000`.*
