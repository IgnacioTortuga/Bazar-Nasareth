# AGENTS.md

## 1. Rol del agente

Actuar como desarrollador responsable del mantenimiento y evolución de Bazar Nasareth.

El objetivo es mejorar y ampliar el proyecto existente, preservando sus funcionalidades, datos, arquitectura y comportamiento actual.

Priorizar:
- Cambios pequeños y controlados.
- Código mantenible.
- Seguridad.
- Compatibilidad.
- Eficiencia en el desarrollo.

## 2. Arquitectura identificada

### Frontend
- React.
- Vite.
- JavaScript.
- Comunicación con backend mediante Fetch API.
- Las solicitudes utilizan el prefijo `/api`.
- `src/main.jsx` monta React; `src/app/App.jsx` coordina navegación y sesión.
- `src/modules/` agrupa componentes, campos y acciones por funcionalidad: productos, servicios, promociones, galería, imágenes, usuarios, contacto, contenido, sesión y métricas.
- `src/app/` compone la página pública y coordina el editor; `src/shared/` contiene API y componentes reutilizables.

### Backend
- C#.
- ASP.NET Core Minimal APIs.
- .NET 10.
- Arquitectura monolítica pequeña.
- `Program.cs` configura el arranque y registra los grupos de rutas de `Modules/`.
- `Modules/` agrupa rutas, entidades, contratos y validaciones por funcionalidad.
- `Data/BazarDb.cs` conserva el contexto y los mapeos; `Shared/` contiene CRUD genérico, reglas comunes y auxiliares de acceso.
- Consultar `docs/estructura-codigo.md` para localizar responsabilidades; las referencias antiguas a `main.jsx` o `Models.cs` en Skills corresponden a los módulos de este mapa.

### Persistencia
- Microsoft SQL Server.
- Entity Framework Core 10.0.14.
- Contexto principal: `BazarDb`.
- Configuración mediante `DbContext`.
- Consultas LINQ y operaciones asíncronas.

### Imágenes
- Los archivos se almacenan en disco.
- SQL Server almacena sus metadatos y rutas.

Estas características deben verificarse si el proyecto cambia.

## 3. Reglas fundamentales

- Analizar el código antes de modificarlo.
- Respetar la arquitectura existente.
- No asumir tecnologías ni dependencias.
- No reescribir archivos completos para cambios pequeños.
- No eliminar funcionalidades existentes.
- No cambiar contratos de API sin revisar sus consumidores.
- No introducir abstracciones o capas innecesarias.
- No agregar dependencias sin justificación.
- Mantener los nombres y convenciones existentes cuando sea posible.

## 4. Frontend: React

- Respetar los componentes y estructura existentes.
- Mantener consistencia visual.
- Reutilizar componentes cuando corresponda.
- Evitar duplicación de código y estilos.
- Mantener compatibilidad con los endpoints existentes.
- Manejar correctamente estados de carga, éxito y error.
- Validar formularios y entradas.
- Mantener interfaces responsivas.
- No modificar contratos de API unilateralmente.

## 5. Backend: ASP.NET Core Minimal APIs

- Respetar el uso actual de Minimal APIs.
- Mantener compatibilidad con los endpoints existentes.
- Comprender el funcionamiento de `MapGet`, `MapPost`, `MapPut` y `MapDelete`.
- Revisar las funciones genéricas como `MapCrud<T>()` antes de modificarlas.
- Utilizar correctamente la inyección de dependencias.
- Mantener operaciones asíncronas cuando corresponda.
- Validar las entradas recibidas.
- Gestionar errores de manera consistente.
- Separar responsabilidades gradualmente cuando aporte valor.
- No introducir controladores MVC ni una arquitectura por capas sin justificación y autorización.

## 6. Entity Framework Core y SQL Server

- Respetar el contexto `BazarDb`.
- Analizar `OnModelCreating()` antes de modificar entidades.
- Preservar claves primarias, claves foráneas, índices y restricciones.
- Revisar relaciones y comportamientos de eliminación.
- Utilizar consultas parametrizadas y LINQ seguro.
- Utilizar `AsNoTracking()` en lecturas cuando corresponda.
- Mantener operaciones asíncronas.
- Utilizar transacciones cuando una operación requiera consistencia entre varias modificaciones.
- No modificar ni eliminar tablas sin autorización.
- No ejecutar migraciones sobre bases existentes sin autorización explícita.

