<template>
  <div class="neon-root">
    <ThemeSwitcher />

    <!-- Static ambient glow + faint wall grid (nothing here moves). -->
    <div class="amb" aria-hidden="true" />

    <div class="wrap">
      <header class="sign">
        <span v-if="data.availability.open" class="otw">{{
          data.availability.label
        }}</span>
        <img class="avatar" :src="data.photo" :alt="data.name" />
        <h1 class="name">{{ data.firstName }}<br />{{ data.lastName }}</h1>
        <div class="role">{{ data.role }}</div>
        <p class="tagline">{{ data.tagline }}</p>
        <nav>
          <NuxtLink
            v-for="item in data.nav"
            :key="item.href"
            :to="linkTo(item.href)"
          >
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
      </header>

      <section id="about" class="about">
        <div class="ol">About</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-for="(p, i) in data.about" :key="i" v-html="p" />
      </section>

      <section id="experiences">
        <div class="ol">Experience</div>
        <article v-for="xp in data.experiences" :key="xp.company" class="xp">
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
            <span v-for="t in xp.stack" :key="t" class="tag">{{ t }}</span>
          </div>
        </article>
      </section>
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

<!-- Not scoped: namespaced under .neon-root; v-html About paragraphs need real
     selectors. Glow uses color-mix on --th-glow/--th-acc. The hero "breathes";
     in light mode the glow is dialed back (the prototype's 0.55 scalar,
     precomputed into the html:not(.dark) overrides) so it isn't blinding. -->
<style>
.neon-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: var(--th-bg);
  color: var(--th-ink);
  font-family: var(--font-space-grotesk);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ── static ambient glow (does NOT move) ── */
