// THEME FAMILY — "Editorial" (the literary issue).
// Masthead, drop cap, multi-column flow. Light, type-forward.
// Palette-driven to compare how different ink/accent moods feel.
function EditorialBoard({ pal }) {
  const P = window.PORTFOLIO;
  const { ns, paper, ink, acc, mut, rule, body, grain, vol, place } = pal;
  const css = `
  .${ns}{position:relative;width:100%;min-height:100vh;overflow:hidden;background:${paper};color:${ink};
    font-family:'Inter',system-ui,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;}
  .${ns} .paper{position:absolute;inset:0;z-index:0;opacity:${grain};pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");}
  .${ns} .sheet{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:54px 70px 90px;}
  /* masthead */
  .${ns} .masthead{border-top:3px solid ${ink};border-bottom:1px solid ${ink};padding:14px 0 18px;
    display:flex;justify-content:space-between;align-items:flex-end;}
  .${ns} .masthead .kicker{font-size:11px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:${acc};margin-bottom:10px;}
  .${ns} .masthead h1{font-family:'Playfair Display',serif;font-size:78px;line-height:.9;font-weight:700;margin:0;letter-spacing:-.02em;}
  .${ns} .masthead .meta{text-align:right;font-size:11.5px;color:${mut};letter-spacing:.04em;line-height:1.8;text-transform:uppercase;}
  .${ns} .masthead .meta b{color:${ink};}
  /* top intro row */
  .${ns} .lead{display:grid;grid-template-columns:236px 1fr;gap:48px;padding:40px 0 0;border-bottom:1px solid ${rule};margin-bottom:44px;}
  .${ns} .lead .avatar{width:236px;height:280px;object-fit:cover;filter:grayscale(.3) saturate(.9);border:1px solid ${rule};}
  .${ns} .lead .cap{font-size:11px;color:${mut};font-style:italic;margin-top:8px;line-height:1.4;}
  .${ns} .lead .role{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${acc};margin-bottom:14px;}
  .${ns} .lead .standfirst{font-family:'Playfair Display',serif;font-size:27px;line-height:1.34;color:${ink};font-weight:500;margin:0 0 20px;text-wrap:pretty;}
  .${ns} .lead nav{display:flex;gap:26px;border-top:1px solid ${rule};padding-top:16px;}
  .${ns} .lead nav a{font-size:12.5px;font-weight:600;letter-spacing:.04em;color:${ink};text-decoration:none;text-transform:uppercase;}
  .${ns} .lead nav a:hover{color:${acc};}
  .${ns} .lead nav a .n{color:${acc};font-family:'Playfair Display',serif;font-style:italic;font-weight:500;margin-right:5px;text-transform:none;}
  /* body columns */
  .${ns} .sectlabel{font-family:'Playfair Display',serif;font-style:italic;font-size:21px;color:${acc};margin:0 0 16px;
    display:flex;align-items:center;gap:14px;}
  .${ns} .sectlabel::after{content:"";flex:1;height:1px;background:${rule};}
  .${ns} .about{columns:2;column-gap:48px;margin-bottom:60px;}
  .${ns} .about p{margin:0 0 14px;color:${body};font-size:15px;line-height:1.72;break-inside:avoid;}
  .${ns} .about p:first-child::first-letter{font-family:'Playfair Display',serif;font-size:62px;line-height:.8;float:left;
    padding:6px 10px 0 0;color:${acc};font-weight:700;}
  .${ns} .about b{color:${ink};font-weight:600;}
  /* experience entries */
  .${ns} .xp{display:grid;grid-template-columns:130px 1fr;gap:34px;padding:26px 0;border-top:1px solid ${rule};}
  .${ns} .xp:last-child{border-bottom:1px solid ${rule};}
  .${ns} .xp .when{font-size:12.5px;color:${mut};line-height:1.5;padding-top:6px;font-variant-numeric:tabular-nums;}
  .${ns} .xp .when .dur{display:block;font-family:'Playfair Display',serif;font-style:italic;color:${acc};font-size:14px;margin-top:3px;}
  .${ns} .xp h3{font-family:'Playfair Display',serif;font-size:26px;font-weight:600;margin:0 0 4px;line-height:1.1;}
  .${ns} .xp h3 .co{font-style:italic;color:${acc};}
  .${ns} .xp .pos{font-size:12.5px;color:${mut};text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px;}
  .${ns} .xp .desc{color:${body};font-size:14.5px;line-height:1.72;margin:0 0 14px;max-width:62ch;}
  .${ns} .tags{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${mut};line-height:1.9;}
  .${ns} .tags .sep{color:${acc};margin:0 8px;}

  @media (max-width:760px){
    .${ns} .sheet{padding:64px 22px 70px;}
    .${ns} .masthead{flex-direction:column;align-items:flex-start;gap:12px;padding:12px 0 14px;}
    .${ns} .masthead h1{font-size:48px;}
    .${ns} .masthead .meta{text-align:left;}
    .${ns} .lead{grid-template-columns:1fr;gap:22px;padding:24px 0 0;margin-bottom:32px;}
    .${ns} .lead .avatar{width:100%;height:230px;}
    .${ns} .lead .standfirst{font-size:21px;}
    .${ns} .lead nav{flex-wrap:wrap;gap:16px 22px;}
    .${ns} .about{columns:1;margin-bottom:44px;}
    .${ns} .xp{grid-template-columns:1fr;gap:8px;padding:22px 0;}
    .${ns} .xp .when{padding-top:0;}
    .${ns} .xp h3{font-size:23px;}
  }
  `;
  return (
    <div className={ns}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="paper" />
      <div className="sheet">
        <div className="masthead">
          <div>
            <div className="kicker">Portfolio — Vol. {vol}</div>
            <h1>Sévrain Chea</h1>
          </div>
          <div className="meta">
            Tech Lead
            <br />
            <b>Full-Stack Engineer</b>
            <br />
            {place} · 2025
          </div>
        </div>
        <div className="lead">
          <div className="figure">
            <img className="avatar" src={P.photo} alt={P.name} />
            <div className="cap">The engineer at work, 2025.</div>
          </div>
          <div>
            <div className="role">On building &amp; leading</div>
            <p className="standfirst">{P.tagline}</p>
            <nav>
              {P.nav.map((n, i) => (
                <a key={n} href="#">
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  {n}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="sectlabel">About</div>
        <div className="about">
          {P.about.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
        <div className="sectlabel">Experience</div>
        {P.experiences.map((x, i) => (
          <div className="xp" key={i}>
            <div className="when">
              {x.dates}
              <span className="dur">{x.duration}</span>
            </div>
            <div>
              <h3>
                {x.title} <span className="co">{x.company}</span>
              </h3>
              <div className="pos">
                {x.contract}
                {x.positions.length ? " — " + x.positions.join(", ") : ""}
              </div>
              <p className="desc">{x.description}</p>
              <div className="tags">
                {x.stack.map((t, j) => (
                  <span key={t}>
                    {t}
                    {j < x.stack.length - 1 ? (
                      <span className="sep">/</span>
                    ) : (
                      ""
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// VARIANT A — "The Issue": warm paper, rust accent (the original).
const ED_ISSUE = {
  ns: "ed-issue",
  paper: "#f4efe4",
  ink: "#23201a",
  acc: "#b8472b",
  mut: "#6f6557",
  rule: "#cbb89a",
  body: "#3a342b",
  grain: 0.5,
  vol: "7",
  place: "Paris",
};
// VARIANT B — "Broadsheet": near B&W, accent = ink. Restrained, classic newsprint.
const ED_NOIR = {
  ns: "ed-noir",
  paper: "#faf8f1",
  ink: "#16130d",
  acc: "#14110c",
  mut: "#6b6354",
  rule: "#d8cdb8",
  body: "#2c281f",
  grain: 0.4,
  vol: "II",
  place: "Paris",
};
// VARIANT C — "Quarterly": cool ivory, deep-forest accent. Calmer, greener.
const ED_FOREST = {
  ns: "ed-forest",
  paper: "#eef0e9",
  ink: "#1b211c",
  acc: "#2f6d52",
  mut: "#5f6b60",
  rule: "#c4ccc1",
  body: "#2f372f",
  grain: 0.32,
  vol: "04",
  place: "Paris",
};
// DARK MODE — "the night edition": same press, lights out. Warm dark stock,
// cream ink, the accent brightened so it carries on a dark page.
const ED_ISSUE_DARK = {
  ns: "ed-issue-d",
  paper: "#191510",
  ink: "#f3ece0",
  acc: "#e07a4a",
  mut: "#9a8d7c",
  rule: "#3a3228",
  body: "#d6cabb",
  grain: 0.6,
  vol: "7",
  place: "Paris",
};
const ED_NOIR_DARK = {
  ns: "ed-noir-d",
  paper: "#141413",
  ink: "#f5f3ec",
  acc: "#f5f3ec",
  mut: "#8f897e",
  rule: "#33312b",
  body: "#d9d6cc",
  grain: 0.5,
  vol: "II",
  place: "Paris",
};
const ED_FOREST_DARK = {
  ns: "ed-forest-d",
  paper: "#121712",
  ink: "#eef2e9",
  acc: "#6fbb8c",
  mut: "#8a958a",
  rule: "#2a322a",
  body: "#ccd6cb",
  grain: 0.4,
  vol: "04",
  place: "Paris",
};

function DirEditorialMag() {
  return <EditorialBoard pal={ED_ISSUE} />;
}
function DirEditorialNoir() {
  return <EditorialBoard pal={ED_NOIR} />;
}
function DirEditorialForest() {
  return <EditorialBoard pal={ED_FOREST} />;
}
function DirEditorialMagDark() {
  return <EditorialBoard pal={ED_ISSUE_DARK} />;
}
function DirEditorialNoirDark() {
  return <EditorialBoard pal={ED_NOIR_DARK} />;
}
function DirEditorialForestDark() {
  return <EditorialBoard pal={ED_FOREST_DARK} />;
}
window.DirEditorialMag = DirEditorialMag;
window.DirEditorialNoir = DirEditorialNoir;
window.DirEditorialForest = DirEditorialForest;
window.DirEditorialMagDark = DirEditorialMagDark;
window.DirEditorialNoirDark = DirEditorialNoirDark;
window.DirEditorialForestDark = DirEditorialForestDark;

// Registry — light is the natural default; dark is the night edition.
window.EDITORIAL_THEME = {
  id: "editorial",
  name: "Editorial",
  Board: EditorialBoard,
  defaultMode: "light",
  swatchKeys: ["acc", "paper"],
  variants: [
    {
      id: "issue",
      name: "The Issue",
      swatch: ["#f4efe4", "#b8472b"],
      accent: { light: "#b8472b", dark: "#e07a4a" },
      light: ED_ISSUE,
      dark: ED_ISSUE_DARK,
    },
    {
      id: "noir",
      name: "Broadsheet",
      swatch: ["#faf8f1", "#3a342b"],
      accent: { light: "#16130d", dark: "#f5f3ec" },
      light: ED_NOIR,
      dark: ED_NOIR_DARK,
    },
    {
      id: "forest",
      name: "Quarterly",
      swatch: ["#eef0e9", "#2f6d52"],
      accent: { light: "#2f6d52", dark: "#6fbb8c" },
      light: ED_FOREST,
      dark: ED_FOREST_DARK,
    },
  ],
};
