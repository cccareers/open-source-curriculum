---
lesson_id: net260-04
course_id: net260
pathway: cybersecurity-support-technician
title: Securing Cloud Networks
order: 4
kind: lesson
competency_ids:
  - D2-S1-C01
  - D6-S1-C01
objectives:
  - Configure cloud network isolation for a stated workload using virtual
    networks, subnets, and security groups
---

## The network is now a configuration file

Identity came first because it is the perimeter. Network isolation comes second because it is what limits the damage when identity fails — and it fails, eventually, in every environment.

The concepts you learned in net110 all survive the move to the cloud: subnets, routing, stateful filtering, defense in depth, deny by default. What changes is that none of them are physical any more. There is no cable to trace, no port to unplug, no rack to walk to. A subnet is a range in a declaration. A firewall rule is an object created by an API call. A route table is a resource with an identity policy attached to it, which means the question "who can change our network" is an IAM question, and you already know how to audit it.

Two practical consequences follow immediately.

First, **network changes are fast, silent, and reversible-looking.** Someone can expose a database to the internet in eight seconds with a single API call and no cabling. The mitigating fact is that the call is logged and the resulting configuration is readable — which is why so much of cloud network security is *verification* rather than construction.

Second, **the network is not the only path in.** Every managed service has a control-plane endpoint on the public internet. A perfectly isolated virtual network does nothing to stop an attacker who holds a credential and calls the storage API directly. Network isolation and identity are complementary; neither substitutes for the other. Keep saying this to yourself when someone proposes a network control as the answer to an identity problem.

## The building blocks, three ways

```text
CONCEPT                 AWS                 Azure               Google Cloud
Private network         VPC                 Virtual Network     VPC network
                                            (VNet)              (global)
Subdivision             Subnet (one AZ)     Subnet              Subnet (regional)
Instance-level filter   Security group      Network security    Firewall rules
                        (stateful)          group, applied to   (stateful, applied
                                            NIC or subnet       by target tag or
                                                                service account)
Subnet-level filter     Network ACL         NSG at subnet       (no separate layer;
                        (stateless)         scope               hierarchical policy)
Outbound to internet    NAT gateway         NAT gateway         Cloud NAT
Inbound from internet   Internet gateway    Public IP           External IP
                        + public IP
Private service access  VPC endpoint /      Private Endpoint /  Private Service
                        PrivateLink         Service Endpoint    Connect / Private
                                                                Google Access
Site-to-site            Site-to-Site VPN,   VPN Gateway,        Cloud VPN,
                        Direct Connect      ExpressRoute        Interconnect
Network telemetry       VPC Flow Logs       NSG Flow Logs       VPC Flow Logs
```

Three differences in this table are worth committing to memory, because they change how you design and how you audit.

**Scope of the network object.** An AWS VPC is regional and a subnet lives in one availability zone. An Azure VNet is regional. A Google Cloud VPC network is *global*, with regional subnets inside it. So "one VPC" means something different in each, and a diagram that is correct on one provider can be structurally wrong on another.

**Stateful versus stateless.** Security groups, NSGs, and Google Cloud firewall rules are stateful: allow the inbound request and the response is automatically permitted. AWS network ACLs are stateless, which means you must allow the return traffic explicitly, usually on the ephemeral port range. Forgetting this is the single most common reason a network ACL change breaks something in a way that looks inexplicable.

**What a rule targets.** AWS attaches security groups to interfaces and — importantly — a security group rule can name *another security group* as its source. Google Cloud firewall rules target instances by network tag or by attached service account. Azure NSGs use IP ranges, application security groups, and service tags. The design advice is identical everywhere: **reference the logical group, never the IP address.** IP addresses change when an instance is replaced; group membership survives. A rule that says "the web tier may reach the database tier on 5432" stays true forever. A rule that says "10.20.1.14 may reach 10.20.2.9 on 5432" is true until the next deployment and then becomes either broken or, worse, wrong in a way that silently grants access to whatever inherits that address.

## Designing isolation for a workload

Isolation is not a switch you turn on. It is a set of decisions you make about one specific workload, and they come in a fixed order.

### 1. Draw the tiers and decide reachability

Take a three-tier web application: a load balancer, an application tier, a database. Write the reachability table before you write a single rule.

