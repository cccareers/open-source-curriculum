---
lesson_id: cse203-06
course_id: cse203
pathway: cloud-support-engineer
title: Declaring Infrastructure with Terraform
order: 6
kind: lesson
competency_ids:
  - D4-S1-C02
objectives:
  - Define and update infrastructure with Terraform, including state, variables, and modules
---

## What Terraform is

Terraform is a single binary that reads configuration files, works out what needs to change to make reality match them, and calls cloud APIs to do it. It has two halves and the split explains most of its behaviour.

The **core** knows nothing about any cloud. It parses the configuration language, builds a dependency graph, compares desired state against recorded state, produces a plan, and executes it. Everything cloud-specific lives in a **provider** — a plugin downloaded per project that knows the API of one platform and exposes it as a set of resource types. There is a provider for each major cloud, and hundreds more for DNS registrars, monitoring services, source control, and databases.

This is what "vendor-neutral" actually means, and it is worth being precise because people overstate it. The *language*, the *workflow*, and the *concepts* are identical everywhere. The *resource types are not*. A configuration written against one cloud's provider does not run against another's, because the underlying services genuinely differ. What transfers is everything in this lesson: the syntax, the plan discipline, state handling, variables, and modules. Learn it on one provider and you will be productive on the next in a day.

The configuration language is **HCL**, HashiCorp Configuration Language. Files end in `.tf`, and Terraform reads *every* `.tf` file in the working directory as one configuration — the split across files is purely for human benefit. The conventional layout is:

```text
main.tf         resources
variables.tf    input declarations
outputs.tf      values to publish
versions.tf     required Terraform and provider versions
terraform.tfvars  values for this environment (often gitignored)
```

The examples below use the AWS provider, named explicitly because resource type names are provider-specific. On Azure the same configuration would use `azurerm_virtual_network`, `azurerm_subnet`, and `azurerm_linux_virtual_machine`; on Google Cloud, `google_compute_network`, `google_compute_subnetwork`, and `google_compute_instance`. Do the practice on whichever cloud you have; every block *shape* below is the same on all three.

## The first configuration

