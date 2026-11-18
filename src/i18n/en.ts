/**
 * English copy. This file defines the shape every other language must follow (see es.ts).
 * Projects and experience live in src/content as Markdown.
 */
const en = {
  meta: {
    role: 'Full stack developer',
    description:
      'Full stack developer in Valencia, Spain. I build SaaS products end to end with React, Node.js and TypeScript, and ship with AI agents under review and verification.',
  },
  a11y: {
    skip: 'Skip to content',
    themeToggle: 'Toggle dark mode',
    switchLang: 'Ver esta página en español',
    mainNav: 'Main',
    home: 'Juan David Mayorga, home',
    external: '(opens in a new tab)',
  },
  nav: {
    about: 'About',
    experience: 'Experience',
    projects: 'Projects',
    ai: 'AI workflow',
    contact: 'Contact',
  },
  hero: {
    eyebrow: 'Full stack developer · Valencia, Spain',
    title: 'I build SaaS products end to end, and ship them with AI agents under review.',
    lead: 'Three years in production as lead developer of a SaaS platform I built from scratch: React and TypeScript on the front, a domain-driven Node.js API on the back, and payments, auth and real time in between.',
    ctaProjects: 'See projects',
    ctaCv: 'Download CV',
    ctaContact: 'Get in touch',
    traceLabel: 'How every change ships',
    trace: ['spec', 'implement', 'review', 'verify'],
    status: 'Open to full stack, frontend or backend roles at product companies · remote or hybrid in Valencia',
  },
  about: {
    label: '01 / context',
    title: 'About',
    // TODO: revisar el tono del "Sobre mí" (borrador escrito a partir del brief).
    paragraphs: [
      'I’m a full stack developer based in Valencia. Since 2023 I’ve been the lead developer at BiMMate, a SaaS startup from the Lanzadera accelerator, where I built the platform from scratch: the REST API and its domain model, the component library, payments, authentication, real-time features and automated invoicing.',
      'I like owning a feature from the first conversation to production: understanding the problem, choosing the architecture, writing the code and the tests, and keeping it running.',
      'I also build with AI agents, with guardrails: specs first, an automated security review, hooks that stop unreviewed code, and tests before anything ships.',
    ],
  },
  experience: {
    label: '02 / log',
    title: 'Experience',
    present: 'Present',
    stack: 'Stack',
  },
  projects: {
    label: '03 / build',
    title: 'Projects',
    intro: 'A selection of products and experiments. The main ones have a case study.',
    status: {
      production: 'In production',
      'in-development': 'In development',
      'user-testing': 'Testing with users',
      published: 'Published',
      prototype: 'Prototype',
    },
    problem: 'Problem',
    contribution: 'What I did',
    stack: 'Stack',
    links: 'Links',
    caseStudy: 'Read case study',
    repo: 'Code',
    demo: 'Demo',
    live: 'Visit',
    back: 'All projects',
    labTitle: 'Side lab',
    labIntro: 'Experiments outside my day-to-day stack.',
  },
  ai: {
    label: '04 / review',
    title: 'How I work with AI',
    intro:
      'AI agents write a lot of my code. I stay responsible for every line, so the workflow is built around review and verification, not speed alone.',
    // TODO: confirmar que estos pasos reflejan tu flujo real y su orden.
    steps: [
      {
        name: 'Spec',
        tag: 'input',
        text: 'I start from a written spec: scope, acceptance criteria and constraints. The agent works from it, not from a vague prompt.',
      },
      {
        name: 'Implement',
        tag: 'agent',
        text: 'Claude Code implements in small steps against the spec, leaving commits I can read and revert.',
      },
      {
        name: 'Audit',
        tag: 'subagent',
        text: 'A dedicated security-audit subagent reviews every change before it moves on.',
      },
      {
        name: 'Gate',
        tag: 'hook',
        text: 'Hooks block code that hasn’t been reviewed, so nothing slips through by accident.',
      },
      {
        name: 'Verify',
        tag: 'tests + human',
        text: 'Tests and my own review close the loop. I decide what gets merged.',
      },
    ],
    pluginNote:
      'I packaged this workflow as a Claude Code plugin so I can reuse it across projects.',
    notebook: 'I wrote down what I’ve learned in a public notebook on agentic workflows.',
    notebookCta: 'Read the Claude Code notebook',
  },
  skills: {
    label: '05 / stack',
    title: 'Skills',
    groups: [
      {
        name: 'Frontend',
        items: [
          'React 18 / 19',
          'TypeScript',
          'Angular',
          'Tailwind CSS',
          'Material UI',
          'Zustand',
          'Component libraries & design systems',
          'i18n',
        ],
      },
      {
        name: 'Backend',
        items: [
          'Node.js',
          'Express',
          'REST APIs',
          'Domain-Driven Design',
          'Layered & hexagonal architecture',
          'Socket.io',
          'Cron jobs',
        ],
      },
      {
        name: 'Data & integrations',
        items: [
          'Firestore',
          'Stripe (payments & subscriptions)',
          'Google & Microsoft sign-in',
          'Google Drive',
          'MapBox',
        ],
      },
      {
        name: 'Security',
        items: ['JWT', 'RBAC', 'CORS', 'Webhook verification', 'Multi-tenant authorization'],
      },
      {
        name: 'Quality & delivery',
        items: ['Jest', 'Integration tests (Firestore emulator)', 'Docker', 'Turborepo monorepos'],
      },
      {
        name: 'AI',
        items: [
          'Claude Code',
          'Subagents, hooks & plugins',
          'Spec-driven development',
          'ComfyUI',
        ],
      },
    ],
    educationTitle: 'Education',
    education: [
      {
        title: 'Higher National Diploma in Web Application Development (CFGS DAW)',
        org: 'Florida Universitaria',
        year: '', // TODO: año de finalización del CFGS
      },
      { title: 'Full Stack Development Bootcamp', org: 'EDEM × The Bridge', year: '2023' },
    ],
    languagesTitle: 'Languages',
    languages: ['Spanish: native', 'English: B2'],
  },
  contact: {
    label: '06 / ship',
    title: 'Let’s talk',
    text: 'I’m looking for full stack, frontend or backend roles at product companies building with AI. Remote, or hybrid in Valencia.',
    email: 'Email',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    cvTitle: 'CV',
    cvEn: 'English (PDF)',
    cvEs: 'Spanish (PDF)',
  },
  footer: {
    builtWith: 'Built with Astro and Tailwind CSS. No cookies, no trackers.',
  },
  notFound: {
    title: 'Page not found',
    text: 'This page doesn’t exist or has moved.',
    back: 'Back to home',
  },
};

export default en;
export type UI = typeof en;