.neon-root .amb {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(
      620px 420px at 50% 4%,
      color-mix(in srgb, var(--th-glow) 12%, transparent),
      transparent 70%
    ),
    radial-gradient(
      520px 520px at 88% 38%,
      color-mix(in srgb, var(--th-acc) 8%, transparent),
      transparent 70%
    ),
    radial-gradient(
      560px 560px at 8% 72%,
      color-mix(in srgb, var(--th-glow) 7%, transparent),
      transparent 70%
    );
}
html:not(.dark) .neon-root .amb {
  background:
    radial-gradient(
      620px 420px at 50% 4%,
      color-mix(in srgb, var(--th-glow) 7%, transparent),
      transparent 70%
    ),
    radial-gradient(
      520px 520px at 88% 38%,
      color-mix(in srgb, var(--th-acc) 5%, transparent),
      transparent 70%
    ),
    radial-gradient(
      560px 560px at 8% 72%,
      color-mix(in srgb, var(--th-glow) 4%, transparent),
      transparent 70%
    );
}
/* faint static wall grid so neon reads as "on a wall at night" */
.neon-root .amb::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image:
    linear-gradient(var(--th-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--th-line) 1px, transparent 1px);
  background-size: 64px 64px;
  -webkit-mask: radial-gradient(120% 90% at 50% 30%, #000, transparent 75%);
  mask: radial-gradient(120% 90% at 50% 30%, #000, transparent 75%);
}

.neon-root .wrap {
  position: relative;
  z-index: 2;
  max-width: 1080px;
  margin: 0 auto;
  padding: 70px 40px 100px;
}

/* ════ HERO: the neon sign card (the only animated thing) ════ */
.neon-root .sign {
  position: relative;
  border-radius: 22px;
  background: linear-gradient(180deg, var(--th-panel), var(--th-bg));
  border: 2px solid var(--th-glow);
  padding: 56px 50px 50px;
  text-align: center;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--th-glow) 33%, transparent),
    0 0 22px color-mix(in srgb, var(--th-glow) 40%, transparent),
    0 0 70px -10px color-mix(in srgb, var(--th-glow) 53%, transparent),
    inset 0 0 26px -6px color-mix(in srgb, var(--th-glow) 40%, transparent);
  animation: neon-breathe 3.6s ease-in-out infinite;
}
@keyframes neon-breathe {
  0%,
  100% {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--th-glow) 27%, transparent),
      0 0 16px color-mix(in srgb, var(--th-glow) 33%, transparent),
      0 0 52px -12px color-mix(in srgb, var(--th-glow) 47%, transparent),
      inset 0 0 22px -8px color-mix(in srgb, var(--th-glow) 33%, transparent);
  }
  50% {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--th-glow) 47%, transparent),
      0 0 30px color-mix(in srgb, var(--th-glow) 53%, transparent),
      0 0 92px -8px var(--th-glow),
      inset 0 0 30px -4px color-mix(in srgb, var(--th-glow) 53%, transparent);
  }
}
/* light mode = neon sign in daylight: glow dialed back (~0.55) */
html:not(.dark) .neon-root .sign {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--th-glow) 18%, transparent),
    0 0 12px color-mix(in srgb, var(--th-glow) 22%, transparent),
    0 0 38px -10px color-mix(in srgb, var(--th-glow) 29%, transparent),
    inset 0 0 14px -6px color-mix(in srgb, var(--th-glow) 22%, transparent);
  animation-name: neon-breathe-soft;
}
@keyframes neon-breathe-soft {
  0%,
  100% {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--th-glow) 15%, transparent),
      0 0 9px color-mix(in srgb, var(--th-glow) 18%, transparent),
      0 0 29px -12px color-mix(in srgb, var(--th-glow) 26%, transparent),
      inset 0 0 12px -8px color-mix(in srgb, var(--th-glow) 18%, transparent);
  }
  50% {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--th-glow) 26%, transparent),
      0 0 16px color-mix(in srgb, var(--th-glow) 29%, transparent),
      0 0 51px -8px color-mix(in srgb, var(--th-glow) 55%, transparent),
      inset 0 0 16px -4px color-mix(in srgb, var(--th-glow) 29%, transparent);
  }
}
@media (prefers-reduced-motion: reduce) {
  .neon-root .sign {
    animation: none;
  }
}
/* inner tube outline */
.neon-root .sign::before {
  content: "";
  position: absolute;
  inset: 9px;
  border: 1px solid color-mix(in srgb, var(--th-acc) 40%, transparent);
  border-radius: 15px;
  box-shadow:
    0 0 12px color-mix(in srgb, var(--th-acc) 33%, transparent),
    inset 0 0 12px color-mix(in srgb, var(--th-acc) 20%, transparent);
  pointer-events: none;
}
.neon-root .otw {
  position: absolute;
  top: 18px;
  right: 22px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--th-acc);
  text-shadow: 0 0 10px var(--th-acc);
}
.neon-root .otw::before {
  content: "";
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--th-acc);
  box-shadow: 0 0 10px var(--th-acc);
  margin-right: 8px;
  vertical-align: middle;
}
.neon-root .avatar {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--th-acc);
  box-shadow:
    0 0 22px var(--th-acc),
    inset 0 0 10px color-mix(in srgb, var(--th-acc) 53%, transparent);
  margin-bottom: 22px;
}
html:not(.dark) .neon-root .avatar {
  box-shadow:
    0 0 12px color-mix(in srgb, var(--th-acc) 55%, transparent),
    inset 0 0 6px color-mix(in srgb, var(--th-acc) 29%, transparent);
}
.neon-root .name {
  font-size: 80px;
  line-height: 0.94;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin: 0;
  text-transform: uppercase;
  color: var(--th-name-col);
  text-shadow:
    0 0 8px var(--th-name-halo),
    0 0 20px var(--th-glow),
    0 0 44px var(--th-glow),
    0 0 78px var(--th-glow);
}
html:not(.dark) .neon-root .name {
  text-shadow:
    0 0 4px var(--th-name-halo),
    0 0 11px var(--th-glow),
    0 0 24px color-mix(in srgb, var(--th-glow) 55%, transparent),
    0 0 43px color-mix(in srgb, var(--th-glow) 55%, transparent);
}
.neon-root .role {
  margin-top: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--th-acc);
  text-shadow: 0 0 12px var(--th-acc);
}
.neon-root .tagline {
  margin: 18px auto 0;
  max-width: 560px;
  font-size: 15px;
  color: var(--th-body);
  line-height: 1.7;
}
.neon-root nav {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.neon-root nav a {
  padding: 10px 22px;
  border: 1px solid color-mix(in srgb, var(--th-glow) 60%, transparent);
  border-radius: 999px;
  color: var(--th-head);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.2s;
  box-shadow:
    0 0 12px color-mix(in srgb, var(--th-glow) 27%, transparent),
    inset 0 0 10px color-mix(in srgb, var(--th-glow) 13%, transparent);
  text-shadow: 0 0 8px color-mix(in srgb, var(--th-glow) 53%, transparent);
}
.neon-root nav a:hover {
  background: var(--th-glow);
  color: var(--th-bg);
  box-shadow: 0 0 24px var(--th-glow);
  text-shadow: none;
}
.neon-root .socials {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.neon-root .socials a {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: var(--th-acc);
  border: 1px solid color-mix(in srgb, var(--th-acc) 40%, transparent);
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.2s;
  box-shadow:
    0 0 12px color-mix(in srgb, var(--th-acc) 20%, transparent),
    inset 0 0 8px color-mix(in srgb, var(--th-acc) 13%, transparent);
}
.neon-root .socials a:hover {
  background: var(--th-acc);
  color: var(--th-bg);
  box-shadow: 0 0 22px var(--th-acc);
}

/* ════ STATIC SECTIONS ════ */
.neon-root #about,
.neon-root #experiences {
  scroll-margin-top: 80px;
}
.neon-root .ol {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--th-glow);
  text-shadow: 0 0 10px color-mix(in srgb, var(--th-glow) 53%, transparent);
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 26px;
}
html:not(.dark) .neon-root .ol {
  text-shadow: 0 0 6px color-mix(in srgb, var(--th-glow) 29%, transparent);
}
.neon-root .ol::before {
  content: "";
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--th-glow);
  box-shadow: 0 0 12px var(--th-glow);
}
.neon-root .ol::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--th-glow) 53%, transparent),
    transparent
  );
}
.neon-root .about {
  max-width: 760px;
  margin: 62px auto 80px;
}
.neon-root .about p {
  margin: 0 0 15px;
  color: var(--th-body);
  font-size: 16.5px;
  line-height: 1.75;
}
.neon-root .about b {
  color: var(--th-head);
  font-weight: 600;
  text-shadow: 0 0 10px color-mix(in srgb, var(--th-acc) 40%, transparent);
}
.neon-root .xp {
  position: relative;
  background: var(--th-panel);
  border: 1px solid var(--th-line);
  border-left: 2px solid color-mix(in srgb, var(--th-glow) 53%, transparent);
  border-radius: 12px;
  padding: 24px 26px;
  margin-bottom: 18px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.neon-root .xp:hover {
  border-color: color-mix(in srgb, var(--th-acc) 53%, transparent);
  border-left-color: var(--th-acc);
  box-shadow: 0 0 24px -8px var(--th-acc);
}
.neon-root .xp .when {
  font-size: 12px;
  color: var(--th-acc);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  gap: 12px;
}
.neon-root .xp .when .dur {
  color: var(--th-body);
}
.neon-root .xp h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 3px;
  color: var(--th-head);
  letter-spacing: -0.01em;
}
.neon-root .xp h3 .co {
  color: var(--th-glow);
  text-shadow: 0 0 12px color-mix(in srgb, var(--th-glow) 40%, transparent);
}
.neon-root .xp h3 .ext {
  font-size: 14px;
  color: var(--th-acc);
  opacity: 0.7;
  text-decoration: none;
  transition: opacity 0.2s;
}
.neon-root .xp h3 .ext:hover {
  opacity: 1;
}
.neon-root .xp .pos {
  font-size: 12.5px;
  color: var(--th-body);
  letter-spacing: 0.04em;
  margin: 0 0 11px;
  text-transform: uppercase;
}
.neon-root .xp .desc {
  color: var(--th-body);
  font-size: 14.5px;
  line-height: 1.7;
  margin: 0 0 14px;
}
.neon-root .xp .links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 0 0 14px;
}
.neon-root .xp .links a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--th-acc);
  text-decoration: none;
  transition: opacity 0.2s;
}
.neon-root .xp .links a:hover {
  opacity: 0.75;
}
.neon-root .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.neon-root .tag {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--th-acc) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--th-acc) 27%, transparent);
  color: var(--th-acc);
}

@media (max-width: 760px) {
  .neon-root .wrap {
    padding: 66px 18px 70px;
  }
  .neon-root .sign {
    padding: 34px 22px 30px;
    border-radius: 18px;
  }
  .neon-root .sign::before {
    inset: 7px;
  }
  .neon-root .otw {
    top: 13px;
    right: 14px;
    font-size: 8.5px;
    letter-spacing: 0.22em;
  }
  .neon-root .avatar {
    width: 84px;
    height: 84px;
    margin-bottom: 16px;
  }
  .neon-root .name {
    font-size: 46px;
    line-height: 0.96;
  }
  .neon-root .role {
    font-size: 11px;
    letter-spacing: 0.22em;
    margin-top: 14px;
  }
  .neon-root .tagline {
    font-size: 14px;
    margin-top: 14px;
  }
  .neon-root nav {
    margin-top: 22px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .neon-root nav a {
    padding: 9px 16px;
    font-size: 11px;
    letter-spacing: 0.1em;
  }
  .neon-root .about {
    margin: 44px auto 56px;
  }
  .neon-root .about p {
    font-size: 15.5px;
  }
  .neon-root .xp {
    padding: 20px 18px;
  }
  .neon-root .xp h3 {
    font-size: 21px;
  }
}
</style>
