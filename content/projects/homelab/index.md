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
pinned git tag. There is no Docker and no CI in the loop — `systemd` supervises
the process.

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
formatting, validation and tflint on the Terraform side, ansible-lint and a
syntax check on the Ansible side — and a gate runs it before every commit the
agent attempts. A failure blocks the commit and hands the output back to the
agent, which fixes the problem and tries again without me in the loop. A second
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
