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

export interface Availability {
  open: boolean;
  label: string;
}

const portfolio = {
  name: "Sévrain Chea",
  firstName: "Sévrain",
  lastName: "Chea",
  role: "Founding Engineer · Product Builder",
  tagline:
    "Took Mayday from zero to a €7M-ARR acquisition. I like being the person who owns a product outright and stays close to the code. Lately that's meant going deep on building with AI.",
  photo: "/images/profile_home.jpeg",

  // Single source of truth for the "open to work" signal each family renders in
  // its own voice (Neon pill, Blueprint status cell, Aurora/Editorial chip).
  availability: {
    open: true,
    label: "Open to work",
  } as Availability,

  nav: [
    { label: "About", href: "#about" },
    { label: "Experiences", href: "#experiences" },
    { label: "Chat", href: "/chat" },
  ] as NavItem[],

  // HTML strings — inline <b> emphasis (e.g. Mayday) is preserved via v-html.
  about: [
    "I'm a full-stack engineer, and after eight years the work I care about most is taking a product from the first architecture calls all the way to watching real people use it. I'd rather not be far from either the code or the users for long.",
    "I was <b>Mayday</b>'s founding engineer. I wrote the first version and stayed through its €7M-ARR acquisition by USU GmbH, moving from Senior Engineer to Tech Lead to Head of Engineering as the company grew. Even running the team I kept coding about half the week, and the last thing I built there was an agentic AI coding system for the team.",
    "Before that it was mostly startups, and the domains were all over the map: monitoring software for cinema hardware, web tools for French tax paperwork, telehealth for scheduling and consultations.",
    "Away from work I'm dad to a little boy who keeps me plenty busy. I cook for my family, grab a short trip whenever I can, and stay reliably geeky — side projects when I've got the energy, video games when I don't.",
  ] as string[],

  socials: [
    {
      label: "GitHub",
      url: "https://github.com/SevrainChea",
      icon: "mdi:github",
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/sevrainchea/",
      icon: "mdi:linkedin",
    },
    { label: "Email", url: "mailto:sevrain.chea@gmail.com", icon: "mdi:email" },
  ] as SocialLink[],

  experiences: [
    {
      title: "Head of Engineering",
      company: "Mayday",
      contract: "Full-Time",
      dates: "2021 — Present",
      duration: "5 yrs",
      positions: ["Founding Engineer", "Senior Engineer", "Tech Lead"],
      description:
        "Founding engineer through the €7M-ARR acquisition by USU GmbH in September 2025, building out the engineering team to eight along the way. I built the real-time collaborative editor on Y.js, rebuilt the notification system on RabbitMQ, and shipped the single- and multi-tenant database architecture and the LMS product. These days I'm moving the team onto agentic AI coding, and I still write code about half the week.",
      stack: [
        "Vue 3",
        "Nuxt",
        "TailwindCSS",
        "Node.js",
        "NestJS",
        "TypeScript",
        "GraphQL",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "RabbitMQ",
        "Python",
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
        "Ran a three-person backend team on the Maiia Pro web app. I owned the architecture and data models, planned and estimated the work, and mentored the other backend developers. On the product side I built the scheduling and payment features, wiring in Stripe for payments and Algolia for search.",
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
        "Started out in aerospace, embedded at Cobham, writing unit tests in C with RTRT and checking work against the technical requirements. Then a stint on an autonomous-vehicle proof of concept for Renault with Akka, where I wrote the test plans and ran functional validation on code that couldn't afford to fail.",
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
        "Worked on the GIP-MDS project behind the net-entreprises.fr portal: shipped features, covered them with unit tests, and prototyped a circuit breaker with Hystrix. I also led a four-person task force that cut the ticket backlog from 50 to under 20 in a single month.",
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
      projectLinks: [
        { name: "GIP-MDS", url: "https://www.net-entreprises.fr/" },
      ],
    },
    {
      title: "Software Engineer",
      company: "CineApps",
      contract: "Internship",
      dates: "2018",
      duration: "6 months",
      positions: [],
      description:
        "Built a Java monitoring tool for Twavox, a cinema accessibility device for hearing- and visually-impaired audiences. I ran it from requirements through to installing it on-site, wrote the documentation and user manuals, and trained the people who'd end up running it.",
      stack: ["Java", "Swing", "Linux"],
      companyLink: "https://www.linkedin.com/company/cineapps/",
      projectLinks: [{ name: "Twavox", url: "https://www.twavox.com/" }],
    },
  ] as Experience[],
};

export function usePortfolioData() {
  return portfolio;
}
