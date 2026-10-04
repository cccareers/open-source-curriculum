---
lesson_id: sn290-03
course_id: sn290
pathway: servicenow-implementation-specialist
title: "Widgets: HTML, CSS, and Scripts"
order: 3
kind: lesson
competency_ids:
  - D6-S1-C02
objectives:
  - Build and clone widgets using HTML, CSS, an AngularJS client controller, and a server script
---

## The four-part contract

A widget is one record in `sp_widget` with four editable parts and one shared object that connects them:

- **Body HTML template** — an AngularJS template. Not a static file; an expression-aware template that is compiled against a scope.
- **CSS** — SCSS, compiled and scoped to instances of this widget so your rules do not leak onto the rest of the page.
- **Client controller** — a JavaScript function that runs in the browser and owns everything interactive.
- **Server script** — a JavaScript function that runs on the instance, with full server-side API access, before the page is delivered.

The object that connects them is called `data`. The server script builds it; the client receives it. That is the whole contract, and it is worth stating in its plainest form because almost every widget bug is a violation of it:

```text
server script                    client controller              template
  data.x = ...        ────►        c.data.x                ────►   {{c.data.x}}
                      ◄────        c.server.update()       ◄────   ng-click
                                   (sends c.data back)
```

The server script runs first and once, when the page is assembled. Its `data` object is serialized into the page. The client controller then runs in the browser with that object already populated on `c.data`. If the client changes `c.data` and calls `c.server.update()`, the whole object is posted back, the server script runs again, and whatever it leaves on `data` replaces `c.data`.

