---
lesson_id: node200-05
course_id: node200
pathway: software-developer
title: Authentication and Session Handling
order: 5
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Implement authentication and session handling for a web service
---

## Two questions, not one

Every protected action in a web service answers two separate questions.

**Authentication** asks *who is this?* The visitor presents a credential, the server checks it, and from then on the server has a claim about identity.

**Authorization** asks *may this person do this?* Given an identity, is this particular action on this particular resource permitted?

They are constantly conflated and they fail differently. A service with weak authentication lets strangers in. A service with weak authorization lets legitimate users read each other's data — which is the more common defect, because it hides behind a working login page and looks fine until someone changes an id in a URL. You will build both, and you will keep them in different places: authentication at the edge of the request, authorization in the service layer where the rules already live.

There is a third piece that only exists because of how HTTP works. The protocol is stateless: each request arrives with no memory of the last. Proving your identity once therefore has to produce something the browser can present on every subsequent request. That something is a **session**, and the mechanism is a cookie carrying an opaque identifier.

Here is the loop you are building:

![The session login flow: a browser posts credentials, the server verifies the password hash, creates a session row and sets a signed cookie, and each later request is identified by that cookie](./img/session-login-flow.png)

1. The browser posts an email and password to `POST /login`.
2. The server looks up the account, verifies the password against a stored hash, and — if it matches — creates a session record and sends back a `Set-Cookie` header holding a random session id.
3. Every later request from that browser automatically includes `Cookie: sid=...`.
4. Middleware turns that id back into a session, and the session into a user, before any route runs.
5. `POST /logout` destroys the session record and clears the cookie.

The security of the whole scheme rests on two properties: the password is never stored in a form anyone can read, and the session id is unguessable and cannot be read or forged by anything other than the server.

## Storing a password without storing the password

Rule one, with no exceptions: **you never store a password**, and you never store anything from which a password can be recovered. Not plaintext, not encrypted — encryption is reversible, and a key that decrypts the password table is a key that will eventually be stolen alongside it.

You store a **hash**: the output of a one-way function that maps the password to a fixed value which cannot be reversed. At login you hash the submitted password the same way and compare the results.

Not every hash is suitable. `md5` and `sha256` are designed to be *fast*, which is exactly wrong here: fast means an attacker with a stolen table can try billions of candidate passwords per second on a graphics card. Password hashing needs a function deliberately made slow and memory-hungry, with a tunable cost. Use **argon2id** (the current recommendation) or **bcrypt** (older, still fine, widely deployed). Both also handle **salting** for you — mixing a unique random value into each hash so that two users with the same password get different hashes, and so that a precomputed table of common passwords is useless.

```bash
npm install argon2
```

```javascript
// src/lib/password.js
import argon2 from "argon2";

const OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(plain) {
  return argon2.hash(plain, OPTIONS);
}

export function verifyPassword(hash, plain) {
  return argon2.verify(hash, plain);
}
```

The resulting hash is a single string that carries its own parameters and salt:

```text
$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG
```

That self-describing format is what lets you raise the cost later without breaking existing users: `argon2.verify` reads the parameters out of the stored hash, so an old hash still verifies. When you increase the cost, re-hash on successful login and store the new value.

Store it in a column that cannot be selected by accident, and keep it out of your repository's column list:

```javascript
// migrations/2026..._create_accounts.js
export async function up(knex) {
  await knex.schema.createTable("accounts", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("email", 254).notNullable();
    t.specificType("email_normalized", "citext").notNullable().unique();
    t.text("password_hash").notNullable();
    t.string("display_name", 120).notNullable();
    t.timestamp("last_login_at", { useTz: true });
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}
```

Two details there. Email is stored twice: as the user typed it, and normalized (trimmed and lower-cased) with the unique constraint on the normalized column, because `Ada@Example.com` and `ada@example.com` are the same person and you must not allow two accounts. The `citext` type needs `CREATE EXTENSION IF NOT EXISTS citext` in an earlier migration; a plain lower-cased `text` column works just as well if you prefer.

And in the repository from lesson 04, `password_hash` is **not** in the shared `COLUMNS` list. It is selected only by the one function that needs it:

