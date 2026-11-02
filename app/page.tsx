import Link from "next/link";
import type { CSSProperties } from "react";
import { CommandPaletteTrigger } from "../components/CommandPalette";
import { projects } from "./projects";
import styles from "./page.module.css";

type Experience = {
  company: string;
  location: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  technologies: string[];
};

type Publication = {
  title: string;
  description: string;
  href: string;
  platform: string;
  topics: string[];
};

type NavItem = {
  href: string;
  label: string;
  description: string;
  accent: string;
};

const skills = [
  { label: "Backend", value: "Spring Boot · Quarkus · Apache Camel" },
  { label: "Frontend", value: "React · Next.js · Tauri" },
  { label: "Data", value: "Microsoft SQL Server · MySQL" },
  { label: "Platform", value: "Kubernetes · OpenShift · Jenkins · SonarQube · Dynatrace · Splunk" },
];

const publications: Publication[] = [
  {
    title: "Camel in Jupyter",
    description:
      "Run Apache Camel routes interactively from a Jupyter notebook and shorten the feedback loop while exploring integrations.",
    href: "https://medium.com/@gogeonhyeok/camel-in-jupyter-efb56d944563",
    platform: "Medium",
    topics: ["Apache Camel", "Jupyter", "Integration"],
  },
];

const experiences: Experience[] = [
  {
    company: "Singapore Airlines",
    location: "Singapore",
    role: "Tech Lead, E-Commerce",
    period: "Dec 2021 — Present",
    summary: "Leading global payment integrations for airline e-commerce, including Mastercard, Worldpay, Adyen, and PayNow. Delivered Altea check-in integration across customer journeys.",
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
    summary: "Modernized warehouse and transport operations with web and mobile applications. Built service-management prototypes, EDI integrations, and Android solutions for international customer sites.",
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

export default function Page() {
  return (
    <div className={styles.page}>
      <div>
        <header>
          <Link href="/"><span>g.</span>Go Gun Hyuk</Link>
          <a href="mailto:gogeonhyeok@outlook.com">Get in touch <span aria-hidden="true">↗</span></a>
        </header>

        <main>
          <section className={styles.posts} aria-labelledby="posts-title">
            <header>
              <div>
                <p>WRITING</p>
                <h2 id="posts-title">Posts</h2>
              </div>
              <a
                href="https://medium.com/@gogeonhyeok"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Medium <span aria-hidden="true">↗</span>
              </a>
            </header>
            <p>
              Practical notes on integration engineering, Apache Camel, and the tools I use to prototype ideas.
            </p>
            <ol aria-label="Published articles">
              {publications.map((publication, index) => (
                <li key={publication.href}>
                  <article>
                    <a
                      href={publication.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Read ${publication.title} on ${publication.platform} (opens in a new tab)`}
                    >
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <span>{publication.platform}</span>
                        <h3>{publication.title}</h3>
                        <p>{publication.description}</p>
                        <ul aria-label="Topics">
                          {publication.topics.map((topic) => <li key={topic}>{topic}</li>)}
                        </ul>
                      </div>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </article>
                </li>
              ))}
            </ol>
            <p>More field notes are in the works.</p>
          </section>

          <section aria-labelledby="workspace-title" className={styles.workspace}>
            <header>
              <p>PERSONAL WORKSPACE</p>
              <h1 id="workspace-title">Projects & experiments.</h1>
              <p>A collection of web tools and interface demos. Pick a page to explore.</p>
            </header>
            <nav aria-label="Projects and experiments">
              {projects.map((page) => (
                <Link key={page.href} href={page.href} style={{ "--accent": page.accent } as CSSProperties}>
                  <span aria-hidden="true">{page.label.slice(0, 1)}</span>
                  <div><h2>{page.label}</h2><p>{page.description}</p></div>
                </Link>
              ))}
            </nav>
          </section>

          <section className={styles.about} aria-labelledby="about-title">
            <header>
              <div><h2 id="about-title">Built by Go Gun Hyuk</h2><p>Software Engineer & Tech Lead · Singapore</p></div>
              <span>Java · Spring · React · Next.js</span>
            </header>
            <p>I build reliable payments, e-commerce integrations, and backend systems.</p>
            <nav aria-label="Contact links">
              <a href="mailto:gogeonhyeok@outlook.com">gogeonhyeok@outlook.com</a>
              <a href="https://www.linkedin.com/in/geon-hyeok-go-59638b155">LinkedIn</a>
            </nav>
            <ol aria-label="Career timeline">
              {experiences.map((experience, index) => (
                <li key={experience.company}>
                  <span>{index === 0 ? "Current role" : "Previously"}</span>
                  <h3>{experience.role}</h3>
                  <p>{experience.company} · {experience.location}</p>
                  <span>{experience.period}</span>
                  <p>{experience.summary}</p>
                </li>
              ))}
            </ol>
            <details>
              <summary>More about me <span aria-hidden="true">+</span></summary>
              <div>
                <h3>Experience</h3>
                {experiences.map((experience) => (
                  <article key={experience.company}>
                    <h4>{experience.role} · {experience.company}</h4>
                    <p>{experience.period} · {experience.location}</p>
                    <ul>
                      {experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                    </ul>
                    <p>{experience.technologies.join(" · ")}</p>
                  </article>
                ))}
                <h3>Expertise</h3>
                <dl>
                  {skills.map((skill) => (
                    <div key={skill.label}><dt>{skill.label}</dt><dd>{skill.value}</dd></div>
                  ))}
                </dl>
                <h3>Education</h3>
                <p>Sejong University · Seoul, Korea · 2010 — 2017<br />Bachelor of Science in Physics · GPA 3.61 / 4.5</p>
                <p>Scholarship for Language Excellence (English)<br />Scholarship for Academic Excellence</p>
                <h3>Qualifications & certifications</h3>
                <ul>{certifications.map((certification) => <li key={certification}>{certification}</li>)}</ul>
              </div>
            </details>
          </section>
        </main>
        <footer>© {new Date().getFullYear()} Go Gun Hyuk</footer>
      </div>
    </div>
  );
}
