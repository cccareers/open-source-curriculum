---
course_id: node200
media_id: node200-v02
type: video-script
title: "Watching Session Fixation Happen"
format: screencast
target_runtime: "8 min"
related_lessons:
  - node200-05
objectives:
  - Implement authentication and session handling for a web service
competency_ids:
  - D2-S1-C04
---

## Purpose

After watching, you can demonstrate session fixation against your own events board, explain exactly why `req.session.regenerate` stops it, and avoid the `returnTo` bug that `regenerate` introduces.

## Audience and prerequisites

Apprentices partway through lesson 05. They have `express-session` with `connect-pg-simple` working and a `/login` route, and they can open browser developer tools. They have not yet done practice step 7.

## Script

Recording setup: Chrome with DevTools docked at the bottom (Application → Cookies → `http://localhost:3000`), a terminal running `psql events_board`, and VS Code with `src/routes/auth.routes.js`. Use two browser profiles with distinct window themes, labelled on screen as "ATTACKER" (top-left badge) and "VICTIM" (top-right badge). The labels are text, not just colour. A temporary route `GET /hello` sets `req.session.visited = true` so an anonymous visitor gets a session.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: two browser windows side by side, both showing the organizer dashboard for "Rosa Parks Park Committee". Badge ATTACKER on one, VICTIM on the other. | "Two browsers, both signed in as the same organizer. Only one of them ever typed the password. Let's see how the other one got in." |
| 0:15 | Title card: "Watching session fixation happen". | "This is session fixation. The fix is one function call, and you're going to watch it work." |
| 0:25 | VS Code: `auth.routes.js` with the *vulnerable* login handler (block A). Highlight the missing `regenerate`. | "Here's a login handler with a mistake that's easy to make. It checks the password, then sets `userId` on whatever session the browser already had. It doesn't create a new session. It upgrades the old one." |
| 0:50 | ATTACKER window: visit `http://localhost:3000/hello`. DevTools → Cookies shows `eb.sid` with value `s%3AQk7…`. Zoom on the value. Copy it. | "The attacker starts by getting a session of their own, as an anonymous visitor. Any page that writes to the session will do; here it's a test route called `/hello`. DevTools shows the cookie `eb.sid`. The attacker copies its value." |
| 1:15 | psql: `SELECT sid, sess FROM user_sessions;` shows one row, `sess` = `{"cookie":{…},"visited":true}`, no `userId`. | "In the database there's one session row, anonymous. No user id." |
| 1:30 | Narrated explanation over a static slide: "How does the victim's browser end up with the attacker's cookie? A shared kiosk; a sibling subdomain that can set cookies for the parent domain; an injected script on a related site." | "Next, the attacker plants that cookie in the victim's browser. In real attacks that happens on a shared computer, through a subdomain the attacker controls, or through an injection bug elsewhere. For the demo, we'll paste it in by hand." |
| 1:50 | VICTIM window: DevTools → Cookies → double-click the `eb.sid` value field and paste the attacker's value. Press Enter. Status bar text: "Cookie set by hand to simulate planting". | "In the victim's DevTools I edit the `eb.sid` cookie and paste the attacker's value. Now both browsers present the same session id." |
| 2:10 | VICTIM: go to `/login`, type `organizer@example.test` and the password, submit. Lands on `/events`. | "The victim signs in normally, with the correct password and no warnings." |
| 2:25 | psql: same query. The same `sid` now has `"userId":"…"` in `sess`. Highlight that the sid is unchanged. | "Back in the database it's still one row, with the same sid as before. But now it carries the victim's user id. The anonymous session the attacker created has been promoted to a signed-in session." |
| 2:45 | ATTACKER window: reload `/organizer`. The dashboard appears with the organizer's name. | "So the attacker reloads, and they're in. They never saw the password. They chose the session id in advance and waited for someone to log into it." |
| 3:05 | VS Code: replace with the fixed handler (block B), first *without* the `returnTo` lines. Highlight `req.session.regenerate`. | "The fix: at the moment privilege changes, throw the old session away and issue a new one. `req.session.regenerate` destroys the old row and creates a fresh session with a new random id. We set `userId` on the new one, and save it explicitly before redirecting so the database write wins the race against the next request." |
| 3:35 | Restart the server. Repeat the steps quickly: ATTACKER `/hello`, copy, paste into VICTIM, VICTIM logs in. VICTIM DevTools now shows a *different* `eb.sid`. psql shows the old sid gone and a new sid with `userId`. ATTACKER reloads `/organizer` → redirected to `/login`. | "Same attack, end to end. The victim logs in, and look at their cookie: a new value. In the database the planted sid is gone. The attacker reloads and gets bounced to the login page. Their id is now worth nothing." |
| 4:15 | Slide: "Regenerate on every privilege change: login, logout (destroy), role change, password change." | "Do this every time privilege changes: login, an account becoming an admin, a password change. On logout, go further and destroy the session." |
| 4:35 | VS Code: show `requireAuth` setting `req.session.returnTo = req.originalUrl`. Then, in the browser, signed out, visit `/organizer/events`. Get redirected to `/login`, log in, and land on `/events`, not `/organizer/events`. | "Now the trap that comes with the fix. `requireAuth` remembers where you were going in `req.session.returnTo`. I visit an organizer page signed out, get sent to login, sign in... and land on `/events`. The page I asked for is lost." |
| 5:05 | VS Code: highlight `res.redirect(req.session.returnTo ?? "/events")` *inside* the regenerate callback. Overlay arrow: "new, empty session". | "Why? `regenerate` replaced the session with an empty one. By the time we read `returnTo`, it belongs to a session that no longer exists." |
| 5:25 | VS Code: type the final version (block C). The `returnTo` value is captured before `regenerate`, with the relative-path check. | "Read it first, then regenerate. And check that it starts with a single slash. `returnTo` came from the request, so a value like `//evil.example` would turn your login into an open redirect to someone else's site." |
| 5:55 | Browser: repeat. Sign in from `/organizer/events` and land on `/organizer/events`. | "Signed out, ask for the organizer page, log in, and land where I meant to go." |
| 6:10 | psql: `SELECT count(*) FROM user_sessions;` before and after an anonymous visit to `/events`. Count unchanged. | "One more check from lesson 05. An anonymous visit to a public page creates no row, because `saveUninitialized` is false. Only a session something writes to gets saved. That's also why `/hello` existed for this demo." |
| 6:30 | Recap card with three lines. | "To recap. Session fixation works when login upgrades an existing session. The fix is `regenerate` at every privilege change. And anything you need from the old session, read it before you regenerate." |
| 6:50 | Practice card: "Lesson 05, practice step 7 — record your cookie before and after; remove regenerate; repeat; restore." | "Now do it yourself in practice step 7. Record both cookie values, remove the fix and watch it fail, then put it back, and write down what an attacker could have done." |
| 7:10 | End card. | "And delete `/hello` before you commit." |

