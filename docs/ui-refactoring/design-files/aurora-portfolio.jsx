/* ════════════════════════════════════════════════════════════════════
   Aurora Portfolio — tokenized frameless layout + visitor theme switcher.
   The layout reads ONLY CSS variables; variants live in aurora-variants.js.
   ════════════════════════════════════════════════════════════════════ */

const AURORA_CSS = `
.aurora-root{position:relative;min-height:100vh;background:var(--bg);color:var(--body);
  font-family:'Inter',system-ui,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;
  transition:background .6s ease, color .6s ease;}
.aurora-root .bg-grad{position:fixed;inset:0;z-index:0;background:var(--bg-grad);transition:background .6s ease;}
.aurora-root .aurora{position:fixed;inset:0;overflow:hidden;z-index:0;}
.aurora-root .blob{position:absolute;border-radius:50%;filter:blur(110px);mix-blend-mode:var(--blob-blend);
  opacity:var(--blob-op);transition:background .6s ease, opacity .6s ease;}
.aurora-root .b1{width:680px;height:680px;left:-220px;top:-200px;background:radial-gradient(circle at 40% 40%,var(--blob-1),transparent 60%);animation:flA 38s ease-in-out infinite;}
.aurora-root .b2{width:560px;height:560px;left:120px;top:60px;background:radial-gradient(circle at 50% 50%,var(--blob-2),transparent 60%);animation:flB 46s ease-in-out infinite;opacity:calc(var(--blob-op) * .64);}
.aurora-root .b3{width:520px;height:520px;left:-120px;top:340px;background:radial-gradient(circle at 50% 50%,var(--blob-3),transparent 60%);animation:flC 50s ease-in-out infinite;opacity:calc(var(--blob-op) * .6);}
@keyframes flA{0%,100%{transform:translate(0,0)}50%{transform:translate(70px,60px)}}
@keyframes flB{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,50px)}}
@keyframes flC{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,-50px)}}
.aurora-root .grain{position:fixed;inset:0;z-index:1;opacity:var(--grain-op);pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

.aurora-root .wrap{position:relative;z-index:2;display:flex;gap:0;max-width:1180px;margin:0 auto;padding:64px 40px 80px 40px;}
.aurora-root .left{width:380px;flex-shrink:0;position:sticky;top:64px;align-self:flex-start;padding-right:60px;}
.aurora-root .avatar{width:96px;height:96px;border-radius:50%;object-fit:cover;border:1px solid var(--avatar-ring);
  box-shadow:0 0 0 4px color-mix(in srgb, var(--accent) 8%, transparent);transition:border-color .6s ease;}
.aurora-root .name{font-family:'Playfair Display',serif;font-size:52px;line-height:1.0;font-weight:600;margin:24px 0 12px;
  letter-spacing:-.015em;color:var(--name);transition:color .6s ease;}
.aurora-root .role{font-size:12.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);
  margin-bottom:20px;transition:color .6s ease;}
.aurora-root .tagline{font-family:'Playfair Display',serif;font-style:var(--tagline-style);font-size:17.5px;line-height:1.55;
  color:var(--muted);max-width:300px;transition:color .6s ease;}
.aurora-root .divrule{height:1px;background:linear-gradient(90deg,var(--border-strong),transparent);margin:30px 0;}
.aurora-root nav{display:flex;flex-direction:column;}
.aurora-root nav a{display:flex;align-items:baseline;gap:13px;padding:12px 0;color:var(--ink);text-decoration:none;font-size:15px;
  font-weight:500;border-bottom:1px solid var(--border);transition:color .22s,padding .22s,border-color .6s ease;}
.aurora-root nav a .ix{font-family:'Playfair Display',serif;font-style:italic;font-size:14px;color:var(--accent);font-weight:500;}
.aurora-root nav a:hover{color:var(--accent-soft);padding-left:6px;}
.aurora-root nav a.active{color:var(--ink);}
.aurora-root nav a.active .ix{color:var(--accent);}
.aurora-root .socials{margin-top:26px;display:flex;gap:8px;}
.aurora-root .socials a{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;
  background:var(--tag-bg);border:1px solid var(--tag-border);color:var(--muted);transition:all .25s;}
.aurora-root .socials a:hover{color:var(--bg);border-color:var(--accent);background:var(--accent);}

.aurora-root .right{flex:1;min-width:0;padding:6px 8px 0 60px;border-left:1px solid var(--border);transition:border-color .6s ease;}
.aurora-root .overline{font-size:11.5px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);
  display:flex;align-items:center;gap:14px;margin:0 0 22px;transition:color .6s ease;}
.aurora-root .overline::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--border-strong),transparent);}
.aurora-root .about p{margin:0 0 16px;color:var(--body);font-size:16.5px;line-height:1.74;max-width:60ch;}
.aurora-root .about b{color:var(--ink);font-weight:600;}
.aurora-root .section{margin-top:60px;}
.aurora-root .tl{position:relative;padding-left:28px;}
.aurora-root .tl::before{content:"";position:absolute;left:4px;top:8px;bottom:8px;width:1px;background:var(--border-strong);}
.aurora-root .xp{position:relative;padding:0 0 34px;}
.aurora-root .xp::before{content:"";position:absolute;left:-27px;top:6px;width:9px;height:9px;border-radius:50%;
  background:var(--bg);border:1.5px solid var(--accent);transition:all .25s;}
.aurora-root .xp:hover::before{background:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);}
.aurora-root .xp .when{font-size:12.5px;color:var(--muted);letter-spacing:.03em;margin-bottom:7px;display:flex;gap:10px;}
.aurora-root .xp .when .dur{font-family:'Playfair Display',serif;font-style:italic;color:var(--accent);}
.aurora-root .xp h3{font-family:'Playfair Display',serif;font-size:23px;font-weight:600;margin:0 0 3px;color:var(--name);}
.aurora-root .xp h3 .co{font-style:italic;color:var(--accent);}
.aurora-root .xp h3 .ext{font-size:13px;color:var(--accent);opacity:.7;font-family:Inter;}
.aurora-root .xp .pos{font-size:13px;color:var(--muted);margin:0 0 9px;}
.aurora-root .xp .desc{color:var(--body);font-size:15px;line-height:1.7;margin:0 0 13px;max-width:62ch;opacity:.92;}
.aurora-root .tags{display:flex;flex-wrap:wrap;gap:7px;}
.aurora-root .tag{font-size:11.5px;font-weight:500;padding:4px 11px;border-radius:6px;background:var(--tag-bg);
  border:1px solid var(--tag-border);color:var(--tag-text);}

/* ── Theme switcher ── */
.aurora-switch{position:fixed;top:22px;right:24px;z-index:50;display:flex;align-items:center;gap:14px;
  padding:9px 9px 9px 16px;border-radius:999px;
  background:color-mix(in srgb, var(--bg) 62%, transparent);backdrop-filter:blur(16px) saturate(140%);
  -webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid var(--border-strong);
  box-shadow:0 10px 34px -16px rgba(0,0,0,.7);transition:background .6s ease,border-color .6s ease;}
.aurora-switch .fam{display:flex;align-items:center;gap:8px;cursor:default;}
.aurora-switch .fam .lbl{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.aurora-switch .fam .val{font-family:'Playfair Display',serif;font-size:15px;color:var(--ink);}
.aurora-switch .fam .val .chev{font-family:Inter;font-size:10px;color:var(--muted);margin-left:4px;}
.aurora-switch .sep{width:1px;height:22px;background:var(--border-strong);}
.aurora-switch .swatches{display:flex;align-items:center;gap:7px;}
.aurora-switch .sw{position:relative;width:26px;height:26px;border-radius:50%;cursor:pointer;padding:0;border:none;
  background:transparent;display:grid;place-items:center;}
.aurora-switch .sw .dot{width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(255,255,255,.25);
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.2);transition:transform .2s;}
.aurora-switch .sw:hover .dot{transform:scale(1.12);}
.aurora-switch .sw.active{box-shadow:0 0 0 1.5px var(--bg), 0 0 0 3px var(--accent);border-radius:50%;}
.aurora-switch .sw .tip{position:absolute;top:34px;left:50%;transform:translateX(-50%) translateY(4px);
  white-space:nowrap;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--ink);
  background:color-mix(in srgb, var(--bg) 80%, #000);border:1px solid var(--border);padding:4px 9px;border-radius:7px;
  opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;}
.aurora-switch .sw:hover .tip{opacity:1;transform:translateX(-50%) translateY(0);}

/* ── Light / dark toggle ── */
.aurora-switch .mode{position:relative;width:34px;height:34px;border-radius:50%;cursor:pointer;border:1px solid var(--border-strong);
  background:var(--tag-bg);color:var(--ink);display:grid;place-items:center;transition:all .25s;padding:0;}
.aurora-switch .mode:hover{border-color:var(--accent);color:var(--accent);}
.aurora-switch .mode svg{width:17px;height:17px;}
.aurora-switch .mode .tip{position:absolute;top:42px;left:50%;transform:translateX(-50%) translateY(4px);
  white-space:nowrap;font-size:11px;font-weight:600;color:var(--ink);
  background:color-mix(in srgb, var(--bg) 80%, #000);border:1px solid var(--border);padding:4px 9px;border-radius:7px;
  opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;}
.aurora-switch .mode:hover .tip{opacity:1;transform:translateX(-50%) translateY(0);}

/* ── Theme menu (family dropdown — structure ready for more families) ── */
.aurora-switch .fam{position:relative;}
.aurora-switch .fam.has-menu{cursor:pointer;}
.aurora-menu{position:absolute;top:42px;left:0;min-width:170px;padding:6px;border-radius:12px;
  background:color-mix(in srgb, var(--bg) 86%, #000);border:1px solid var(--border-strong);
  box-shadow:0 16px 40px -14px rgba(0,0,0,.75);display:flex;flex-direction:column;gap:2px;}
.aurora-menu button{all:unset;display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:8px;cursor:pointer;
  font-size:13.5px;color:var(--body);transition:background .15s;}
.aurora-menu button:hover{background:var(--tag-bg);}
.aurora-menu button.active{color:var(--ink);}
.aurora-menu button .ck{margin-left:auto;color:var(--accent);font-size:12px;}
.aurora-menu button.soon{opacity:.42;cursor:default;}
.aurora-menu button.soon .badge{margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);border:1px solid var(--border);border-radius:5px;padding:2px 5px;}

@media (max-width:880px){
  .aurora-root .wrap{flex-direction:column;padding:88px 28px 60px;gap:0;}
  .aurora-root .left{width:auto;position:static;padding-right:0;align-self:stretch;}
  .aurora-root .right{border-left:none;border-top:1px solid var(--border);padding:36px 0 0;margin-top:36px;}
  .aurora-switch{top:14px;right:14px;}
  .aurora-switch .fam .lbl{display:none;}
}
@media (max-width:760px){
  .aurora-root .wrap{padding:72px 22px 64px;}
  .aurora-root .avatar{width:78px;height:78px;}
  .aurora-root .name{font-size:40px;margin:18px 0 10px;}
  .aurora-root .tagline{font-size:15.5px;max-width:none;}
  .aurora-root .divrule{margin:24px 0;}
  .aurora-root nav a{padding:11px 0;}
  .aurora-root .right{padding-top:30px;margin-top:30px;}
  .aurora-root .about p{font-size:16px;}
  .aurora-root .section{margin-top:44px;}
  .aurora-root .xp h3{font-size:21px;}
}
`;