### Migraciones

Actualmente el proyecto utiliza `EnsureCreatedAsync()` y no tiene migraciones versionadas identificadas.

No sustituir `EnsureCreatedAsync()` por `MigrateAsync()` automáticamente.

Antes de proponer una estrategia:
1. Analizar el modelo actual.
2. Identificar el estado del esquema existente.
3. Comparar el esquema con las entidades.
4. Identificar riesgos de pérdida de información.
5. Proponer un procedimiento de transición.
6. Esperar autorización antes de ejecutarlo.

## 7. Autenticación y autorización

El proyecto utiliza autenticación mediante cookies.

Al modificar esta funcionalidad:
- Respetar los mecanismos actuales de autenticación.
- Revisar las restricciones de permisos por endpoint.
- No asumir que estar autenticado equivale a tener autorización.
- Revisar los permisos del editor activo.
- Proteger las operaciones administrativas.
- No debilitar las configuraciones de cookies.
- Revisar protección CSRF y validación de origen.
- No modificar el sistema de contraseñas sin justificación.
- No exponer información de sesiones ni credenciales.

Cualquier cambio de seguridad debe explicarse y probarse.

## 8. Integración frontend y backend

El flujo actual es:

React → Fetch API → Proxy Vite → ASP.NET Core → BazarDb → SQL Server.

Al modificar una funcionalidad:
- Revisar ambos extremos de la comunicación.
- Mantener compatibilidad de rutas y formatos JSON.
- Revisar el manejo de cookies.
- Revisar respuestas HTTP y errores.
- Considerar operaciones que involucren varias solicitudes.
- No asumir que varias solicitudes forman una única transacción.

## 9. Seguridad y protección de datos

- No mostrar contraseñas ni claves API.
- No exponer archivos `.env`.
- No imprimir cadenas de conexión.
- No ejecutar operaciones destructivas sin autorización.
- No alterar datos reales durante las pruebas.
- No desactivar controles de seguridad para solucionar errores.
- Revisar validaciones de archivos e imágenes.

## 10. Procedimiento de trabajo

Antes de modificar:
1. Comprender el objetivo solicitado.
2. Identificar los archivos involucrados.
3. Revisar sus dependencias.
4. Identificar posibles efectos secundarios.
5. Proponer el cambio mínimo necesario.

Durante el trabajo:
- Modificar únicamente lo necesario.
- Mantener la compatibilidad.
- Evitar refactorizaciones ajenas a la tarea.

Después del trabajo:
1. Revisar los cambios.
2. Ejecutar las pruebas disponibles.
3. Comprobar errores de compilación cuando sea posible.
4. Revisar posibles regresiones.
5. Informar cualquier validación pendiente.

## 11. Uso eficiente de tokens

- Leer archivos relevantes, no todo el repositorio indiscriminadamente.
- No repetir análisis ya documentados si el código no cambió.
- Consultar Skills especializadas cuando corresponda.
- Evitar explicaciones redundantes.
- No generar documentación innecesaria.
- Priorizar resultados concretos.
- No sacrificar la calidad de las verificaciones por ahorrar tokens.

## 12. Comunicación

Al finalizar cada tarea indicar:
- Objetivo cumplido.
- Archivos modificados.
- Descripción de los cambios.
- Pruebas ejecutadas y resultados.
- Riesgos o limitaciones.
- Tareas pendientes.

Nunca afirmar que algo funciona si no fue comprobado.
## 13. Selección de Skills

Antes de realizar una tarea:

1. Identificar qué partes del proyecto están involucradas.
2. Consultar las descripciones de las Skills disponibles.
3. Seleccionar las Skills pertinentes.
4. Consultar sus instrucciones antes de trabajar.
5. Combinar procedimientos cuando una tarea abarque
   varias áreas.

Asignación orientativa:

- React e interfaces:
  frontend-development.

- Endpoints y lógica de negocio:
  aspnet-core-backend.

- Entidades, consultas y persistencia:
  ef-core-sqlserver.

- Inicio de sesión y permisos:
  authentication-authorization.

- Errores:
  debugging.

- Análisis general:
  project-analysis.

- Revisión de cambios:
  code-review.

No utilizar Skills que no aporten valor a la tarea.

Si una tarea afecta varias áreas, utilizar las Skills
correspondientes en conjunto.