```javascript
const COLUMNS = ["id", "email", "display_name", "created_at"];

export async function findById(id) {
  return toDomain(await db("accounts").select(COLUMNS).where({ id }).first());
}

export async function findCredentialsByEmail(email) {
  const row = await db("accounts")
    .select(["id", "password_hash"])
    .where({ email_normalized: email.trim().toLowerCase() })
    .first();
  return row ? { id: row.id, passwordHash: row.password_hash } : null;
}
```

That separation is the practical defence against the hash leaking into a log line, a JSON response, or a rendered template — none of which are hypothetical.

## Signup

```javascript
// src/services/accounts.service.js
import * as accountsRepo from "../repositories/accounts.repository.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { ConflictError, ValidationError, AuthError } from "../errors/index.js";

const MIN_PASSWORD_LENGTH = 12;

export async function signUp({ email, password, displayName }) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  const passwordHash = await hashPassword(password);
  try {
    return await accountsRepo.insert({ email, displayName, passwordHash });
  } catch (err) {
    if (err.code === "23505") throw new ConflictError("An account with that email already exists");
    throw err;
  }
}
```

The length floor deserves a word, because password policy is an area where folklore outlives evidence. Current guidance from NIST and from every large provider is: **require length, allow everything, and check against known-breached lists.** Composition rules — one uppercase, one digit, one symbol — measurably push people toward `Password1!` and add almost nothing. Do not cap length below about 64 characters, and do not silently truncate (bcrypt notoriously ignores everything past 72 bytes, which is one reason to prefer argon2). Do not force periodic rotation without cause; it produces `Summer2026`, then `Summer2027`. Do accept and preserve spaces, so passphrases work. The single highest-value check is rejecting passwords already known to be compromised, and the rest of the ceremony is theatre.

Note also what the catch block does: it relies on the database's unique constraint rather than a "does this email exist?" query beforehand. A check-then-insert has a race between the two statements; the constraint has none. Reaching for the constraint instead of the check is the same instinct you used for registrations in lesson 04.

## Sessions

Install the session middleware and a store that keeps sessions in Postgres, so they survive a restart and are shared across processes:

```bash
npm install express-session connect-pg-simple
```

```javascript
// src/middleware/session.js
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { config } from "../config/index.js";

const PgStore = connectPgSimple(session);

export const sessionMiddleware = session({
  name: "eb.sid",
  store: new PgStore({
    conString: config.databaseUrl,
    tableName: "user_sessions",
    createTableIfMissing: false, // create it in a migration instead
  }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
    path: "/",
  },
});
```

Registered in `createApp` after body parsing and before any router that needs it:

```javascript
app.use(sessionMiddleware);
app.use(loadCurrentUser);
```

Every option there is a decision, and the defaults are not all safe.

**`store`** is the one people skip. Without it, `express-session` uses an in-memory store that leaks memory, loses every session on restart, and is not shared between processes — it prints a warning telling you exactly this, and production incidents follow from ignoring it. Sessions in Postgres cost you one small table and remove all three problems.

**`secret`** signs the cookie so a client cannot forge a session id. It comes from `config.sessionSecret`, which comes from the environment, and it is a genuine secret: 32 random bytes, never committed, different in every environment. Changing it invalidates every existing session, which is a useful emergency lever.

**`resave: false`** stops writing the session back to the store on every request when nothing changed. **`saveUninitialized: false`** stops creating a session row for every anonymous visitor — without it, every crawler that ever hits your site gets a row.

**`httpOnly: true`** means JavaScript in the page cannot read the cookie, so a cross-site scripting bug cannot simply exfiltrate sessions. **`secure: true`** means the cookie is only ever sent over HTTPS; it must be off locally over plain HTTP, hence the environment check. Behind a proxy that terminates TLS you also need `app.set("trust proxy", 1)`, or Express believes the connection is insecure and never sets the cookie — a classic "works locally, no login in production" bug.

**`sameSite: "lax"`** tells the browser not to send the cookie on cross-site POST requests, which removes most of the cross-site request forgery surface for free. `strict` is tighter but breaks the case where someone follows a link into your site from elsewhere and expects to still be logged in.

