# Portfolio · Juan David Mayorga

Web personal estática en inglés (`/`) y español (`/es/`). Hecha con **Astro 7 + TypeScript + Tailwind CSS 4**, sin frameworks de cliente: el único JS que llega al navegador es el cambio de tema (~1 KB).

- Lighthouse 100 / 100 / 100 / 100 en local (el CI falla por debajo de 95).
- Accesibilidad comprobada con axe (WCAG 2.2 A/AA) en modo claro y oscuro.
- SEO: canonical, `hreflang` (en, es, x-default), Open Graph con imagen por página, sitemap y `robots.txt`.

## Versión interactiva (`/lab/`)

`/lab/` y `/es/lab/` son una versión interactiva del portfolio con la temática **plano de obra**, enlazada desde el bloque "Laboratorio" y desde el pie de página. Usa el mismo contenido que la web clásica (`src/content`, `src/i18n`).

- **Alzado del stack** (Canvas 2D, `src/scripts/lab/blueprint.ts`): cinco agentes toman trazos de una cola común y dibujan un edificio de cuatro plantas (infra, backend, frontend, agentes). Al terminar, el cajetín se sella como verificado.
- **Comportamiento** (GSAP + ScrollTrigger + Lenis, `src/scripts/lab/main.ts`):
  - el ciclo agéntico queda fijado en pantalla y avanza un programa de obra (diagrama de Gantt) con el scroll;
  - cada proyecto es una lámina; al pasar el cursor, un agente repasa su contorno;
  - cursor de CAD con coordenadas que se engancha a los vértices del dibujo;
  - dos papeles, cianotipo y calco, que se recuerdan por visitante (`localStorage`).
- **Estilos**: `src/styles/lab.css`. Tipografías Barlow Condensed e IBM Plex Mono (autoalojadas con Fontsource).
- **Mejora progresiva**: sin JS es un documento completo; con `prefers-reduced-motion` el plano aparece ya dibujado y nada se fija ni se anima.
- **Lighthouse**: ≥ 95 en todo, igual que la web clásica.

## Requisitos

- Node 24 (ver `.nvmrc`; mínimo 22.23)
- pnpm 9

## Comandos

```bash
pnpm install
pnpm dev          # http://localhost:4321 (muestra los TODO en rojo)
pnpm build        # genera dist/ (los TODO no se muestran)
pnpm preview      # sirve dist/
```

| Comando       | Qué hace                                                        |
| ------------- | --------------------------------------------------------------- |
| `pnpm lint`   | ESLint (incluye reglas de accesibilidad) + Prettier             |
| `pnpm check`  | Typecheck de `.astro` y `.ts`                                   |
| `pnpm test`   | Playwright contra la build: páginas, enlaces, idioma, tema, axe |
| `pnpm lhci`   | Lighthouse CI sobre `dist/` (umbral 95 en las 4 categorías)     |
| `pnpm og`     | Regenera las imágenes Open Graph en `public/og/`                |
| `pnpm todos`  | Regenera `TODO.md` con todo lo pendiente                        |
| `pnpm format` | Formatea el código con Prettier                                 |

> Para `pnpm test` y `pnpm og` hace falta Chromium de Playwright una vez: `pnpm exec playwright install chromium`.
> Para `pnpm lhci` en macOS, apunta `CHROME_PATH` a un Chrome instalado (en CI no hace falta).

## Editar el contenido

Para cambiar el contenido no hace falta tocar componentes.

| Qué                                                                 | Dónde                                       |
| ------------------------------------------------------------------- | ------------------------------------------- |
| Textos de la web (hero, sobre mí, flujo IA, habilidades, contacto…) | `src/i18n/en.ts` y `src/i18n/es.ts`         |
| Experiencia                                                         | `src/content/experience/{en,es}/*.md`       |
| Proyectos y casos de estudio                                        | `src/content/projects/{en,es}/*.md`         |
| Email, enlaces y nombres de los CV                                  | `src/data/profile.ts`                       |
| CV en PDF                                                           | `public/cv/` (nombres en `profile.ts`)      |
| Colores y tipografía                                                | `src/styles/global.css` (tokens en `:root`) |