```text
FROM               TO                  PORT    WHY
Internet           Load balancer       443     Public service
Load balancer      App tier            8080    Only the LB may reach the app
App tier           Database            5432    Only the app may reach the DB
App tier           Provider APIs       443     Secrets, logging, object storage
Admin (managed
 session: SSM /
 Azure Bastion /
 IAP)              App tier            22*     Break-fix only, no public SSH
                                               *SSM and similar agent-based
                                                services need no inbound rule;
                                                IAP needs 22 from 35.235.240.0/20
                                                only; Bastion from its subnet
Everything else    Everything else     -       DENY
```

That table is the design. Everything after it is transcription. If you cannot produce the table, you do not yet understand the workload well enough to isolate it, and the usual result of building rules without one is a set of grants that accumulate until they mean nothing.

### 2. Choose public and private subnets

A subnet is "public" when its route table sends `0.0.0.0/0` to an internet gateway and its resources have public addresses. It is "private" when it does not.

The rule of thumb is blunt and correct: **only the load balancer belongs in a public subnet.** Application instances and databases go in private subnets and reach the internet, if they need to at all, through a NAT gateway — which allows outbound and permits no inbound. A database with a public IP address is a finding in essentially every environment, regardless of how tight its firewall rules are, because the firewall rule is one API call from being changed and the public address is one scan from being found.

```text
VPC 10.20.0.0/16
├── public-a   10.20.0.0/24    route 0.0.0.0/0 -> internet gateway
│                              contains: load balancer, NAT gateway
├── private-app-a  10.20.10.0/24   route 0.0.0.0/0 -> NAT gateway
│                                  contains: application instances
└── private-data-a 10.20.20.0/24   NO default route to internet
                                   contains: database
```

Note the data subnet has no internet route at all, not even through NAT. If the database never needs to fetch anything from the internet, giving it a path is pure downside: it is one of the few structural controls that hinders data exfiltration after a compromise.

### 3. Write the rules, referencing groups

```hcl
resource "aws_security_group" "lb" {
  name        = "clinic-lb"
  description = "Public entry point"
  vpc_id      = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "lb_https" {
  security_group_id = aws_security_group.lb.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "Public HTTPS"
}

resource "aws_security_group" "app" {
  name        = "clinic-app"
  description = "Application tier"
  vpc_id      = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "app_from_lb" {
  security_group_id            = aws_security_group.app.id
  referenced_security_group_id = aws_security_group.lb.id
  from_port                    = 8080
  to_port                      = 8080
  ip_protocol                  = "tcp"
  description                  = "Only the load balancer may reach the app"
}

resource "aws_security_group" "db" {
  name        = "clinic-db"
  description = "Database tier"
  vpc_id      = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Only the app tier may reach Postgres"
}
```

Read what the group references buy you. No IP addresses appear anywhere. Instances can be replaced, scaled, or moved to a different availability zone and the rules remain exactly as true as the day they were written. The `description` on every rule is not decoration — it is the field that lets a future auditor decide whether a rule is still needed, and a rule with no description is a rule nobody will ever dare delete.

The same shape as Azure NSG rules, which read differently but express the same intent:

```yaml
securityRules:
  - name: allow-https-from-internet
    priority: 100
    direction: Inbound
    access: Allow
    protocol: Tcp
    sourceAddressPrefix: Internet
    destinationApplicationSecurityGroups: [asg-lb]
    destinationPortRange: "443"
  - name: allow-app-from-lb
    priority: 110
    direction: Inbound
    access: Allow
    protocol: Tcp
    sourceApplicationSecurityGroups: [asg-lb]
    destinationApplicationSecurityGroups: [asg-app]
    destinationPortRange: "8080"
  - name: deny-all-inbound
    priority: 4096
    direction: Inbound
    access: Deny
    protocol: "*"
    sourceAddressPrefix: "*"
    destinationAddressPrefix: "*"
    destinationPortRange: "*"
```

Priority numbers matter in Azure: the lowest number that matches wins, and there are default rules below yours. Google Cloud firewall rules work the same way with a `priority` field, lowest wins, and an implied deny-ingress at the bottom.

### 4. Close the control-plane path

You isolated the network. The database is private, the app is private, nothing has a public IP but the load balancer. Now: the application still needs to read a secret and write an object to storage, and both of those services live on public endpoints.