**`maxAge` with `rolling: true`** gives an eight-hour idle timeout that extends on activity, rather than a hard expiry mid-task. Pick a number and be able to justify it: eight hours suits an internal tool, thirty minutes suits anything holding money.

The store table belongs in a migration like everything else:

```javascript
export async function up(knex) {
  await knex.schema.createTable("user_sessions", (t) => {
    t.string("sid").primary();
    t.json("sess").notNullable();
    t.timestamp("expire", { useTz: true }).notNullable().index();
  });
}
```

## Login, logout, and the session fixation trap

```javascript
// src/routes/auth.routes.js
import { Router } from "express";
import * as accountService from "../services/accounts.service.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const account = await accountService.authenticate(req.body);

    // regenerate() replaces the session with an empty one, so read
    // anything you need from the old session first.
    const returnTo = req.session.returnTo;
    const safeReturnTo =
      typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : "/events";

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = account.id;
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        res.redirect(safeReturnTo);
      });
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("eb.sid");
    res.redirect("/");
  });
});
```

`req.session.regenerate` is not optional and it is not decoration. Without it, the session id the visitor had *before* logging in stays valid *after*. An attacker who can set a cookie in someone's browser — through a shared machine, a subdomain, or a link — can fix a known session id in advance, wait for the victim to log in, and then use that id as the now-authenticated user. This is **session fixation**, and regenerating the id at the moment privilege changes is the entire fix. Regenerating also throws away everything stored in the old session, which is why the handler reads `returnTo` *before* calling `regenerate`. Read it afterwards and it is always `undefined`, and every login lands on `/events`. The check that `returnTo` starts with a single `/` keeps the redirect on your own site; a value like `//evil.example` would otherwise send a freshly logged-in user somewhere else (an **open redirect**). Do the same on logout (destroy, not just clear the user id) and on any other privilege change, such as an account switching to admin.

The explicit `req.session.save` before redirecting matters when the store is a database: the redirect can otherwise race the asynchronous write, and the next request arrives before the session row exists. The symptom is a login that appears to work but leaves you logged out, intermittently, more often on a fast connection.

The service behind it:

```javascript
export async function authenticate({ email, password }) {
  const credentials = await accountsRepo.findCredentialsByEmail(email ?? "");

  if (!credentials) {
    // Hash anyway so a missing account takes the same time as a wrong password.
    await hashPassword(password ?? "");
    throw new AuthError("Invalid email or password");
  }

  const ok = await verifyPassword(credentials.passwordHash, password ?? "");
  if (!ok) throw new AuthError("Invalid email or password");

  await accountsRepo.touchLastLogin(credentials.id);
  return accountsRepo.findById(credentials.id);
}
```

Two deliberate choices. The error message is identical for an unknown email and a wrong password, and the response status is identical too. Distinguishing them turns your login form into an **account enumeration** oracle: an attacker can discover which addresses have accounts, which is useful for phishing and for credential stuffing. The same rule applies to signup ("if that address is new, we have sent a link") and to password reset ("if that address has an account, we have sent a link") — neither should confirm existence.

Be honest about the tension with the `signUp` function earlier in this lesson: its `ConflictError("An account with that email already exists")` is exactly such a confirmation. Anyone can learn whether an address has an account by trying to sign up with it. Many services accept that leak, because a signup form that refuses to explain a duplicate is confusing, and they rely on the rate limiter below to make bulk probing slow. The enumeration-safe alternative is for signup to always answer "check your email to continue", and then send either a verification link (new address) or a "you already have an account — sign in or reset your password" message (existing address). Choose one deliberately and record which in your design note. Don't claim the login form is enumeration-proof while signup answers the question for free.

The deliberate wasted hash in the not-found branch closes the *timing* version of the same leak. Verifying argon2 takes tens of milliseconds; a database miss takes one. Without the dummy hash, response time alone tells an attacker which addresses exist.

## Knowing who is logged in

One middleware turns a session into a user, and it runs for every request:

```javascript
// src/middleware/load-current-user.js
import * as accountService from "../services/accounts.service.js";

export async function loadCurrentUser(req, res, next) {
  if (!req.session?.userId) return next();
  try {
    const user = await accountService.getById(req.session.userId);
    if (!user) {
      // The account was deleted while the session lived on.
      return req.session.destroy(() => next());
    }
    req.currentUser = user;
    res.locals.currentUser = user;
    next();
  } catch (err) {
    next(err);
  }
}
```

