---
name: ef-core-sqlserver
description: Revisar o modificar el modelo, consultas y transacciones de Entity Framework Core 10 con SQL Server en Bazar Nazareth, y planificar migraciones preservando datos. Activar ante cambios de esquema, relaciones o EnsureCreatedAsync; no presupone autorización para operar sobre una base.
---

# Persistencia con EF Core y SQL Server

## Propósito y límites
Preservar datos y compatibilidad entre BazarDb, SQL Server y los contratos existentes, conforme a Agents.md. El proveedor real es Microsoft.EntityFrameworkCore.SqlServer, no MySQL. Inspeccionar claves de configuración sin exponer valores secretos de ConnectionStrings:Bazar.

## Procedimiento de modelo y consultas
1. Leer el csproj, AddDbContext/UseSqlServer en Program.cs y el mapeo afectado en Models.cs. Comprobar migraciones y snapshot existentes antes de asumir su ausencia o presencia.
2. Identificar tablas, columnas, nulabilidad, precisión y restricciones. Conservar claves compuestas de ProductoImagen y asociaciones de promociones, índices únicos de orden y la restricción Id = 1 de InformacionNegocio.
3. Seguir la consulta LINQ hasta su consumidor. Usar proyecciones y AsNoTracking cuando corresponda a lectura; no ejecutar consultas en paralelo sobre el mismo contexto. Conservar parametrización si se necesita SQL explícito.
4. Delimitar la unidad de cambio. Las relaciones de productos y promociones tienen transacciones locales, pero varios requests del frontend no comparten transacción. Evaluar guardados parciales sin prometer atomicidad entre SQL Server y archivos en disco.
5. Preparar cambios de código únicamente dentro del alcance solicitado; revisar impacto de Restrict y Cascade, datos existentes y posibles conflictos de índices. Verificar en una base aislada solo con autorización suficiente y sin alterar datos reales.

## Procedimiento para migraciones y EnsureCreatedAsync
1. Inventariar de forma estática el mecanismo de arranque. Actualmente usa EnsureCreatedAsync y siembra negocio y editor inicial; no arrancar la API como comprobación inocua de conexión.
2. Distinguir creación inicial de evolución de esquema: EnsureCreatedAsync no actualiza una base existente al cambiar el modelo. No combinarlo a ciegas con Migrate ni sustituirlo y ejecutar inmediatamente.
3. Antes de una transición, identificar base objetivo, historial real y diferencias entre modelo y esquema. Solicitar acceso o información que falte; usar consultas de solo lectura únicamente cuando estén autorizadas. El README no demuestra que sql/schema.sql cree tablas.
4. Diseñar una línea base coherente para una base creada con EnsureCreated. No marcar migraciones como aplicadas ni insertar filas en __EFMigrationsHistory sin comprobar equivalencia del esquema y un plan explícitamente autorizado. No asumir que una migración inicial puede aplicarse sobre tablas existentes.
5. Preparar para revisión los cambios y scripts, identificando renombres frente a borrado/recreación, valores de relleno, restricciones nuevas, copia de seguridad y recuperación. Generar artefactos solo si el encargo autoriza escribirlos; revisar SQL generado antes de ejecutarlo.
6. Ejecutar migraciones únicamente si la autorización incluye aplicar el cambio a esa base, con respaldo y validación de recuperación. Si el usuario pidió solo análisis o preparación, detenerse tras entregar los artefactos. Nunca ejecutar EnsureDeleted, DROP o reinicialización para resolver conflictos.

## Ejemplo
Al añadir un campo obligatorio a Producto con datos existentes, evaluar primero un campo nullable o un valor de relleno validado y después la restricción. Presentar un plan por etapas; no eliminar productos para que la migración pase.

Entregar diferencias previstas, impacto en datos, comprobaciones realizadas y operaciones pendientes, sin presentar una compilación como validación del esquema desplegado.
