/**
 * Language-independent profile data: name, links, CV files.
 * Edit here; components read from this file.
 */
export const profile = {
  name: 'Juan David Mayorga',
  shortName: 'Juanda',
  locality: 'Valencia',
  country: 'ES',
  // TODO: email público de contacto (no se muestra el bloque de email hasta que esté).
  email: '',
  links: {
    linkedin: 'https://www.linkedin.com/in/juandamt',
    github: 'https://github.com/JuandaMT',
    notebook: 'https://juandamt.github.io/apuntes-claude-code/',
    bimmate: '', // TODO: URL pública de BiMMate (opcional)
  },
  // Files live in /public/cv. The download button only renders when the file exists.
  // TODO: añadir los PDF del CV en public/cv/ con estos nombres.
  cv: {
    en: '/cv/juan-david-mayorga-cv-en.pdf',
    es: '/cv/juan-david-mayorga-cv-es.pdf',
  },
} as const;
