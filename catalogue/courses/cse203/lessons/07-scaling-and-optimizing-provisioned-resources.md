---
lesson_id: cse203-07
course_id: cse203
pathway: cloud-support-engineer
title: Scaling and Optimizing Provisioned Resources
order: 7
kind: lesson
competency_ids:
  - D4-S1-C04
objectives:
  - Right-size and autoscale provisioned resources against demand and cost
---

## Optimisation is a subtraction problem

Every environment you have built so far is a fixed shape: one instance of a chosen size, running continuously. That is the correct way to learn and the wrong way to run anything for long, because demand is not fixed and a fixed shape is wrong at every moment except by accident. It is too big at 3 a.m. and too small at the Monday morning peak.

There are exactly three ways to fix the mismatch, and they are worth ranking because people reach for them in the wrong order.

1. **Turn off what nobody uses.** Free, instant, and it is where most of the money is. Development and test environments running twenty-four hours a day for a team that works forty hours a week are idle roughly 76% of the time.
2. **Right-size what is oversized.** Cheap, quick, and the second-largest saving in most accounts.
3. **Make the capacity follow demand.** Autoscaling and serverless. This is the interesting engineering, and it is third on the list because doing it to a workload that was never sized or never switched off is optimising the wrong variable.

Everything below assumes you have done one and two. Do them first with a real customer, too — a scaling policy attached to instances that are twice the size they need to be simply scales the waste.

## Right-sizing, done from evidence

Lesson 02 sized an instance from a workload description because nothing was running yet. Once something is running, guessing is no longer allowed. Four measurements, taken at peak and over at least a full business cycle — a week, ideally a month if there is a monthly close:

- **CPU utilisation.** Sustained below about 20% at peak means the instance is too big. Sustained above about 70% means it is too small or is about to be.
- **Memory in use.** Not reported by default on most platforms; it requires an agent on the instance. Missing memory data is the most common reason a right-sizing exercise stalls, so arrange it before you need it.
- **Disk throughput and operations per second**, against the volume's provisioned limits. A volume at its IOPS ceiling looks exactly like a slow application.
- **Network throughput**, against the instance type's ceiling. Smaller instance types have smaller network allowances, and a machine with idle CPU that is saturating its network allocation is a real and confusing failure.

Two rules turn measurements into a decision. **The binding constraint decides the family, and the size follows from it** — if memory is at 90% while CPU sits at 15%, you do not need more cores, you need a memory-optimised family, and moving up a size in a general-purpose family buys you the memory at the price of cores you will not use. And **change one dimension at a time, then re-measure**. Two simultaneous changes produce a result you cannot attribute.

Right-sizing downward has a floor worth naming: the smallest configuration that survives your peak *plus* whatever headroom your failure model requires. If you run two instances and either must be able to carry the whole load while the other is replaced, each has to be sized for 100% of peak, not 50%.

## Vertical and horizontal

**Vertical scaling** — a bigger instance — is the simple answer, and it has three hard limits. It requires a stop and start, so there is downtime. There is a largest instance type, and once you are on it there is nowhere to go. And a single instance of any size is a single point of failure. Vertical scaling is right for a database that cannot easily be spread across machines, and for the early life of anything.

**Horizontal scaling** — more instances — is the cloud-native answer and it is what autoscaling automates. It has no ceiling that matters, it can add and remove capacity without downtime, and it gives you fault tolerance for free because losing one of six instances is a capacity event rather than an outage.

Horizontal scaling has one precondition and it is absolute: **the instances must be interchangeable.** Any request must be servable by any instance, and destroying an instance must lose nothing. In practice that means:

- **No session state in memory.** A user logged in on instance three must not be logged out when the load balancer sends their next request to instance five. Sessions go in a shared cache or a signed token.
- **No uploaded files on local disk.** They go to object storage, which is lesson 04's argument arriving with consequences.
- **No local database.** It is a managed service in a private subnet.
- **No manual configuration on the machine.** A new instance must arrive fully configured from its image and boot script, because nobody is going to log into it — autoscaling creates instances at 4 a.m. without asking.

An application that violates any of these cannot be horizontally scaled until it is fixed, and diagnosing "it works with one instance and breaks with two" is a support call you will take. The symptom is almost always sessions or local files.

## Autoscaling groups

