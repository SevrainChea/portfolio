<template>
  <div class="ed-root">
    <ThemeSwitcher />

    <!-- Faint paper grain overlay -->
    <div class="paper" aria-hidden="true" />

    <div class="sheet">
      <header class="masthead">
        <div>
          <div class="kicker">Portfolio — Vol. {{ vol }}</div>
          <h1>{{ data.name }}</h1>
        </div>
        <div class="meta">
          Founding Engineer<br /><b>Product Builder</b>
          <span v-if="data.availability.open" class="avail"
            ><span class="dot" />{{ data.availability.label }}</span
          >
        </div>
      </header>

      <div class="lead">
        <div class="figure">
          <img class="avatar" :src="data.photo" :alt="data.name" />
          <div class="cap">The engineer at work, 2025.</div>
        </div>
        <div>
          <div class="role">On building &amp; leading</div>
          <p class="standfirst">{{ data.tagline }}</p>
          <nav>
            <NuxtLink
              v-for="(item, i) in data.nav"
              :key="item.href"
              :to="linkTo(item.href)"
            >
              <span class="n">{{ String(i + 1).padStart(2, "0") }}</span
              >{{ item.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>

      <section id="about">
        <div class="sectlabel">About</div>
        <div class="about">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p v-for="(p, i) in data.about" :key="i" v-html="p" />
        </div>
      </section>

      <section id="experiences">
        <div class="sectlabel">Experience</div>
        <article v-for="xp in data.experiences" :key="xp.company" class="xp">
          <div class="when">
            {{ xp.dates }}<span class="dur">{{ xp.duration }}</span>
          </div>
          <div>
            <h3>
              {{ xp.title }}
              <a
                class="co"
                :href="xp.companyLink"
                target="_blank"
                rel="noopener noreferrer"
                >{{ xp.company }}</a
              >
            </h3>
            <div class="pos">{{ positionLine(xp) }}</div>
            <p class="desc">{{ xp.description }}</p>
            <div class="tags">
              <span v-for="(t, j) in xp.stack" :key="t">
                {{ t }}<span v-if="j < xp.stack.length - 1" class="sep">/</span>
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Experience } from "~/composables/usePortfolioData";

const data = usePortfolioData();
const { currentVariant } = useTheme();

// Per-variant issue number for the masthead kicker (place is always Paris).
const VOLUMES: Record<string, string> = {
  issue: "7",
  noir: "II",
  forest: "04",
};
const vol = computed(() => VOLUMES[currentVariant.value] ?? "1");

function linkTo(href: string) {
  return href.startsWith("#") ? { hash: href } : href;
}

// Editorial joins positions with commas after an em dash, per the prototype.
function positionLine(xp: Experience): string {
  return xp.positions.length
    ? `${xp.contract} — ${xp.positions.join(", ")}`
    : xp.contract;
}
</script>

<!-- Not scoped: namespaced under .ed-root; v-html About paragraphs need real
     selectors (drop cap on the first one). -->
<style>
.ed-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: var(--th-bg);
  color: var(--th-ink);
  font-family: var(--font-inter);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.ed-root .paper {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: var(--th-grain-op);
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}
.ed-root .sheet {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 0 auto;
  padding: 54px 70px 90px;
}

/* masthead */
.ed-root .masthead {
  border-top: 3px solid var(--th-ink);
  border-bottom: 1px solid var(--th-ink);
  padding: 14px 0 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.ed-root .masthead .kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--th-accent);
  margin-bottom: 10px;
}
.ed-root .masthead h1 {
  font-family: var(--font-playfair-display);
  font-size: 78px;
  line-height: 0.9;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}
.ed-root .masthead .meta {
  text-align: right;
  font-size: 11.5px;
  color: var(--th-muted);
  letter-spacing: 0.04em;
  line-height: 1.8;
  text-transform: uppercase;
}
.ed-root .masthead .meta b {
  color: var(--th-ink);
}
.ed-root .masthead .meta .avail {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  color: var(--th-accent);
  font-weight: 700;
}
.ed-root .masthead .meta .avail .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--th-accent);
  animation: ed-otw-pulse 2.4s ease-out infinite;
}
@keyframes ed-otw-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--th-accent) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 7px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ed-root .masthead .meta .avail .dot {
    animation: none;
  }
}

