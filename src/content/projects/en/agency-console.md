---
title: Agency Console
tagline: Multi-tenant access control platform, built as a technical challenge in a hiring process.
problem: Employees of external agencies manage the finances of several client organisations. Each of them must see only the organisations they are assigned to, with the right permissions in each one.
contribution:
  - Built the React frontend and the Node.js backend in TypeScript.
  - Structured the backend with a hexagonal architecture and dependency inversion.
  - Designed a relational domain model where access is an explicit assignment.
  - Implemented two-layer authorization, enforced on the backend on every request.
  - Covered the authorization logic with Jest unit tests.
stack: [React, Vite, Node.js, Express, TypeScript, Hexagonal architecture, Jest]
status: prototype
links:
  repo: https://github.com/JuandaMT/Agency-Console
order: 1
visual: access
detailPage: true
todos:
  - 'Capturas o diagrama de arquitectura de Agency Console'
---

## Two-layer authorization

Authorization is enforced only on the backend, on every request. The frontend never decides access; it reflects what the API returns. The UI filters for user experience, the backend enforces for security, because a user could skip the UI and call the API directly.

It works as a double lock:

- **Lock 1, resource access:** can this employee access _this_ organisation? Only if an assignment links them to it. That covers "see only assigned organisations" and "deny the rest".
- **Lock 2, action scope:** within that organisation, _what_ can they do? The assignment carries a scope (finance), so anything outside it is denied.

Authentication and authorization stay separate: a middleware authenticates the request, and the use case and query authorize it.

## Domain model

The agency is a first-class entity, and access is a join table of explicit, per-employee assignments between agency employees and organisations. Access doesn't depend on being a member inside each organisation.

## Hexagonal architecture

The domain defines ports, infrastructure provides adapters, and dependencies always point inward. That makes the authorization logic testable in isolation with mocks and no database. For the challenge the app runs on an in-memory repository; a PostgreSQL implementation is included as a reference, and swapping it is one line in the composition root.

## Deliberate scope

Sign-in is simulated: the backend's token verification is mocked so the effort goes into the authorization model, where the real complexity is. In production this would be a real OIDC flow with JWT signature verification. The repository documents next steps: pagination for agencies with many organisations, an audit log, and evolving the scope into finer-grained roles.