An **autoscaling group** — a scale set on Azure, a managed instance group on Google Cloud — is a declared population of interchangeable instances. You do not create instances any more; you declare how many should exist and let the group maintain that number.

Four pieces make one up.

**A launch template** is the recipe for one instance: image, type, security groups, instance role, boot script, storage. Every instance the group creates is built from it. Changing the template does not change running instances — new ones use the new version, and existing ones are replaced only when you trigger a refresh. That is immutable infrastructure operating as designed.

**Capacity bounds.** `min_size` is the floor the group never goes below, `max_size` is the ceiling that protects you from a runaway scaling loop emptying the customer's budget, and `desired_capacity` is the number it currently maintains. Scaling policies move `desired_capacity` between the two bounds; you set the bounds deliberately, and `max_size` is a cost control as much as a capacity one.

**Subnets across multiple zones.** Give the group the private subnets in both availability zones from lesson 03 and it distributes instances between them and rebalances after a failure. This is the cheapest availability you will ever buy.

**Health checks and replacement.** The group checks each instance and terminates and replaces anything unhealthy. There are two kinds and the difference matters: an *instance* health check asks the platform whether the virtual machine is running, and a *load balancer* health check asks the application whether it is answering correctly on its port. Only the second one detects a crashed application on a healthy machine, so use it. Set a **grace period** long enough for a new instance to boot and start its application, or the group will kill instances during start-up and loop forever creating new ones — a genuinely expensive mistake and an easy one.

Attaching the group to a load balancer's target group is what closes the circuit: new instances register and start receiving traffic, terminating instances are drained first. From outside, capacity changes are invisible.

## Scaling policies

A policy decides when `desired_capacity` changes.

**Target tracking** is the one to reach for first. You name a metric and a target value, and the platform adds and removes instances to keep the metric near it — "keep average CPU at 50%". It handles the arithmetic, it scales in conservatively, and it needs one decision from you rather than a table of thresholds.

**Step scaling** gives you explicit rules: at 70% add one instance, at 85% add three. Use it when the response needs to be non-linear, or when target tracking's behaviour does not fit the workload.

**Scheduled scaling** changes capacity by the clock. It is the most underrated policy in the set, because a great deal of real demand is a calendar, not a surprise: office hours, a batch window, a Monday morning login rush, an enrolment deadline. Scheduled scaling is also how you implement "turn it off at night" for non-production — a scheduled action taking `min_size` and `desired_capacity` to zero at 19:00 and back at 07:00 saves about two-thirds of the compute bill and requires no cleverness at all.

**Predictive scaling**, where offered, uses historical patterns to scale *before* demand arrives. It is useful for the one problem the others cannot solve, which is described next.

Three details separate a policy that works from one that thrashes.

**Choose a metric that reflects load, not a metric that is easy.** CPU is the default and is right when work is CPU-bound. For a service that spends its time waiting on a database, CPU stays flat while response time degrades, and a CPU policy will never scale. Request count per instance, queue depth, or concurrent connections are often the honest signal. Pick the number that goes up when users start suffering.

**Respect the lag.** Between the metric crossing a threshold and a new instance serving traffic there is a metric period, an evaluation window, a boot, an application start, and a health check — commonly three to six minutes. Autoscaling cannot respond to a spike shorter than that, and if your demand arrives in seconds you need either a warm buffer, scheduled capacity ahead of the known event, or a serverless approach. Nobody's autoscaling group survives a live television advert.

**Set cooldowns and warm-up periods.** After a scaling action, the group should wait before acting again, so the new instance has time to affect the metric. Without it, the metric is still high while the instance boots, the policy adds another, and you get a stampede followed by an equally violent scale-in. Oscillation like that costs more than no scaling at all.

Scale-in deserves its own thought. It saves the money, and it is the direction that breaks things. Ensure connection draining is enabled so a terminating instance finishes its in-flight requests, and be conservative — a slightly slow scale-in is much cheaper than a dropped checkout.

Declared in Terraform, using the tooling from lesson 06, the whole thing is short:

