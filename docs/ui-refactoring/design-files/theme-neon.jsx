// THEME FAMILY — "Neon" (a glowing neon sign at night).
// One hero element animates: a neon-tube card that softly pulses/breathes.
// Everything else is static — neon styling without a busy, moving screen.
// Palette-driven so we can prove the look survives a color swap.
//
// Palette roles:
//   bg    — near-black base            panel — card / surface fill (slightly lifted)
//   GLOW  — primary neon (name, hero tube, headings)
//   ACC   — secondary neon (role, links, tags)
//   ink   — bright text                body — muted body text
//   line  — hairline borders
function NeonBoard({ pal }) {
  const P = window.PORTFOLIO;
  const { ns, bg, panel, GLOW, ACC, ink, body, line, nameCol, nameHalo, head } =
    pal;
  // Glow strength: 1 = full (dark mode), <1 softens blur + alpha (light mode).
  const g = pal.glow == null ? 1 : pal.glow;
  const ax = (frac) =>
    Math.round(Math.min(1, Math.max(0, frac * g)) * 255)
      .toString(16)
      .padStart(2, "0");
  const bl = (px) => +(px * g).toFixed(1);
  const css = `
  .${ns}{position:relative;width:100%;min-height:100vh;overflow:hidden;background:${bg};color:${ink};
    font-family:'Space Grotesk','Inter',sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;}
  /* static ambient glow — does NOT move */
  .${ns} .amb{position:absolute;inset:0;z-index:0;pointer-events:none;
    background:
      radial-gradient(620px 420px at 50% 4%, ${GLOW}${ax(0.12)}, transparent 70%),
      radial-gradient(520px 520px at 88% 38%, ${ACC}${ax(0.08)}, transparent 70%),
      radial-gradient(560px 560px at 8% 72%, ${GLOW}${ax(0.07)}, transparent 70%);}
  /* faint static brick/wall texture so neon reads as "on a wall at night" */
  .${ns} .amb::after{content:"";position:absolute;inset:0;opacity:.5;
    background-image:linear-gradient(${line} 1px,transparent 1px),linear-gradient(90deg,${line} 1px,transparent 1px);
    background-size:64px 64px;-webkit-mask:radial-gradient(120% 90% at 50% 30%,#000,transparent 75%);
    mask:radial-gradient(120% 90% at 50% 30%,#000,transparent 75%);}
  .${ns} .wrap{position:relative;z-index:2;max-width:1080px;margin:0 auto;padding:70px 40px 100px;}

  /* ===== HERO: the neon sign card (the only animated thing) ===== */
  .${ns} .sign{position:relative;border-radius:22px;background:
      linear-gradient(180deg, ${panel}, ${bg});
    border:2px solid ${GLOW};padding:56px 50px 50px;text-align:center;
    box-shadow:0 0 0 1px ${GLOW}${ax(0.33)}, 0 0 ${bl(22)}px ${GLOW}${ax(0.4)}, 0 0 ${bl(70)}px -10px ${GLOW}${ax(0.53)},
      inset 0 0 ${bl(26)}px -6px ${GLOW}${ax(0.4)};
    animation:${ns}-breathe 3.6s ease-in-out infinite;}
  @keyframes ${ns}-breathe{
    0%,100%{box-shadow:0 0 0 1px ${GLOW}${ax(0.27)}, 0 0 ${bl(16)}px ${GLOW}${ax(0.33)}, 0 0 ${bl(52)}px -12px ${GLOW}${ax(0.47)}, inset 0 0 ${bl(22)}px -8px ${GLOW}${ax(0.33)};}
    50%    {box-shadow:0 0 0 1px ${GLOW}${ax(0.47)}, 0 0 ${bl(30)}px ${GLOW}${ax(0.53)}, 0 0 ${bl(92)}px -8px ${GLOW}${ax(1)}, inset 0 0 ${bl(30)}px -4px ${GLOW}${ax(0.53)};}}
  @media (prefers-reduced-motion: reduce){ .${ns} .sign{animation:none;} }
  /* inner tube outline */
  .${ns} .sign::before{content:"";position:absolute;inset:9px;border:1px solid ${ACC}66;border-radius:15px;
    box-shadow:0 0 12px ${ACC}55, inset 0 0 12px ${ACC}33;pointer-events:none;}
  .${ns} .open{position:absolute;top:18px;right:22px;font-size:10px;font-weight:700;letter-spacing:.32em;
    text-transform:uppercase;color:${ACC};text-shadow:0 0 10px ${ACC};}
  .${ns} .open::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:${ACC};
    box-shadow:0 0 10px ${ACC};margin-right:8px;vertical-align:middle;}
  .${ns} .avatar{width:108px;height:108px;border-radius:50%;object-fit:cover;border:2px solid ${ACC};
    box-shadow:0 0 ${bl(22)}px ${ACC}${ax(1)}, inset 0 0 ${bl(10)}px ${ACC}${ax(0.53)};margin-bottom:22px;}
  .${ns} .name{font-size:80px;line-height:.94;font-weight:700;letter-spacing:.01em;margin:0;text-transform:uppercase;
    color:${nameCol};text-shadow:0 0 ${bl(8)}px ${nameHalo}, 0 0 ${bl(20)}px ${GLOW}, 0 0 ${bl(44)}px ${GLOW}${ax(1)}, 0 0 ${bl(78)}px ${GLOW}${ax(1)};}
  .${ns} .role{margin-top:20px;font-size:13px;font-weight:600;letter-spacing:.34em;text-transform:uppercase;color:${ACC};
    text-shadow:0 0 12px ${ACC};}
  .${ns} .tagline{margin:18px auto 0;max-width:560px;font-size:15px;color:${body};line-height:1.7;}
  .${ns} nav{margin-top:30px;display:flex;justify-content:center;gap:12px;}
  .${ns} nav a{padding:10px 22px;border:1px solid ${GLOW}99;border-radius:999px;color:${head};text-decoration:none;
    font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;transition:all .2s;
    box-shadow:0 0 12px ${GLOW}44, inset 0 0 10px ${GLOW}22;text-shadow:0 0 8px ${GLOW}88;}
  .${ns} nav a:hover{background:${GLOW};color:${bg};box-shadow:0 0 24px ${GLOW};text-shadow:none;}
  .${ns} .socials{margin-top:22px;display:flex;justify-content:center;gap:12px;}
  .${ns} .socials a{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;color:${ACC};
    border:1px solid ${ACC}66;transition:all .2s;box-shadow:0 0 12px ${ACC}33, inset 0 0 8px ${ACC}22;}
  .${ns} .socials a:hover{background:${ACC};color:${bg};box-shadow:0 0 22px ${ACC};}

  /* ===== STATIC SECTIONS ===== */
  .${ns} .ol{font-size:13px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:${GLOW};
    text-shadow:0 0 ${bl(10)}px ${GLOW}${ax(0.53)};display:flex;align-items:center;gap:16px;margin:0 0 26px;}
  .${ns} .ol::before{content:"";width:9px;height:9px;border-radius:50%;background:${GLOW};box-shadow:0 0 12px ${GLOW};}
  .${ns} .ol::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,${GLOW}88,transparent);}
  .${ns} .about{max-width:760px;margin:62px auto 80px;}
  .${ns} .about p{margin:0 0 15px;color:${body};font-size:16.5px;line-height:1.75;}
  .${ns} .about b{color:${head};font-weight:600;text-shadow:0 0 10px ${ACC}66;}
  .${ns} .xp{position:relative;background:${panel};border:1px solid ${line};border-left:2px solid ${GLOW}88;
    border-radius:12px;padding:24px 26px;margin-bottom:18px;transition:border-color .2s, box-shadow .2s;}
  .${ns} .xp:hover{border-color:${ACC}88;border-left-color:${ACC};box-shadow:0 0 24px -8px ${ACC};}
  .${ns} .xp .when{font-size:12px;color:${ACC};letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;display:flex;gap:12px;}
  .${ns} .xp .when .dur{color:${body};}
  .${ns} .xp h3{font-size:24px;font-weight:700;margin:0 0 3px;color:${head};letter-spacing:-.01em;}
  .${ns} .xp h3 .co{color:${GLOW};text-shadow:0 0 12px ${GLOW}66;}
  .${ns} .xp .pos{font-size:12.5px;color:${body};letter-spacing:.04em;margin:0 0 11px;text-transform:uppercase;}
  .${ns} .xp .desc{color:${body};font-size:14.5px;line-height:1.7;margin:0 0 14px;}
  .${ns} .tags{display:flex;flex-wrap:wrap;gap:8px;}
  .${ns} .tag{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:5px 11px;border-radius:6px;
    background:${ACC}12;border:1px solid ${ACC}44;color:${ACC};}

  @media (max-width:760px){
    .${ns} .wrap{padding:66px 18px 70px;}
    .${ns} .sign{padding:34px 22px 30px;border-radius:18px;}
    .${ns} .sign::before{inset:7px;}
    .${ns} .open{top:13px;right:14px;font-size:8.5px;letter-spacing:.22em;}
    .${ns} .avatar{width:84px;height:84px;margin-bottom:16px;}
    .${ns} .name{font-size:46px;line-height:.96;}
    .${ns} .role{font-size:11px;letter-spacing:.22em;margin-top:14px;}
    .${ns} .tagline{font-size:14px;margin-top:14px;}
    .${ns} nav{margin-top:22px;flex-wrap:wrap;gap:8px;}
    .${ns} nav a{padding:9px 16px;font-size:11px;letter-spacing:.1em;}
    .${ns} .about{margin:44px auto 56px;}
    .${ns} .about p{font-size:15.5px;}
    .${ns} .xp{padding:20px 18px;}
    .${ns} .xp h3{font-size:21px;}
  }
  `;
  return (
    <div className={ns}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="amb" />
      <div className="wrap">
        <header className="sign">
          <span className="open">Open to work</span>
          <img className="avatar" src={P.photo} alt={P.name} />
          <h1 className="name">
            Sévrain
            <br />
            Chea
          </h1>
          <div className="role">Tech Lead · Full-Stack Engineer</div>
          <p className="tagline">{P.tagline}</p>
          <nav>
            {P.nav.map((n) => (
              <a key={n} href="#">
                {n}
              </a>
            ))}
          </nav>
          <div className="socials">
            {P.socials.map((s) => (
              <a key={s} href="#" title={s}>
                {window.IconFor(s)}
              </a>
            ))}
          </div>
        </header>
        <div className="about">
          <div className="ol">About</div>
          {P.about.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
        <div className="ol">Experience</div>
        {P.experiences.map((x, i) => (
          <div className="xp" key={i}>
            <div className="when">
              <span>{x.dates}</span>
              <span className="dur">{x.duration}</span>
            </div>
            <h3>
              {x.title} <span className="co">@ {x.company}</span>
            </h3>
            <div className="pos">
              {x.contract}
              {x.positions.length ? " · " + x.positions.join(" · ") : ""}
            </div>
            <p className="desc">{x.description}</p>
            <div className="tags">
              {x.stack.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// VARIANT A — "Hotline": hot-pink primary, teal secondary on deep purple-black.
const NEON_HOTLINE = {
  ns: "neon-hot",
  bg: "#0d0518",
  panel: "#190a2b",
  GLOW: "#ff2e88",
  ACC: "#2de2e6",
  ink: "#f5e9ff",
  body: "#c2add9",
  line: "rgba(255,255,255,.07)",
  nameCol: "#ffffff",
  nameHalo: "#ffffff",
  head: "#ffffff",
};
// VARIANT B — "Acid": toxic lime primary, electric-blue secondary on near-black green.
const NEON_ACID = {
  ns: "neon-acid",
  bg: "#06110b",
  panel: "#0c2017",
  GLOW: "#b6ff3c",
  ACC: "#2f9bff",
  ink: "#eafff0",
  body: "#a8c9b6",
  line: "rgba(255,255,255,.06)",
  nameCol: "#ffffff",
  nameHalo: "#ffffff",
  head: "#ffffff",
};
// VARIANT C — "Electric": electric-blue primary, vivid violet secondary on deep navy-black.
const NEON_ELECTRIC = {
  ns: "neon-elec",
  bg: "#04081c",
  panel: "#0a1338",
  GLOW: "#2e9bff",
  ACC: "#b14bff",
  ink: "#eaf2ff",
  body: "#9fb4d8",
  line: "rgba(255,255,255,.07)",
  nameCol: "#ffffff",
  nameHalo: "#ffffff",
  head: "#ffffff",
};
// LIGHT MODE — "neon sign in daylight": the sign sits on a softly tinted wall
// (never pure white) and the tube/name glow is dialled back so it reads calm,
// not blinding. Background saturation + glow are tweakable (see applyTweak).
const NEON_HOTLINE_LIGHT = {
  ns: "neon-hot-l",
  bg: "#f5eef5",
  panel: "#fbf6fb",
  GLOW: "#e0247a",
  ACC: "#0aa1a6",
  ink: "#2a1f33",
  body: "#6a5d76",
  line: "rgba(40,20,60,.07)",
  nameCol: "#e0247a",
  nameHalo: "#f7a7c8",
  head: "#2a1f33",
  glow: 0.55,
};
const NEON_ACID_LIGHT = {
  ns: "neon-acid-l",
  bg: "#eff5ec",
  panel: "#f9fcf6",
  GLOW: "#4fa514",
  ACC: "#1f78d6",
  ink: "#1b271e",
  body: "#5a6b5f",
  line: "rgba(20,40,25,.07)",
  nameCol: "#4fa514",
  nameHalo: "#bfe39a",
  head: "#1b271e",
  glow: 0.55,
};
const NEON_ELECTRIC_LIGHT = {
  ns: "neon-elec-l",
  bg: "#edf1fb",
  panel: "#f7f9fe",
  GLOW: "#1f5fe0",
  ACC: "#8b2fdc",
  ink: "#1a2138",
  body: "#5a667f",
  line: "rgba(20,30,60,.07)",
  nameCol: "#1f5fe0",
  nameHalo: "#a9c4f7",
  head: "#1a2138",
  glow: 0.55,
};

// Background saturation presets for Neon light mode (tweakable, never #fff).
const NEON_LIGHT_SAT = {
  hotline: {
    soft: { bg: "#f5eef5", panel: "#fbf6fb" },
    tinted: { bg: "#f0e4ef", panel: "#f8edf5" },
    saturated: { bg: "#efd6e8", panel: "#f9e4f1" },
  },
  acid: {
    soft: { bg: "#eff5ec", panel: "#f9fcf6" },
    tinted: { bg: "#e6f0e1", panel: "#f0f8ec" },
    saturated: { bg: "#daeecf", panel: "#eaf7e0" },
  },
  electric: {
    soft: { bg: "#edf1fb", panel: "#f7f9fe" },
    tinted: { bg: "#e2e9f8", panel: "#eef3fc" },
    saturated: { bg: "#d2def5", panel: "#e6eefb" },
  },
};

function DirNeon() {
  return <NeonBoard pal={NEON_HOTLINE} />;
}
function DirNeonAcid() {
  return <NeonBoard pal={NEON_ACID} />;
}
function DirNeonElectric() {
  return <NeonBoard pal={NEON_ELECTRIC} />;
}
function DirNeonLight() {
  return <NeonBoard pal={NEON_HOTLINE_LIGHT} />;
}
function DirNeonAcidLight() {
  return <NeonBoard pal={NEON_ACID_LIGHT} />;
}
window.DirNeon = DirNeon;
window.DirNeonAcid = DirNeonAcid;
window.DirNeonLight = DirNeonLight;
window.DirNeonAcidLight = DirNeonAcidLight;
window.DirNeonElectric = DirNeonElectric;

// Registry for the live portfolio's theme switcher. Each variant carries a
// dark + light palette; the host picks one based on the family's mode.
window.NEON_THEME = {
  id: "neon",
  name: "Neon",
  Board: NeonBoard,
  defaultMode: "dark",
  swatchKeys: ["GLOW", "ACC"],
  variants: [
    {
      id: "hotline",
      name: "Hotline",
      swatch: ["#ff2e88", "#2de2e6"],
      accent: { dark: "#ff2e88", light: "#e0247a" },
      dark: NEON_HOTLINE,
      light: NEON_HOTLINE_LIGHT,
    },
    {
      id: "acid",
      name: "Acid",
      swatch: ["#b6ff3c", "#2f9bff"],
      accent: { dark: "#b6ff3c", light: "#57b015" },
      dark: NEON_ACID,
      light: NEON_ACID_LIGHT,
    },
    {
      id: "electric",
      name: "Electric",
      swatch: ["#2e9bff", "#b14bff"],
      accent: { dark: "#2e9bff", light: "#1f5fe0" },
      dark: NEON_ELECTRIC,
      light: NEON_ELECTRIC_LIGHT,
    },
  ],
  // Tweak defaults the host merges into its panel state.
  tweakDefaults: { neonSat: "soft", neonGlow: 0.55 },
  // Build the palette for a variant+mode, applying live tweaks (light only).
  applyTweak(variantId, mode, tw) {
    const v = this.variants.find((x) => x.id === variantId) || this.variants[0];
    const base = v[mode];
    if (mode !== "light") return base;
    const sat = (tw && tw.neonSat) || "soft";
    const preset = (NEON_LIGHT_SAT[variantId] || {})[sat] || {};
    const glow = tw && typeof tw.neonGlow === "number" ? tw.neonGlow : 0.55;
    return { ...base, ...preset, glow };
  },
};
