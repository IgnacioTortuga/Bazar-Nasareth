---
name: aspnet-core-backend
description: Implementar o mantener endpoints y lógica del backend C#/.NET 10 de Bazar Nazareth con ASP.NET Core Minimal APIs. Usar para contratos, validación, inyección de dependencias y manejo de imágenes en disco; derivar migraciones y auditorías de acceso a sus Skills específicas.
---

# Backend con Minimal APIs

## Propósito
Cambiar el comportamiento HTTP de forma compatible con React, siguiendo Agents.md. Program.cs concentra rutas, auxiliares y arranque; Models.cs contiene entidades y BazarDb. No introducir MVC, repositorios o capas nuevas sin una necesidad concreta del cambio.

## Procedimiento
1. Localizar el endpoint y su consumidor api() en main.jsx. Registrar verbo, ruta, entrada, salida y códigos de error existentes.
2. Seguir MapCrud, Validate y los auxiliares usados. Comprobar si la modificación afecta otras entidades que comparten el manejador genérico.
3. Diseñar el cambio mínimo. Si se extrae un servicio justificado, mantener los contratos y registrar su dependencia explícitamente; BazarDb se recibe por inyección con alcance por solicitud, nunca como singleton ni compartido entre tareas paralelas.
4. Validar entradas en el servidor y devolver errores controlados sin detalles internos. Conservar la comprobación de publicación tanto al guardar como al consultar /api/publico. Usar authentication-authorization cuando se cambien controles de acceso y ef-core-sqlserver cuando se cambien persistencia o transacciones.
5. Para imágenes, comprobar permiso, tamaño máximo actual de 5 MB, extensión, MIME y firma JPG/PNG/WebP. Mantener nombre físico generado con GUID, metadatos en SQL Server y archivo bajo ImageDirectory. Nunca utilizar directamente el nombre recibido como ruta física.
6. Tratar reemplazo como archivo nuevo y actualización de una referencia elegida. Preservar otros usos; impedir eliminar imágenes referenciadas. Analizar fallos entre escritura en disco y guardado de metadatos: no hay transacción conjunta automática. No borrar archivos huérfanos sin verificar propiedad, referencias y alcance autorizado.
7. Revisar el diff y compilar. Si el ejecutable está en uso, preferir salida temporal antes que detener servicios. Probar comportamiento solo en entorno aislado; el arranque puede modificar la base mediante EnsureCreatedAsync y datos iniciales.

## Convenciones
Ejemplo existente: admin.MapPut("/productos/{id:int}/imagenes", ...) recibe HttpContext y BazarDb, valida referencias y actualiza relaciones. Conservar rutas /api/admin y respuestas compatibles con api().

No convertir precios informativos o consultas por WhatsApp en pedidos, ventas o pagos. Reportar contratos afectados y verificaciones realmente ejecutadas.
