---
lesson_id: sn360-04
course_id: sn360
pathway: servicenow-implementation-specialist
title: Entitlements, Contracts, and Customer SLAs
order: 4
kind: lesson
competency_ids:
  - D3-S1-C01
  - D2-S1-C04
objectives:
  - Configure entitlements and service contracts that drive customer-facing SLAs
---

## Two questions, in order

Internal IT support answers one question when a ticket arrives: how fast do we have to fix this? Customer support answers two, and the order is not negotiable.

1. **Is this customer entitled to support at all, for this thing, right now?**
2. **If so, what response and resolution commitment did they buy?**

Question one is entitlement. Question two is the service level agreement. An implementation that jumps straight to SLA definitions produces an instance that promises four-hour response to a customer whose contract lapsed in March. This lesson wires both, in that order, on top of the account and install base model from lesson 02 and the state model from lesson 03.

## The record chain

The chain a case walks to find its commitment looks like this:

```text
Case
 ├─ Contact ─────────► Account ──► parent Account
 ├─ Installed product ──► Product model
 └─ Entitlement  ◄── found by an entitlement lookup rule
        │
        └─ Service contract ──► Contract SLA ──► SLA definition ──► Task SLA on the case
```

Read it from the middle outward. An **entitlement** (`service_entitlement`) is a record that says "support of this kind is available to this scope." Its scope can be an account, a specific contact, a product model, an installed product, or an asset — that flexibility is the whole point. A **service contract** is the commercial agreement the entitlement belongs to, with a start date, an end date, and the contract's SLA commitments attached. A **contract SLA** links the contract to the platform SLA definitions that will actually be applied.

When a case is created or updated, an **entitlement lookup** evaluates the available entitlements against the case and picks one. That entitlement's contract carries the SLA commitments, which the SLA engine attaches to the case as **task SLA** records — the same task SLA mechanism the platform uses everywhere.

Every layer in that chain exists because a real customer relationship needed it. Skip a layer and you will rebuild it in script later.

## Configuring entitlements

Start from the sales reality, not the table. Ask the customer's service leadership four questions:

- **What did you sell?** Support tiers by name — Bronze, Gold, Premium — or by product, or "the first year is included with the hardware."
- **Who does it cover?** The whole account, named contacts only, or specific installed products.
- **When does it apply?** 24x7, or business hours in the customer's time zone, or business hours in yours.
- **What happens when it runs out?** Refuse the case, accept it as unentitled and bill it, or accept it at a default low tier.

Those four answers map almost directly onto configuration.

**Scope** becomes the entitlement's scope fields. An entitlement scoped to an account covers every contact and every installed product under it; one scoped to a product model covers that model wherever it is installed; one scoped to an installed product covers exactly one serial number. Prefer the broadest scope that is true. A hundred install-base-scoped entitlements that all say "Gold" should be one account-scoped entitlement.

**Timing** becomes a schedule attached to the entitlement or the SLA definition. Schedules are ordinary platform schedules, and the customer's time zone is the one that matters — "next business day" means next business day where the customer is.

**Expiry** is the contract's start and end dates, plus your entitlement lookup's behavior when nothing matches. Configure the no-match path explicitly. The two defensible designs are: leave the entitlement empty, set a flag on the case, and route it to a commercial triage queue; or attach a named "Unentitled" entitlement with a deliberately weak SLA so the case still gets measured. Silently letting an unentitled case run with no SLA at all is the option that produces an angry conversation nine months later, because nobody can prove what was promised.

**Entitlement lookup rules** decide which entitlement wins when several match — and several will, because a customer with an account-wide Gold contract who also bought extended coverage on one machine matches twice. Order the rules from most specific to least: installed product, then product model, then contact, then account. The first match wins, so the machine-specific extended coverage beats the account default, which is what the customer paid for.

## Service contracts and what they carry

A service contract is the commercial wrapper: which account, which period, which entitlements it grants, and which SLA commitments come with it. Two configuration points deserve attention.

**Renewal and lapse.** A contract that ends does not delete itself; the entitlement lookup simply stops matching it. Build the visibility for that: a report of contracts expiring in the next sixty days, and a notification to the account team. Customers rarely notice a lapsed contract until they need it, and "your support expired" is a much better message in advance than during an outage.

