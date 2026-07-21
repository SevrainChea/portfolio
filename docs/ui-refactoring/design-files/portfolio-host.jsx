/* ════════════════════════════════════════════════════════════════════
   PortfolioHost — the live portfolio shell.
   One unified switcher drives FOUR theme families:
     • Aurora    — tokenized layout, 4 color worlds + light/dark
     • Neon      — neon-sign card, 2 palettes
     • Editorial — literary issue, 3 palettes
     • Blueprint — spec sheet, 3 palettes
   Each family renders its own full-page body; the switcher chrome adapts
   (dark/light glass + accent) to whatever is on screen.
   ════════════════════════════════════════════════════════════════════ */

const HOST_CSS = `
.ph-switch{position:fixed;top:22px;right:24px;z-index:60;display:flex;align-items:center;gap:14px;
  padding:9px 9px 9px 16px;border-radius:999px;font-family:'Inter',system-ui,sans-serif;
  box-shadow:0 10px 34px -16px rgba(0,0,0,.7);transition:background .45s ease,border-color .45s ease,color .45s ease;}
.ph-switch[data-chrome="dark"]{background:rgba(13,15,21,.9);border:1px solid rgba(255,255,255,.16);color:#fff;}
.ph-switch[data-chrome="light"]{background:rgba(252,251,248,.93);border:1px solid rgba(20,20,30,.12);color:#171310;}

.ph-switch .fam{position:relative;display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;}
.ph-switch .fam .lbl{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.5;}
.ph-switch .fam .val{font-family:'Playfair Display',serif;font-size:15px;display:flex;align-items:center;gap:6px;}
.ph-switch .fam .val .chev{font-family:Inter;font-size:9px;opacity:.55;transition:transform .2s;}
.ph-switch .fam.open .val .chev{transform:rotate(180deg);}

.ph-switch .sep{width:1px;height:22px;}
.ph-switch[data-chrome="dark"] .sep{background:rgba(255,255,255,.18);}
.ph-switch[data-chrome="light"] .sep{background:rgba(20,20,30,.14);}

.ph-switch .swatches{display:flex;align-items:center;gap:7px;}
.ph-switch .sw{position:relative;width:26px;height:26px;border-radius:50%;cursor:pointer;padding:0;border:none;
  background:transparent;display:grid;place-items:center;}
.ph-switch .sw .dot{width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(255,255,255,.3);
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.22);transition:transform .2s;}
.ph-switch .sw:hover .dot{transform:scale(1.14);}
.ph-switch .sw.active{box-shadow:0 0 0 2px var(--acc);border-radius:50%;}
.ph-switch .sw .tip{position:absolute;top:34px;left:50%;transform:translateX(-50%) translateY(4px);white-space:nowrap;
  font-size:11px;font-weight:600;padding:4px 9px;border-radius:7px;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;}
.ph-switch[data-chrome="dark"] .sw .tip{color:#fff;background:rgba(8,9,13,.92);border:1px solid rgba(255,255,255,.14);}
.ph-switch[data-chrome="light"] .sw .tip{color:#171310;background:rgba(255,255,255,.96);border:1px solid rgba(20,20,30,.12);box-shadow:0 6px 18px -8px rgba(0,0,0,.4);}
.ph-switch .sw:hover .tip{opacity:1;transform:translateX(-50%) translateY(0);}

.ph-switch .mode{position:relative;width:34px;height:34px;border-radius:50%;cursor:pointer;display:grid;place-items:center;padding:0;
  background:transparent;transition:all .25s;}
.ph-switch[data-chrome="dark"] .mode{border:1px solid rgba(255,255,255,.2);color:#fff;}
.ph-switch[data-chrome="light"] .mode{border:1px solid rgba(20,20,30,.18);color:#171310;}
.ph-switch .mode:hover{border-color:var(--acc);color:var(--acc);}
.ph-switch .mode svg{width:17px;height:17px;}

/* row wrapper is transparent on desktop (controls stay in the pill); nav row hidden */
.ph-row{display:contents;}
.ph-nav{display:none;}

/* ── mobile scroll-merge mini (avatar + name); hidden on desktop ── */
.ph-switch .mini{display:none;align-items:center;gap:9px;min-width:0;}
.ph-switch .mini img{width:30px;height:30px;border-radius:50%;object-fit:cover;flex:0 0 auto;
  border:1px solid currentColor;opacity:.95;}
.ph-switch .mini .nm{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;}

.ph-menu{position:absolute;top:40px;left:-4px;min-width:190px;padding:6px;border-radius:13px;display:flex;flex-direction:column;gap:2px;
  z-index:70;opacity:1;}
.ph-switch[data-chrome="dark"] .ph-menu{background:rgba(15,17,23,.97);border:1px solid rgba(255,255,255,.13);box-shadow:0 18px 44px -14px rgba(0,0,0,.8);}
.ph-switch[data-chrome="light"] .ph-menu{background:rgba(255,255,255,.98);border:1px solid rgba(20,20,30,.1);box-shadow:0 18px 44px -14px rgba(0,0,0,.32);}
.ph-menu button{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;cursor:pointer;
  font-size:13.5px;width:100%;transition:background .15s;}
.ph-switch[data-chrome="dark"] .ph-menu button:hover{background:rgba(255,255,255,.07);}
.ph-switch[data-chrome="light"] .ph-menu button:hover{background:rgba(20,20,30,.05);}
.ph-menu button .mini{width:18px;height:18px;border-radius:50%;flex-shrink:0;border:1.5px solid rgba(128,128,128,.3);}
.ph-menu button .mname{font-family:'Playfair Display',serif;font-size:14.5px;}
.ph-menu button .msub{margin-left:auto;font-size:10px;opacity:.5;letter-spacing:.04em;}
.ph-menu button .ck{margin-left:auto;color:var(--acc);font-size:12px;}

/* ════════ MOBILE: switcher becomes a full-width sticky header ════════ */
/* Driven by the JS .is-mobile class (per-theme breakpoint) so the header
   flips to mobile at the SAME width its theme layout collapses. */
.ph-switch.is-mobile{top:0;left:0;right:0;width:100%;box-sizing:border-box;border-radius:0;border-width:0 0 1px;
  flex-direction:column;align-items:stretch;gap:0;padding:0;
  box-shadow:0 6px 22px -14px rgba(0,0,0,.7);}
.ph-switch.is-mobile .ph-row{display:flex;align-items:center;justify-content:center;gap:13px;width:100%;box-sizing:border-box;padding:10px 14px;position:relative;}
.ph-switch.is-mobile .fam{flex:0 0 auto;min-width:0;}
.ph-switch.is-mobile .fam .lbl{display:none;}
.ph-switch.is-mobile .fam .val{font-size:15px;}
.ph-switch.is-mobile .swatches{gap:7px;}
.ph-switch.is-mobile .sw{width:25px;height:25px;}
.ph-switch.is-mobile .sw .dot{width:19px;height:19px;}
.ph-switch.is-mobile .sw .tip{display:none;}
.ph-switch.is-mobile .mode{width:33px;height:33px;}
.ph-switch.is-mobile .ph-menu{top:46px;left:0;}
/* scroll-merge: nav row (avatar + name + links) slides in; theme selector stays put */
.ph-switch.is-mobile .ph-nav{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;overflow:hidden;
  max-height:0;opacity:0;padding:0 12px;transition:max-height .3s ease,opacity .26s ease,padding .3s ease;}
.ph-switch.is-mobile.cond .ph-nav{max-height:56px;opacity:1;padding:8px 12px;border-top:1px solid;}
.ph-switch.is-mobile[data-chrome="dark"].cond .ph-nav{border-top-color:rgba(255,255,255,.12);}
.ph-switch.is-mobile[data-chrome="light"].cond .ph-nav{border-top-color:rgba(20,20,30,.1);}
.ph-switch.is-mobile .ph-nav .mini{display:flex;flex:0 0 auto;}
.ph-switch.is-mobile .ph-nav .mini img{width:28px;height:28px;}
.ph-switch.is-mobile .ph-nav .mini .nm{max-width:92px;}
.ph-switch.is-mobile .ph-nav a{flex:1;text-align:center;font-size:12.5px;font-weight:600;letter-spacing:.01em;text-decoration:none;
  color:inherit;padding:8px 6px;border-radius:8px;transition:background .15s;}
.ph-switch.is-mobile[data-chrome="dark"] .ph-nav a{background:rgba(255,255,255,.06);}
.ph-switch.is-mobile[data-chrome="light"] .ph-nav a{background:rgba(20,20,30,.05);}
`;