```hcl
resource "aws_autoscaling_group" "app" {
  name                = "${local.name_prefix}-app"
  min_size            = 2
  max_size            = 8
  desired_capacity    = 2
  vpc_zone_identifier = module.network.private_subnet_ids
  target_group_arns   = [aws_lb_target_group.app.arn]

  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # The schedules below change these two values; without this, the next
  # terraform apply would put them back to 2 overnight.
  lifecycle {
    ignore_changes = [min_size, desired_capacity]
  }
}

resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "${local.name_prefix}-cpu-target"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value     = 50
    disable_scale_in = false
  }
}

resource "aws_autoscaling_schedule" "nightly_down" {
  scheduled_action_name  = "nightly-down"
  autoscaling_group_name = aws_autoscaling_group.app.name
  recurrence             = "0 19 * * MON-FRI"
  time_zone              = "Europe/London"
  min_size               = 0
  desired_capacity       = 0
  max_size               = 8
}

resource "aws_autoscaling_schedule" "morning_up" {
  scheduled_action_name  = "morning-up"
  autoscaling_group_name = aws_autoscaling_group.app.name
  recurrence             = "0 7 * * MON-FRI"
  time_zone              = "Europe/London"
  min_size               = 2
  desired_capacity       = 2
  max_size               = 8
}
```

Two details in those schedules are easy to miss. A scale-down with no matching scale-up leaves the group at zero until somebody notices, so the two actions are always written as a pair. And scheduled recurrences are evaluated in UTC unless you name a time zone, so a "7 a.m." schedule written without one is wrong by an hour for half the year in most of the world. Use the customer's time zone, not your own. Finally, once a schedule owns `min_size` and `desired_capacity`, Terraform must stop owning them: the `lifecycle { ignore_changes = ... }` block on the group stops an evening `terraform apply` from quietly restoring two instances and undoing the saving.

A few short blocks, and the capacity strategy is now reviewable in a pull request like any other change. That is the sequencing argument from lesson 05 paying off: autoscaling is a property you declare on a resource, not a button somebody presses.

## Serverless functions as a demand-fitting tool

Lesson 02 introduced serverless functions as a compute abstraction. Here they are a *provisioning* strategy, and the distinction is the point of this section: a function's capacity is not something you size, schedule, or scale. It is created per request and destroyed afterwards.

That gives three properties an instance fleet cannot match.

**Scaling is per-request and immediate.** A thousand simultaneous invocations create a thousand execution environments in seconds, with no launch template, no health check, and no cooldown. The lag problem above simply does not apply.

**Idle costs nothing.** No invocations, no charge. An autoscaling group at `min_size = 2` bills for two instances every hour of the year regardless of traffic.

**There is no machine to operate.** No patching, no image rebuilds, no boot scripts, no capacity bounds.

And four constraints that decide when it is wrong.

**Cold starts.** The first invocation after an idle period pays initialisation — the runtime starting, dependencies loading, connections opening. Tens of milliseconds to several seconds depending on the runtime and the size of the package. For an asynchronous job nobody notices. For a synchronous request with a latency commitment it can be unacceptable, and mitigations exist but cost money and complexity.

**Execution limits.** Maximum run time per invocation, capped memory, limited local disk. Long jobs must be broken up or run somewhere else.

**Statelessness is enforced, not encouraged.** Nothing survives between invocations. Every piece of state lives in a database, a cache, or object storage — which also means every invocation pays for the connection to it, and a function scaling to a thousand concurrent executions in front of a modest database is the classic way to exhaust its connection limit. The autoscaling connection warning from lesson 04 applies with more force here, not less.

**The cost curve crosses over.** Per unit of compute, serverless is expensive. It wins because you buy so much less of it.

That crossover is arithmetic you should be able to do. A function billed per gigabyte-second at roughly seventeen dollars per million gigabyte-seconds, running for 200 ms at 512 MB, costs about 1.7 microdollars per invocation plus a small per-request charge. At 100,000 invocations a month that is well under a dollar; a small instance running all month is around fifteen. At 50 million invocations a month the function costs roughly ninety dollars — about $83 of compute plus around $10 of per-request charges at a typical twenty cents per million requests — and a pair of small instances handling the same steady load costs about thirty. Push the duration to one second or the memory to 2 GB and the function's figure multiplies by five or four respectively, while the instances' does not move. **Spiky and intermittent favours functions; steady and high-volume favours instances.** Run the numbers with your provider's real prices rather than trusting either instinct.

A useful rule of thumb: if the workload has a duty cycle below roughly 10% — genuinely idle most of the time — functions are usually cheaper and always simpler. Above about 50%, provisioned capacity usually wins. In between, decide on the operational properties rather than the price, because the difference is small.

## The other cost levers

