---
lesson_id: cse203-03
course_id: cse203
pathway: cloud-support-engineer
title: Cloud Networking for Deployed Workloads
order: 3
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Configure a virtual private cloud with subnets and security groups for a deployed application
---

## The virtual private cloud

In the previous lesson you launched an instance into a network without choosing the network. It worked, because every provider gives a fresh account a default one. That default is a wide-open convenience built to make the first tutorial succeed, and it is not what you deploy a customer's application into.

A **virtual private cloud** — VPC on AWS and Google Cloud, *virtual network* or VNet on Azure — is a logically isolated network that belongs to you inside the provider's physical network. Traffic between resources in your VPC is not visible to any other tenant, and nothing outside can reach in unless you build a path for it. It is the closest cloud equivalent to "the network in our building", except that you define it in software and it can be recreated in ninety seconds.

The first and least reversible decision is the **address range**, written in CIDR notation. `10.0.0.0/16` means "addresses starting `10.0.`, with the last sixteen bits free" — 65,536 addresses from `10.0.0.0` to `10.0.255.255`. The `/16` is the *prefix length*, the count of fixed leading bits; a smaller number means a bigger network. `/24` gives 256 addresses, `/20` gives 4,096, `/16` gives 65,536.

Three rules for choosing one:

**Use private address space.** RFC 1918 reserves `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16` for private networks. Cloud VPC ranges come from these, and resources inside get addresses from your range. Public reachability comes later, from a separate mechanism, not from the address itself.

**Take more room than you need.** A `/16` gives you room to add subnets for years and costs exactly nothing extra; addresses are not billed. Growing a VPC after the fact ranges from awkward to impossible depending on the provider.

**Do not overlap with anything you might one day connect to.** This is the rule that gets broken, and the consequence is severe. If the customer's office network is `10.0.0.0/16` and you build their VPC as `10.0.0.0/16`, the two can never be joined by a VPN or a peering link, because a router presented with the same destination range on both sides has no way to decide. If a second VPC uses the same range, those two can never peer either. Ask what already exists before you type a number, and if nobody knows, pick something unfashionable — `10.42.0.0/16` is far less likely to collide than `10.0.0.0/16`.

A VPC spans an entire region. It is not a thing that lives in one building; it is a control-plane construct that the provider makes available across every availability zone in the region. That property is what lets you build something that survives a zone failure.

## Subnets, zones, and the public/private split

A VPC is subdivided into **subnets**, each carved from the VPC range and each pinned to exactly one availability zone. Two things follow immediately: a subnet's addresses are a subset of the VPC's, and an instance's subnet determines which physical facility it runs in.

Splitting a `10.0.0.0/16` VPC into `/24` subnets gives 256 subnets of 251 usable addresses each — the provider reserves a handful in every subnet for the network address, the gateway, DNS, and broadcast, so you never get the full 256. `10.0.1.0/24`, `10.0.2.0/24`, `10.0.11.0/24` and so on are a perfectly good scheme, and a numbering convention that encodes meaning (say, `10.0.1.x` and `10.0.2.x` for public tiers, `10.0.11.x` and `10.0.12.x` for private) will save you and the next engineer real time.

The distinction that actually matters is **public versus private**, and it is not a checkbox on the subnet. It is a routing outcome.

Every subnet is associated with a **route table**: a list of destination ranges and the target that handles traffic for each. Every route table starts with a local route covering the whole VPC range, which is why anything in the VPC can reach anything else in the VPC without configuration. What you add to that table decides everything else.

