<template>
  <div class="aurora-root">
    <ThemeSwitcher />

    <div class="wrap">
      <aside class="left">
        <img class="avatar" :src="data.photo" :alt="data.name" />
        <h1 class="name">{{ data.firstName }}<br />{{ data.lastName }}</h1>
        <div class="role">{{ data.role }}</div>
        <p class="tagline">{{ data.tagline }}</p>
        <div class="divrule" />
        <nav>
          <NuxtLink
            v-for="(item, i) in data.nav"
            :key="item.href"
            :to="linkTo(item.href)"
            :class="{ active: i === 0 }"
          >
            <span class="ix">{{ String(i + 1).padStart(2, "0") }}</span>
            {{ item.label }}
          </NuxtLink>
        </nav>
        <div class="socials">
          <a
            v-for="s in data.socials"
            :key="s.label"
            :href="s.url"
            :title="s.label"
            :aria-label="s.label"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon :name="s.icon" size="18" />
          </a>
        </div>
      </aside>

      <main class="right">
        <section id="about">
          <div class="sect-label">About</div>
          <div class="about">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p v-for="(p, i) in data.about" :key="i" v-html="p" />
          </div>
        </section>

        <section id="experiences" class="section">
          <div class="sect-label">Experience</div>
          <div class="tl">
            <article
              v-for="xp in data.experiences"
              :key="xp.company"
              class="xp"
            >
              <div class="when">
                <span>{{ xp.dates }}</span>
                <span class="dur">{{ xp.duration }}</span>
              </div>
              <h3>
                {{ xp.title }} <span class="co">@ {{ xp.company }}</span>
                <a
                  class="ext"
                  :href="xp.companyLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`Visit ${xp.company}`"
                  >↗</a
                >
              </h3>
              <div class="pos">{{ positionLine(xp) }}</div>
              <p class="desc">{{ xp.description }}</p>
              <div v-if="xp.projectLinks?.length" class="links">
                <a
                  v-for="pl in xp.projectLinks"
                  :key="pl.url"
                  :href="pl.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="mdi:link-variant" size="13" />{{ pl.name }}
                </a>
              </div>
              <div class="tags">
                <StackTag v-for="t in xp.stack" :key="t" :text="t" />
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Experience } from "~/composables/usePortfolioData";

const data = usePortfolioData();

// Hash links stay on-page (SPA + smooth scroll); route links navigate.
function linkTo(href: string) {
  return href.startsWith("#") ? { hash: href } : href;
}

function positionLine(xp: Experience): string {
  return xp.positions.length
    ? `${xp.contract} · ${xp.positions.join(" · ")}`
    : xp.contract;
}
</script>

<!-- Not scoped: rules are namespaced under .aurora-root, and v-html paragraphs
     (the About copy) need real selectors, not Vue's scoped data-attributes. -->
<style>
.aurora-root {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  color: var(--th-body);
  font-family: var(--font-inter);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.aurora-root .wrap {
  position: relative;
  display: flex;
  gap: 0;
  max-width: 1180px;
  margin: 0 auto;
  padding: 64px 40px 80px;
}
.aurora-root .left {
  width: 380px;
  flex-shrink: 0;
  position: sticky;
  top: 64px;
  align-self: flex-start;
  padding-right: 60px;
}
.aurora-root .avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--th-avatar-ring);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--th-accent) 8%, transparent);
  transition: border-color 0.6s ease;
}
.aurora-root .name {
  font-family: var(--font-playfair-display);
  font-size: 52px;
  line-height: 1;
  font-weight: 600;
  margin: 24px 0 12px;
  letter-spacing: -0.015em;
  color: var(--th-name);
  transition: color 0.6s ease;
}
.aurora-root .role {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--th-accent);
  margin-bottom: 20px;
  transition: color 0.6s ease;
}
.aurora-root .tagline {
  font-family: var(--font-playfair-display);
  font-style: italic;
  font-size: 17.5px;
  line-height: 1.55;
  color: var(--th-muted);
  max-width: 300px;
  transition: color 0.6s ease;
}
.aurora-root .divrule {
  height: 1px;
  background: linear-gradient(90deg, var(--th-border-strong), transparent);
  margin: 30px 0;
}
/* Scoped to the sidebar (`.left`): the shared <ThemeSwitcher> renders its mobile
   header as <nav class="ph-nav"> inside .aurora-root, so a bare `.aurora-root nav`
   selector would leak onto it (stacking the links vertically). */
