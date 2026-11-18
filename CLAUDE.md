# Notas para agentes

- **Honestidad.** No inventes métricas, clientes, testimonios, fechas, años de experiencia ni tecnologías. Si falta un dato, deja un TODO (`todos:` en el frontmatter, `// TODO:` o `<Todo note="…" />`) y ejecuta `pnpm todos`.
- **Ubicación del contenido.** Los textos van en `src/i18n/{en,es}.ts`, los proyectos y la experiencia en `src/content/**`. No metas texto en los componentes.
- **Idiomas.** Todo cambio de contenido se hace en inglés y en español.
- **Antes de commitear:** `pnpm lint && pnpm check && pnpm build && pnpm test`.
- **Servidor.** El preview de Astro 7 puede quedarse en segundo plano. Si Playwright dice "webServer exited early", ejecuta `pnpm astro preview stop`.