- **Los idiomas están tipados.** `es.ts` tiene que tener exactamente las mismas claves que `en.ts`; si falta alguna, `pnpm check` falla.
- **Los Markdown se validan con Zod** (`src/content.config.ts`). Un campo mal escrito rompe la build con un mensaje claro.
  - Si un texto contiene `:`, ponlo entre comillas.

### Añadir un proyecto

1. Crea `src/content/projects/en/mi-proyecto.md` y `src/content/projects/es/mi-proyecto.md`. El nombre del fichero es la URL.
2. Rellena el frontmatter:

   ```yaml
   ---
   title: Mi proyecto
   tagline: Una línea para la tarjeta.
   problem: Qué problema resuelve. # opcional
   contribution: # qué hice
     - ...
   stack: [React, TypeScript]
   status: production # production | in-development | user-testing | published | prototype
   links:
     repo: https://github.com/...
     demo: https://...
   linkNote: Código privado · demo bajo petición # opcional
   order: 7 # posición en la lista
   detailPage: true # genera /projects/mi-proyecto/ con el cuerpo del Markdown
   tier: main # main | lab
   todos: [] # datos que faltan
   ---
   ```

3. Si tiene página de detalle, ejecuta `pnpm og` para generar su imagen para compartir.

### CV

Copia los PDF a `public/cv/juan-david-mayorga-cv-en.pdf` y `public/cv/juan-david-mayorga-cv-es.pdf`. Los botones de descarga aparecen solos en cuanto los ficheros existen.

## Datos pendientes (TODOs)

Regla del proyecto: **no se inventa ningún dato**. Cada dato que falta tiene su marcador:

- `todos:` en el frontmatter de los Markdown;
- `// TODO:` en código y `<!-- TODO: -->` en Markdown;
- `<Todo note="…" />` en componentes. Se ve en rojo en `pnpm dev` y nunca en producción; hay un test que lo comprueba.

`pnpm todos` los reúne todos en [`TODO.md`](TODO.md).

## Despliegue (GitHub Pages)

El workflow `.github/workflows/ci.yml` se ejecuta en cada push:

1. **verify**: lint, typecheck, build, Playwright (escritorio y móvil) y Lighthouse.
2. **deploy**: solo en `main`, y solo si `verify` pasa. Publica `dist/` en GitHub Pages.

Puesta en marcha (una vez):

1. Crea el repositorio público `JuandaMT/JuandaMT.github.io` y sube el código a `main`.
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. La web queda en `https://juandamt.github.io/`. El cuaderno sigue en `/apuntes-claude-code/`, porque es otro repositorio.

¿Dominio propio? Cambia `site` en `astro.config.mjs`, añade `public/CNAME` y actualiza la URL de `public/robots.txt` y la de `scripts/og.mjs`.

## Decisiones técnicas

- **Sin islas de React.** El tema, el idioma y la navegación no lo necesitan. Si algún día hace falta una galería interactiva, `pnpm astro add react` y `client:visible` en ese único componente.
- **Fuentes autoalojadas** con Fontsource (Geist y JetBrains Mono), sin peticiones a Google.
- **TypeScript 6 fijado.** `astro check` y `typescript-eslint` aún no soportan TypeScript 7.
- **Las imágenes OG se generan con Playwright** (`scripts/og.mjs`) y se versionan. Así no hace falta Satori ni otra dependencia en la build.
- **Animaciones** con CSS (scroll-driven y keyframes) y desactivadas con `prefers-reduced-motion`.

## Estructura

```
src/
  components/        Header, Footer, ThemeToggle, LangSwitch, ProjectCard, Todo…
    sections/        Hero, About, Experience, Projects, AiWorkflow, Skills, Contact
    pages/           Home y ProjectDetail (compartidas por /en y /es)
  content/           Markdown de proyectos y experiencia
  content.config.ts  Esquemas Zod
  data/profile.ts    Datos sin traducción
  i18n/              en.ts, es.ts, utils.ts
  layouts/Base.astro SEO, hreflang, tema sin parpadeo
  pages/             index, projects/[slug], 404 y su espejo en es/
scripts/             og.mjs, todos.mjs
tests/               Playwright
```
