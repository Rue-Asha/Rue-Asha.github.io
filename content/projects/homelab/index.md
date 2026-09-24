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

Two services are deployed this way today, Life-Managment-Dashboard and
Party-Games, alongside network-level pieces: Pi-hole for DNS filtering,
Tailscale as a subnet router for remote access into the LAN, and nginx as a
host-level reverse proxy in front of each web service.

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

## Small things that keep it usable

The `NN_` prefix on each playbook category encodes the order a fresh host moves
through them — base configuration before services. `01_PROVISIONING` is gone
entirely; that step is now `terraform apply`.

Everything runs from the repository root. `.envrc` exports `ANSIBLE_CONFIG`
pointing at `ansible/ansible.cfg`, so Ansible finds its config without anyone
changing directory — which matters because the Terraform-backed inventory plugin
resolves its project path relative to the working directory.

```sh
direnv allow
terraform -chdir=terraform/environments/homelab apply
ansible-playbook ansible/playbooks/03_SERVICES/pihole.yml -l pihole01
```

The host catalogue lives in `hosts.auto.tfvars` and is rendered into the Ansible
inventory, so the two layers read the same list of machines instead of keeping
one each.