/* top intro row */
.ed-root .lead {
  display: grid;
  grid-template-columns: 236px 1fr;
  gap: 48px;
  padding: 40px 0 0;
  border-bottom: 1px solid var(--th-border);
  margin-bottom: 44px;
}
.ed-root .lead .avatar {
  width: 236px;
  height: 280px;
  object-fit: cover;
  filter: grayscale(0.3) saturate(0.9);
  border: 1px solid var(--th-border);
}
.ed-root .lead .cap {
  font-size: 11px;
  color: var(--th-muted);
  font-style: italic;
  margin-top: 8px;
  line-height: 1.4;
}
.ed-root .lead .role {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--th-accent);
  margin-bottom: 14px;
}
.ed-root .lead .standfirst {
  font-family: var(--font-playfair-display);
  font-size: 27px;
  line-height: 1.34;
  color: var(--th-ink);
  font-weight: 500;
  margin: 0 0 20px;
  text-wrap: pretty;
}
.ed-root .lead nav {
  display: flex;
  gap: 26px;
  border-top: 1px solid var(--th-border);
  padding-top: 16px;
}
.ed-root .lead nav a {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--th-ink);
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s;
}
.ed-root .lead nav a:hover {
  color: var(--th-accent);
}
.ed-root .lead nav a .n {
  color: var(--th-accent);
  font-family: var(--font-playfair-display);
  font-style: italic;
  font-weight: 500;
  margin-right: 5px;
  text-transform: none;
}

/* body columns */
.ed-root #about,
.ed-root #experiences {
  scroll-margin-top: 80px;
}
.ed-root .sectlabel {
  font-family: var(--font-playfair-display);
  font-style: italic;
  font-size: 21px;
  color: var(--th-accent);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.ed-root .sectlabel::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--th-border);
}
.ed-root .about {
  columns: 2;
  column-gap: 48px;
  margin-bottom: 60px;
}
.ed-root .about p {
  margin: 0 0 14px;
  color: var(--th-body);
  font-size: 15px;
  line-height: 1.72;
  break-inside: avoid;
}
.ed-root .about p:first-child::first-letter {
  font-family: var(--font-playfair-display);
  font-size: 62px;
  line-height: 0.8;
  float: left;
  padding: 6px 10px 0 0;
  color: var(--th-accent);
  font-weight: 700;
}
.ed-root .about b {
  color: var(--th-ink);
  font-weight: 600;
}

/* experience entries */
.ed-root .xp {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 34px;
  padding: 26px 0;
  border-top: 1px solid var(--th-border);
}
.ed-root .xp:last-child {
  border-bottom: 1px solid var(--th-border);
}
.ed-root .xp .when {
  font-size: 12.5px;
  color: var(--th-muted);
  line-height: 1.5;
  padding-top: 6px;
  font-variant-numeric: tabular-nums;
}
.ed-root .xp .when .dur {
  display: block;
  font-family: var(--font-playfair-display);
  font-style: italic;
  color: var(--th-accent);
  font-size: 14px;
  margin-top: 3px;
}
.ed-root .xp h3 {
  font-family: var(--font-playfair-display);
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 4px;
  line-height: 1.1;
}
.ed-root .xp h3 .co {
  font-style: italic;
  color: var(--th-accent);
  text-decoration: none;
}
.ed-root .xp h3 .co:hover {
  text-decoration: underline;
}
.ed-root .xp .pos {
  font-size: 12.5px;
  color: var(--th-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 12px;
}
.ed-root .xp .desc {
  color: var(--th-body);
  font-size: 14.5px;
  line-height: 1.72;
  margin: 0 0 14px;
  max-width: 62ch;
}
.ed-root .tags {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--th-muted);
  line-height: 1.9;
}
.ed-root .tags .sep {
  color: var(--th-accent);
  margin: 0 8px;
}

@media (max-width: 760px) {
  .ed-root .sheet {
    padding: 64px 22px 70px;
  }
  .ed-root .masthead {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0 14px;
  }
  .ed-root .masthead h1 {
    font-size: 48px;
  }
  .ed-root .masthead .meta {
    text-align: left;
  }
  .ed-root .lead {
    grid-template-columns: 1fr;
    gap: 22px;
    padding: 24px 0 0;
    margin-bottom: 32px;
  }
  .ed-root .lead .avatar {
    width: 100%;
    height: 230px;
  }
  .ed-root .lead .standfirst {
    font-size: 21px;
  }
  .ed-root .lead nav {
    flex-wrap: wrap;
    gap: 16px 22px;
  }
  .ed-root .about {
    columns: 1;
    margin-bottom: 44px;
  }
  .ed-root .xp {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 22px 0;
  }
  .ed-root .xp .when {
    padding-top: 0;
  }
  .ed-root .xp h3 {
    font-size: 23px;
  }
}
</style>
