// THEME FAMILY — "Blueprint" (the spec sheet).
// Drafting canvas, dimension lines, monospace callouts, title block.
// Palette-driven. Readability fix: the grid is muted and the reading
// content floats on a solid "drawing sheet" so lines never run through text.
function BlueprintBoard({ pal }) {
  const P = window.PORTFOLIO;
  const {
    ns,
    bg,
    CY,
    AM,
    line1,
    line2,
    INK,
    MUT,
    HEAD,
    panel,
    notch,
    avFilter,
  } = pal;
  const css = `
  .${ns}{position:relative;width:100%;min-height:100vh;overflow:hidden;background:${bg};color:${INK};
    font-family:'Inter',system-ui,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;
    background-image:linear-gradient(${line1} 1px,transparent 1px),linear-gradient(90deg,${line1} 1px,transparent 1px),
      linear-gradient(${line2} 1px,transparent 1px),linear-gradient(90deg,${line2} 1px,transparent 1px);
    background-size:120px 120px,120px 120px,24px 24px,24px 24px;}
  .${ns} .mono{font-family:'JetBrains Mono',monospace;}
  .${ns} .frame{position:absolute;inset:24px;border:1px solid ${line1};z-index:1;pointer-events:none;}
  .${ns} .frame::before{content:"";position:absolute;inset:8px;border:1px solid ${line2};}
  /* content sheet — solid backing so the grid sits only in the margins/frame */
  .${ns} .wrap{position:relative;z-index:2;display:grid;grid-template-columns:400px 1fr;gap:0;max-width:1240px;margin:0 auto;padding:64px 56px;}
  .${ns} .wrap::before{content:"";position:absolute;inset:0;background:${panel};z-index:0;
    box-shadow:0 0 0 1px ${line1};}
  .${ns} .left,.${ns} .right{position:relative;z-index:1;}
  .${ns} .left{padding-right:48px;}
  /* title block */
  .${ns} .titleblock{border:1px solid ${CY}66;background:${CY}0a;}
  .${ns} .titleblock .tbrow{display:flex;border-bottom:1px solid ${CY}44;}
  .${ns} .titleblock .tbrow:last-child{border-bottom:none;}
  .${ns} .titleblock .cell{padding:9px 12px;border-right:1px solid ${CY}44;}
  .${ns} .titleblock .cell:last-child{border-right:none;}
  .${ns} .titleblock .k{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:${MUT};display:block;margin-bottom:2px;}
  .${ns} .titleblock .v{font-size:13px;color:${INK};font-weight:500;}
  .${ns} .avatar{width:100%;height:230px;object-fit:cover;display:block;border:1px solid ${CY}66;filter:${avFilter};
    background:${bg};}
  .${ns} .avwrap{position:relative;margin-bottom:0;}
  .${ns} .name{font-family:'Playfair Display',serif;font-size:46px;line-height:1.0;font-weight:600;margin:22px 0 6px;letter-spacing:-.01em;color:${HEAD};}
  .${ns} .role{font-family:'JetBrains Mono',monospace;font-size:12px;color:${CY};letter-spacing:.04em;margin-bottom:8px;}
  .${ns} .role::before{content:"// ";color:${MUT};}
  .${ns} .tagline{font-size:13.5px;color:${MUT};line-height:1.66;margin-bottom:22px;max-width:320px;}
  .${ns} nav{display:flex;flex-direction:column;border-top:1px solid ${line1};margin-bottom:22px;}
  .${ns} nav a{display:flex;align-items:baseline;gap:12px;padding:10px 0;border-bottom:1px solid ${line1};color:${INK};
    text-decoration:none;font-size:14px;transition:all .2s;}
  .${ns} nav a .ix{font-family:'JetBrains Mono',monospace;font-size:11px;color:${CY};}
  .${ns} nav a:hover{color:${CY};padding-left:6px;}
  .${ns} .socials{display:flex;gap:8px;}
  .${ns} .socials a{width:38px;height:38px;display:grid;place-items:center;border:1px solid ${CY}55;color:${MUT};transition:all .2s;}
  .${ns} .socials a:hover{color:${bg};background:${CY};}
  .${ns} .right{padding-left:50px;border-left:1px solid ${line1};}
  .${ns} .ol{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${AM};
    display:flex;align-items:center;gap:12px;margin:0 0 22px;}
  .${ns} .ol .fig{color:${MUT};}
  .${ns} .ol::after{content:"";flex:1;border-top:1px dashed ${CY}55;}
  .${ns} .about p{margin:0 0 14px;color:${INK};font-size:15.5px;line-height:1.74;max-width:60ch;}
  .${ns} .about b{color:${HEAD};font-weight:600;border-bottom:1px solid ${CY}66;}
  .${ns} .section{margin-top:54px;}
  .${ns} .xp{position:relative;border:1px solid ${line1};padding:20px 22px;margin-bottom:18px;background:${CY}08;transition:all .25s;}
  .${ns} .xp::before{content:attr(data-fig);position:absolute;top:-9px;left:16px;background:${notch};padding:0 8px;
    font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;color:${AM};}
  .${ns} .xp:hover{border-color:${CY}88;background:${CY}12;}
  .${ns} .xp .when{font-family:'JetBrains Mono',monospace;font-size:11px;color:${MUT};letter-spacing:.04em;margin-bottom:7px;display:flex;gap:12px;}
  .${ns} .xp .when .dur{color:${CY};}
  .${ns} .xp h3{font-family:'Playfair Display',serif;font-size:21px;font-weight:600;margin:0 0 2px;color:${HEAD};}
  .${ns} .xp h3 .co{color:${CY};font-style:italic;}
  .${ns} .xp .pos{font-family:'JetBrains Mono',monospace;font-size:11px;color:${MUT};margin:0 0 10px;}
  .${ns} .xp .desc{color:${INK};font-size:14px;line-height:1.68;margin:0 0 12px;max-width:62ch;}
  .${ns} .tags{display:flex;flex-wrap:wrap;gap:6px;}
  .${ns} .tag{font-family:'JetBrains Mono',monospace;font-size:11px;padding:3px 9px;border:1px solid ${CY}44;color:${INK};background:${CY}08;}

  @media (max-width:760px){
    .${ns} .frame{inset:10px;}
    .${ns} .wrap{grid-template-columns:1fr;padding:62px 22px 64px;}
    .${ns} .left{padding-right:0;}
    .${ns} .avatar{height:240px;}
    .${ns} .name{font-size:38px;margin:18px 0 6px;}
    .${ns} .tagline{max-width:none;}
    .${ns} nav{flex-direction:row;flex-wrap:wrap;gap:6px;border-top:none;margin-bottom:18px;}
    .${ns} nav a{flex:1;justify-content:center;border-bottom:none;border:1px solid ${CY}33;padding:9px 8px;font-size:12.5px;}
    .${ns} nav a:hover{padding-left:8px;}
    .${ns} .right{padding-left:0;border-left:none;border-top:1px solid ${line1};margin-top:30px;padding-top:30px;}
    .${ns} .section{margin-top:40px;}
    .${ns} .about p{font-size:15px;}
  }
  `;
  return (
    <div className={ns}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="frame" />
      <div className="wrap">
        <aside className="left">
          <div className="avwrap">
            <img className="avatar" src={P.photo} alt={P.name} />
          </div>
          <h1 className="name">
            Sévrain
            <br />
            Chea
          </h1>
          <div className="role">Tech Lead · Full-Stack Engineer</div>
          <p className="tagline">{P.tagline}</p>
          <div className="titleblock">
            <div className="tbrow">
              <div className="cell" style={{ flex: 1 }}>
                <span className="k">Discipline</span>
                <span className="v">Full-Stack</span>
              </div>
              <div className="cell" style={{ flex: 1 }}>
                <span className="k">Exp.</span>
                <span className="v">7 Years</span>
              </div>
            </div>
            <div className="tbrow">
              <div className="cell" style={{ flex: 1 }}>
                <span className="k">Scale</span>
                <span className="v">0 → 10 team</span>
              </div>
              <div className="cell" style={{ flex: 1 }}>
                <span className="k">Status</span>
                <span className="v" style={{ color: CY }}>
                  Available
                </span>
              </div>
            </div>
          </div>
          <nav style={{ marginTop: 22 }}>
            {P.nav.map((n, i) => (
              <a key={n} href="#">
                <span className="ix">[{String(i + 1).padStart(2, "0")}]</span>
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
          <div className="ol">
            <span className="fig">FIG 1 —</span> About
          </div>
          <div className="about">
            {P.about.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <div className="section">
            <div className="ol">
              <span className="fig">FIG 2 —</span> Experience
            </div>
            {P.experiences.map((x, i) => (
              <div className="xp" key={i} data-fig={`2.${i + 1}`}>
                <div className="when">
                  <span>{x.dates}</span>
                  <span className="dur">[{x.duration}]</span>
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
        </main>
      </div>
    </div>
  );
}

// ── AZURE (blue) ── deep navy draft + cool engineering paper.
//    primary = refined azure, secondary = warm amber "Experience" label.
const BP_SPEC = {
  ns: "bp-spec",
  bg: "#0d2236",
  CY: "#5bb4e8",
  AM: "#f0a652",
  line1: "rgba(120,180,220,.14)",
  line2: "rgba(120,180,220,.05)",
  INK: "#c6dcee",
  MUT: "#7fa6c4",
  HEAD: "#ffffff",
  panel: "rgba(9,26,42,.84)",
  notch: "#0f2a40",
  avFilter: "saturate(.9) brightness(.97)",
};
const BP_SPEC_LIGHT = {
  ns: "bp-spec-l",
  bg: "#eef3f7",
  CY: "#2b78b4",
  AM: "#bf6f1f",
  line1: "rgba(40,90,140,.18)",
  line2: "rgba(40,90,140,.06)",
  INK: "#26343f",
  MUT: "#5d7287",
  HEAD: "#10202c",
  panel: "rgba(248,251,253,.85)",
  notch: "#eef3f7",
  avFilter: "saturate(.92) contrast(1.02)",
};
// ── CRIMSON (red) ── deep wine draft + warm paper.
//    primary = coral red, secondary = soft teal "Experience" label.
const BP_CYANO = {
  ns: "bp-cyano",
  bg: "#251419",
  CY: "#e2796c",
  AM: "#54c2b2",
  line1: "rgba(224,150,140,.15)",
  line2: "rgba(224,150,140,.05)",
  INK: "#ecd2cc",
  MUT: "#bd928b",
  HEAD: "#fff3ef",
  panel: "rgba(31,16,20,.84)",
  notch: "#2a1519",
  avFilter: "saturate(.95) brightness(.96)",
};
const BP_CYANO_LIGHT = {
  ns: "bp-cyano-l",
  bg: "#f7efed",
  CY: "#c0524a",
  AM: "#2f8f7e",
  line1: "rgba(150,70,60,.17)",
  line2: "rgba(150,70,60,.06)",
  INK: "#3a2a27",
  MUT: "#876a64",
  HEAD: "#2a1411",
  panel: "rgba(252,247,245,.85)",
  notch: "#f7efed",
  avFilter: "saturate(.97) contrast(1.02)",
};
// ── VERDANT (green) ── forest draft + sage paper.
//    primary = emerald, secondary = terracotta "Experience" label.
const BP_VELLUM = {
  ns: "bp-vellum",
  bg: "#eef4ee",
  CY: "#2f9266",
  AM: "#c0682a",
  line1: "rgba(40,110,70,.17)",
  line2: "rgba(40,110,70,.06)",
  INK: "#283a30",
  MUT: "#5f7a68",
  HEAD: "#12241a",
  panel: "rgba(248,252,249,.85)",
  notch: "#eef4ee",
  avFilter: "saturate(.94) contrast(1.02)",
};
const BP_VELLUM_DARK = {
  ns: "bp-vellum-d",
  bg: "#102420",
  CY: "#5fc090",
  AM: "#ec9a5e",
  line1: "rgba(130,200,160,.13)",
  line2: "rgba(130,200,160,.05)",
  INK: "#c8e0d2",
  MUT: "#85a896",
  HEAD: "#f0fff6",
  panel: "rgba(11,28,22,.84)",
  notch: "#0e201a",
  avFilter: "saturate(.9) brightness(.97)",
};

function DirBlueprint() {
  return <BlueprintBoard pal={BP_SPEC} />;
}
function DirBlueprintCyano() {
  return <BlueprintBoard pal={BP_CYANO} />;
}
function DirBlueprintVellum() {
  return <BlueprintBoard pal={BP_VELLUM} />;
}
function DirBlueprintLight() {
  return <BlueprintBoard pal={BP_SPEC_LIGHT} />;
}
function DirBlueprintCyanoLight() {
  return <BlueprintBoard pal={BP_CYANO_LIGHT} />;
}
function DirBlueprintVellumDark() {
  return <BlueprintBoard pal={BP_VELLUM_DARK} />;
}
window.DirBlueprint = DirBlueprint;
window.DirBlueprintCyano = DirBlueprintCyano;
window.DirBlueprintVellum = DirBlueprintVellum;
window.DirBlueprintLight = DirBlueprintLight;
window.DirBlueprintCyanoLight = DirBlueprintCyanoLight;
window.DirBlueprintVellumDark = DirBlueprintVellumDark;

// Registry — each variant is a color world with both modes. (Vellum was
// always the light one; it now also has a dark "graphite" counterpart.)
window.BLUEPRINT_THEME = {
  id: "blueprint",
  name: "Blueprint",
  Board: BlueprintBoard,
  defaultMode: "dark",
  swatchKeys: ["CY", "AM"],
  variants: [
    {
      id: "azure",
      name: "Azure",
      swatch: ["#5bb4e8", "#f0a652"],
      accent: { dark: "#5bb4e8", light: "#2b78b4" },
      dark: BP_SPEC,
      light: BP_SPEC_LIGHT,
    },
    {
      id: "crimson",
      name: "Crimson",
      swatch: ["#e2796c", "#54c2b2"],
      accent: { dark: "#e2796c", light: "#c0524a" },
      dark: BP_CYANO,
      light: BP_CYANO_LIGHT,
    },
    {
      id: "verdant",
      name: "Verdant",
      swatch: ["#5fc090", "#ec9a5e"],
      accent: { dark: "#5fc090", light: "#2f9266" },
      dark: BP_VELLUM_DARK,
      light: BP_VELLUM,
    },
  ],
};