function lsGet(k, d) {
  try {
    return localStorage.getItem(k) || d;
  } catch (e) {
    return d;
  }
}
function lsSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
}

function PortfolioHost() {
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider } =
    window;
  const AURORA = window.AURORA_THEME;
  const families = [
    {
      id: "aurora",
      name: "Aurora",
      sub: "Frameless",
      kind: "aurora",
      bp: 880,
      swatch: AURORA.variants[0].swatch,
    },
    {
      id: "neon",
      name: window.NEON_THEME.name,
      sub: "Neon sign",
      kind: "board",
      bp: 760,
      reg: window.NEON_THEME,
      swatch: window.NEON_THEME.variants[0].swatch,
    },
    {
      id: "editorial",
      name: window.EDITORIAL_THEME.name,
      sub: "The issue",
      kind: "board",
      bp: 760,
      reg: window.EDITORIAL_THEME,
      swatch: window.EDITORIAL_THEME.variants[0].swatch,
    },
    {
      id: "blueprint",
      name: window.BLUEPRINT_THEME.name,
      sub: "Spec sheet",
      kind: "board",
      bp: 760,
      reg: window.BLUEPRINT_THEME,
      swatch: window.BLUEPRINT_THEME.variants[0].swatch,
    },
  ];

  const [family, setFamily] = React.useState(() =>
    lsGet("pf-family", "aurora"),
  );
  const [variants, setVariants] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pf-variants")) || {};
    } catch (e) {
      return {};
    }
  });
  const [modes, setModes] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pf-modes")) || {};
    } catch (e) {
      return {};
    }
  });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [condensed, setCondensed] = React.useState(false);
  const [winW, setWinW] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const P = window.PORTFOLIO;
  const [tw, setTweak] = useTweaks({ neonSat: "soft", neonGlow: 0.55 });

  React.useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 96);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return;
    const h = () => setMenuOpen(false);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [menuOpen]);

  const fam = families.find((f) => f.id === family) || families[0];
  const isMobile = winW <= (fam.bp || 760);
  const defVar = (f) =>
    f.kind === "aurora" ? AURORA.variants[0].id : f.reg.variants[0].id;
  const variantId = variants[family] || defVar(fam);
  const defMode = (f) =>
    f.kind === "aurora" ? "dark" : f.reg.defaultMode || "dark";
  const mode = modes[family] || defMode(fam);

  const pickFamily = (id) => {
    setFamily(id);
    lsSet("pf-family", id);
    setMenuOpen(false);
  };
  const pickVariant = (id) => {
    const nv = { ...variants, [family]: id };
    setVariants(nv);
    lsSet("pf-variants", JSON.stringify(nv));
  };
  const toggleMode = () => {
    const next = mode === "dark" ? "light" : "dark";
    const nm = { ...modes, [family]: next };
    setModes(nm);
    lsSet("pf-modes", JSON.stringify(nm));
  };

  // Derive switcher chrome / accent / swatches + the body to render.
  let chrome, accent, swatchList, body;
  if (fam.kind === "aurora") {
    const v =
      AURORA.variants.find((x) => x.id === variantId) || AURORA.variants[0];
    chrome = mode;
    accent = (v[mode] || v.dark)["--accent"];
    swatchList = AURORA.variants.map((x) => {
      const p = x[mode] || x.dark;
      return { id: x.id, name: x.name, swatch: [p["--blob-1"], p["--accent"]] };
    });
    body = <window.AuroraBody variantId={variantId} mode={mode} />;
  } else {
    const v =
      fam.reg.variants.find((x) => x.id === variantId) || fam.reg.variants[0];
    chrome = mode;
    accent = v.accent[mode];
    const sk = fam.reg.swatchKeys;
    swatchList = fam.reg.variants.map((x) => {
      const p = x[mode] || x.dark || x.light;
      return {
        id: x.id,
        name: x.name,
        swatch: sk ? [p[sk[0]], p[sk[1]]] : x.swatch,
      };
    });
    const Board = fam.reg.Board;
    const pal = fam.reg.applyTweak
      ? fam.reg.applyTweak(variantId, mode, tw)
      : v[mode];
    body = <Board pal={pal} />;
  }

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{ __html: HOST_CSS }} />
      {body}
      <div
        className={
          "ph-switch" +
          (isMobile ? " is-mobile" : "") +
          (condensed ? " cond" : "")
        }
        data-chrome={chrome}
        style={{ "--acc": accent }}
      >
        <div className="ph-row">
          <div
            className={"fam" + (menuOpen ? " open" : "")}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
          >
            <span className="lbl">Theme</span>
            <span className="val">
              {fam.name}
              <span className="chev">▾</span>
            </span>
            {menuOpen && (
              <div className="ph-menu" onClick={(e) => e.stopPropagation()}>
                {families.map((f) => (
                  <button key={f.id} onClick={() => pickFamily(f.id)}>
                    <span
                      className="mini"
                      style={{
                        background: `linear-gradient(135deg, ${f.swatch[0]} 45%, ${f.swatch[1]} 45%)`,
                      }}
                    />
                    <span className="mname">{f.name}</span>
                    {f.id === family ? (
                      <span className="ck">✓</span>
                    ) : (
                      <span className="msub">{f.sub}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sep" />
          <div className="swatches">
            {swatchList.map((s) => (
              <button
                key={s.id}
                className={"sw" + (s.id === variantId ? " active" : "")}
                onClick={() => pickVariant(s.id)}
                aria-label={s.name}
              >
                <span
                  className="dot"
                  style={{
                    background: `linear-gradient(135deg, ${s.swatch[0]} 45%, ${s.swatch[1]} 45%)`,
                  }}
                />
                <span className="tip">{s.name}</span>
              </button>
            ))}
          </div>
          <div className="sep" />
          <button
            className="mode"
            onClick={toggleMode}
            aria-label={mode === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {mode === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </div>
        <nav className="ph-nav">
          <div className="mini">
            <img src={P.photo} alt={P.name} style={{ borderColor: accent }} />
            <span className="nm">Sévrain Chea</span>
          </div>
          {P.nav.map((n, i) => (
            <a
              key={n}
              href="#"
              className={i === 0 ? "active" : ""}
              style={i === 0 ? { color: accent } : null}
            >
              {n}
            </a>
          ))}
        </nav>
      </div>
      <TweaksPanel>
        <TweakSection label="Neon — light mode" />
        <TweakRadio
          label="Background"
          value={tw.neonSat}
          options={["soft", "tinted", "saturated"]}
          onChange={(v) => setTweak("neonSat", v)}
        />
        <TweakSlider
          label="Glow"
          value={tw.neonGlow}
          min={0.2}
          max={1}
          step={0.05}
          onChange={(v) => setTweak("neonGlow", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}
window.PortfolioHost = PortfolioHost;