### Code shown on screen

Block A, the vulnerable handler (for the demo only):

```javascript
authRouter.post("/login", async (req, res, next) => {
  try {
    const account = await accountService.authenticate(req.body);
    req.session.userId = account.id;          // upgrades the existing session
    res.redirect("/events");
  } catch (err) {
    next(err);
  }
});
```

Block B, the fix:

```javascript
authRouter.post("/login", async (req, res, next) => {
  try {
    const account = await accountService.authenticate(req.body);
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = account.id;
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        res.redirect("/events");
      });
    });
  } catch (err) {
    next(err);
  }
});
```

Block C, the final version with `returnTo`:

```javascript
authRouter.post("/login", async (req, res, next) => {
  try {
    const account = await accountService.authenticate(req.body);

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
```

Demo-only route:

```javascript
app.get("/hello", (req, res) => { req.session.visited = true; res.send("hello"); });
```

SQL:

```sql
SELECT sid, sess FROM user_sessions;
SELECT count(*) FROM user_sessions;
```

## On-screen assets and B-roll

- Two Chrome profiles with distinct themes and large text badges "ATTACKER" and "VICTIM" in the window chrome.
- A slide for the cookie-planting vectors (1:30) and one for "regenerate on every privilege change" (4:15).
- An overlay arrow graphic for 5:05 labelled "new, empty session".
- No B-roll. This is a precise screencast.

## Accessibility

- Captions plus a `.vtt`. Narration reads out every cookie comparison ("a different value", "the same sid as before") instead of relying on viewers reading hashes.
- Cookie values are zoomed to 200%, and only the first six characters are compared aloud.
- Attacker and victim windows are identified by text badges and window position (left/right), not by colour alone.
- DevTools cookie editing is shown with keyboard navigation (Tab into the value cell, Enter to edit) and the keys are named aloud.
- The transcript includes all code blocks and SQL as text.

## Check for understanding

1. In the vulnerable version, why did the attacker's copied cookie become valuable *after* the victim logged in?
   *Answer:* Login set `userId` on the existing session without changing its id, so the id the attacker already knew became an authenticated session.
2. After adding `regenerate`, users always land on `/events` instead of the page they asked for. What is wrong, and what is the fix?
   *Answer:* `regenerate` replaces the session with an empty one, so `returnTo` is read from a session that no longer exists. Read `returnTo` before regenerating, and validate that it is a same-site relative path.
3. Why does the handler call `req.session.save` before redirecting?
   *Answer:* With a database store, the redirect could reach the browser and the next request arrive before the new session row is written, which produces an intermittent "logged straight back out" bug.