Three block types get you to a running resource.

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.42.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "ticketing"
    env  = "dev"
  }
}
```

The `terraform` block configures Terraform itself. Pinning `required_providers` is not optional in practice: providers release frequently, and an unpinned project will one day download a new major version and produce a plan full of changes nobody asked for. `~> 5.0` means "any 5.x, not 6".

The `provider` block configures the plugin — region, and credentials if you are not supplying them through the environment. Do not put access keys here. Terraform reads the same credential sources as the provider's own CLI, so if `aws sts get-caller-identity` works in your shell, Terraform will authenticate too.

The `resource` block is the substance. It has a **type** (`aws_vpc`) and a **local name** (`main`), and together those form the address `aws_vpc.main` used to reference it elsewhere. The local name is yours; it never appears in the cloud. Inside the block are the arguments the provider defines for that resource type, which you look up in the provider documentation — the documentation is the reference you will keep open permanently, and knowing that is part of learning the tool.

## init, plan, apply, destroy

Four commands make up the whole daily workflow.

```bash
terraform init      # download providers, configure the backend
terraform plan      # compare desired state to reality, propose changes
terraform apply     # execute the plan
terraform destroy   # remove everything this configuration manages
```

`terraform init` runs once per project, and again whenever you add a provider or change the backend. It creates `.terraform/` (downloaded plugins, gitignored) and `.terraform.lock.hcl` (the exact provider versions selected, **committed**, and the direct analogue of an application lockfile).

`terraform plan` is the step lesson 05 argued for. It reads the configuration, refreshes what it knows about existing resources, and prints a proposal:

```text
Terraform will perform the following actions:

  # aws_vpc.main will be created
  + resource "aws_vpc" "main" {
      + cidr_block           = "10.42.0.0/16"
      + enable_dns_hostnames = true
      + id                   = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

Read the symbols. `+` create, `~` change in place, `-` destroy, and `-/+` **replace** — destroy then recreate, which is the one that ruins days. Terraform prints `# forces replacement` next to the attribute responsible, and that annotation is the most important text the tool ever produces. `(known after apply)` marks values the cloud will assign, which is why a plan can never be a complete prediction.

![How Terraform compares declared configuration against recorded state and live infrastructure to produce a plan, and what apply then changes](./img/terraform-plan-apply-cycle.png)

`terraform apply` prints the plan again and asks for confirmation. For anything that matters, save the plan and apply exactly that file, so the thing you reviewed is the thing that runs:

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

`terraform destroy` removes everything in state. It is genuinely useful for lab and ephemeral environments and it is genuinely dangerous everywhere else. Read its plan with the same care.

Two more commands earn their place early: `terraform fmt` rewrites files to canonical formatting, and `terraform validate` checks syntax and internal consistency without contacting the cloud. Run both before every commit.

## References, dependencies, and data sources

Resources refer to each other's attributes by address, and this is where declarative configuration starts paying off:

```hcl
resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.42.1.0/24"
  availability_zone = "us-east-1a"

  tags = { Name = "public-a" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
```

You never write the VPC id anywhere. `aws_vpc.main.id` is not known until the VPC exists, and by referencing it you have told Terraform two things at once: what value to use, and that the subnet depends on the VPC. Terraform builds a **dependency graph** from these references and creates resources in the required order, in parallel where it can, and destroys them in reverse. This is why the ordering problems that plague shell scripts simply do not arise.

Where a genuine dependency exists that is not expressed by a reference — a policy that must be attached before an instance starts using it — `depends_on` states it explicitly. Reach for it rarely; if you need it often, you are probably not referencing attributes where you could.

**Data sources** read something Terraform does not manage:

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}
```

`data.aws_ami.ubuntu.id` now resolves to the current image id without you hard-coding one. Note the trade-off, because lesson 02 warned about it: `most_recent = true` means the value can change between runs, and a changed image id forces replacement of every instance built from it. That is either exactly what you want — immutable infrastructure, rolling forward — or a nasty surprise. Decide deliberately, and pin the id for anything you need to be stable.

## State

Terraform's record of what it created is the **state file**, `terraform.tfstate`. Every resource in your configuration maps to a real cloud identifier in there, along with the last-known values of its attributes.

By default state is a JSON file in the working directory. That default is fine for the first hour and unacceptable for anything else, for three reasons: it is on one laptop, so nobody else can run the project; it has no locking, so two simultaneous applies corrupt it; and it commonly contains sensitive values, so it must never be committed. Add `.terraform/`, `*.tfstate`, and `*.tfstate.backup` to `.gitignore` on the first commit.

The fix is a **remote backend** — state kept in cloud storage with locking:

```hcl
terraform {
  backend "s3" {
    bucket         = "acme-tfstate"
    key            = "ticketing/dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    use_lockfile   = true
  }
}
```

`use_lockfile` is the S3 backend's native locking and needs Terraform 1.10 or later; if your project pins an older version (the `>= 1.6.0` example above would allow one), raise the pin or use the older pattern, a `dynamodb_table` argument naming a lock table you create separately. Check which your pinned version supports before relying on it. Azure's equivalent is the `azurerm` backend over a storage account container; Google Cloud's is the `gcs` backend. All three give you the same three properties, which are the ones that matter: **shared** so a team can work, **locked** so only one apply runs at a time, and **encrypted** because of what state contains. Use a separate state file per environment — that `key` path is doing real work.

A handful of state commands are worth knowing before you need them in anger:

```bash
terraform state list                  # every resource under management
terraform state show aws_vpc.main     # recorded attributes of one resource
terraform show                        # the whole state, human-readable
terraform state rm aws_vpc.main       # forget a resource WITHOUT destroying it
terraform import aws_vpc.main vpc-0abc123   # adopt an existing resource into state
```

`import` is how you adopt infrastructure somebody built by hand — the "import" response to drift from lesson 05. You write the resource block to match what exists, import it, then run `plan` until it comes back empty. `state rm` is the opposite: Terraform stops managing something without deleting it. Both are sharp tools; take a copy of state before using either.

Finally: **state is not a backup and not documentation.** It is a mapping. Losing it does not destroy your infrastructure, but it does leave Terraform believing nothing exists — after which the next apply cheerfully builds a duplicate of everything.

## Variables, locals, and outputs

Hard-coded values make a configuration single-use. **Input variables** make it a template.

```hcl
variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "vpc_cidr" {
  description = "Address range for the VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "instance_type" {
  description = "Instance size for the application tier."
  type        = string
  default     = "t3.small"
}

variable "azs" {
  description = "Availability zones to spread subnets across."
  type        = list(string)
}

variable "tags" {
  description = "Tags applied to every resource."
  type        = map(string)
  default     = {}
}
```

Reference them as `var.environment`. Types are enforced, so a list supplied where a string is expected fails at plan time rather than at 3 a.m. A variable with no `default` is required, which is a useful way to force a caller to make a decision.

`validation` blocks turn a class of mistake into an error message:

```hcl
variable "environment" {
  description = "Deployment environment name."
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of dev, staging, or prod."
  }
}
```

Values come from a `.tfvars` file, from `-var` on the command line, or from `TF_VAR_`-prefixed environment variables:

```hcl
environment   = "dev"
vpc_cidr      = "10.42.0.0/16"
azs           = ["us-east-1a", "us-east-1b"]
instance_type = "t3.small"

