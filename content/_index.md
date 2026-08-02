---
title: Rue Asha
layout: hextra-home
---

{{< hextra/hero-badge >}}
  <div class="hx:w-2 hx:h-2 hx:rounded-full hx:bg-primary-400"></div>
  <span>Learning in public</span>
{{< /hextra/hero-badge >}}

<div class="hx:mt-6 hx:mb-6">
{{< hextra/hero-headline >}}
  Notes from the way in
{{< /hextra/hero-headline >}}
</div>

<div class="hx:mb-12">
{{< hextra/hero-subtitle >}}
  Cybersecurity writeups, project documentation and&nbsp;<br class="hx:sm:block hx:hidden" />the messy middle of learning it all.
{{< /hextra/hero-subtitle >}}
</div>

{{< hextra/feature-grid >}}
  {{< hextra/feature-card
    title="Writeups"
    icon="flag"
    subtitle="CTF boxes, labs and challenges — recon through root, with the reasoning left in."
    link="writeups"
    style="background: radial-gradient(ellipse at 50% 80%, rgba(142,53,74,0.15), hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Projects"
    icon="cube"
    subtitle="Living documentation for the things I build: homelab, dashboards, tooling."
    link="projects"
    style="background: radial-gradient(ellipse at 50% 80%, rgba(194,97,254,0.15), hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Journal"
    icon="light-bulb"
    subtitle="Short essays on what I learned this week, and what still doesn't click."
    link="blog"
    style="background: radial-gradient(ellipse at 50% 80%, rgba(221,210,59,0.15), hsla(0,0%,100%,0));"
  >}}
{{< /hextra/feature-grid >}}

<div class="hx:mt-16 hx:mb-10 hx:text-center">
  <h2 class="hx:text-2xl hx:font-medium hx:mb-3">Start with the projects</h2>
  <p class="hx:text-gray-600 hx:dark:text-gray-400 hx:max-w-2xl hx:mx-auto">
    Not install guides — decision records. Why SQLite and not Postgres, why no WebSockets,
    why the migrations are date-prefixed. Each page states what was chosen, why, and what
    it cost.
  </p>
</div>

{{< hextra/feature-grid >}}
  {{< hextra/feature-card
    title="Homelab"
    icon="server"
    subtitle="A Proxmox host where nothing is configured by hand. Ansible turns an empty container into a running service, and a pinned git tag is the deployable unit."
    link="/projects/homelab/"
  >}}
  {{< hextra/feature-card
    title="Web Apps"
    icon="template"
    subtitle="One language, one process, one file. The architecture two self-hosted apps share — and an honest list of the conditions under which it stops being the right one."
    link="/projects/web-apps/"
  >}}
{{< /hextra/feature-grid >}}

<div class="hx:mt-16 hx:mb-8 hx:text-center hx:text-sm hx:text-gray-500 hx:dark:text-gray-400">
  <p>
    Everything here is written first for future-me, and second for anyone who finds it
    useful. More about the scope and the ethics on the
    <a href="/about/" class="hx:underline hx:underline-offset-2 hx:decoration-from-font">about page</a>.
  </p>
</div>