The naive answer is to route that traffic out through the NAT gateway to the public API. It works, and it means your private workload has a general-purpose path to the internet — the exact path an attacker uses to exfiltrate or to pull down a second-stage payload.

The correct answer is a **private service endpoint**: AWS VPC endpoints and PrivateLink, Azure Private Endpoint and Service Endpoints, Google Cloud Private Service Connect and Private Google Access. The service's API is projected into your private network with a private address, so the traffic never traverses the internet at all, and on some providers you can then attach a policy to the endpoint restricting which resources may be reached through it.

That last capability is the interesting one. An endpoint policy that permits only your own buckets means a credential stolen from inside that network cannot be used to write your data into an attacker's bucket, because the network path to the attacker's bucket does not exist. Network isolation and identity, reinforcing each other.

### 5. Handle administrative access without opening SSH

Public SSH or RDP to a workload instance is one of the most reliable findings in any cloud environment, and it is unnecessary. The options, in ascending order of preference:

- **Bastion host in a public subnet.** Traditional, works everywhere, and now the weakest option because it is a permanently exposed host you must patch and monitor.
- **Managed bastion service.** Azure Bastion, or a provider-managed session service. No exposed port on your instance.
- **Agent-based session access.** AWS Systems Manager Session Manager, Google Cloud IAP TCP forwarding. The instance opens an outbound connection to the provider; there is no inbound rule at all, and every session is authorized by IAM and logged. Nothing to expose, nothing to patch, and the access record lands in the audit log you will study in lesson 07.

The third option deserves emphasis because it converts a network problem into an identity problem you already know how to audit. "Who can shell into production" becomes a policy query rather than a question about who has the SSH key.

## VPNs and hybrid connectivity

Most organizations moving to the cloud have something left on-premises, and the two networks must talk.

**Site-to-site VPN** builds an IPsec tunnel between your on-premises edge device and a provider VPN gateway over the public internet. It is cheap, quick to stand up, encrypted, and limited by internet variability. Standard practice is two tunnels to separate provider endpoints for redundancy.

**Dedicated interconnect** — Direct Connect, ExpressRoute, Cloud Interconnect — is a private circuit. Predictable, higher bandwidth, and here is the part people get wrong: **a private circuit is not automatically encrypted.** Private means "not routed over the public internet," not "confidential." If your data classification requires encryption in transit, you run encryption over the circuit, or you rely on TLS at the application layer, and you say which in your design.

**Client VPN** brings individual users onto the cloud network. Increasingly it is being displaced by identity-aware proxies and zero-trust access, which authenticate per-request rather than admitting a device to a network. The security argument is straightforward: a client VPN grants network position, and network position is exactly what you have spent this lesson trying not to grant.

Two rules for any hybrid link:

- **Advertise the narrowest routes you can.** A tunnel that carries your entire on-premises `10.0.0.0/8` into the cloud has just merged two blast radii. Advertise only the ranges that genuinely need to be reachable.
- **Filter at both ends.** A VPN is a transport, not a control. The security group and on-premises firewall rules still apply, and "it came over the VPN" is not an authorization.

## Verifying isolation, which is the actual job

You will more often be asked to check someone else's network than to build your own. Work through a fixed list, because the interesting failures are boring.

1. **Enumerate every public IP address and every internet-facing load balancer.** For each one, name the service it exposes and the reason. Anything you cannot justify is a finding.
2. **Search for `0.0.0.0/0` and `::/0` in inbound rules.** On 443 to a load balancer, fine. On 22, 3389, 5432, 3306, 6379, 27017, 9200, or anything else, a finding — and for a database port, a critical one.
3. **Check for default networks.** Every provider creates a default VPC or network with permissive rules to make getting started easy. Production workloads should not be in it, and in most mature accounts it should not exist.
4. **Read the route tables, not just the firewall rules.** A subnet you believe is private but which has a default route to an internet gateway is public, whatever anyone calls it. This is a genuinely common and genuinely missed defect.
5. **Confirm the data tier has no public address and no internet route.**
6. **Look for peering and hybrid links,** and ask what each connects to. Transitive reachability through a peering you forgot about is how "isolated" environments turn out not to be.
7. **Confirm flow logs are on** for the networks that matter, and that someone receives them. Without flow logs you cannot answer "did anything actually connect to it" after an incident, and lesson 07 will need them.
8. **Test it.** Configuration review tells you what the rules say. From an authorized position inside your own lab, attempt the connection that should fail and record that it failed.