- An **internet gateway** is a VPC-level component that connects your VPC to the public internet. A subnet whose route table sends `0.0.0.0/0` to the internet gateway is a **public subnet**. Instances there can reach the internet, and — if they have a public address and the security rules permit — the internet can reach them.
- A **NAT gateway** lives in a public subnet and performs network address translation for machines that have no public address. A subnet whose route table sends `0.0.0.0/0` to a NAT gateway is a **private subnet**. Instances there can make outbound connections — to download packages, call an API, reach a licence server — and nothing on the internet can initiate a connection to them, because they have no address on the internet to initiate one to. Note that NAT gateways are one of the genuinely expensive small components in a cloud bill, charged both hourly and per gigabyte processed.
- A subnet whose route table has no `0.0.0.0/0` entry at all is **isolated**: it can reach the rest of the VPC and nothing beyond it. This is where a database with no need for outbound internet access belongs.

Having a public address is a separate matter from being in a public subnet, and mixing the two up is the classic source of "I gave it a public IP and still cannot reach it". A machine needs *both* a public address *and* a route to an internet gateway. A machine in a private subnet with a public address assigned is unreachable, because there is no gateway for the traffic to return through.

The standard shape for a deployed application is therefore two tiers across two zones:

![A two-tier virtual private cloud showing public and private subnets across two availability zones, with the security groups that permit traffic between them](./img/vpc-subnet-layout.png)

Public subnets in zone A and zone B hold only things that must be reachable from the internet — a load balancer, and possibly a bastion host. Private subnets in zone A and zone B hold the application instances. A further pair of isolated or private subnets holds the database. Nothing that holds data or runs your code has an address on the public internet, and the only way in is through the load balancer, which you control.

Two zones rather than one, always, for anything a customer depends on. It costs nothing extra in address space, and it is the difference between a facility failure being an incident and being an outage.

## Security groups

Routing decides whether a packet *can* arrive. Security groups decide whether it is *allowed* to.

A **security group** is a stateful virtual firewall attached to a network interface — which in practice means attached to an instance, a load balancer, or a managed database endpoint. Azure's equivalent is the network security group; Google Cloud uses VPC firewall rules attached by network tag. The model is the same and four properties define it:

**It is default-deny.** A new security group permits no inbound traffic at all. Everything that is allowed is allowed because somebody wrote a rule saying so. There is no "deny" rule to write — the absence of a permit *is* the deny.

**It is stateful.** If an inbound request is allowed, the response is automatically allowed back out, and vice versa. You do not write rules for return traffic or for ephemeral high-numbered ports. This is the single biggest difference from a traditional firewall and it removes an entire category of mistake.

**Rules are evaluated as a union.** An interface can have several security groups, and traffic is permitted if *any* rule in *any* attached group permits it. Rules never conflict, because none of them denies anything.

**The source of a rule can be another security group.** This is the feature to internalise, and it is what separates a competent layout from a fragile one. Instead of writing "allow port 5432 from `10.0.11.0/24`", you write "allow port 5432 from the security group `app-sg`". Now the rule means *the application tier*, not *that address range*, and it stays correct when you add a subnet, change the CIDR, or replace every instance. Addresses are an implementation detail; roles are the thing you are actually describing.

The layout for the two-tier application above is four groups, each with one job:

```text
lb-sg      inbound  443  from 0.0.0.0/0                (the public)
app-sg     inbound  8080 from lb-sg                    (only the load balancer)
db-sg      inbound  5432 from app-sg                   (only the application)
bastion-sg inbound  22   from 203.0.113.0/24           (the office range only)
app-sg     inbound  22   from bastion-sg               (admin access via bastion only)
```

Read that as a sentence and it describes the architecture: the public reaches the load balancer, the load balancer reaches the application, the application reaches the database, and humans reach machines only by going through one audited hop. Nothing in it mentions a subnet or an address except at the two points where traffic genuinely crosses a boundary you do not control.

Compare that with what an inexperienced engineer produces under time pressure: one security group, attached to everything, with `0.0.0.0/0` on ports 22, 80, 443, 5432, and 8080. It works. It also puts a database on the public internet, and automated scanners will find it in minutes. When you meet a rule permitting `0.0.0.0/0` on anything other than 80 or 443, treat it as a defect and ask what it is for.

