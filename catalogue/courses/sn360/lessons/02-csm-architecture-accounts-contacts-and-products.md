---
lesson_id: sn360-02
course_id: sn360
pathway: servicenow-implementation-specialist
title: 'CSM Architecture: Accounts, Contacts, and Products'
order: 2
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Model accounts, contacts, consumers, and installed products so cases attach to the right customer
---

## Why the customer model comes first

In ITSM the requester is an employee. You already have them: they are in `sys_user`, they came from the HR feed or the directory sync, and their department and location are somebody else's problem. Customer Service Management removes that comfort. The person contacting you works for another company, was sold something by your sales team, may or may not be covered by a support contract, and may not exist in your instance at all until the moment they need help.

Every downstream capability in this course depends on getting that picture right. Routing rules match on account and product. Entitlements are found by walking from the case to the account to the contract. The customer service portal decides what a logged-in user may read by looking at which account they belong to. Reporting on "top five accounts by case volume" is meaningless if half the cases have an empty account field. When a CSM implementation goes wrong, the failure is almost never in the case form. It is in the customer data model underneath it.

So the first configuration decision on any CSM engagement is not "what fields go on the case" but "who is the customer, and what shape is that customer in."

## The two supported customer models

CSM ships with two models, and a case must resolve to exactly one of them.

**The B2B model** treats a company as the customer. The company is an **account** (`customer_account`), and the individual people who contact you are **contacts** (`customer_contact`). A case is filed by a contact and belongs to an account. This is the default assumption of nearly every CSM implementation, and it is the model this course teaches in depth.

**The B2C model** treats an individual as the customer. There is no company in the middle. The individual is a **consumer** (`csm_consumer`), and the case is filed by that consumer directly. You would use this for a retail bank's cardholders, an airline's passengers, or a utility's ratepayers.

The two models are not mutually exclusive in a single instance — a manufacturer can sell to distributors (B2B) and to the public (B2C) — but they are mutually exclusive on a single case. The case form shows the account and contact fields or the consumer field depending on which model the case is using, and the underlying `sn_customerservice_case` table carries fields for both.

A detail that catches people: `customer_contact` extends `sys_user`. A contact is a user record. (Consumers are modeled differently: a `csm_consumer` record is linked to a user record for portal login rather than being one; confirm the relationship on your release before you script against it.) This is what allows a contact to log into the customer service portal with the `sn_customerservice.customer` role, and it is why you should never create a plain `sys_user` record for a customer and then wonder why they cannot see anything on the portal. Create the contact; the user record comes with it.

For the rest of this lesson, and for the rest of the course, assume B2B unless a section says otherwise. The consumer model is shown as a variation, not taught twice.

## Accounts and account hierarchy

An account record answers "which company is this?" Its useful configuration is mostly about relationships rather than fields.

**Parent accounts.** `customer_account` has a `parent` reference to itself, so you can model Global Industries with subsidiaries Global Industries UK and Global Industries Canada. Hierarchy matters for two reasons. First, entitlements and contracts can be inherited down the tree, so the parent's support contract can cover the subsidiaries without duplicating records. Second, portal visibility can be scoped by hierarchy, so a head-office contact can be given a view of every case across the family while a subsidiary contact sees only their own.

Design the hierarchy from how the customer buys support and how they expect to see their cases, not from the org chart on their website. A three-level legal structure with one support contract at the top should be a two-level account tree at most. Every level you add is a level the entitlement lookup and the portal visibility logic has to traverse.

**Partner accounts.** An account can be flagged as a partner, which means it services other accounts on your behalf. A partner contact can be given access to cases belonging to the accounts they cover. Partner enablement is worth knowing exists at design time even if you do not configure it — deciding late that resellers need case access is an expensive change, because it touches account relationships, roles, and portal access control all at once.

**Account teams and relationships.** Rather than adding a "primary support engineer" field to the account, model responsibility with account relationship records: a user, an account, and the role they play for it. This scales when the same engineer covers eight accounts and when responsibility changes weekly, which it does.

## Contacts, and who is allowed to open a case

A contact belongs to one account. The contact record carries the fields you need to route and communicate — email, phone, time zone, preferred language — plus two that decide behavior.

The first is whether the contact is a **primary contact** for the account. The second is the set of **contact roles**, or in some designs a responsibility relationship, that says what this person may do: file cases, approve changes to entitlements, see all cases for the account, or only see their own.

That last distinction is the one customers ask about within a week of go-live. "Sunil filed the case, but Priya is his manager and needs to see it." You have three defensible answers, and the implementation is different for each:

1. Give Priya a contact role that grants account-wide case visibility, and let the portal's access control read that role.
2. Add Priya to the case as a watcher or additional contact, case by case.
3. Model Priya's team as its own account under the parent and let hierarchy do the work.

Pick one deliberately and write it down. Instances where all three exist simultaneously are impossible to reason about six months later.

