# Notas para agentes

- **Honestidad.** No inventes métricas, clientes, testimonios, fechas, años de experiencia ni tecnologías. Si falta un dato, deja un TODO (`todos:` en el frontmatter, `// TODO:` o `<Todo note="…" />`) y ejecuta `pnpm todos`.
- **Ubicación del contenido.** Los textos van en `src/i18n/{en,es}.ts`, los proyectos y la experiencia en `src/content/**`. No metas texto en los componentes.
- **Idiomas.** Todo cambio de contenido se hace en inglés y en español.
- **Antes de commitear:** `pnpm lint && pnpm check && pnpm build && pnpm test`.
- **Servidor.** Astro 7 pone `astro preview` en segundo plano si detecta un agente. Playwright usa `--ignore-lock` para evitarlo; si un preview se queda colgado: `pnpm astro preview stop`.
