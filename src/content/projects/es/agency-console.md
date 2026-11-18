---
title: Agency Console
tagline: Plataforma multi-tenant de control de acceso.
contribution:
  - Construí el frontend en React y el backend en Node.js, todo en TypeScript.
  - Estructuré el backend con arquitectura hexagonal (puertos y adaptadores).
  - Implementé un modelo de autorización de doble capa para el acceso multi-tenant.
  - Cubrí el núcleo con tests en Jest.
stack: [React, Node.js, TypeScript, Arquitectura hexagonal, Jest]
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

## Arquitectura

El backend sigue una arquitectura hexagonal: el dominio y sus casos de uso no dependen de Express, de la base de datos ni de ningún otro framework. Se comunican con el exterior mediante puertos, y los adaptadores implementan esos puertos. Así las reglas de negocio se pueden probar de forma aislada con Jest.

<!-- TODO: añadir qué módulos tiene el dominio y por qué elegiste hexagonal aquí. -->

## Autorización de doble capa

El acceso se comprueba en dos capas en lugar de en un único punto.

<!-- TODO: describir las dos capas (p. ej. tenant y permisos) con tus palabras. No lo he rellenado para no inventar. -->