Autoscaling changes how much you run. Three purchasing decisions change what each unit costs, and a support engineer is expected to know they exist.

**On-demand** is the default: full price, no commitment, delete whenever. Right for anything unpredictable and for everything while you are still learning the shape of the workload.

**Committed use** — reserved instances, savings plans, committed use discounts — trades a one- or three-year commitment for 30% to 70% off. Right for the steady baseline you are certain about. The trap is committing to a *size* rather than a *spend* where the provider offers the choice, because a right-sizing exercise six months later then leaves you paying for capacity you no longer use.

**Spot or preemptible capacity** is the provider's spare inventory at 60% to 90% off, reclaimable with a couple of minutes' notice. Right for anything interruption-tolerant: batch processing, build agents, and stateless web tiers with enough spread that losing a few instances is absorbed. Never for a database or anything holding state. Autoscaling groups can mix on-demand and spot, keeping a guaranteed baseline on-demand and taking the variable top on spot — a genuinely good pattern and a good answer in a review.

The habit that ties them together is attribution. Tag everything by owner, environment, and purpose, as lesson 02 insisted, and set a budget alert at a threshold that means something. A cost you cannot attribute is a cost nobody will own, and the first question on a "why has the bill gone up" ticket is always which tag the increase sits under.

## Practice

Take the Terraform project from lesson 06 and convert its single application instance into an autoscaling, right-sized, cost-controlled tier. All infrastructure changes are made in code; the console is for observation only.

1. **Right-size from evidence.** Put your existing instance under a repeatable synthetic load for at least fifteen minutes. Record CPU utilisation, memory in use (install whatever agent your provider needs for the memory metric), disk operations per second, and network throughput at peak. Identify the binding constraint and state whether the instance is oversized, undersized, or correct, with the numbers supporting it.
2. **Check the preconditions.** Audit your application against the four interchangeability requirements — no in-memory sessions, no local uploads, no local database, no manual configuration. Write down each one and how you satisfied it. If any is violated, fix it before continuing and say what you changed.
3. **Declare a launch template** in Terraform from your instance's current configuration: image, type, security group, instance role, boot script, and storage.
4. **Declare an autoscaling group** across the private subnets in both availability zones, with `min_size` 2, `max_size` 6, a load-balancer health check, and a grace period you can justify by timing an actual boot-to-healthy cycle. Attach it to a load balancer target group. Apply, and confirm two healthy instances in different zones.
5. **Prove replacement works.** Terminate one instance by hand. Record how long until a replacement is registered and healthy, and confirm the service stayed available throughout.
6. **Add a target tracking policy** on a metric you can defend. Justify in two sentences why that metric reflects load for this application and what CPU would fail to capture if the workload were database-bound.
7. **Trigger a scale-out.** Apply enough load to cross the target, and record the timeline: metric breach, policy action, instance launch, health check pass, traffic served. Report the total lag and state what class of demand spike this group could not absorb.
8. **Trigger a scale-in** by removing the load. Record how long it takes and whether any request failed during termination. If any did, say which setting would have prevented it.
9. **Add a scheduled action** taking the group to zero outside working hours and back in the morning. Calculate the monthly saving against running `min_size` 2 continuously, using your provider's real prices.
10. **Break it deliberately, once.** Set the health check grace period to 30 seconds, apply, and observe. Record what happens and why, then restore the correct value. Estimate what an hour of that loop would have cost.
11. **Do the serverless comparison.** Take one narrow piece of work from your application — an image thumbnail, a notification, a nightly report — and cost it two ways for 10,000, 500,000, and 20,000,000 invocations a month: as a function, and as capacity on your existing instances. Show the arithmetic, identify the crossover point, and state which you would recommend and why. Name one non-cost reason that could reverse your recommendation.
12. **Write the optimisation memo**, no more than 400 words, addressed to the customer: what you changed, the measured before-and-after monthly cost, the capacity bounds you set and why `max_size` is where it is, what would happen during a spike larger than the group can absorb, and one commitment or spot recommendation you would make once the workload's baseline is confirmed.
13. **Tear down** with `terraform destroy` and confirm no launch templates, target groups, or load balancers survived.

**Deliverable:** the right-sizing measurements and conclusion, the interchangeability audit, the Terraform changes, the timelines from steps 5, 7, and 8, the grace-period failure observation, the serverless cost comparison with its arithmetic, and the customer memo.
