
type Experience = {
  company: string;
  location: string;
  role: string;
  period: string;
  highlights: string[];
  technologies: string[];
};

const skills = [
  { label: "Backend", value: "Spring Boot · Quarkus · Apache Camel" },
  { label: "Frontend", value: "React · Next.js · Tauri" },
  { label: "Data", value: "Microsoft SQL Server · MySQL" },
  { label: "Platform", value: "Kubernetes · OpenShift · Jenkins · SonarQube · Dynatrace · Splunk" },
];

const experiences: Experience[] = [
  {
    company: "Singapore Airlines",
    location: "Singapore",
    role: "Tech Lead, E-Commerce",
    period: "Dec 2021 — Present",
    highlights: [
      "Led integration of global payment providers for airline e-commerce, spanning Mastercard, Worldpay, Adyen, Alipay+, IATAPay, and DBS PayNow.",
      "Delivered Altea check-in integration for e-commerce flows, aligning data mapping, validation, and operational readiness.",
    ],
    technologies: ["Java", "Spring Boot", "Quarkus", "Apache Camel", "MySQL", "OpenShift"],
  },
  {
    company: "CJ Logistics Asia Pte Ltd",
    location: "Singapore",
    role: "Software Engineer",
    period: "Nov 2017 — Dec 2021",
    highlights: [
      "Modernized warehouse workflows with an MSA proof-of-concept and web application for WMS Web.",
      "Built a service-management platform proof-of-concept and delivered EDI and Android solutions for international customer sites.",
      "Shipped POD upload and mobile capabilities for transport operations through TMS Mobile.",
    ],
    technologies: ["Spring Boot", "React", "SQL Server", "Docker Swarm", "ELK", "Jenkins", "Vert.x", "Vue.js", "Redis", ".NET", "Android", "Xamarin Forms"],
  },
];

const certifications = [
  "Programming in HTML5, CSS, JavaScript — Microsoft (2017)",
  "Engineer Information Processing — HRD Service of Korea (2016)",
  "MOS 2010 Master — Microsoft (2015)",
  "MCTS: Accessing Data with Microsoft .NET Framework 4 — Microsoft (2012)",
  "Computer Literacy and Word Processor (Level 2) — Korea Chamber of Commerce & Industry (2003)",
  "OPIc — ACTFL (2016, Intermediate High)",
  "TOEIC — ETS (2016; Speaking 160/200, Listening 455/500, Reading 465/500)",
  "Driver License — Seoul Metropolitan Police Agency (2009, Level 1)",
];