function AuroraSwitcher({ variant, onPick, mode, onToggleMode }) {
  const T = window.AURORA_THEME;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const current = T.variants.find((v) => v.id === variant) || T.variants[0];
  React.useEffect(() => {
    if (!menuOpen) return;
    const h = () => setMenuOpen(false);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [menuOpen]);
  return (
    <div className="aurora-switch">
      <div
        className={"fam has-menu"}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((o) => !o);
        }}
      >
        <span className="lbl">Theme</span>
        <span className="val">
          {T.name}
          <span className="chev">▾</span>
        </span>
        {menuOpen && (
          <div className="aurora-menu" onClick={(e) => e.stopPropagation()}>
            <button className="active">
              Aurora<span className="ck">✓</span>
            </button>
            <button className="soon">
              Editorial<span className="badge">Soon</span>
            </button>
            <button className="soon">
              Console<span className="badge">Soon</span>
            </button>
          </div>
        )}
      </div>
      <div className="sep" />
      <div className="swatches">
        {T.variants.map((v) => (
          <button
            key={v.id}
            className={"sw" + (v.id === variant ? " active" : "")}
            onClick={() => onPick(v.id)}
            aria-label={v.name}
          >
            <span
              className="dot"
              style={{
                background: `linear-gradient(135deg, ${v.swatch[0]} 45%, ${v.swatch[1]} 45%)`,
              }}
            />
            <span className="tip">{v.name}</span>
          </button>
        ))}
      </div>
      <div className="sep" />
      <button
        className="mode"
        onClick={onToggleMode}
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
        <span className="tip">{mode === "dark" ? "Light" : "Dark"}</span>
      </button>
    </div>
  );
}

