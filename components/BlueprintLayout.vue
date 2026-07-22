<template>
  <div class="bp-root">
    <ThemeSwitcher />

    <!-- Double drafting frame in the margins -->
    <div class="frame" aria-hidden="true" />

    <div class="wrap">
      <aside class="left">
        <div class="avwrap">
          <img class="avatar" :src="data.photo" :alt="data.name" />
        </div>
        <h1 class="name">{{ data.firstName }}<br />{{ data.lastName }}</h1>
        <div class="role">{{ data.role }}</div>
        <p class="tagline">{{ data.tagline }}</p>

        <div class="titleblock">
          <div class="tbrow">
            <div class="cell">
              <span class="k">Discipline</span><span class="v">Full-Stack</span>
            </div>
            <div class="cell">
              <span class="k">Exp.</span><span class="v">8 Years</span>
            </div>
          </div>
          <div class="tbrow">
            <div class="cell">
              <span class="k">Scale</span><span class="v">0 → €7M ARR</span>
            </div>
            <div class="cell">
              <span class="k">Status</span
              ><span class="v status"
                ><span class="sdot" />{{
                  data.availability.open ? "Available" : "Closed"
                }}</span
              >
            </div>
          </div>
        </div>

        <nav>
          <NuxtLink
            v-for="(item, i) in data.nav"
            :key="item.href"
            :to="linkTo(item.href)"
          >
            <span class="ix">[{{ String(i + 1).padStart(2, "0") }}]</span
            >{{ item.label }}
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
            <Icon :name="s.icon" size="17" />
          </a>
        </div>
      </aside>

      <main class="right">
        <section id="about">
          <div class="ol"><span class="fig">FIG 1 —</span> About</div>
          <div class="about">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p v-for="(p, i) in data.about" :key="i" v-html="p" />
          </div>
        </section>

        <section id="experiences" class="section">
          <div class="ol"><span class="fig">FIG 2 —</span> Experience</div>
          <article
            v-for="(xp, i) in data.experiences"
            :key="xp.company"
            class="xp"
            :data-fig="`2.${i + 1}`"
          >
            <div class="when">
              <span>{{ xp.dates }}</span>
              <span class="dur">[{{ xp.duration }}]</span>
            </div>
            <h3>
              {{ xp.title }}
              <a
                class="co"
                :href="xp.companyLink"
                target="_blank"
                rel="noopener noreferrer"
                >@ {{ xp.company }}</a
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
                <Icon name="mdi:link-variant" size="12" />{{ pl.name }}
              </a>
            </div>
            <div class="tags">
              <span v-for="t in xp.stack" :key="t" class="tag">{{ t }}</span>
            </div>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Experience } from "~/composables/usePortfolioData";

const data = usePortfolioData();

function linkTo(href: string) {
  return href.startsWith("#") ? { hash: href } : href;
}

function positionLine(xp: Experience): string {
  return xp.positions.length
    ? `${xp.contract} · ${xp.positions.join(" · ")}`
    : xp.contract;
}
</script>

<!-- Not scoped: namespaced under .bp-root; v-html About paragraphs need real
     selectors. CY-alpha tints use color-mix on --th-accent. The drafting grid
     lives in the margins; the reading content floats on a solid --th-panel
     backing (.wrap::before) so grid lines never run through text. -->
<style>
.bp-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  /* clip (not hidden) so the grid/frame can't cause horizontal scroll WITHOUT
     establishing a scroll container — `overflow: hidden` would break the sticky
     sidebar below (sticky resolves against the nearest scroll-container ancestor). */
  overflow: clip;
  background: var(--th-bg);
  color: var(--th-ink);
  font-family: var(--font-inter);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  background-image:
    linear-gradient(var(--th-line1) 1px, transparent 1px),
    linear-gradient(90deg, var(--th-line1) 1px, transparent 1px),
    linear-gradient(var(--th-line2) 1px, transparent 1px),
    linear-gradient(90deg, var(--th-line2) 1px, transparent 1px);
  background-size:
    120px 120px,
    120px 120px,
    24px 24px,
    24px 24px;
}
.bp-root .frame {
  position: absolute;
  inset: 24px;
  border: 1px solid var(--th-line1);
  z-index: 1;
  pointer-events: none;
}
.bp-root .frame::before {
  content: "";
  position: absolute;
  inset: 8px;
  border: 1px solid var(--th-line2);
}