That last point carries a hard boundary. Connectivity testing is performed **only** against your own lab account or an instructor-provided target, with authorization stated in writing beforehand. Scanning or probing any other environment — including another team's cloud account at your employer — requires explicit written authorization and belongs to the discipline covered in cyb140, not here. In this course you verify your own controls.

A finding, written the way it should be:

```text
F2  CRITICAL  Managed Postgres instance clinic-db-prod is reachable from the
              internet.
              Evidence: public endpoint enabled; firewall rule "allow-ops"
              permits 0.0.0.0/0 on 5432; instance has a public IP; flow logs
              show 41 connection attempts from 6 external ASNs in 7 days,
              all rejected at authentication.
              Risk: any credential leak becomes immediate data access with no
              network barrier; the port is being actively discovered already.
              Fix: disable the public endpoint; move to a private subnet with
              no default route; replace "allow-ops" with a rule sourced from
              the app tier group on 5432 only; provide operator access via
              the managed session service.
              Owner: Platform Lead.   Target: 3 days.
              Verify: re-run external connectivity test from lab; expect
              timeout. Confirm flow logs show no accepted external flows.
```

## Practice

Everything below runs in your own lab or sandbox account, or against an instructor-provided target, with written authorization confirmed before you begin. Do not probe, scan, or test connectivity against any environment outside that boundary.

**Exercise 1 — Write the reachability table.**

A clinic runs: a public web front end, an internal staff admin interface used only from the office, an application tier, a managed Postgres database, a nightly export job that writes to object storage, and a legacy SMS gateway VM that must reach one external vendor API. Produce the complete reachability table (from, to, port, why) including an explicit final deny row, then state which components go in public subnets, which in private subnets with NAT, and which in private subnets with no internet route at all.

**Exercise 2 — Build it.**

In your lab account, implement the isolation for the three core tiers from Exercise 1 using infrastructure as code. Requirements: no hard-coded IP addresses in any rule other than the public 443 ingress; every rule carries a description; the database tier has no public address and no default route; administrative access uses a managed session service or bastion rather than public SSH. Commit the configuration and include it in your submission.

**Exercise 3 — Prove the isolation holds.**

Design and run four tests against your own lab build: one connection that must succeed, and three that must fail (internet to database, internet to app tier, database outbound to the internet). Record for each the command run, the expected result, the observed result, and the corresponding flow log entry. A test with no evidence attached does not count.

**Exercise 4 — Audit a broken network.**

Your instructor provides an exported network configuration. Find every isolation defect and write each as a finding in the format above, with severity, evidence, risk, specific fix, owner, and a verification step. There are at least five. At least one is a route table problem that the firewall rules disguise, and at least one is a public IP address on something that should not have one.

**Exercise 5 — Close the control-plane path.**

Your application in a private subnet currently reaches the object storage and secrets APIs through a NAT gateway. Write the change that removes that dependency: which private endpoint mechanism you would use on your chosen provider, what the route and DNS implications are, what endpoint policy you would attach to restrict which resources may be reached through it, and how you would verify afterwards that the workload can still reach your own storage but can no longer reach an arbitrary internet host. Then state, in two sentences, which specific attack step this change removes.

## Check your understanding

1. A subnet named `private-app-a` has a route `0.0.0.0/0 -> internet gateway`. Its security groups allow nothing from the internet. Is it private?
2. Why should a database rule reference the app tier's security group rather than the app instances' IP addresses?
3. Your workload reaches object storage through a NAT gateway. What does a private service endpoint with an endpoint policy remove from an attacker's options?

**Answers:** (1) No — a subnet is public if its route table sends the default route to an internet gateway; read route tables independently of firewall rules. (2) IP addresses change when instances are replaced; group membership survives, so the rule stays correct and does not silently grant access to whatever inherits an old address. (3) The endpoint provides a private path to object storage; with a policy limited to your own buckets, it blocks access to an attacker's bucket through that endpoint. It does not remove an existing NAT/default internet route: remove or restrict that egress separately and verify no alternate path remains. See [AWS endpoint routing](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html).