Contacts arrive in your instance three ways: created by an agent while taking a call, self-registered through the portal, or synchronized from a CRM. The third is the common case in a real implementation, and it is covered in lesson 09. What matters here is the design rule: choose exactly one system of record for contacts. If both your CRM and your ServiceNow instance can create contacts, you will have duplicates within a month, and duplicate contacts fragment case history for the customer who is least patient about it.

## Products, product models, and installed products

"My laptop is broken" is a different case from "my laptop is broken and it is the ruggedized model we bought 300 of last March, still under the extended warranty." The second version is answerable. Getting there requires modeling what the customer actually owns.

CSM uses the platform's product catalog structures:

- A **product model** (`cmdb_model`) is the thing you sell as a type — "Model 4400 Controller", "Analytics Platform, Enterprise Tier". One record per sellable model, shared by every customer who owns one.
- An **installed product** (`sn_install_base_item`, surfaced as the install base) is one customer's specific instance of that model: this serial number, at this location, owned by this account, installed on this date, covered until this date.

The install base is what makes CSM specific. When a contact opens a case and selects an installed product, the case now knows the account, the model, the warranty window, and often the location — without asking the customer a single additional question. Entitlement lookup in lesson 04 uses exactly that chain. Routing in lesson 08 can match a product line to a specialist queue because the installed product points at a model that belongs to a product line.

Install base items can themselves be related in a hierarchy — a controller that contains four modules — and can have relationships to configuration items when the customer's environment is also modeled in your CMDB. Keep this restrained on a first implementation. Model the level at which support is actually delivered. If nobody will ever open a case about an individual module, the module does not need an install base record.

A practical loading note: install base data almost always arrives from an ERP or order system as a flat extract. Import it with a transform map that keys on serial number and account, not on display name, and set the transform to skip rather than insert when the account cannot be resolved. An install base item attached to the wrong account will silently give one customer entitlements they did not buy, and it is very hard to find afterward.

## Worked example: modeling one customer

Northwind Manufacturing buys your industrial controllers. They have a head office and two plants that raise their own support cases. They bought a Gold support contract at the head office level, and each plant has controllers on site.

The model:

```text
Account:  Northwind Manufacturing        (parent, holds the support contract)
  Account: Northwind - Rivergate Plant   (parent = Northwind Manufacturing)
  Account: Northwind - Ashcroft Plant    (parent = Northwind Manufacturing)

Contacts:
  Dana Whitfield  -> Northwind Manufacturing   (account-wide case visibility)
  Sunil Rao       -> Northwind - Rivergate     (files cases, own cases only)
  Priya Menon     -> Northwind - Ashcroft      (files cases, own cases only)

Product models:
  Model 4400 Controller
  Model 4400 Controller, Ruggedized

Installed products:
  SN-4400-08812  Model 4400            -> Rivergate  (installed 2024-03-11)
  SN-4400-08813  Model 4400 Ruggedized -> Ashcroft   (installed 2024-03-11)
```

Now trace a case. Sunil files "controller alarms overnight" and selects SN-4400-08812. The case resolves to the Rivergate account, whose parent is Northwind Manufacturing, which holds the Gold contract — so the case is entitled at Gold even though the contract is not on Sunil's own account. Dana can see the case from the portal because her contact role grants account-wide visibility and hierarchy carries it down. Routing can send it to the controller specialists because the installed product points at Model 4400.

None of that required custom code. It required the records to exist in the right shape.

Compare the B2C variation. If Northwind were a consumer rather than a company, Sunil would be a `csm_consumer` record, there would be no account and no hierarchy, and the installed product would hang off the consumer directly. Entitlement would be found on the consumer or on the installed product's warranty rather than on a company contract. Same case table, same install base, one fewer level of indirection.

## Loading the model, and keeping it loaded

The model above is easy to build by hand for three accounts. Real customers arrive with four thousand, in a spreadsheet exported from a CRM by someone who left last year. Two disciplines make that survivable.

**Load in dependency order, in stages.** Accounts before contacts, parent accounts before children, product models before installed products. Each stage is its own import set and transform map, and each stage is verified before the next runs. A contact import that runs before its accounts exist produces four thousand contacts with an empty account field, and cleaning that up is harder than doing the load again.

For the account hierarchy specifically, load the flat list first with the parent field empty, then run a second pass that sets `parent` by matching the external parent identifier. Trying to resolve parents during the first pass fails for every account whose parent has not been inserted yet, and the failures depend on row order, which makes them maddening to diagnose.

**Coalesce on something stable.** Every transform map in this load coalesces on an external identifier — the CRM's account id, the ERP's serial number — not on the display name. Names are edited, capitalized differently, and duplicated across regions. An import that coalesces on name will, on its second run, either create duplicates or overwrite the wrong record, and both are discovered weeks later by a customer rather than by you.

