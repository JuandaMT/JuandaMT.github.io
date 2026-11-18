---
title: Agency Console
tagline: Multi-tenant access control platform.
contribution:
  - Built the React frontend and the Node.js backend in TypeScript.
  - Structured the backend with a hexagonal architecture (ports and adapters).
  - Implemented a two-layer authorization model for multi-tenant access.
  - Covered the core with Jest tests.
stack: [React, Node.js, TypeScript, Hexagonal architecture, Jest]
order: 1
detailPage: true
todos:
  - 'Confirmar que la lista "Qué hice" es correcta (redactada a partir del brief)'
  - 'Enlace al repositorio de Agency Console'
  - 'Problema que resuelve y para quién (campo problem)'
  - 'Estado del proyecto (campo status)'
  - 'Cómo funciona exactamente la autorización de doble capa'
  - 'Capturas o diagrama de arquitectura'
---

## Architecture

The backend follows a hexagonal architecture: the domain and its use cases don't depend on Express, the database or any other framework. They talk to the outside world through ports, and adapters implement those ports. That keeps the business rules testable in isolation with Jest.

<!-- TODO: añadir qué módulos tiene el dominio y por qué elegiste hexagonal aquí. -->

## Two-layer authorization

Access is checked in two layers rather than in a single place.

<!-- TODO: describir las dos capas (p. ej. tenant y permisos) con tus palabras. No lo he rellenado para no inventar. -->