`req.currentUser` is for your code; `res.locals.currentUser` is automatically available to every rendered template, so a layout can show a name and a logout button without every handler passing it.

That is one database read per request, which is the price of always-fresh permissions — if an account is disabled, the very next request notices. Caching the user in the session avoids the read at the cost of stale data. Take the read until you have measured a reason not to.

Then the guard:

```javascript
// src/middleware/require-auth.js
export function requireAuth(req, res, next) {
  if (req.currentUser) return next();

  if (req.accepts("html") && req.method === "GET") {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  res.status(401).json({ error: { code: "unauthenticated", message: "Sign in required" } });
}
```

Two behaviours because there are two kinds of client. A browser asking for a page should be sent to the login form and returned afterwards. An API client should get a `401` and a JSON body, because a redirect to an HTML login page is useless to it. Note that `401` means "not authenticated"; `403` means "authenticated but not permitted". Using them the other way around is a small thing that misleads every client author who reads your API.

Apply it at the router level, as in lesson 02:

```javascript
app.use("/events", eventsRouter);            // public listing
app.use("/organizer", requireAuth, organizerRouter);
```

Whitelist, do not blacklist: protect groups of routes by mounting them behind the guard, rather than adding `requireAuth` route by route. The route you forget is the one that leaks.

## Authorization belongs in the service

`requireAuth` proves someone is signed in. It says nothing about whether *this* signed-in person may cancel *this* event. That check needs the resource, so it belongs where the resource is loaded — the service:

```javascript
export async function cancel(eventId, actorId) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw new NotFoundError(`No event with id ${eventId}`);
  if (event.organizerId !== actorId) {
    throw new ForbiddenError("Only the organizer may cancel this event");
  }
  return eventsRepo.update(eventId, { status: "cancelled" });
}
```

```javascript
eventsRouter.post("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    await eventService.cancel(req.params.id, req.currentUser.id);
    res.redirect(`/events/${req.params.id}`);
  } catch (err) { next(err); }
});
```

The route passes an **actor id**, not the whole request. That keeps the service free of HTTP — the same rule from lesson 02 — and it means the ownership rule can be tested with a function call.

The failure this prevents has a name: **insecure direct object reference**. A route that loads a resource by an id from the URL and renders it, with no ownership check, lets any signed-in user read any record by changing a number. It is consistently one of the most common serious defects in real applications, it is invisible in the user interface, and the only reliable defence is to make the ownership check part of the operation itself rather than something a caller remembers to do.

Order the checks so you do not leak existence: if a user may not see an event at all, returning `404` rather than `403` avoids confirming that the id exists. For a resource whose existence is public, `403` is more honest and more helpful.

## Cross-site request forgery

If a signed-in visitor loads a hostile page, that page can make their browser submit a form to your service, and the browser will attach their cookie. Nothing about the request is forged — it is genuinely from that user's browser — which is why it works.

`sameSite: "lax"` blocks the common form of this for cross-site POSTs, and for many applications that is now sufficient. Where you want defence in depth, or must support browsers and flows where `sameSite` is not enough, add a **CSRF token**: a random value stored in the session, embedded as a hidden field in every state-changing form, and checked on submission. Only your own pages can read it, so only your own pages can produce a valid submission.

```javascript
// src/middleware/csrf.js
import crypto from "node:crypto";

export function csrfToken(req, res, next) {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString("base64url");
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

export function verifyCsrf(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const sent = req.body?._csrf ?? req.get("x-csrf-token");
  const expected = req.session?.csrfToken;
  if (typeof sent !== "string" || typeof expected !== "string") return reject(res);

  const sentBuf = Buffer.from(sent);
  const expectedBuf = Buffer.from(expected);
  // timingSafeEqual throws if the byte lengths differ, so check bytes, not characters.
  if (sentBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sentBuf, expectedBuf)) {
    return reject(res);
  }
  next();
}

function reject(res) {
  return res.status(403).json({ error: { code: "csrf_failed", message: "Invalid request token" } });
}
```

