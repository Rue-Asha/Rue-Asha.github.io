---
name: Homelab
summary: A Proxmox homelab where nothing is set up by hand — Terraform provisions the guests, Ansible configures them.
year: 2026
type: Infrastructure automation
tools:
  - Proxmox VE
  - Terraform
  - Ansible
  - LXC
  - systemd
  - GitHub Actions
repo: https://github.com/Rue-Asha/Homelab-Managment
featured: true
---

A Proxmox host running a handful of small machines, each doing one thing. The
rule the repository exists to enforce is that nothing is set up by hand: every
service gets its own lightweight LXC, and a playbook is the only way in.

## One service, one container, two repositories

Application services follow an app-per-LXC, two-repo model. The homelab
repository configures the host and installs the runtime; the application's own
code lives in its own repository and is checked out and built on the host at a
pinned git tag. There is no Docker and no CI in the deploy path — `systemd`
supervises the process, and a deploy is a playbook run from my machine.

One service is deployed this way today: Life-Manager, a weekly-sprint todo app,
in its own container behind nginx as a host-level reverse proxy. Everything
that ran before was torn down together — the two earlier apps,
Life-Managment-Dashboard and Party-Games, and the network pieces, Pi-hole for
DNS filtering and Tailscale as a subnet router into the LAN — so that each can
come back one at a time in the shape I want, rather than being reshaped in
place. With Terraform owning the guests that was a single targeted destroy. The
cost is plain: until Pi-hole and Tailscale return, the LAN has no DNS filtering
and there is no way in from outside it.

## Terraform provisions, Ansible configures

Two peer layers in one repository, with a boundary written down rather than
assumed. Terraform declares anything the Proxmox API owns — whether a guest
exists, its vmid and hostname, CPU, memory, disk, its network interface and IP,
and the SSH key seeded at creation. Ansible declares everything inside a guest:
users, sudo, SSH hardening, packages, runtimes, services, application releases.

Terraform `provisioner`, `remote-exec` and `local-exec` blocks are banned. They
are one-shot, not idempotent, and invisible to `plan`; configuration after boot
is always an Ansible run.

The provisioning layer used to be Ansible too, and replacing it was about state
rather than taste. With no state file there was no desired-state model, and it
showed in three places: changing the memory of an existing container silently
did nothing, because the create task was gated on the container not existing
yet; nothing implemented teardown, so removing a host from the inventory left it
running forever; and every role reimplemented its own "does this exist, is there
free space" preflight, which a state file gives for free.

## An agent works on it, behind gates

Most changes to this repository are made with Claude Code, and the rules that
matter most — lint before committing, never apply Terraform or run a playbook
against real hosts without asking — used to exist only as prose in its
instructions file. The model followed them most of the time, which is not the
same thing as by construction. An earlier commit hook had been written and
never wired into anything, so for weeks the only thing enforcing those rules was
the model's attention.

They are hooks now. One script runs whichever checks apply to what changed —
formatting, validation, tflint and checkov on the Terraform side, ansible-lint
and a syntax check on the Ansible side — and a git pre-commit hook runs it
before every commit, mine as well as the agent's. A failure blocks the commit
and hands the output back to the agent, which fixes the problem and tries again
without me in the loop. The agent is also stopped from passing `--no-verify` to
step around it. A second
gate stops on anything that would change a real machine, a Terraform apply or a
playbook run without `--check`, and asks me first. It is the same idea as
[flow](/writing/the-harness-proves-the-human-judges/): whatever a machine can
check should not need my approval, and what it cannot check should not happen
without it.

That second gate asks rather than proves, and that is the trade-off. The
stronger version would only allow an apply from a saved plan newer than every
Terraform change, turning my click into evidence. I built the smaller one first
because it changes nothing about how an apply is run. Its matching is
deliberately loose: a commit message that merely mentions an apply prompts
once, which is the right way round for a gate whose miss costs a container.

What it does not cover yet is the other end. A deploy still counts as done when
the playbook exits cleanly, not when the service answers on its port.

## CI is the one that decides

The gates had a hole I had stopped seeing: all of them ran inside the agent's
harness. The commit gate used to fire on the agent's commits and nothing else —
not mine from the terminal, not an edit made on GitHub, not a Dependabot pull
request — and where it did fire, the agent was grading its own work. So `main`
now gets its verdict from somewhere else. A GitHub Actions workflow runs on
every pull request and every push to `main`, on a fresh runner, and a ruleset
refuses the merge unless it is green.

The workflow owns no list of checks. It installs pinned tool versions and runs
the same script the commit hook runs, over the whole repository, so a new check
goes into the script and the hook and CI cannot drift apart. What the runner had
to be told is what my workstation has and it does not: a vault password file
and the SSH public key Terraform seeds into guests. Both are placeholders set
through the environment. I only found the second by running the job locally
against an empty home directory before pushing it — tflint evaluates locals,
and one of them reads a key file from the home directory.

It is CI and not CD, on purpose. The runner sits on GitHub's network and cannot
reach the LAN, the Terraform state lives on my machine, and no secret is
configured anywhere. Nothing in the workflow could change a container even if
it tried.

That made the commit gate a different thing. With CI as the authority, the
agent-only hook was no longer needed for correctness, but it still saved a
push-and-wait round trip per mistake, so it moved into git, where it serves both
of us. The ruleset has no bypass, and that includes me: my own fixes go through
a pull request too. It costs a minute on a hotfix, and that is the point — an
exemption for the owner would reopen exactly the gap this closed.

The other half is shared. Workflow linting, a secret scan over the full history,
and a review of newly added dependencies against known advisories live in one
reusable workflow in a separate public repository,
[Rue-Asha/ci](https://github.com/Rue-Asha/ci). This repository and this site
both call it pinned to a commit SHA, and Life-Manager will be the third; writing
the controls once is cheaper than keeping three copies honest. Its job names are
part of its interface, because a ruleset can only require a check by its exact
name. Getting it green surfaced two things I would not have guessed: the two
workflow linters disagree about GitHub's newer syntax for calling a workflow in
the same repository, and dependency review cannot run at all until the
repository's dependency graph is switched on — which, on both repositories, it
was not.

## Small things that keep it usable

The `NN_` prefix on each playbook category encodes the order a fresh host moves
through them — base configuration before services. `01_PROVISIONING` is gone
entirely; that step is now `terraform apply`.

Everything runs from the repository root. `.envrc` exports `ANSIBLE_CONFIG`
pointing at `ansible/ansible.cfg`, so Ansible finds its config without anyone
changing directory.

```sh
direnv allow
terraform -chdir=terraform/environments/homelab apply
ansible-playbook ansible/playbooks/03_SERVICES/life-manager.yml -l life-manager01
```

The host catalogue lives in `hosts.auto.tfvars` and is rendered into the Ansible
inventory, so the two layers read the same list of machines instead of keeping
one each. The original plan was the `cloud.terraform` inventory plugin reading
Terraform state directly, but its latest release cannot parse an inventory on
current ansible-core at all. Writing the inventory as a plain file turned out
better anyway: no extra collection, no dependency on readable state, and the
inventory change shows up in the same diff as the catalogue change that caused
it.