/* content sheet — solid backing so the grid sits only in the margins/frame */
.bp-root .wrap {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 0;
  max-width: 1240px;
  margin: 0 auto;
  padding: 64px 56px;
}
.bp-root .wrap::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--th-panel);
  z-index: 0;
  box-shadow: 0 0 0 1px var(--th-line1);
}
.bp-root .left,
.bp-root .right {
  position: relative;
  z-index: 1;
}
.bp-root .left {
  padding-right: 48px;
  /* sticky sidebar (like Aurora). align-self:start so the grid item shrinks to
     its content height instead of stretching the full row — otherwise it fills
     the track and has no slack to stick. */
  position: sticky;
  top: 40px;
  align-self: start;
}

/* avatar */
.bp-root .avwrap {
  position: relative;
  margin-bottom: 0;
}
.bp-root .avatar {
  width: 100%;
  height: 230px;
  object-fit: cover;
  display: block;
  border: 1px solid color-mix(in srgb, var(--th-accent) 40%, transparent);
  filter: var(--th-av-filter);
  background: var(--th-bg);
}
.bp-root .name {
  font-family: var(--font-playfair-display);
  font-size: 46px;
  line-height: 1;
  font-weight: 600;
  margin: 22px 0 6px;
  letter-spacing: -0.01em;
  color: var(--th-head);
}
.bp-root .role {
  font-family: var(--font-jetbrains-mono);
  font-size: 12px;
  color: var(--th-accent);
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}
.bp-root .role::before {
  content: "// ";
  color: var(--th-muted);
}
.bp-root .tagline {
  font-size: 13.5px;
  color: var(--th-muted);
  line-height: 1.66;
  margin-bottom: 22px;
  max-width: 320px;
}

/* title block */
.bp-root .titleblock {
  border: 1px solid color-mix(in srgb, var(--th-accent) 40%, transparent);
  background: color-mix(in srgb, var(--th-accent) 4%, transparent);
}
.bp-root .titleblock .tbrow {
  display: flex;
  border-bottom: 1px solid color-mix(in srgb, var(--th-accent) 27%, transparent);
}
.bp-root .titleblock .tbrow:last-child {
  border-bottom: none;
}
.bp-root .titleblock .cell {
  flex: 1;
  padding: 9px 12px;
  border-right: 1px solid color-mix(in srgb, var(--th-accent) 27%, transparent);
}
.bp-root .titleblock .cell:last-child {
  border-right: none;
}
.bp-root .titleblock .k {
  font-family: var(--font-jetbrains-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--th-muted);
  display: block;
  margin-bottom: 2px;
}
.bp-root .titleblock .v {
  font-size: 13px;
  color: var(--th-ink);
  font-weight: 500;
}
.bp-root .titleblock .v.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--th-accent);
}
.bp-root .titleblock .v.status .sdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--th-accent);
  animation: bp-otw-pulse 2.4s ease-out infinite;
}
@keyframes bp-otw-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--th-accent) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bp-root .titleblock .v.status .sdot {
    animation: none;
  }
}

/* nav */
.bp-root nav {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--th-line1);
  margin-top: 22px;
  margin-bottom: 22px;
}
.bp-root nav a {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--th-line1);
  color: var(--th-ink);
  text-decoration: none;
  font-size: 14px;
  transition:
    color 0.2s,
    padding 0.2s;
}
.bp-root nav a .ix {
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  color: var(--th-accent);
}
.bp-root nav a:hover {
  color: var(--th-accent);
  padding-left: 6px;
}

/* socials */
.bp-root .socials {
  display: flex;
  gap: 8px;
}
.bp-root .socials a {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--th-accent) 33%, transparent);
  color: var(--th-muted);
  transition:
    color 0.2s,
    background 0.2s;
}
.bp-root .socials a:hover {
  color: var(--th-bg);
  background: var(--th-accent);
}

