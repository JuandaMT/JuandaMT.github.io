---
title: Online coaching platform
tagline: SaaS in development, heading to launch.
contribution:
  - Building the product end to end.
  - 'Developing it with my agentic workflow in Claude Code: a security-audit subagent and hooks that block pushes of unreviewed code, packaged as a plugin that installs with a single command.'
  - Automating production processes.
status: in-development
linkNote: Private code · demo on request
order: 2
detailPage: true
todos:
  - 'Qué problema resuelve y para quién'
  - 'Stack del proyecto'
  - 'Confirmar qué partes del flujo agéntico se usan aquí y un ejemplo concreto'
---

## Why it's here

This is the project where I apply my agentic workflow most fully. The code is private while the product heads to launch, but I'm happy to walk through it in a demo.

## How it's being built

- **Spec first.** Each feature starts from a written spec with acceptance criteria.
- **Agent implementation.** Claude Code implements against the spec in small, reviewable steps.
- **Security audit.** A dedicated subagent audits the changes.
- **Gates.** Hooks block pushes of code that hasn't been reviewed.
- **Reusable.** The subagent and the hooks are packaged as a Claude Code plugin that installs with a single command.

<!-- TODO: añadir un ejemplo real (una feature concreta y cómo pasó por el flujo). -->