Three habits that keep security groups honest:

- **Name and describe every rule.** Most providers allow a per-rule description field. "temporary — vendor testing, remove after 2026-08-15" in that field is how a rule gets removed rather than living forever.
- **Never open a port to `0.0.0.0/0` for administration.** SSH and RDP from anywhere is the most-exploited misconfiguration in cloud computing. Use a bastion, a VPN, or the provider's agent-based session service.
- **Scope outbound too, where it matters.** Default outbound rules usually allow everything. For a tier holding sensitive data, restricting outbound to the specific destinations it legitimately needs limits what an intruder can do with it.

Providers also offer a second, subnet-level control — network ACLs on AWS, and their equivalents elsewhere. These are *stateless*, apply to the whole subnet, and support explicit deny. They are a coarse blunt instrument used for broad blocks, and the default one permits everything. Know they exist and that a subnet-level deny will silently override a permissive security group; leave them at their default unless a specific requirement says otherwise. Firewall and encryption policy design is a topic in its own right and belongs to cse280 rather than here.

## Getting traffic in, and names for things

**Public addresses.** A dynamically assigned public address changes every time an instance stops and starts. A *reserved* address — an Elastic IP on AWS, a static public IP address on Azure and Google Cloud — stays yours until you release it. Reserve one when something external depends on the address; note that most providers charge for reserved addresses that are not attached to anything, which is a common and irritating line on a bill.

**Load balancers.** For anything with more than one instance, the entry point should be a load balancer rather than an instance address. It lives in the public subnets, holds the TLS certificate, spreads requests across healthy targets in both zones, and — crucially for your layout — is the only thing that needs to be publicly reachable. Health checks are what make it useful: the balancer stops sending traffic to a target that fails its check, which is how a failed instance becomes invisible rather than becoming an outage. Lesson 07 attaches autoscaling to that same target group.

**DNS.** Customers use names, not addresses. Each provider has a managed DNS service, and each provider also gives your VPC internal DNS resolution so resources can find each other by name. Two record types cover almost everything you will do: an `A` record maps a name to an address, and a `CNAME` maps a name to another name. Load balancers are usually referenced by name rather than address because their addresses change, which means the public entry point is normally a `CNAME` or a provider-specific alias record pointing at the balancer.

**Connecting to other networks.** Two mechanisms are worth recognising even though building them is beyond this course: **VPC peering** joins two VPCs so their private ranges can route to each other directly, and a **site-to-site VPN** or dedicated interconnect joins a VPC to a customer's own premises. Both fail immediately and permanently if the address ranges overlap — which is the third rule from the first section, arriving with consequences attached.

## Diagnosing a connectivity problem

You will be handed "I cannot reach the server" more often than you will be asked to design a network. Work the path in order, from outside in, and stop at the first layer that explains the symptom.

1. **Does the name resolve?** `dig app.example.com` or `nslookup`. A name that resolves to nothing, or to an old address, is a DNS problem and none of the following matters.
2. **Is there a route?** Is the target in a public subnet with a `0.0.0.0/0` route to an internet gateway, or behind a load balancer that is? A private-subnet instance with a public address is the classic trap.
3. **Does the security group permit it?** Check the inbound rule on the target: right port, right protocol, and a source that actually includes where you are coming from. Then check the *source's* outbound rules if they have been tightened.
4. **Is the subnet-level ACL in the way?** Rare, but a stateless deny here overrides everything above it, and because it is stateless it can block the return traffic while the request gets through.
5. **Is the application listening?** From on the machine, `ss -tlnp` shows what is bound to what. A service bound to `127.0.0.1` accepts only local connections no matter how perfect the network is — this is the single most common cause once the cloud layers check out.
6. **Is the instance healthy?** If a load balancer is involved, look at target health before anything else; an unhealthy target gets no traffic and the symptom looks exactly like a network fault.