tags = {
  owner   = "platform-team"
  managed = "terraform"
}
```

```bash
terraform apply -var-file=dev.tfvars
```

That is the environment mechanism lesson 05 asked for: one configuration, one `.tfvars` per environment, differing only in values. Mark anything sensitive with `sensitive = true` so it is redacted from plan output — and remember that redaction is cosmetic, because the value is still written to state.

**Locals** are computed values used more than once:

```hcl
locals {
  name_prefix = "${var.environment}-ticketing"

  common_tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "terraform"
  })
}
```

`local.name_prefix` and `local.common_tags` then appear everywhere, and the naming and tagging convention is enforced by construction rather than by discipline.

**Outputs** publish values after apply — for humans, for scripts, and for other configurations:

```hcl
output "vpc_id" {
  description = "Id of the VPC."
  value       = aws_vpc.main.id
}

output "app_private_ip" {
  description = "Private address of the application instance."
  value       = aws_instance.app.private_ip
}

output "db_endpoint" {
  description = "Database connection endpoint."
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}
```

`terraform output -json` makes them machine-readable, which is how a deployment step finds the address of something Terraform just built.

## count, for_each, and lifecycle

Two subnets per tier, written twice, is tolerable. Two tiers across three zones, written six times, is not. Two meta-arguments solve it.

`count` repeats a resource a fixed number of times, indexed from zero:

```hcl
resource "aws_subnet" "public" {
  count = length(var.azs)

  vpc_id            = aws_vpc.main.id
  availability_zone = var.azs[count.index]
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-${count.index}"
  })
}
```

`cidrsubnet("10.42.0.0/16", 8, 0)` produces `10.42.0.0/24`, index 1 gives `10.42.1.0/24`, and so on — arithmetic instead of hand-counted ranges.

`for_each` iterates a map or set and keys each instance by its map key rather than by position:

```hcl
resource "aws_security_group" "tier" {
  for_each = {
    lb  = "Public entry point"
    app = "Application tier"
    db  = "Database tier"
  }

  name        = "${local.name_prefix}-${each.key}"
  description = each.value
  vpc_id      = aws_vpc.main.id

  tags = local.common_tags
}
```

Prefer `for_each` wherever the collection could change. With `count`, removing the middle element of a three-item list shifts every later item's index, and Terraform reads that as "destroy and recreate everything after position one". With `for_each`, resources are addressed as `aws_security_group.tier["app"]` and removing a different key disturbs nothing. This is one of the most common real-world Terraform accidents and it is entirely avoidable.

`lifecycle` adjusts how Terraform handles a resource:

```hcl
resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.private[0].id
  vpc_security_group_ids = [aws_security_group.tier["app"].id]
  user_data              = file("${path.module}/cloud-init.yaml")

  tags = merge(local.common_tags, { Name = "${local.name_prefix}-app" })

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [user_data]
  }
}
```

`create_before_destroy` builds the replacement before removing the original, which turns a replacement from an outage into a handover. `ignore_changes` tells Terraform to stop reconciling an attribute it will otherwise fight another system over. `prevent_destroy = true` makes Terraform refuse to delete a resource at all, and it belongs on every production database you manage.

## Modules

A **module** is a directory of `.tf` files. You have already written one: the top-level directory is the root module. Modules become interesting when you call one from another.

```hcl
module "network" {
  source = "./modules/network"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = var.azs
  tags        = local.common_tags
}

resource "aws_instance" "app" {
  subnet_id = module.network.private_subnet_ids[0]
  # …
}
```

The module's `variables.tf` defines its inputs, its `outputs.tf` defines what callers can read, and everything else inside is private. `module.network.private_subnet_ids` is an output. That is the entire interface, and it is genuinely a function signature: a well-designed module is one you can use correctly from its inputs and outputs alone.

Modules come from three kinds of source, and the difference matters:

```hcl
module "local_network" {
  source = "./modules/network"
}

module "registry_vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
}