**Hierarchy inheritance.** As in lesson 02's Northwind example, a contract held at the parent account should be findable from a case on a child account. Confirm this behaves the way the customer expects before go-live, because the alternative — duplicating the contract onto every subsidiary — is a maintenance liability that grows every time they acquire a company.

## From contract to SLA

Now the second question. Platform SLAs on the case table are the same construct you already know: an **SLA definition** with a table, a start condition, a pause condition, a stop condition, a duration, and a schedule; a **task SLA** record created when the start condition is met; and optionally a flow attached for warning notifications.

CSM implementations almost always need two per tier:

- A **response SLA** — from case creation until the first customer-visible communication from an agent. This is the one customers feel.
- A **resolution SLA** — from case creation until the case reaches Resolved.

The conditions are where design decisions become configuration.

**Start condition.** Usually "case created", but if you triage before accepting, the customer may have agreed the clock starts at acceptance. Ask, do not assume.

**Pause condition.** This is where lesson 03's `Awaiting Info` state earns its existence. The resolution SLA pauses while the case is Awaiting Info; the response SLA usually does not, because the first response is what moves it out of that state in the first place. Configure the pause on the SLA definition, and make sure the condition is written against the state field rather than against a checkbox someone can forget to tick.

**Stop condition.** For the response SLA, the cleanest signal is a customer-visible comment authored by an agent, which usually means a small flag field set by a business rule when `comments` is written by a fulfiller. Stopping on "state changes to Open" is a common shortcut and a lie — assigning a case is not responding to the customer.

**Duration and schedule.** Duration comes from the contract SLA for the matched entitlement; the schedule comes from the entitlement's support hours. A Gold four-hour response on a 24x7 schedule and a Bronze four-hour response on a 9-to-5 schedule are the same number and completely different promises.

A worked mapping for Northwind's Gold contract:

| SLA | Start | Pause | Stop | Duration | Schedule |
| --- | --- | --- | --- | --- | --- |
| Gold Response | Case created, entitlement = Gold | none | First agent customer-visible comment | 4 hours | 24x7 |
| Gold Resolution | Case created, entitlement = Gold | State is Awaiting Info | State is Resolved or Closed | 3 days | 24x7 |
| Bronze Response | Case created, entitlement = Bronze | none | First agent customer-visible comment | 1 business day | Customer business hours |
| Bronze Resolution | Case created, entitlement = Bronze | State is Awaiting Info | State is Resolved or Closed | 10 business days | Customer business hours |

Attach a flow to each definition that notifies the assignment group at 50% and 75% elapsed, and the service manager at breach. Warnings that arrive after the breach are decoration.

## Entitled service catalog offerings

Not every customer request is a problem. "Ship me a replacement sensor", "add a named support contact", "schedule the annual health check" are *requests*, and requests belong in a catalog rather than in free text on a case.

The platform's Service Catalog works on the customer service portal the same way it works internally, with one difference that matters: the catalog is now customer-facing, so what a user may see and order must follow entitlement rather than an internal role.

Build a customer request offering in three parts:

1. **The catalog item.** Variables for what you need to fulfill it — which installed product, ship-to address, contact for delivery. Keep the variable set short; every field you add is a field an external customer can get wrong.
2. **The visibility rule.** Use a user criteria record that resolves to the customer's entitlement or contract rather than to a company or group. "Visible to accounts with an active Gold or Premium contract" is a business rule the customer will understand; "visible to members of group X" is one they will not.
3. **The fulfillment.** A flow in Flow Designer that creates the downstream work — a case task, a stock reservation, an approval from the account's primary contact when the item is chargeable — and writes back to the request so the portal shows honest status.

The SLA angle: a request has commitments too. If the contract promises next-business-day dispatch on replacement parts, that is an SLA definition on the request or request item table, with the same start-pause-stop discipline you applied to cases. Do not model it as a case SLA and hope nobody looks.

## Consumption-based entitlements

Not every support agreement is "unlimited support for a year." Two common commercial models need explicit handling, and both surprise implementers who have only seen tier-based contracts.

