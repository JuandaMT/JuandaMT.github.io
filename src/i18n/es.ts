import type { UI } from './en';

/** Spanish copy. Must have exactly the same keys as en.ts (TypeScript enforces it). */
const es: UI = {
  meta: {
    role: 'Desarrollador full stack',
    description:
      'Desarrollador full stack en Valencia. Construyo productos SaaS de principio a fin con React, Node.js y TypeScript, y los entrego con agentes de IA bajo revisión y verificación.',
  },
  a11y: {
    skip: 'Saltar al contenido',
    themeToggle: 'Cambiar modo oscuro',
    switchLang: 'View this page in English',
    mainNav: 'Principal',
    home: 'Juan David Mayorga, inicio',
    external: '(se abre en una pestaña nueva)',
  },
  nav: {
    about: 'Sobre mí',
    experience: 'Experiencia',
    projects: 'Proyectos',
    ai: 'Flujo con IA',
    contact: 'Contacto',
  },
  hero: {
    eyebrow: 'Desarrollador full stack · Valencia',
    title:
      'Construyo productos SaaS de principio a fin y los entrego con agentes de IA bajo revisión.',
    lead: 'Tres años en producción como desarrollador principal de una plataforma SaaS que construí desde cero: React y TypeScript en el frontend, una API en Node.js con Domain-Driven Design en el backend, y pagos, autenticación y tiempo real entre medias.',
    ctaProjects: 'Ver proyectos',
    ctaCv: 'Descargar CV',
    ctaContact: 'Contactar',
    traceLabel: 'Cómo se entrega cada cambio',
    trace: ['spec', 'implementar', 'revisar', 'verificar'],
    status:
      'Abierto a puestos full stack, frontend o backend en empresas de producto · remoto o híbrido en Valencia',
  },
  about: {
    label: '01 / contexto',
    title: 'Sobre mí',
    // TODO: revisar el tono del "Sobre mí" (borrador escrito a partir del brief).
    paragraphs: [
      'Soy desarrollador full stack en Valencia. Desde 2023 soy el desarrollador principal de BiMMate, una startup SaaS para el sector AECO (arquitectura, ingeniería y construcción), nacida en la aceleradora Lanzadera, donde construí la plataforma desde cero: la API REST y su modelo de dominio, la librería de componentes, los pagos, la autenticación, el tiempo real y la facturación automatizada.',
      'Me gusta hacerme cargo de una funcionalidad desde la primera conversación hasta producción: entender el problema, elegir la arquitectura, escribir el código y los tests, y mantenerla funcionando.',
      'También construyo con agentes de IA, con barandillas: primero la especificación, una revisión de seguridad automatizada, hooks que frenan el código sin revisar y tests antes de entregar nada.',
    ],
  },
  experience: {
    label: '02 / registro',
    title: 'Experiencia',
    present: 'Actualidad',
    stack: 'Stack',
  },
  projects: {
    label: '03 / construir',
    title: 'Proyectos',
    intro: 'Una selección de productos y experimentos. Los principales tienen caso de estudio.',
    status: {
      production: 'En producción',
      'in-development': 'En desarrollo',
      'user-testing': 'En pruebas con usuarios',
      published: 'Publicado',
      prototype: 'Prototipo',
    },
    problem: 'Problema',
    contribution: 'Qué hice',
    stack: 'Stack',
    links: 'Enlaces',
    caseStudy: 'Ver caso de estudio',
    repo: 'Código',
    demo: 'Demo',
    live: 'Visitar',
    back: 'Todos los proyectos',
    labTitle: 'Laboratorio',
    labIntro: 'Experimentos fuera de mi stack del día a día.',
  },
  ai: {
    label: '04 / revisar',
    title: 'Cómo trabajo con IA',
    intro:
      'Los agentes de IA escriben buena parte de mi código. Yo sigo siendo responsable de cada línea, así que el flujo gira en torno a la revisión y la verificación, no solo a la velocidad.',
    // TODO: confirmar que estos pasos reflejan tu flujo real y su orden.
    steps: [
      {
        name: 'Spec',
        tag: 'entrada',
        text: 'Parto de una especificación escrita: alcance, criterios de aceptación y restricciones. El agente trabaja a partir de ella, no de un prompt vago.',
      },
      {
        name: 'Implementar',
        tag: 'agente',
        text: 'Claude Code implementa en pasos pequeños contra la especificación, con commits que puedo leer y revertir.',
      },
      {
        name: 'Auditar',
        tag: 'subagente',
        text: 'Un subagente dedicado a auditoría de seguridad revisa cada cambio antes de que avance.',
      },
      {
        name: 'Bloquear',
        tag: 'hook',
        text: 'Unos hooks bloquean el push de código que no se ha revisado, para que nada se cuele por accidente.',
      },
      {
        name: 'Verificar',
        tag: 'tests + humano',
        text: 'Los tests y mi propia revisión cierran el ciclo. Yo decido qué se integra.',
      },
    ],
    pluginNote:
      'Empaqueté el subagente de auditoría y los hooks como un plugin de Claude Code que se instala con un solo comando, para reutilizarlos entre proyectos.',
    notebook: 'He puesto por escrito lo aprendido en un cuaderno público sobre flujos agénticos.',
    notebookCta: 'Leer el Cuaderno de Claude Code',
  },
  skills: {
    label: '05 / stack',
    title: 'Habilidades',
    groups: [
      {
        name: 'Frontend',
        items: [
          'React 18 / 19',
          'Angular',
          'TypeScript / JavaScript',
          'Tailwind CSS',
          'Material UI',
          'Zustand · Redux',
          'Librerías de componentes y sistemas de diseño',
          'i18n',
          'Figma',
        ],
      },
      {
        name: 'Backend',
        items: ['Node.js', 'Express', 'APIs REST', 'Socket.io', 'PHP · Symfony', 'Cron jobs'],
      },
      {
        name: 'Arquitectura y seguridad',
        items: [
          'Domain-Driven Design',
          'Arquitectura hexagonal y por capas',
          'JWT · RBAC',
          'Autorización multi-tenant',
          'CORS · verificación de webhooks',
        ],
      },
      {
        name: 'Datos e integraciones',
        items: [
          'Firestore',
          'PostgreSQL · MySQL · MariaDB',
          'MongoDB',
          'Stripe (pagos y suscripciones)',
          'Login con Google y Microsoft',
          'Google Drive · MapBox',
        ],
      },
      {
        name: 'DevOps y calidad',
        items: [
          'Docker',
          'Linux',
          'CI/CD',
          'Google Cloud · AWS',
          'Jest · Firebase Emulator Suite',
          'TDD · code review',
          'Monorepos con Turborepo',
          'Scrum',
        ],
      },
      {
        name: 'Desarrollo asistido por IA',
        items: [
          'Claude Code: subagentes, hooks, MCP, skills, plugins',
          'Spec-driven development',
          'Cursor · GitHub Copilot',
          'ComfyUI',
        ],
      },
    ],
    educationTitle: 'Formación',
    education: [
      {
        title: 'CFGS Desarrollo de Aplicaciones Web (DAW)',
        org: 'Florida Universitaria',
        year: '2026',
      },
      { title: 'Bootcamp Full Stack Developer', org: 'EDEM × The Bridge', year: '2023' },
    ],
    languagesTitle: 'Idiomas',
    languages: ['Español: nativo', 'Inglés: B2'],
  },
  contact: {
    label: '06 / entregar',
    title: 'Hablemos',
    text: 'Busco puestos full stack, frontend o backend en empresas de producto que construyen con IA. En remoto o en híbrido en Valencia.',
    email: 'Email',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    cvTitle: 'CV',
    cvEn: 'Inglés (PDF)',
    cvEs: 'Español (PDF)',
  },
  footer: {
    builtWith: 'Hecho con Astro y Tailwind CSS. Sin cookies ni rastreadores.',
  },
  lab: {
    title: 'Portfolio interactivo',
    description:
      'Versión interactiva del portfolio de Juan David Mayorga, dibujada como un juego de planos: su stack, su flujo de desarrollo agéntico, sus proyectos y su experiencia.',
    classic: 'Versión clásica',
    interactive: 'Versión interactiva',
    interactiveCta: 'Ver la versión interactiva de este portfolio',
    sheet: 'Lámina',
    eyebrow: 'Alzado · Desarrollador full stack · Valencia',
    lead: 'Construyo productos SaaS de principio a fin y los entrego con agentes de IA bajo revisión. En esta página, cinco agentes dibujan el plano y lo dejan revisado.',
    titleBlock: {
      label: 'Cajetín',
      project: 'Proyecto',
      projectValue: 'Portfolio · J. D. Mayorga',
      drawing: 'Plano',
      drawingValue: 'Alzado · stack',
      scale: 'Escala',
      role: 'Rol',
      sheet: 'Hoja',
      revision: 'Rev.',
      agents: 'agentes',
      strokes: 'trazos',
      stamp: 'Verificado',
    },
    drawing: {
      levels: ['Infra · DevOps', 'Backend · Node.js', 'Frontend · React', 'Agentes · Claude Code'],
      dimension: 'Sep 2023 → hoy · BiMMate',
    },
    flowLabel: 'El ciclo',
    flowTitle: 'Cada cambio pasa por el mismo ciclo.',
    scheduleLabel: 'Programa de obra',
    phases: ['Proyecto', 'Ejecución', 'Inspección', 'Licencia', 'Entrega'],
    workLabel: 'Proyectos',
    workHint: 'Haz scroll: cada proyecto aparece con su elemento característico',
    caseStudy: 'Caso de estudio',
    materials: 'Materiales',
    ref: 'Ref.',
    experienceLabel: 'Experiencia',
    stackLabel: 'Leyenda de materiales',
    contactLabel: 'Entrega',
    contactCta: 'Escríbeme',
  },
  notFound: {
    title: 'Página no encontrada',
    text: 'Esta página no existe o ha cambiado de sitio.',
    back: 'Volver al inicio',
  },
};

export default es;