.aurora-root .left nav {
  display: flex;
  flex-direction: column;
}
.aurora-root .left nav a {
  display: flex;
  align-items: baseline;
  gap: 13px;
  padding: 12px 0;
  color: var(--th-ink);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-bottom: 1px solid var(--th-border);
  transition:
    color 0.22s,
    padding 0.22s,
    border-color 0.6s ease;
}
.aurora-root .left nav a .ix {
  font-family: var(--font-playfair-display);
  font-style: italic;
  font-size: 14px;
  color: var(--th-accent);
  font-weight: 500;
}
.aurora-root .left nav a:hover {
  color: var(--th-accent-soft);
  padding-left: 6px;
}
.aurora-root .left nav a.active {
  color: var(--th-ink);
}
.aurora-root .socials {
  margin-top: 26px;
  display: flex;
  gap: 8px;
}
.aurora-root .socials a {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--th-tag-bg);
  border: 1px solid var(--th-tag-border);
  color: var(--th-muted);
  transition:
    color 0.25s,
    background 0.25s,
    border-color 0.25s;
}
.aurora-root .socials a:hover {
  color: var(--th-bg);
  border-color: var(--th-accent);
  background: var(--th-accent);
}

.aurora-root .right {
  flex: 1;
  min-width: 0;
  padding: 6px 8px 0 60px;
  border-left: 1px solid var(--th-border);
  transition: border-color 0.6s ease;
}
.aurora-root #about {
  scroll-margin-top: 80px;
}
.aurora-root #experiences {
  scroll-margin-top: 80px;
}
.aurora-root .sect-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--th-accent);
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 0 22px;
  transition: color 0.6s ease;
}
.aurora-root .sect-label::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--th-border-strong), transparent);
}
.aurora-root .about p {
  margin: 0 0 16px;
  color: var(--th-body);
  font-size: 16.5px;
  line-height: 1.74;
  max-width: 60ch;
}
.aurora-root .about b {
  color: var(--th-ink);
  font-weight: 600;
}
.aurora-root .section {
  margin-top: 60px;
}
.aurora-root .tl {
  position: relative;
  padding-left: 28px;
}
.aurora-root .tl::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--th-border-strong);
}
.aurora-root .xp {
  position: relative;
  padding: 0 0 34px;
}
.aurora-root .xp::before {
  content: "";
  position: absolute;
  left: -27px;
  top: 6px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--th-bg);
  border: 1.5px solid var(--th-accent);
  transition: all 0.25s;
}
.aurora-root .xp:hover::before {
  background: var(--th-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--th-accent) 16%, transparent);
}
.aurora-root .xp .when {
  font-size: 12.5px;
  color: var(--th-muted);
  letter-spacing: 0.03em;
  margin-bottom: 7px;
  display: flex;
  gap: 10px;
}
.aurora-root .xp .when .dur {
  font-family: var(--font-playfair-display);
  font-style: italic;
  color: var(--th-accent);
}
.aurora-root .xp h3 {
  font-family: var(--font-playfair-display);
  font-size: 23px;
  font-weight: 600;
  margin: 0 0 3px;
  color: var(--th-name);
}
.aurora-root .xp h3 .co {
  font-style: italic;
  color: var(--th-accent);
}
.aurora-root .xp h3 .ext {
  font-size: 13px;
  color: var(--th-accent);
  opacity: 0.7;
  text-decoration: none;
  transition: opacity 0.2s;
}
.aurora-root .xp h3 .ext:hover {
  opacity: 1;
}
.aurora-root .xp .pos {
  font-size: 13px;
  color: var(--th-muted);
  margin: 0 0 9px;
}
.aurora-root .xp .desc {
  color: var(--th-body);
  font-size: 15px;
  line-height: 1.7;
  margin: 0 0 13px;
  max-width: 62ch;
  opacity: 0.92;
}
.aurora-root .xp .links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 0 0 13px;
}
.aurora-root .xp .links a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--th-accent);
  text-decoration: none;
  transition: color 0.2s;
}
.aurora-root .xp .links a:hover {
  color: var(--th-accent-soft);
}
.aurora-root .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

@media (max-width: 880px) {
  .aurora-root .wrap {
    flex-direction: column;
    padding: 88px 28px 60px;
  }
  .aurora-root .left {
    width: auto;
    position: static;
    padding-right: 0;
    align-self: stretch;
  }
  .aurora-root .right {
    border-left: none;
    border-top: 1px solid var(--th-border);
    padding: 36px 0 0;
    margin-top: 36px;
  }
}
@media (max-width: 760px) {
  .aurora-root .wrap {
    padding: 72px 22px 64px;
  }
  .aurora-root .avatar {
    width: 78px;
    height: 78px;
  }
  .aurora-root .name {
    font-size: 40px;
    margin: 18px 0 10px;
  }
  .aurora-root .tagline {
    font-size: 15.5px;
    max-width: none;
  }
  .aurora-root .divrule {
    margin: 24px 0;
  }
  .aurora-root .left nav a {
    padding: 11px 0;
  }
  .aurora-root .right {
    padding-top: 30px;
    margin-top: 30px;
  }
  .aurora-root .about p {
    font-size: 16px;
  }
  .aurora-root .section {
    margin-top: 44px;
  }
  .aurora-root .xp h3 {
    font-size: 21px;
  }
}
</style>