/** A responsive, self-contained resume page. No styling dependencies required. */
export default function App() {
  return (
    <main className="resume-page">
      <style>{css}</style>
      <div className="grain" aria-hidden="true" />
      <nav className="topbar" aria-label="Resume navigation">
        <a className="brand" href="#top" aria-label="Back to top">GGH<span>·</span></a>
        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#expertise">Expertise</a>
          <a href="#credentials">Credentials</a>
        </div>
        <a className="contact-button" href="mailto:gogeonhyeok@outlook.com">Get in touch <span aria-hidden="true">↗</span></a>
      </nav>

      <header id="top" className="hero">
        <div className="hero-copy">
          <p className="kicker"><span className="status-dot" /> Available for conversations</p>
          <h1>Go<br />Gun Hyuk<span className="accent">.</span></h1>
          <p className="hero-role">Software Engineer <span>/</span> Tech Lead</p>
          <p className="intro">I lead reliable e-commerce integrations and build the systems that make complex operations feel simple—from payment orchestration to production support.</p>
          <div className="hero-actions">
            <a className="primary-button" href="mailto:gogeonhyeok@outlook.com">Start a conversation <span aria-hidden="true">↗</span></a>
            <span className="location">Based in Singapore</span>
          </div>
        </div>
        <aside className="hero-aside">
          <p className="aside-label">Current focus</p>
          <p>Airline e-commerce<br />&amp; payments</p>
          <div className="aside-line" />
          <p className="aside-label">Core stack</p>
          <p>Java · Spring · Cloud native</p>
        </aside>
      </header>

      <section id="experience" className="section experience-section">
        <SectionHeading number="01" title="Experience" description="End-to-end product delivery across aviation and enterprise logistics." />
        <div className="timeline">
          {experiences.map((experience, index) => <ExperienceCard key={experience.company} experience={experience} index={index + 1} />)}
        </div>
      </section>

      <section id="expertise" className="section expertise-section">
        <SectionHeading number="02" title="Expertise" description="A backend-led skill set with practical fluency across the full delivery lifecycle." />
        <div className="skills-grid">
          {skills.map((skill, index) => <div className="skill-card" key={skill.label}><span className="skill-number">0{index + 1}</span><h3>{skill.label}</h3><p>{skill.value}</p></div>)}
        </div>
      </section>

      <section id="credentials" className="section credentials-section">
        <SectionHeading number="03" title="Credentials" description="Education and professional qualifications." />
        <div className="credentials-layout">
          <div className="education-card">
            <p className="card-label">Education</p>
            <h3>Sejong University</h3>
            <p className="education-meta">Seoul, Korea · 2010 — 2017</p>
            <p className="degree">Bachelor of Science in Physics<br />GPA 3.61 / 4.5</p>
            <p className="scholarships">Scholarship for Language Excellence (English)<br />Scholarship for Academic Excellence</p>
          </div>
          <ul className="certifications">
            {certifications.map((certification) => <li key={certification}>{certification}<span aria-hidden="true">↗</span></li>)}
          </ul>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Go Gun Hyuk</p>
        <a href="mailto:gogeonhyeok@outlook.com">gogeonhyeok@outlook.com <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  );
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="section-heading"><p className="section-number">{number}</p><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function ExperienceCard({ experience, index }: { experience: Experience; index: number }) {
  return (
    <article className="experience-card">
      <div className="timeline-index">0{index}</div>
      <div className="experience-main">
        <div className="experience-title"><div><p className="company">{experience.company}</p><h3>{experience.role}</h3></div><p className="period">{experience.period}</p></div>
        <p className="location-text">{experience.location}</p>
        <ul>{experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
        <div className="chips">{experience.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
      </div>
    </article>
  );
}

const css = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  .resume-page { --ink:#f6f5f0; --muted:#a9aaa8; --line:rgba(246,245,240,.17); --accent:#c8ff63; min-height:100vh; overflow:hidden; position:relative; background:#121411; color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .grain { position:absolute; inset:0; opacity:.14; pointer-events:none; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E"); }
  .topbar,.hero,.section,.footer { width:min(1200px, calc(100% - 48px)); margin-inline:auto; position:relative; }
  .topbar { height:88px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); }
  .brand { color:var(--ink); text-decoration:none; font-weight:800; font-size:20px; letter-spacing:-.07em; } .brand span,.accent { color:var(--accent); }
  .nav-links { display:flex; gap:28px; } .nav-links a { color:var(--muted); font-size:13px; text-decoration:none; } .nav-links a:hover { color:var(--ink); }
  .contact-button { border:1px solid var(--line); color:var(--ink); border-radius:999px; padding:10px 15px; font-size:13px; text-decoration:none; } .contact-button span { color:var(--accent); }
  .hero { min-height:660px; padding:110px 0 90px; display:grid; grid-template-columns:1.3fr .7fr; align-items:end; gap:48px; }
  .kicker,.aside-label,.card-label { color:var(--muted); text-transform:uppercase; letter-spacing:.13em; font-size:11px; font-weight:700; }.status-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--accent); margin-right:8px; box-shadow:0 0 0 4px rgba(200,255,99,.12); }
  .hero h1 { margin:22px 0 15px; font-size:clamp(72px, 12vw, 150px); line-height:.79; letter-spacing:-.09em; font-weight:750; }.hero-role { font-size:clamp(18px, 2.2vw, 25px); margin:0; color:#dadbd5; letter-spacing:-.035em; }.hero-role span { color:var(--accent); padding:0 8px; }
  .intro { max-width:590px; color:var(--muted); font-size:17px; line-height:1.65; margin:37px 0 30px; }.hero-actions { display:flex; align-items:center; gap:24px; }.primary-button { color:#121411; background:var(--accent); padding:14px 19px; font-size:14px; font-weight:750; text-decoration:none; border-radius:2px; }.primary-button span { margin-left:9px; }.location { color:var(--muted); font-size:14px; }
  .hero-aside { padding:25px 0 0 25px; border-left:1px solid var(--line); align-self:center; }.hero-aside p:not(.aside-label) { margin:6px 0 0; font-size:17px; line-height:1.45; }.aside-line { width:100%; height:1px; background:var(--line); margin:28px 0; }
  .section { border-top:1px solid var(--line); padding:108px 0; }.section-heading { display:grid; grid-template-columns:140px 1fr; gap:20px; margin-bottom:60px; }.section-number { margin:8px 0 0; color:var(--accent); font:700 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace; }.section-heading h2 { margin:0; font-size:clamp(38px,5vw,64px); letter-spacing:-.07em; line-height:.95; }.section-heading div>p { max-width:410px; margin:17px 0 0; color:var(--muted); line-height:1.6; }
  .timeline { margin-left:140px; }.experience-card { display:grid; grid-template-columns:72px 1fr; gap:25px; padding:0 0 55px; border-bottom:1px solid var(--line); margin-bottom:38px; }.experience-card:last-child { margin:0; padding-bottom:0; border:0; }.timeline-index,.skill-number { font:700 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color:var(--accent); }.experience-title { display:flex; justify-content:space-between; gap:20px; align-items:start; }.company { margin:0 0 8px; color:var(--accent); font-size:13px; font-weight:750; }.experience-card h3 { margin:0; font-size:clamp(24px,3vw,32px); letter-spacing:-.055em; line-height:1; }.period,.location-text { color:var(--muted); font-size:13px; white-space:nowrap; }.period { margin:2px 0 0; }.location-text { margin:9px 0 25px; }.experience-card ul { max-width:760px; margin:0; padding:0; list-style:none; }.experience-card li { position:relative; padding-left:18px; margin:0 0 12px; color:#d7d8d3; font-size:15px; line-height:1.65; }.experience-card li::before { content:"/"; position:absolute; left:0; color:var(--accent); }.chips { display:flex; flex-wrap:wrap; gap:7px; margin-top:24px; }.chips span { color:#c9cac5; border:1px solid var(--line); border-radius:999px; padding:6px 10px; font-size:12px; }
  .expertise-section { background:#191c18; width:100%; padding-inline:max(24px, calc((100% - 1200px)/2)); }.expertise-section .section-heading { max-width:1200px; margin-inline:auto; }.skills-grid { max-width:1060px; margin-left:max(140px, calc((100% - 1200px)/2 + 140px)); display:grid; grid-template-columns:repeat(2, 1fr); border-top:1px solid var(--line); border-left:1px solid var(--line); }.skill-card { min-height:195px; padding:25px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); }.skill-card h3 { margin:49px 0 9px; font-size:22px; letter-spacing:-.04em; }.skill-card p { margin:0; max-width:350px; color:var(--muted); font-size:14px; line-height:1.55; }
  .credentials-layout { margin-left:140px; display:grid; grid-template-columns:.76fr 1.24fr; gap:62px; }.education-card { padding:27px; background:var(--accent); color:#172015; min-height:320px; }.education-card .card-label { color:#53613a; }.education-card h3 { font-size:28px; letter-spacing:-.06em; margin:43px 0 7px; }.education-meta { font-size:13px; margin:0; }.degree { margin:40px 0 0; font-weight:700; line-height:1.55; }.scholarships { margin:25px 0 0; font-size:12px; line-height:1.7; }.certifications { margin:0; padding:0; list-style:none; }.certifications li { display:flex; justify-content:space-between; gap:20px; padding:0 0 15px; margin-bottom:15px; border-bottom:1px solid var(--line); color:#d7d8d3; font-size:14px; line-height:1.5; }.certifications span { color:var(--accent); }
  .footer { display:flex; justify-content:space-between; align-items:center; padding:32px 0 48px; color:var(--muted); font-size:13px; border-top:1px solid var(--line); }.footer p { margin:0; }.footer a { color:var(--ink); text-decoration:none; }.footer span { color:var(--accent); }
  @media (max-width:720px) { .topbar,.hero,.section,.footer { width:min(100% - 32px, 1200px); }.topbar { height:72px; }.nav-links { display:none; }.contact-button { padding:8px 11px; }.hero { min-height:auto; display:block; padding:85px 0 70px; }.hero h1 { font-size:clamp(64px,20vw,100px); }.intro { font-size:16px; }.hero-actions { align-items:start; flex-direction:column; gap:15px; }.hero-aside { margin-top:66px; }.section { padding:70px 0; }.section-heading { grid-template-columns:1fr; gap:14px; margin-bottom:38px; }.section-number { margin:0; }.timeline,.credentials-layout { margin-left:0; }.experience-card { grid-template-columns:1fr; gap:16px; padding-bottom:36px; margin-bottom:29px; }.experience-title { display:block; }.period { margin-top:12px; }.skills-grid { margin-left:0; grid-template-columns:1fr; }.skill-card { min-height:160px; }.credentials-layout { grid-template-columns:1fr; gap:28px; }.footer { align-items:start; flex-direction:column; gap:12px; }.certifications li { font-size:13px; } }
`;


// const featuredTreatments = [
//   {
//     name: 'Ultherapy / Ulthera',
//     category: 'Laser lifting',
//     description: 'Non-surgical skin lifting with ultrasound energy for a more defined jawline and firmer contours.',
//     price: 'From ₩250,000',
//     badge: 'Best seller',
//   },
//   {
//     name: 'Pico Laser',
//     category: 'Pigment & acne',
//     description: 'Popular for freckles, acne marks, and skin texture refinement with minimal downtime.',
//     price: 'From ₩180,000',
//     badge: 'Fast recovery',
//   },
//   {
//     name: 'CO2 / Fraxel Laser',
//     category: 'Resurfacing',
//     description: 'Ideal for smoother skin, fine lines, and a brighter complexion with a premium clinic experience.',
//     price: 'From ₩320,000',
//     badge: 'Glow boost',
//   },
//   {
//     name: 'Botox & Fillers',
//     category: 'Injectables',
//     description: 'Soft facial contouring and volume enhancement with highly curated Korean aesthetic clinics.',
//     price: 'From ₩120,000',
//     badge: 'Popular',
//   },
//   {
//     name: 'Skin Boosters',
//     category: 'Hydration',
//     description: 'Deep hydration treatments that leave the skin dewy, plump, and naturally radiant.',
//     price: 'From ₩160,000',
//     badge: 'Trending',
//   },
//   {
//     name: 'Hair PRP / Hair Loss',
//     category: 'Hair care',
//     description: 'Regenerative scalp treatments for thinning hair and stronger, healthier-looking strands.',
//     price: 'From ₩220,000',
//     badge: 'Clinic favorite',
//   },
// ];

// const highlights = [
//   {
//     title: 'Real-time booking',
//     text: 'Compare clinics, prices, and availability in one place like a travel booking flow.',
//   },
//   {
//     title: 'Korean expertise',
//     text: 'Browse highly rated services from Seoul, Gangnam, and top beauty districts.',
//   },
//   {
//     title: 'Tailored plans',
//     text: 'Choose packages for lifting, glow, contouring, or full skin reset experiences.',
//   },
// ];

// export default function HomePage() {
//   return (
//     <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#fdf2f8_45%,_#f8fafc_100%)] text-slate-900">
//       {/* Top Bar */}
//       <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.35em] text-pink-500">K-Beauty Booking</p>
//             <h1 className="text-2xl font-semibold text-slate-800">Seoul Skin Escape</h1>
//           </div>
//           <div className="hidden items-center gap-3 md:flex">
//             <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Top-rated clinics</span>
//             <span className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700">4.9/5 average</span>
//           </div>
//         </div>
//       </header>

//       {/* Main Menu */}
//       <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//         <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
//           <div className="rounded-[2rem] bg-gradient-to-br from-pink-500 via-rose-400 to-orange-300 p-8 text-white shadow-2xl shadow-pink-200">
//             <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">Travel-style beauty discovery</p>
//             <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
//               Discover the most loved cosmetic treatments in Korea
//             </h2>
//             <p className="mt-4 max-w-2xl text-lg text-white/90">
//               From laser lifting such as Ultherapy to hydrating skin boosters and premium injectables, browse the services that are trending in Seoul and beyond.
//             </p>
//             <div className="mt-6 flex flex-wrap gap-3">
//               <span className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm">Laser treatments</span>
//               <span className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm">Botox & fillers</span>
//               <span className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm">Skin boosters</span>
//             </div>
//           </div>

//           <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-slate-500">Today&apos;s pick</p>
//                 <h3 className="text-xl font-semibold text-slate-800">Glow & lift package</h3>
//               </div>
//               <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">Popular</span>
//             </div>
//             <div className="mt-5 rounded-2xl bg-slate-50 p-4">
//               <p className="text-sm text-slate-500">Includes</p>
//               <ul className="mt-2 space-y-2 text-sm text-slate-700">
//                 <li>• Ultherapy consultation</li>
//                 <li>• Skin booster infusion</li>
//                 <li>• Premium aftercare mask</li>
//               </ul>
//             </div>
//             <button className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700">
//               Reserve your slot
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Dropdown Menu for Mobile */}
//       <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
//         <div className="mb-4 flex items-center justify-between">
//           <div>
//             <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">Popular now</p>
//             <h3 className="text-2xl font-semibold text-slate-800">Cosmetic services loved in Korea</h3>
//           </div>
//           <a href="#" className="text-sm font-medium text-pink-600">View all treatments</a>
//         </div>

//         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//           {featuredTreatments.map((treatment) => (
//             <article key={treatment.name} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <p className="text-sm font-semibold text-pink-500">{treatment.category}</p>
//                   <h4 className="mt-1 text-lg font-semibold text-slate-800">{treatment.name}</h4>
//                 </div>
//                 <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
//                   {treatment.badge}
//                 </span>
//               </div>
//               <p className="mt-3 text-sm leading-6 text-slate-600">{treatment.description}</p>
//               <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
//                 <span className="text-sm font-semibold text-slate-800">{treatment.price}</span>
//                 <button className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white">Book now</button>
//               </div>
//             </article>
//           ))}
//         </div>
//       </section>

//       <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
//         <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
//           <h3 className="text-2xl font-semibold text-slate-800">Why travelers love planning beauty treatments here</h3>
//           <div className="mt-6 grid gap-4 md:grid-cols-3">
//             {highlights.map((item) => (
//               <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
//                 <h4 className="font-semibold text-slate-800">{item.title}</h4>
//                 <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }