---
name: project-analysis
description: Analizar la arquitectura, dependencias y flujos de Bazar Nazareth cuando se solicite comprender el proyecto o evaluar el alcance de un cambio. Produce un diagnóstico con evidencia; no implementa cambios por una petición de análisis.
---

# Análisis del proyecto

## Propósito y contexto
Reconstruir el flujo real y distinguir hechos, riesgos y propuestas. Leer las instrucciones generales de Agents.md en la raíz (AGENTS.md si se renombra); no repetirlas en cada diagnóstico.

La referencia arquitectónica comprobada es C#/.NET 10, ASP.NET Core Minimal APIs, EF Core 10 y SQL Server; React y Vite en el frontend, cookies para acceso e imágenes en disco. Agents.md aún menciona MySQL y backend desconocido: señalar esa discrepancia, conservar sus restricciones de protección y comprobar el código antes de concluir. No cambiar documentación automáticamente.

## Procedimiento
1. Delimitar la pregunta y enumerar solo archivos relevantes, excluyendo bin, obj, node_modules y secretos.
2. Comprobar versiones en backend/BazarNazareth.csproj y frontend/package.json. Seguir el arranque en backend/Program.cs y la configuración del proxy en frontend/vite.config.js.
3. Trazar el flujo solicitado entre frontend/src/main.jsx, endpoint, validaciones, BazarDb y entidades en backend/Models.cs. Los endpoints actuales son lambdas; no asumir controladores MVC ni servicios de negocio separados.
4. Identificar límites de responsabilidad, contratos JSON, permisos, persistencia y efectos secundarios. El arranque llama EnsureCreatedAsync y puede insertar registros iniciales: un análisis estático no requiere iniciar la API.
5. Contrastar README y sql/schema.sql con la implementación antes de recomendar comandos. El script SQL observado contiene una consulta de editores, no un esquema de creación.
6. Entregar un mapa con archivos y símbolos, hallazgos priorizados, incertidumbres y siguiente cambio mínimo. Distinguir lectura estática de comportamiento probado.

## Ejemplo y límites
Para «explica cómo se reemplaza una imagen», seguir replaceImage, POST /api/admin/imagenes, el PUT del contenido y la referencia ImagenId; explicar que archivo y referencia son pasos distintos.

No iniciar procesos, consultar SQL Server o modificar datos como consecuencia implícita de analizar. Para trabajo especializado usar solo la Skill pertinente: aspnet-core-backend para endpoints, ef-core-sqlserver para persistencia, authentication-authorization para seguridad, frontend-development para interfaz, debugging para fallos y code-review para revisar cambios.