module "shared" {
  source = "git::https://github.com/acme/tf-modules.git//network?ref=v1.4.0"
}
```

**Always pin a version** on anything you do not control. An unpinned registry or git module changes under you, and infrastructure that changes when nobody edited anything is precisely what you adopted this tool to prevent.

When should you write a module? When the same group of resources is needed more than once — per environment, per customer, per region — or when a chunk of configuration has grown big enough that its details obscure the shape of the whole. When should you not? On day one. A single flat configuration that works beats a beautifully factored one that nobody can follow, and premature modules are the most common way a Terraform repository becomes unreadable. Build it flat, watch it repeat, then extract.

Three rules keep modules useful. Give every input a `description` and a sensible `default` where one exists. Never let a module reach outside its inputs — no hard-coded account ids, region names, or environment strings. And do not put a `provider` block or a `backend` block inside a module; both belong to the root configuration, and a module carrying its own provider becomes impossible to use twice.

## Putting it together

The shape of a working project, assembled from the pieces above:

```text
ticketing/
├── versions.tf        terraform + provider version pins
├── main.tf            provider, module calls, top-level resources
├── variables.tf       inputs
├── locals.tf          naming and tagging conventions
├── outputs.tf         published values
├── dev.tfvars         development values
├── prod.tfvars        production values
├── cloud-init.yaml    instance boot configuration
├── .terraform.lock.hcl  committed
└── modules/
    └── network/       vpc, subnets, gateways, route tables
```

And the loop you will run dozens of times:

```bash
terraform fmt -recursive
terraform validate
terraform plan -var-file=dev.tfvars -out=tfplan
# read every line of the plan
terraform apply tfplan
```

That middle comment is not decoration. It is the professional practice this whole lesson exists to install.

## Practice

Rebuild, as Terraform code, the environment you created by hand in lessons 02 through 04. Work in a clean directory with git initialised from the first commit, and commit at every step so the history shows the build.

1. Initialise the project: `versions.tf` with a pinned Terraform version and a pinned provider, a `provider` block with the region taken from a variable, and a `.gitignore` covering `.terraform/`, `*.tfstate`, `*.tfstate.backup`, and your `.tfvars`. Commit before running anything.
2. Declare the VPC and run `terraform init`, then `terraform plan`. Read every line before applying. Apply, and confirm in the console that the VPC exists with the tags you declared.
3. Run `terraform plan` again with no changes and confirm it reports no changes. Explain in one sentence what the tool just did to reach that conclusion.
4. Add public and private subnets across two availability zones using `count` and `cidrsubnet`, plus an internet gateway, route tables, and associations. No subnet CIDR may be written as a literal.
5. Add the three security groups from lesson 03 using `for_each`, with rules that reference other security groups by address rather than by CIDR.
6. Add a data source for the operating system image, and an application instance in a private subnet using it, with your `cloud-init.yaml` supplied through `user_data`. Add a bucket with versioning enabled and a lifecycle rule.
7. Parameterise everything: `environment`, `region`, `vpc_cidr`, `azs`, and `instance_type` as variables with descriptions and types, a `validation` block on `environment`, a `locals` block producing a name prefix and common tags, and those common tags applied to every resource. Create `dev.tfvars`.
8. Add outputs for the VPC id, the private subnet ids, and the instance's private address. Run `terraform output -json` and record what you get.
9. Migrate state to a remote backend with locking and encryption. Confirm the migration, then run `terraform plan` and verify it still reports no changes.
10. Prove locking works: start an apply and, while it is running, start a second one from another terminal. Record the exact error the second one gives.
11. Make three changes, one at a time, and **record the plan symbol and reasoning before applying each**: (a) add a tag to the instance; (b) change the instance type one size up; (c) change the instance's subnet to the other availability zone. One of these is a change in place, one is a replacement, and one may be either — say which is which, and quote the line where Terraform explains the replacement.
12. Create drift by hand: in the console, add an inbound rule to one of your security groups. Run `terraform plan` and paste what it reports. Then resolve it by re-applying, and explain why you chose that resolution over amending the code.
13. Extract the network resources into `./modules/network` with proper inputs and outputs, and call it from the root. Run `terraform plan` afterwards and record what happens — refactoring into a module changes resource addresses, so the plan will not be empty. Say what the plan proposes to do and why that is dangerous on a production environment.
14. Destroy everything with `terraform destroy`, then audit the account for survivors as you did in lesson 04. Compare the number of orphans with what you found after the manual teardown, and write two sentences on the difference.

**Deliverable:** the committed repository (no state file, no secrets, `.terraform.lock.hcl` present), the plan output from steps 3, 11, 12, and 13 with your written reasoning for each, the locking error from step 10, and the teardown comparison.

## Check your understanding

1. Why is `.terraform.lock.hcl` committed while `terraform.tfstate` is not? *(The lockfile pins provider versions and contains nothing sensitive; state can hold secrets and belongs in a locked, encrypted remote backend.)*
2. You have three subnets created with `count` and remove the first from the list. What will the plan show, and how would `for_each` have avoided it? *(Indexes shift, so later subnets are destroyed and recreated; `for_each` keys resources by name, so only the removed one is destroyed.)*
3. What does `terraform state rm` do to the real resource? *(Nothing — Terraform stops managing it but does not delete it.)*