Two details in `verifyCsrf` are there because an attacker controls `sent`. The `typeof` check matters because a form that submits `_csrf` twice is parsed into an *array*, not a string. The length check compares **bytes**: a token containing non-ASCII characters can have the same string length as yours but a different byte length, and `timingSafeEqual` throws on unequal lengths. Either mistake would turn a forged request into a `500` rather than a clean `403`.

Mind where you mount `csrfToken`. It writes to the session, and a session that has been written to is saved even with `saveUninitialized: false`. Mount it globally and every anonymous visitor (crawlers included) gets a session row again. Mount it only on the routers that render state-changing forms, including the login page, so that login itself is CSRF-protected. `verifyCsrf` goes on every router that accepts cookie-authenticated `POST`s.

```html
<form method="post" action="/events/123/cancel">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <button type="submit">Cancel event</button>
</form>
```

Note `timingSafeEqual` rather than `===`. Comparing secrets with `===` returns as soon as two bytes differ, and the time that takes leaks how much of the value was correct. Any comparison of a secret should be constant-time.

Two related habits: state-changing operations must never be reachable by `GET` — a link a browser can prefetch must not cancel an event — and this protection is for cookie-authenticated requests. An API authenticated by a header token is not vulnerable in the same way, because a browser will not attach that header on a hostile page's behalf.

## Slowing down the attacker

A login endpoint with no limits is a free password-guessing service. You need two limits, not one. One limit is keyed on the client's address, so one attacker cannot spread guesses across many accounts. The other is keyed on the account, so one account cannot be attacked from many addresses. A single limiter keyed on the *combination* (`ip:email`) does neither: every new email gives the same attacker a fresh 10 attempts, and every new address gives the same account a fresh 10.

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from "express-rate-limit";

const tooMany = { error: { code: "too_many_attempts", message: "Try again in a few minutes" } };

// One client, any accounts: stops spraying many accounts from one address.
export const loginLimiterByIp = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count
  message: tooMany,
});

// One account, any clients: stops many addresses hammering one account.
export const loginLimiterByAccount = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `acct:${String(req.body?.email ?? "").trim().toLowerCase()}`,
  message: tooMany,
});