**Decide the deduplication rule before the first load, not after.** Two accounts called "Northwind Manufacturing" and "Northwind Mfg." with different CRM ids are, as far as the platform can tell, two customers. Getting them merged is a business decision about which one holds the contract and which cases move. Ask the customer to clean their source data before the load if they can; if they cannot, agree on the merge rule and a reconciliation report so the duplicates are at least visible.

**Name the ongoing owner.** A customer model is not loaded once. Accounts are acquired and renamed, contacts join and leave, and instruments are decommissioned. Before go-live, get an answer to three questions: who creates a new account, what happens when a contact leaves a customer, and what marks an installed product as retired. If the answers are "the integration does it" — good, that is lesson 09. If the answers are "nobody has thought about that", the model will be accurate on the day you hand it over and wrong within a quarter.

The leaver question deserves particular attention on a customer-facing implementation. A contact who leaves the customer still has portal credentials and, unless you do something, still sees their old employer's cases. Decide the mechanism — deactivation from the CRM feed, an expiry on the contact record, or a periodic access review sent to the account's primary contact — and configure it. This is the CSM equivalent of an offboarding process, and it is the finding an auditor will reach for first.

## Reading a customer's model before you build it

On a real engagement you are not inventing this structure; you are eliciting it. The discovery questions that produce a correct model are shorter than you would expect, and they are all about behavior rather than about data:

- **Who signs the support contract, and who uses the support?** If those are different legal entities, you have a hierarchy.
- **When two of your customer's sites both have a problem, are they the same customer to you?** This is the account boundary question, asked in language a service manager answers instantly.
- **Who is allowed to see what a colleague reported?** This settles contact roles and portal visibility in one answer, and it will surprise you: some customers want total transparency within the company, and some are strict about it because different departments hold different budgets.
- **What is the thing you are supporting, and does it have a serial number?** If yes, you need install base. If no — the customer buys a subscription or a service — you still need install base, and the item is the subscription.
- **How do you know whether a caller is entitled today?** Whatever the answer is, that is the chain lesson 04 has to reproduce in configuration. If the answer is "we look it up in a spreadsheet", you have just been told what the highest-value part of the implementation is.

Write the answers down as a one-page model — accounts, hierarchy, contacts, roles, product models, install base — and walk it back to the customer before configuring anything. Twenty minutes of correction on a page is cheaper than a week of rework in an instance.

## Common modeling mistakes

**Using accounts as a department list.** An account is a customer you have a commercial relationship with. Modeling your customer's internal departments as accounts inflates the tree, breaks the contract inheritance you wanted, and produces reports nobody can read.

**Letting the case's account be set by script instead of by data.** If you find yourself writing a business rule that guesses the account from the contact's email domain, the contact records are wrong. Fix the data.

**Creating contacts as plain users.** They will not have the customer role, they will not see the portal, and you will spend an afternoon on it.

**Modeling install base only for hardware.** Subscriptions, licenses, and service tiers are install base items too, and they are frequently the thing entitlement depends on.

## Practice

Work in a personal developer instance with the CSM plugins active.

1. **Build the Northwind tree.** Create the parent account and two child accounts exactly as in the worked example. Create the three contacts on the correct accounts. Confirm each contact has a corresponding user record and can be given the customer role.

2. **Model the products.** Create the two product models, then create two installed product records with distinct serial numbers, each pointing at the correct child account and model.

3. **File a case as data.** Create a case with Sunil as the contact and SN-4400-08812 as the installed product. Verify the account field populates to the Rivergate plant. Then, without editing the case, change the installed product to the Ashcroft serial and observe what does and does not update — write down which fields are derived on insert versus kept in sync.

4. **Test visibility by hierarchy.** Impersonate Dana and confirm she can retrieve Sunil's case; impersonate Priya and confirm she cannot. If your result differs from the design, identify whether the cause is the contact role, the account relationship, or the access control — and say which one you would change.

5. **Write the variation.** In a short paragraph, describe how you would remodel Northwind as a B2C consumer implementation: which records disappear, which one replaces them, and what the case would lose as a result.

## Check your understanding

1. A manufacturer sells to distributors and to the public. One customer model or two, and can a single case use both?
2. Why should you never create a plain `sys_user` for a B2B customer?
3. Why coalesce account and install base imports on an external identifier rather than a name?
4. Sunil files a case on a Rivergate controller. How does it end up entitled at Gold when the contract is on the parent account?

*Answers:* (1) Both models can exist in one instance, but each case uses exactly one. (2) It will not be a contact, will not carry the customer role, and will not see the portal; create the contact. (3) Names are edited and duplicated; the external id is stable, so re-runs update rather than duplicate or overwrite the wrong record. (4) The case resolves to Rivergate, whose parent account holds the Gold contract, and the entitlement lookup walks the hierarchy.