**Prepaid incident packs.** The customer buys twenty support cases. Each entitled case decrements the balance; at zero, new cases fall to your unentitled path. The configuration is a counter on the entitlement plus a decrement at a defined point in the case lifecycle — and *when* to decrement is a business decision, not a technical one. On creation is simple and punishes the customer for a duplicate. On resolution is fairer and lets a customer open thirty cases against a twenty-pack before anyone notices. The usual compromise is to decrement on resolution, exclude cases resolved as duplicates or as no-fault-found, and warn at 80% consumed.

**Prepaid hours.** The customer buys a block of engineering time, and work is drawn against it. This needs time recording on the case or its tasks, a running balance, and a statement the customer can reconcile against their own records. Do not build this unless the customer genuinely sells it — time tracking is a behavior change for agents, and an unenforced time entry field produces a balance nobody trusts.

For both models, the visibility requirement is stronger than the tracking requirement. A customer who discovers at zero balance that they have been consuming a pack for three months will dispute the count. Show the balance on the portal, notify at thresholds, and make each decrement traceable to a specific case.

## What the customer is told, and when

An SLA that only exists in your reporting is a private opinion. The commitments in this lesson become real to the customer through communication, and there are four moments worth configuring deliberately.

**At case creation**, the acknowledgment states the response commitment in plain terms — "someone will respond by 14:30 today" is better than "your case is subject to a four-hour response SLA", because a calculated timestamp accounts for the schedule and the customer's time zone while the abstract number does not.

**During the case**, the portal shows the same commitment, drawn from the same task SLA record. If the acknowledgment email and the portal disagree, the customer will believe whichever is worse for you.

**When you are late**, say so before they ask. A breach notification to the customer, with a revised commitment, converts a broken promise into a managed one. Most support organizations resist this and every one that adopts it reports fewer escalations.

**At renewal time**, an entitlement that is about to lapse should generate customer-facing notice as well as an internal report. This is the least technical item in the lesson and the one most likely to be omitted, because it belongs to nobody's application.

One design caution: everything above depends on the entitlement being resolved correctly at creation. If your no-match path leaves the entitlement empty, the acknowledgment must not quote a commitment it cannot back. Configure the unentitled acknowledgment separately, and make it honest — "we have received this and are checking your coverage" is a fine message and a true one.

## Verifying the whole chain

Entitlement bugs are hard to see because nothing errors — the case just quietly gets the wrong number. Verify deliberately:

- Create a case for a contact under a child account and confirm the parent's contract is found.
- Create a case against an installed product with extended coverage and confirm the specific entitlement beats the account default.
- Backdate a contract's end date and confirm a new case falls to your no-match path rather than to a stale entitlement.
- Move a case into Awaiting Info, wait, move it back, and confirm the resolution task SLA's elapsed time excludes the pause while the response SLA is unaffected.
- Order the catalog item as a Gold contact and as a Bronze contact, and confirm visibility differs.

Each of those is a five-minute test and each has caught a production defect on real engagements.

## Practice

1. **Build the tiers.** Create Gold and Bronze entitlements and two service contracts on the Northwind parent account, one active and one expired. Confirm which one the lookup matches.

2. **Add a specific override.** Create an entitlement scoped to a single installed product with a stronger commitment than the account default. Order your lookup rules so the specific one wins, then prove it with a case against that serial number and a case against the other one.

3. **Configure the SLA set.** Implement the four SLA definitions in the table above. For the response SLA, add whatever flag or condition is needed so it stops on a genuine customer-visible reply and not on assignment.

4. **Prove the pause.** Put a case into `Awaiting Info` for a measurable period, return it to `Open`, and read the task SLA record. Show that the resolution SLA's business elapsed time excludes the pause.

5. **Handle the no-match.** Configure your chosen unentitled path and demonstrate it with a case from a contact whose account has no active contract. State in one sentence why you chose that path over the alternative.

6. **Publish an entitled catalog item.** Create a "Request replacement part" catalog item with user criteria driven by contract tier, a Flow Designer fulfillment that opens a dispatch case task, and an SLA on the request for next-business-day dispatch. Order it as an entitled contact and confirm an unentitled contact cannot see it.