authRouter.post("/login", loginLimiterByIp, loginLimiterByAccount, /* … */);
```

The per-IP limit is higher because a whole office or school can share one address. `skipSuccessfulRequests` means a successful login (any status below 400, so your `302`) does not use up the allowance. Be aware that a per-account limit lets an attacker deliberately lock a real user out by failing on purpose. Keep the window short, and log lockouts so they can be spotted. The per-IP limiter uses the library's default key, the client address. Check your installed version's documentation for how it groups IPv6 addresses.

Behind a proxy this needs `trust proxy` set correctly, or every request appears to come from the proxy and one visitor's failures lock out everybody. Apply the same treatment to signup and password reset, which are also abused.

Three more items belong on the checklist for any service that has a login, even though each is a small change:

- **Add `helmet`** (`npm install helmet`, `app.use(helmet())`) for a sensible set of security response headers, including a content security policy that limits the damage a script injection can do.
- **Log authentication events** — success, failure, logout, lockout — with the account id and address but *never* the password or the session id. Lesson 08 does the logging properly; the events themselves are decided here.
- **Have a password change path that invalidates other sessions.** "Sign out everywhere" is what a user reaches for when they think they have been compromised, and it means deleting that account's rows from the session table.

## A note on tokens

You will meet services that use a signed token — commonly a JSON Web Token — instead of a server-side session. The trade is straightforward: a token carries its claims inside itself, so the server holds no state and any instance can verify any request, which suits an API consumed by mobile clients or other services. The cost is that a token cannot be revoked, because nothing is looked up; it is valid until it expires, so logging someone out immediately requires adding back exactly the server-side state you removed. Storing a token in browser-accessible storage also exposes it to script injection in a way an `httpOnly` cookie is not.

For a server-rendered application with a browser front end — this course's case, and a large share of real ones — a server-side session in an `httpOnly` cookie is the simpler and safer default. Choose tokens when you have a reason you can state.

## Practice

Add accounts, sessions, and authorization to the events board on top of the data layer from lesson 04.

1. Add `SESSION_SECRET` to `src/config/index.js` and `.env.example`, generated with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Make startup fail with a clear message when it is absent.
2. Write migrations for `accounts` (with a normalized unique email and a `password_hash` column) and `user_sessions`. Confirm `password_hash` does not appear in the accounts repository's shared column list.
3. Implement `src/lib/password.js` with argon2id, then write a throwaway script that hashes `"correct horse battery staple"` twice and prints both results. Explain in `NOTES.md` why the two hashes differ but both verify.
4. Implement `signUp` in the accounts service with a 12-character minimum, relying on the unique constraint rather than a pre-check, and translating error `23505` into a conflict.
5. Wire `express-session` with `connect-pg-simple` and the cookie options from this lesson. Log in, then inspect the cookie in your browser's developer tools and confirm `HttpOnly` and `SameSite` are set. Query the `user_sessions` table and confirm exactly one row exists for your login and none for an anonymous visit.
6. Implement `POST /login`, `POST /logout`, and `authenticate` with an identical error for unknown-email and wrong-password, plus the dummy hash on the not-found path. Measure it: time 10 logins with a real email and a wrong password, and 10 with an email that does not exist, and record both averages in `NOTES.md`. They should be within a few milliseconds.
7. Prove the fixation defence. Because of `saveUninitialized: false`, an anonymous visitor normally has no cookie at all, so first create a pre-login session: temporarily add a route such as `GET /hello` that sets `req.session.visited = true` (or do this step after step 8, and request a protected page so `requireAuth` stores `returnTo`). Record the `eb.sid` cookie value before logging in and after. Then remove `req.session.regenerate`, repeat, and record what changes. Restore it and write two sentences on what an attacker could do with the version you removed.
8. Add `loadCurrentUser` and `requireAuth`. Mount an `/organizer` router behind the guard with a page listing the current user's events. Confirm that requesting it signed out redirects a browser to `/login` and returns `401` JSON to `curl -H "Accept: application/json"`.
9. Add an ownership rule: only the organizer may cancel an event, enforced in the service and given a `403`. Then demonstrate the vulnerability it fixes — sign in as organizer A, take the id of an event owned by organizer B, and confirm the cancel is refused. Remove the check, confirm it succeeds, and put it back.
10. Add CSRF tokens to every state-changing form and verify them, using `timingSafeEqual`. Show a `403` from `curl -X POST` with a valid session cookie but no token.
11. Add the login rate limiter and prove it: script 15 failed logins in a loop and record the status codes of attempts 1 through 15 in `NOTES.md`.
12. Write a short section in `docs/design-notes.md` recording your session lifetime, your cookie flags, and the reason for each, so a reviewer can challenge the numbers rather than guess at them.

**Deliverable:** an events board with signup, login, logout, a persisted session store, a protected organizer area, an ownership-enforced cancel, CSRF-protected forms, and a rate-limited login — plus a `NOTES.md` containing the timing measurements, the fixation experiment, and the rate-limit results.

## Check your understanding

1. Your login handler calls `req.session.regenerate` and then redirects to `req.session.returnTo`. Users report they always land on `/events` after signing in. Why?
2. Which status code should a signed-in user get when they try to cancel someone else's event, and which should a signed-out API client get for the same request? Where in the code is each decided?
3. Login works locally but in production the browser never receives a session cookie. The cookie has `secure: true` and the app runs behind a TLS-terminating proxy. What is missing?
4. Why is `sha256(password + salt)` not an acceptable password hash, even with a unique salt per user?

**Answers**

1. `regenerate` replaces the session with a new, empty one, so `returnTo` is gone by the time you read it. Read it before regenerating.
2. Signed in but not the owner: `403`, decided in the service (`ForbiddenError` from the ownership check). Signed out: `401`, decided by `requireAuth` before the service is called. If even the event's existence should be hidden, use `404`.
3. `app.set("trust proxy", 1)` (or the correct hop count). Without it, Express sees the proxy's plain-HTTP connection, treats the request as insecure, and `express-session` refuses to set a `secure` cookie.
4. SHA-256 is designed to be fast, so an attacker with a stolen table can test billions of guesses per second. Password hashing needs a deliberately slow, memory-hard function with a tunable cost, such as argon2id (or bcrypt).