The distinguishing symptom between the two most confusable failures is worth memorising. **A connection that hangs and eventually times out** is almost always a security group or route problem — the packet went into a void with nothing to send a rejection back. **A connection refused immediately** means the packet arrived and something said no: nothing is listening on that port, or a stateless deny rejected it. Timeout means blocked; refused means arrived. Deep packet-level traffic analysis is cse220's territory; this ladder is the part a deployment engineer owns.

## Practice

Build the two-tier layout from this lesson in your own account, prove the boundaries hold, then tear it down.

Do not use the default VPC. Create your own, and use two availability zones throughout.

1. Choose a VPC CIDR that is deliberately unlikely to collide with an office network, and write one sentence justifying the prefix length you chose. Create the VPC.
2. Create four subnets: public in zone A and zone B, private in zone A and zone B. Record each subnet's CIDR, its zone, and how many usable addresses it has.
3. Attach an internet gateway. Create a public route table with a `0.0.0.0/0` route to it, and associate it with both public subnets only.
4. Create a NAT gateway in one public subnet. Create a private route table with a `0.0.0.0/0` route to it, and associate it with both private subnets. Note the hourly and per-gigabyte price of that NAT gateway — you are going to be asked about it.
5. Create three security groups — `lb-sg`, `app-sg`, `bastion-sg` — with the rules from this lesson. Every rule that references another tier must use a **security group** as its source, not a CIDR. Give every rule a description.
6. Launch a bastion instance in a public subnet with `bastion-sg`, and an application instance in a private subnet in zone A with `app-sg`. The application instance must have no public address. Use cloud-init to install a web server listening on 8080.
7. Prove the private instance has no inbound path from the internet: from your laptop, attempt to connect to it directly and record what happens and how long it takes.
8. Connect to the application instance by hopping through the bastion. Confirm from the instance that it can reach the internet outbound — a package update is a sufficient test — and explain in one sentence which component made that work.
9. From the bastion, request the application's page on port 8080 over its private address. Because `app-sg` permits 8080 only from `lb-sg`, this should **fail** — record the failure mode and how long it takes to appear. Now add a temporary rule to `app-sg` permitting 8080 from `bastion-sg`, with the description "temporary — step 9 test, remove today", and retry: it should succeed. Remove the temporary rule and confirm the original failure returns. Write one sentence explaining why the rule's *source group*, not the bastion's subnet or address, decided the outcome.
10. Deliberately break one thing at a time and record the symptom for each: (a) remove the `0.0.0.0/0` route from the public route table; (b) restore it and instead bind the web server to `127.0.0.1`; (c) restore that and instead remove the inbound SSH rule from `bastion-sg`. For each, state whether the failure was a timeout or a refusal and which of the six diagnostic steps identified it.
11. Draw your layout — hand-drawn is fine — labelling every subnet with its CIDR and zone, every route table with its `0.0.0.0/0` target, and every security group with its rules. Somebody who has never seen your account should be able to trace a request from the internet to the application and back.
12. Delete everything you created, in dependency order, and confirm the NAT gateway and any reserved addresses are gone. Say what would still be billing if you had forgotten them.

**Deliverable:** the CIDR justification, your subnet and route table records, the security group rules with descriptions, the four recorded failure modes from steps 7, 9, and 10, and the labelled diagram.

## Check your understanding

1. An instance in a private subnet has a public address assigned, and nobody can reach it from the internet. Why? *(Being reachable needs both a public address and a route to an internet gateway; the private subnet's default route points at a NAT gateway, which does not accept inbound connections.)*
2. Why write `5432 from app-sg` rather than `5432 from 10.0.11.0/24`? *(The rule then means "the application tier" and stays correct when subnets, ranges, or instances change.)*
3. A connection attempt hangs for 30 seconds and times out. Which two layers do you check first? *(Routing and security groups — a timeout means the packet was dropped silently; a refusal means it arrived.)*