See the official [Glide Server APIs](https://www.servicenow.com/docs/r/api-reference/scripts/p_GlideServerAPIs.html) and [GlideElement field permission methods](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_GlideElementScopedAPI.html) for the record/field ACL distinction.

Two consequences follow, and they catch everyone once:

1. **Anything you put on `data` is visible in the browser.** Never put a value on `data` that the current user is not allowed to see. The server script runs in the caller's session, but a plain `GlideRecord` query does **not** apply access controls for you: it returns records and fields the user may not be allowed to see, and anything you copy from it onto `data` you have deliberately published. Filter to what the user should see, use `GlideRecordSecure` (which applies ACLs to queries and field reads), or check `canRead()` on each record **and each field** before you attach it.
2. **The server script has no DOM and the client controller has no `GlideRecord`.** They are two different runtimes that happen to share a file. Do the querying on one side and the rendering on the other, and never try to reach across.

## Reading a widget end to end

Here is a complete, small widget: a card that lists the current user's open records from a configurable table. Start with the server script.

```javascript
(function() {
  var table = options.table || 'incident';
  var limit = parseInt(options.max_entries, 10) || 5;

  data.title = options.title || 'My open records';
  data.table = table;
  data.records = [];

  var gr = new GlideRecordSecure(table);
  gr.addActiveQuery();
  gr.addQuery('opened_by', gs.getUserID());
  gr.orderByDesc('sys_updated_on');
  gr.setLimit(limit);
  gr.query();

  while (gr.next()) {
    data.records.push({
      sys_id: gr.getUniqueValue(),
      number: gr.getDisplayValue('number'),
      short_description: gr.getDisplayValue('short_description'),
      state: gr.getDisplayValue('state'),
      updated: gr.getDisplayValue('sys_updated_on')
    });
  }

  data.count = data.records.length;
})();
```

Four things in that script are deliberate and worth copying every time.

**`options` is read, never assumed.** Every value comes from the instance with a fallback. That is what makes the widget reusable across placements instead of forcing a clone per use.

**The result is a plain array of plain objects.** Do not push `GlideRecord` objects onto `data`. They do not serialize the way you expect, and the client cannot use them. Build the small, flat shape the template actually needs.

**`getDisplayValue` where the template will display, `getValue` where the client will compare.** A state of `2` is useless to a reader and a state of `In Progress` is useless to a comparison. Send both if you need both.

**`setLimit` is present.** A list widget without a limit is a performance incident waiting for the first user with four hundred records. Lesson 6 comes back to this.

Now the template:

```html
<div class="panel panel-default sn290-open-records">
  <div class="panel-heading">
    <h3 class="panel-title">{{c.data.title}}</h3>
  </div>

  <ul class="list-group" ng-if="c.data.count > 0">
    <li class="list-group-item" ng-repeat="rec in c.data.records">
      <a href="?id=form&amp;table={{c.data.table}}&amp;sys_id={{rec.sys_id}}">
        {{rec.number}}
      </a>
      <span class="sn290-desc">{{rec.short_description}}</span>
      <span class="label label-default">{{rec.state}}</span>
    </li>
  </ul>

  <div class="panel-body text-muted" ng-if="c.data.count === 0">
    ${You have no open records.}
  </div>

  <div class="panel-footer">
    <button type="button" class="btn btn-default btn-sm" ng-click="c.refresh()">
      ${Refresh}
    </button>
  </div>
</div>
```

Three details to notice. `c` is the controller alias — the template always reaches data through it. `ng-if` rather than `ng-show` for the empty state, because `ng-if` removes the element from the DOM entirely instead of hiding it, which keeps screen readers from announcing an empty list. And the `${...}` wrapper marks a string for translation; any literal text a user will read belongs inside one.

The client controller is the smallest part:

```javascript
api.controller = function() {
  var c = this;

  c.refresh = function() {
    c.server.update().then(function() {
      c.lastRefreshed = new Date();
    });
  };
};
```

`c.server.update()` posts the current `c.data` back, re-runs the server script, and resolves with the refreshed data already applied. If you only need fresh data and do not care about sending anything up, `c.server.get({action: 'something'})` is the lighter call — it passes an object to the server as `input` without shipping the whole of `data`.

Finally, the CSS. It is SCSS, and it is scoped to this widget's instances:

```css
.sn290-open-records {
  .sn290-desc {
    display: block;
    color: $text-muted;
    font-size: 0.9em;
  }

  .list-group-item {
    border-left: 3px solid transparent;

    &:hover {
      border-left-color: $brand-primary;
    }
  }
}
```

The `$brand-primary` and `$text-muted` names are variables the theme supplies. Using them instead of hard-coded hex values is what makes a widget survive a rebrand — change the theme's variables and every widget follows. Hard-code `#0d6efd` and you have created work for someone in eighteen months.

## Client-to-server calls

When the user does something that must change data, you send it up as `input`. The server script branches on it:

```javascript
(function() {
  data.title = options.title || 'My open records';

  if (input && input.action === 'acknowledge') {
    var gr = new GlideRecordSecure('incident');
    if (typeof input.sys_id === 'string' && /^[0-9a-f]{32}$/i.test(input.sys_id) &&
        gr.get(input.sys_id) && gr.canRead() && gr.canWrite() && gr.comments.canWrite()) {
      gr.setValue('comments', 'Acknowledged from the portal.');
      data.message = gr.update()
        ? gs.getMessage('Acknowledged {0}', gr.getDisplayValue('number'))
        : gs.getMessage('The update could not be saved.');
    } else {
      data.message = gs.getMessage('You cannot update that record.');
    }
  }

  // ... build data.records as before ...
})();
```

```javascript
api.controller = function(spUtil) {
  var c = this;

  c.acknowledge = function(rec) {
    c.server.get({action: 'acknowledge', sys_id: rec.sys_id}).then(function(r) {
      if (r.data.message) {
        spUtil.addInfoMessage(r.data.message);
      }
      c.server.update();
    });
  };
};
```

Two rules govern this. **Validate on the server, always.** `input` arrives from a browser and a browser is not trustworthy; check that the record exists, that the user may write to it (both the record and comments-field `canWrite()` calls above, because a plain `GlideRecord` will happily update a record the user's ACLs forbid), and that the action string is one you recognize. Client-side checks are a courtesy to honest users, not a security control. And **branch explicitly** — a server script that runs an update every time it executes will run it again on every refresh.

`spUtil` is the client-side helper service you inject into the controller. Beyond `addInfoMessage` and `addErrorMessage`, the two you will reach for are `spUtil.get(widgetId, options)` to embed one widget inside another from script, and `spUtil.recordWatch(scope, table, filter, callback)` to have the widget react when a matching record changes on the server — the correct alternative to a polling timer.

## The `$sp` server API

Inside a server script, `$sp` is a helper object that knows about the portal context. The calls you will use constantly:

- `$sp.getParameter('sys_id')` — read a URL query parameter. This is how a detail widget knows which record it is showing.
- `$sp.getValue('short_description')` and `$sp.getDisplayValue(field)` — read from the record the *page* is scoped to, when the page has one.
- `$sp.getRecord()` — the `GlideRecord` for that page-scoped record.
- `$sp.getWidget(widgetId, options)` — render another widget and attach it to `data` so your template can embed it.
- `$sp.getMenuItems(menuSysId)` — resolve a menu into a structure your template can loop over.
- `$sp.log(message)` — write to the portal log without leaking to the browser.

Prefer `$sp.getParameter` to reading `window.location` in the client. The server already parsed the URL, and a value read on the server can be validated before it is used.

## Options: making one widget serve many placements

You saw `options.table` in the server script. For the designer to render a friendly form instead of raw JSON, the widget declares an **option schema** — a JSON array on the widget record:

```json
[
  {
    "name": "title",
    "label": "Card title",
    "type": "string",
    "default_value": "My open records"
  },
  {
    "name": "table",
    "label": "Table name",
    "type": "string",
    "default_value": "incident"
  },
  {
    "name": "max_entries",
    "label": "Rows to show",
    "type": "integer",
    "default_value": "5"
  }
]
```

Now placing this widget twice — once for incidents, once for requests — is two instances and two form fills. No clone, one place to fix a bug.

## Cloning, and when it is the right answer

Never edit an out-of-box widget in place. It is a shared, upgradeable artifact; your change will collide with a future platform update, and the collision will surface as a skipped record in an upgrade log that nobody reads until the portal breaks.

Instead, use the **Clone Widget** action from the widget editor or the widget form. It copies the HTML, CSS, both scripts, the option schema, and the dependencies into a new record with a new ID that you own. Then place the clone, and leave the original untouched.

The judgement call is clone versus option. Ask: *does the difference live in data or in structure?* A different table, title, limit, or filter is data — add an option. A genuinely different template, a different interaction, a different shape on the page — that is structure, and structure is a clone. If you find yourself writing `ng-if="c.options.mode === 'compact'"` around two entirely different blocks of markup, you wanted two widgets.

One more part exists that you will not need often: the **link function**. It runs after the template is compiled, receives the scope and the actual DOM element, and is the only correct place to initialise a third-party JavaScript library or measure a rendered element. Anything you can do with a directive or with `ng-` attributes, do there instead — a link function that manipulates the DOM by hand is the hardest kind of widget to maintain.

## Dependencies and shared code

Two related lists on the widget record handle code that comes from somewhere else.

A **dependency** attaches external JavaScript files or style sheets to the widget. When any instance of the widget is on a page, the dependency loads. This is how you bring in a charting library, a date picker, or a vendor script. Two cautions. A dependency attached to a widget that lives in the theme's header loads on *every page of the portal*, whether or not anything on that page uses it — so attach heavy libraries to the specific widget that needs them, never to a header or footer widget. And a dependency is shared: if two widgets each attach their own copy of the same library at different versions, one of them loses.

An **Angular provider** is platform-side shared code — a service, a directive, or a filter, written once and injected into any widget's controller that asks for it. Reach for one when the same logic appears in three widgets. A shared date-formatting filter or a service that wraps a common set of server calls is exactly the right use; wrapping a single function used once is not.

```javascript
// a widget controller consuming an injected service and the built-in spUtil
api.controller = function(spUtil, sn290DateService) {
  var c = this;
  c.friendlyUpdated = sn290DateService.relative(c.data.records[0].updated);
};
```

Both mechanisms exist so that widgets stay small. A widget whose client controller is three hundred lines long is usually a widget with a service hiding inside it.

## Debugging a widget

Widgets fail in one of two runtimes, and the first diagnostic question is always *which one*. Answer it before you start changing code.

**Is the data there?** Add a temporary line to the template that dumps the server's output:

```html
<pre ng-if="c.data.debug">{{c.data | json}}</pre>
```

If the object is right, the server script is fine and your problem is in the template or the controller. If the object is wrong, empty, or missing a field, stop looking at the client entirely.

**Server-side tools.** `gs.info` writes to the system log; `$sp.log` writes without any chance of leaking into the browser. Neither is visible to the user, which is the point. If a query returns nothing, log the encoded query and the row count separately — the usual cause is a filter that is correct in the list view and wrong once a user's own sys_id is substituted.

**Client-side tools.** The browser console shows Angular errors, and they are usually precise: a controller injecting a service that does not exist, a template referencing a property on an undefined object. An expression bound to something that does not exist does not error at all — it renders empty — so a blank spot on the page is a spelling problem until proven otherwise.

**The widget editor's preview** renders the widget against a page you choose, which is faster than reloading the whole portal, and it shows both scripts and the template together. Use the widget record's **demo data** field to give the editor a sample `data` object so you can develop the template before the server script exists.

Two failure modes worth naming because they cost everyone an afternoon once. First: the server script runs *again* on every `c.server.update()`, so any side effect it performs unconditionally happens repeatedly — always branch on `input`. Second: `data` is serialized, so a value that is a `GlideRecord`, a function, or a circular structure will not arrive intact on the client. If a property is mysteriously missing in the browser, check that what you put on it was a plain value.

## Practice

Work in your `dev290` portal from Lesson 2. Clone rather than edit anything out of box.

1. **Build the card.** Create a new widget named `sn290 Open Records`. Type in the server script, template, client controller, and CSS from this lesson. Place one instance on your home page and confirm it renders your own open incidents.
2. **Add the option schema.** Add the three options above to the widget record. Place a *second* instance of the same widget in another column, and configure it — through the options form, not by cloning — to show a different table with a different title and a limit of 3.
3. **Prove the round trip.** Add a visible counter to the template bound to a value the server sets, such as the time the server script last ran. Click Refresh and confirm the value changes. Then add a `gs.info` line to the server script and confirm in the system log that it fires on load *and* on every refresh.
4. **Add an action.** Implement the acknowledge behaviour: a button per row that calls `c.server.get` with an action and a sys_id, writes a comment to the record on the server, shows an info message, and refreshes the list. Then attack your own code — call it with a sys_id the current user cannot write to and confirm the server refuses cleanly rather than throwing.
5. **Make it theme-proof.** Replace every hard-coded colour in your CSS with a theme variable. Change one variable on your copied theme and confirm the widget follows without being touched.
6. **Justify a clone.** Write two or three sentences deciding whether a "compact, no-footer" version of this card should be an option or a clone, and say which rule from this lesson you applied.

## Check your understanding

1. Trace a value from the server script to the screen. Which object carries it, and what name does the template use?
2. What is the difference between `c.server.update()` and `c.server.get({...})` in what they send and what they re-run?
3. Your server script uses `new GlideRecord('incident')` to fetch a record whose sys_id came from `input`. Name two checks it must do before updating.
4. A colleague wants a "compact" mode and plans to wrap two completely different templates in `ng-if`. Option or clone?

*Answers:* (1) `data` on the server, `c.data` in the controller, `{{c.data.x}}` in the template. (2) `update` posts all of `c.data` and re-runs the whole server script; `get` sends only the object you pass as `input` (the server script still runs, so branch on `input`). (3) That the record exists and that the user can write it (`canWrite()`), plus that the action string is one you recognise. (4) A clone; the difference is structure, not data.
