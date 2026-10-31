---
name: code-review
description: Revisar cambios o código concreto de Bazar Nazareth para detectar errores, regresiones y riesgos con evidencia y prioridades. Usar cuando se solicite una revisión técnica o del diff; entregar hallazgos sin corregir archivos salvo autorización adicional.
---

# Revisión de código

## Propósito
Evaluar corrección y compatibilidad del cambio con el flujo existente, conforme a Agents.md. Priorizar defectos demostrables sobre preferencias de estilo; una arquitectura general se analiza con project-analysis.

## Procedimiento
1. Identificar alcance y base de comparación. Leer el diff y contexto mínimo; distinguir cambios previos del usuario. Si no hay referencia disponible, declarar que se revisa el estado actual, no atribuir defectos a un cambio específico.
2. Seguir cada cambio desde su consumidor hasta sus efectos: request React, Minimal API, validación, permiso, entidad y archivo físico cuando aplique. Revisar cambios de contrato y casos que fallan a mitad del flujo.
3. Comprobar invariantes afectados: publicación con categoría activa, vigencia de promociones calculada por fechas, uso único de InformacionNegocio y reemplazo de una sola referencia de imagen. No ampliar la revisión a toda la aplicación sin justificación.
4. Para cambios de persistencia usar ef-core-sqlserver; para cambios de acceso usar authentication-authorization. Evaluar el resultado de sus procedimientos en el contexto del diff, sin duplicar listas generales de auditoría.
5. Sustentar cada hallazgo con ubicación precisa, escenario realista, efecto y corrección mínima. Separar vulnerabilidad confirmada de política ambigua; no afirmar que una ruta es insegura solo porque usa Minimal APIs.
6. Revisar evidencia de pruebas disponible. Si hacen falta comprobaciones, elegir las que no muten datos reales ni arranquen una API que inicialice el esquema; señalar expresamente cualquier comportamiento no verificado. No ejecutar migraciones como parte de una revisión.

## Formato de entrega
Presentar primero hallazgos ordenados por gravedad: bloqueo crítico, defecto importante, defecto moderado o mejora menor. Incluir archivo y línea, condición y consecuencia; omitir hallazgos puramente especulativos. Después indicar preguntas y límites de verificación. Si no hay hallazgos, decirlo sin afirmar ausencia absoluta de errores.

Ejemplo de hallazgo útil: «Guardar producto y relaciones ocurre en dos solicitudes; si la segunda falla, la interfaz informa error pero los campos ya se guardaron». Comprobar el escenario en el código y el impacto antes de asignar prioridad.

No reformatear, aplicar arreglos, cambiar dependencias o generar datos durante una petición de revisión. La recomendación de una mejora no autoriza implementarla.
