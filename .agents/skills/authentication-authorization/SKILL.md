---
name: authentication-authorization
description: Revisar o corregir acceso al editor de Bazar Nazareth mediante cookies, permisos por endpoint, ciclo de sesiones y protección CSRF. Usar ante cambios de login, permisos o seguridad de requests; no migrar el proyecto a JWT o Identity por defecto.
---

# Autenticación y autorización

## Propósito
Verificar quién puede acceder a cada operación y cómo se mantiene o revoca su sesión. Seguir las restricciones de secretos de Agents.md. El sistema actual usa cookies ASP.NET Core, entidad Editor, Actor/Allowed y permisos separados por comas; no asumir roles, JWT ni ASP.NET Core Identity.

## Procedimiento
1. Trazar /api/login, /api/session, /api/logout, AddCookie, UseAuthentication y UseAuthorization. Inspeccionar código y configuración relevante sin imprimir contraseñas, cookies o hashes.
2. Construir una matriz de verbo/ruta, acceso anónimo, editor activo, permiso requerido y acceso completo. Incluir GET, escritura, endpoints genéricos MapCrud y /api/imagenes/{id}/archivo. RequireAuthorization exige sesión, pero no demuestra permiso de sección.
3. Comparar política esperada con Actor y Allowed en cada ruta. Actualmente algunas lecturas administrativas solo exigen editor activo. Reportar esa diferencia como decisión de política a resolver, no restringirlas automáticamente. Verificar también cambios de Clave entre portada y textos, escalamiento de privilegios y conservación del último administrador completo.
4. Revisar la cookie bazar.editor: HttpOnly, SameSite=Strict y SecurePolicy=SameAsRequest; comprobar HTTPS y comportamiento real del proxy para el entorno objetivo. Examinar expiración y renovación configuradas o por defecto sin inventar valores.
5. Trazar desactivación de usuario, cambio de permisos, cambio de contraseña y logout. Actor vuelve a consultar usuario activo, pero no asumir que cambiar contraseña invalida cookies existentes. Evaluar revocación y persistencia de claves de protección de datos cuando corresponda al despliegue.
6. Revisar CSRF en todas las mutaciones, incluido login y multipart: middleware que verifica Origin, FrontendOrigin, origen reenviado por Vite, SameSite y DisableAntiforgery en subida de imágenes. Evaluar requests sin Origin o con origen ajeno. No describir la comprobación de Origin como un token antiforgery ni asumir que CORS reemplaza CSRF.
7. Revisar hash PBKDF2/SHA-256, salt, comparación en tiempo constante, validación de entrada y defensas de intentos de login. Preservar hashes existentes; no cambiar credenciales ni mecanismos como efecto lateral de una auditoría.
8. Verificar escenarios de acceso permitido y denegado, 401 frente a 403, sesión expirada e intentos de mutación desde otro origen en entorno aislado. No usar cuentas reales para pruebas de bloqueo ni desactivar defensas para hacer pasar pruebas.

## Ejemplo y resultado
Ante «un editor sin permiso de imágenes puede listar la biblioteca», rastrear GET /api/admin/imagenes y la política de lectura esperada; contrastar con POST y DELETE sin inferir que todos tienen el mismo permiso.

Entregar hallazgos con ruta, condición de reproducción, impacto y corrección mínima. Aplicar cambios solo dentro del encargo; remitir mapeos de Editor a ef-core-sqlserver si requieren modificar persistencia.
