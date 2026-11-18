---
title: Agency Console
tagline: Plataforma multi-tenant de control de acceso, desarrollada como prueba técnica en un proceso de selección.
problem: Empleados de agencias externas gestionan las finanzas de varias organizaciones cliente. Cada uno debe ver solo las organizaciones que tiene asignadas, con los permisos correctos en cada una.
contribution:
  - Construí el frontend en React y el backend en Node.js, todo en TypeScript.
  - Estructuré el backend con arquitectura hexagonal e inversión de dependencias.
  - Diseñé un modelo de dominio relacional donde el acceso es una asignación explícita.
  - Implementé una autorización de doble capa, aplicada en el backend en cada petición.
  - Cubrí la lógica de autorización con tests unitarios en Jest.
stack: [React, Vite, Node.js, Express, TypeScript, Arquitectura hexagonal, Jest]
status: prototype
links:
  repo: https://github.com/JuandaMT/Agency-Console
order: 1
detailPage: true
todos:
  - 'Capturas o diagrama de arquitectura de Agency Console'
---

## Autorización de doble capa

La autorización se aplica solo en el backend, en cada petición. El frontend nunca decide el acceso: refleja lo que devuelve la API. La interfaz filtra por experiencia de usuario y el backend verifica por seguridad, porque un usuario podría saltarse la interfaz y llamar a la API directamente.

Funciona como un doble candado:

- **Candado 1, acceso al recurso:** ¿puede este empleado acceder a _esta_ organización? Solo si una asignación le vincula con ella. Así se cumple "ver solo las organizaciones asignadas" y "denegar el resto".
- **Candado 2, alcance de la acción:** dentro de esa organización, ¿_qué_ puede hacer? La asignación lleva un alcance (finanzas), y todo lo que queda fuera se deniega.

Autenticación y autorización van separadas: un middleware autentica la petición, y el caso de uso y la consulta la autorizan.

## Modelo de dominio

La agencia es una entidad de primer nivel, y el acceso es una tabla de asignaciones explícitas, por empleado, entre empleados de la agencia y organizaciones. El acceso no depende de pertenecer a cada organización.

## Arquitectura hexagonal

El dominio define puertos, la infraestructura aporta adaptadores y las dependencias siempre apuntan hacia dentro. Así la lógica de autorización se prueba de forma aislada con mocks y sin base de datos. Para la prueba la aplicación usa un repositorio en memoria; se incluye una implementación en PostgreSQL como referencia, y cambiarla es una línea en la composition root.

## Alcance deliberado

El inicio de sesión está simulado: la verificación del token en el backend está mockeada para centrar el esfuerzo en el modelo de autorización, que es donde está la complejidad real. En producción sería un flujo OIDC real con verificación de la firma JWT. El repositorio documenta los siguientes pasos: paginación para agencias con muchas organizaciones, un registro de auditoría y evolucionar el alcance hacia roles más finos.
