// Single source of truth for all portfolio content.
// Consumed by every theme family's layout (Aurora, Neon, Editorial, Blueprint)
// so the copy never diverges. Rendering differs per family — content does not.

export interface ProjectLink {
  name: string;
  url: string;
}

export interface Experience {
  title: string;
  company: string;
  contract: string;
  dates: string; // e.g. "2021 — 2025"
  duration: string; // e.g. "Present" / "22 months"
  positions: string[];
  description: string;
  stack: string[];
  companyLink: string;
  projectLinks?: ProjectLink[];
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
}

const portfolio = {
  name: "Sévrain Chea",
  firstName: "Sévrain",
  lastName: "Chea",
  role: "Tech Lead · Full-Stack Engineer",
  tagline:
    "Start-up mindset — shipping fast, iterating on product, and building scalable processes for high-performing engineering teams.",
  photo: "/images/profile_home.jpeg",

  nav: [
    { label: "About", href: "#about" },
    { label: "Experiences", href: "#experiences" },
    { label: "Chat", href: "/chat" },
  ] as NavItem[],

  // HTML strings — inline <b> emphasis (e.g. Mayday) is preserved via v-html.
  about: [
    "I am a full-stack engineer with 7 years of experience building and scaling web applications. I specialize in system architecture, leading engineering teams, and driving product development from concept to launch.",
    "I'm currently a Tech Lead at <b>Mayday</b>, where I joined as the first engineer and helped grow the team from 0 to 10. I started by building core product features, then moved into designing scalable systems and leading technical architecture — driving direction, mentoring, and shipping high-impact features.",
    "Before Mayday I worked primarily in startups across diverse domains — monitoring tools for cinema hardware, web apps for French tax workflows, and healthcare platforms for teleconsultation and scheduling.",
    "Outside of work I'm a dad to one awesome little boy. I love cooking for my family, sneaking in quick getaways, and a geeky side that runs from side projects to video games.",
  ] as string[],

  socials: [
    { label: "GitHub", url: "https://github.com/SevrainChea", icon: "mdi:github" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/sevrainchea/",
      icon: "mdi:linkedin",
    },
    { label: "Email", url: "mailto:sevrain.chea@gmail.com", icon: "mdi:email" },
  ] as SocialLink[],

  experiences: [
    {
      title: "Tech Lead",
      company: "Mayday",
      contract: "Full-Time",
      dates: "2021 — 2025",
      duration: "Present",
      positions: ["Senior Engineer", "Full-Stack Engineer"],
      description:
        "Led two squads (7 engineers) building a SaaS platform at a fast-growing startup. Shaped scalable architecture, spearheaded technical discoveries (collaborative editor with Y.js), refactored the notification system with RabbitMQ, and initiated the LMS product. Implemented single/multi-tenant DB architecture and defined onboarding for rapid team growth.",
      stack: [
        "VueJS",
        "TailwindCSS",
        "NodeJS",
        "NestJS",
        "TypeScript",
        "GraphQL",
        "MongoDB",
        "PostgreSQL",
        "RabbitMQ",
      ],
      companyLink: "https://www.mayday.fr/",
    },
    {
      title: "Backend Technical Lead",
      company: "Maiia",
      contract: "Full-Time",
      dates: "2019 — 2021",
      duration: "22 months",
      positions: ["Full-Stack Engineer"],
      description:
        "Led a backend team (3 developers) building the Maiia Pro web application. Designed technical architecture and data models, planned and estimated work, mentored backend developers, and delivered agenda management and payment processing. Integrated Stripe and Algolia to support core business workflows.",
      stack: [
        "Java",
        "SpringBoot",
        "MongoDB",
        "RabbitMQ",
        "ReactJS",
        "Node.js",
        "JavaScript",
      ],
      companyLink: "https://www.maiia.com/",
    },
    {
      title: "Software Engineer",
      company: "Viveris",
      contract: "Full-Time",
      dates: "2018 — 2019",
      duration: "10 months",
      positions: [],
      description:
        "Embedded software engineer at Cobham in aerospace — developed unit tests in C using RTRT and validated technical requirements. Later a technical consultant for Renault and Akka on an autonomous-vehicle PoC, authoring test plans and leading functional validation in safety-critical environments.",
      stack: ["C", "RTRT", "Functional QA"],
      companyLink: "https://www.viveris.fr/",
    },
    {
      title: "Full-Stack Engineer",
      company: "Sopra Steria",
      contract: "Internship",
      dates: "2018",
      duration: "6 months",
      positions: [],
      description:
        "Contributed to the GIP-MDS project on the net-entreprises.fr portal. Developed new features, ensured reliability through unit testing, and built a Circuit Breaker PoC using Hystrix. Led a task force of 4 developers, reducing the backlog from 50 to under 20 tickets within one month.",
      stack: [
        "Java",
        "JEE",
        "JSP",
        "SpringBoot",
        "JUnit",
        "HTML",
        "CSS",
        "JavaScript",
        "jQuery",
      ],
      companyLink: "https://www.soprasteria.com/",
      projectLinks: [{ name: "GIP-MDS", url: "https://www.net-entreprises.fr/" }],
    },
    {
      title: "Software Engineer",
      company: "CineApps",
      contract: "Internship",
      dates: "2018",
      duration: "6 months",
      positions: [],
      description:
        "Led development of a Java-based monitoring tool for Twavox, a cinema accessibility device for hearing- and visually-impaired audiences. Handled the full cycle from requirements gathering to deployment at client sites, authored technical documentation and user manuals, and supported training for smooth adoption.",
      stack: ["Java", "Swing", "Linux"],
      companyLink: "https://www.linkedin.com/company/cineapps/",
      projectLinks: [{ name: "Twavox", url: "https://www.twavox.com/" }],
    },
  ] as Experience[],
};

export function usePortfolioData() {
  return portfolio;
}