/* right column */
.bp-root .right {
  padding-left: 50px;
  border-left: 1px solid var(--th-line1);
}
.bp-root #about,
.bp-root #experiences {
  scroll-margin-top: 80px;
}
.bp-root .ol {
  font-family: var(--font-jetbrains-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--th-am);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 22px;
}
.bp-root .ol .fig {
  color: var(--th-muted);
}
.bp-root .ol::after {
  content: "";
  flex: 1;
  border-top: 1px dashed color-mix(in srgb, var(--th-accent) 33%, transparent);
}
.bp-root .about p {
  margin: 0 0 14px;
  color: var(--th-ink);
  font-size: 15.5px;
  line-height: 1.74;
  max-width: 60ch;
}
.bp-root .about b {
  color: var(--th-head);
  font-weight: 600;
  border-bottom: 1px solid color-mix(in srgb, var(--th-accent) 40%, transparent);
}
.bp-root .section {
  margin-top: 54px;
}

/* experience cards */
.bp-root .xp {
  position: relative;
  border: 1px solid var(--th-line1);
  padding: 20px 22px;
  margin-bottom: 18px;
  background: color-mix(in srgb, var(--th-accent) 3%, transparent);
  transition:
    border-color 0.25s,
    background 0.25s;
}
.bp-root .xp::before {
  content: attr(data-fig);
  position: absolute;
  top: -9px;
  left: 16px;
  background: var(--th-notch);
  padding: 0 8px;
  font-family: var(--font-jetbrains-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--th-am);
}
.bp-root .xp:hover {
  border-color: color-mix(in srgb, var(--th-accent) 53%, transparent);
  background: color-mix(in srgb, var(--th-accent) 7%, transparent);
}
.bp-root .xp .when {
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  color: var(--th-muted);
  letter-spacing: 0.04em;
  margin-bottom: 7px;
  display: flex;
  gap: 12px;
}
.bp-root .xp .when .dur {
  color: var(--th-accent);
}
.bp-root .xp h3 {
  font-family: var(--font-playfair-display);
  font-size: 21px;
  font-weight: 600;
  margin: 0 0 2px;
  color: var(--th-head);
}
.bp-root .xp h3 .co {
  color: var(--th-accent);
  font-style: italic;
  text-decoration: none;
}
.bp-root .xp h3 .co:hover {
  text-decoration: underline;
}
.bp-root .xp .pos {
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  color: var(--th-muted);
  margin: 0 0 10px;
}
.bp-root .xp .desc {
  color: var(--th-ink);
  font-size: 14px;
  line-height: 1.68;
  margin: 0 0 12px;
  max-width: 62ch;
}
.bp-root .xp .links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 12px;
}
.bp-root .xp .links a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  color: var(--th-accent);
  text-decoration: none;
}
.bp-root .xp .links a:hover {
  text-decoration: underline;
}
.bp-root .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.bp-root .tag {
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  padding: 3px 9px;
  border: 1px solid color-mix(in srgb, var(--th-accent) 27%, transparent);
  color: var(--th-ink);
  background: color-mix(in srgb, var(--th-accent) 3%, transparent);
}

@media (max-width: 760px) {
  .bp-root .frame {
    inset: 10px;
  }
  .bp-root .wrap {
    grid-template-columns: 1fr;
    padding: 62px 22px 64px;
  }
  .bp-root .left {
    padding-right: 0;
    position: static;
  }
  .bp-root .avatar {
    height: 240px;
  }
  .bp-root .name {
    font-size: 38px;
    margin: 18px 0 6px;
  }
  .bp-root .tagline {
    max-width: none;
  }
  .bp-root nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    border-top: none;
  }
  .bp-root nav a {
    flex: 1;
    justify-content: center;
    border-bottom: none;
    border: 1px solid color-mix(in srgb, var(--th-accent) 20%, transparent);
    padding: 9px 8px;
    font-size: 12.5px;
  }
  .bp-root nav a:hover {
    padding-left: 8px;
  }
  .bp-root .right {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--th-line1);
    margin-top: 30px;
    padding-top: 30px;
  }
  .bp-root .section {
    margin-top: 40px;
  }
  .bp-root .about p {
    font-size: 15px;
  }
}
</style>