function AuroraPortfolio() {
  const P = window.PORTFOLIO;
  const T = window.AURORA_THEME;
  const [variant, setVariant] = React.useState(() => {
    try {
      return localStorage.getItem("aurora-variant") || "cobalt";
    } catch (e) {
      return "cobalt";
    }
  });
  const [mode, setMode] = React.useState(() => {
    try {
      return localStorage.getItem("aurora-mode") || "dark";
    } catch (e) {
      return "dark";
    }
  });
  const v = T.variants.find((x) => x.id === variant) || T.variants[0];
  const pick = (id) => {
    setVariant(id);
    try {
      localStorage.setItem("aurora-variant", id);
    } catch (e) {}
  };
  const toggleMode = () => {
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("aurora-mode", next);
      } catch (e) {}
      return next;
    });
  };
  const style = v[mode] || v.dark;
  return (
    <div className="aurora-root" style={style}>
      <style dangerouslySetInnerHTML={{ __html: AURORA_CSS }} />
      <div className="bg-grad" />
      <div className="aurora">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <div className="grain" />
      <AuroraSwitcher
        variant={variant}
        onPick={pick}
        mode={mode}
        onToggleMode={toggleMode}
      />
      <div className="wrap">
        <aside className="left">
          <img className="avatar" src={P.photo} alt={P.name} />
          <h1 className="name">
            Sévrain
            <br />
            CHEA
          </h1>
          <div className="role">Tech Lead · Full-Stack Engineer</div>
          <p className="tagline">{P.tagline}</p>
          <div className="divrule" />
          <nav>
            {P.nav.map((n, i) => (
              <a key={n} className={i === 0 ? "active" : ""} href="#">
                <span className="ix">{String(i + 1).padStart(2, "0")}</span>
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
        </aside>
        <main className="right">
          <div className="overline">About</div>
          <div className="about">
            {P.about.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <div className="section">
            <div className="overline">Experience</div>
            <div className="tl">
              {P.experiences.map((x, i) => (
                <div className="xp" key={i}>
                  <div className="when">
                    <span>{x.dates}</span>
                    <span className="dur">{x.duration}</span>
                  </div>
                  <h3>
                    {x.title} <span className="co">@ {x.company}</span>{" "}
                    <span className="ext">↗</span>
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
        </main>
      </div>
    </div>
  );
}

// Body only (no switcher) — used by the unified PortfolioHost switcher.
function AuroraBody({ variantId, mode }) {
  const P = window.PORTFOLIO;
  const T = window.AURORA_THEME;
  const v = T.variants.find((x) => x.id === variantId) || T.variants[0];
  const style = v[mode] || v.dark;
  return (
    <div className="aurora-root" style={style}>
      <style dangerouslySetInnerHTML={{ __html: AURORA_CSS }} />
      <div className="bg-grad" />
      <div className="aurora">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <div className="grain" />
      <div className="wrap">
        <aside className="left">
          <img className="avatar" src={P.photo} alt={P.name} />
          <h1 className="name">
            Sévrain
            <br />
            CHEA
          </h1>
          <div className="role">Tech Lead · Full-Stack Engineer</div>
          <p className="tagline">{P.tagline}</p>
          <div className="divrule" />
          <nav>
            {P.nav.map((n, i) => (
              <a key={n} className={i === 0 ? "active" : ""} href="#">
                <span className="ix">{String(i + 1).padStart(2, "0")}</span>
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
        </aside>
        <main className="right">
          <div className="overline">About</div>
          <div className="about">
            {P.about.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <div className="section">
            <div className="overline">Experience</div>
            <div className="tl">
              {P.experiences.map((x, i) => (
                <div className="xp" key={i}>
                  <div className="when">
                    <span>{x.dates}</span>
                    <span className="dur">{x.duration}</span>
                  </div>
                  <h3>
                    {x.title} <span className="co">@ {x.company}</span>{" "}
                    <span className="ext">↗</span>
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
        </main>
      </div>
    </div>
  );
}
window.AuroraBody = AuroraBody;

// Icon helper (self-contained so this file doesn't depend on the canvas files).
function IconFor(s) {
  const c = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "currentColor",
  };
  if (s === "GitHub")
    return (
      <svg {...c}>
        <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9 9 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.8-5.1 6.8-9.7C22 6.6 17.5 2 12 2z" />
      </svg>
    );
  if (s === "LinkedIn")
    return (
      <svg {...c}>
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.3 18V10H5.7v8h2.6zM7 8.8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.3 18v-4.4c0-2.4-1.3-3.5-3-3.5-1.4 0-2 .8-2.3 1.3V10h-2.6v8h2.6v-4.5c0-1.2.8-1.6 1.5-1.6.7 0 1.2.5 1.2 1.6V18h2.6z" />
      </svg>
    );
  return (
    <svg {...c}>
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7L4 7v1l8 5 8-5V7l-8 5z" />
    </svg>
  );
}
window.IconFor = IconFor;
window.AuroraPortfolio = AuroraPortfolio;
