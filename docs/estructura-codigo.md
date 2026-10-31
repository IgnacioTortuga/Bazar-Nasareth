# Código organizado por funcionalidades

Cada funcionalidad tiene una carpeta en el frontend y otra en el backend. Para trabajar en productos, por ejemplo, se empieza por `frontend/src/modules/productos/` y `backend/Modules/Productos/`.

La aplicación sigue siendo un monolito pequeño: React con Vite, ASP.NET Core Minimal APIs y un contexto EF Core. Las carpetas delimitan responsabilidades dentro de los mismos proyectos.

## Mapa de módulos

| Funcionalidad | Frontend: `frontend/src/modules/` | Backend: `backend/Modules/` |
| --- | --- | --- |
| Productos y categorías | `productos/`: catálogo público, consultas por WhatsApp, categorías, selección de imágenes y configuración de formularios. | `Productos/`: entidades, contratos, rutas, guardado de relaciones, validaciones y ficha compartible. |
| Servicios | `servicios/`: sección pública, consulta por WhatsApp y campos del formulario. | `Servicios/`: entidad, rutas y validación. |
| Promociones | `promociones/`: sección pública, selección de productos y servicios asociados y campos del formulario. | `Promociones/`: entidades, contratos, rutas, guardado transaccional y validación. |
| Galería | `galeria/`: fotografías, paginación de 3 elementos, ventana ampliada y campos del formulario. | `Galeria/`: entidad, rutas y validación. |
| Imágenes | `imagenes/`: biblioteca, herramientas de carga y `useImageLibrary.js` con las acciones de carga, reemplazo, texto alternativo y eliminación. | `Imagenes/`: archivos, metadatos, contratos y rutas de imágenes. |
| Administradores | `usuarios/`: formulario, listado y `useAccounts.js` con el estado del formulario y las acciones de cuentas. | `Usuarios/`: entidad Editor, contratos, rutas y validación de cuentas. |
| Contacto | `contacto/`: formulario administrativo, contacto público, direcciones, horarios y campos. | `Contacto/`: información del negocio y rutas de lectura y edición. |
| Portada y textos | `contenido/`: portada, enlaces destacados, bloques de texto y campos. | `Contenido/`: entidad de secciones, rutas y reglas de publicación. |
| Sesión | `sesion/`: pantalla de acceso. | `Sesion/`: inicio y cierre de sesión y consulta de cuenta actual. |
| Métricas | `metricas/`: informe de interés por WhatsApp. | `Metricas/`: entidades de conteo, registro de clics e informe administrativo. |
| Datos de la página pública | `app/PublicPage.jsx` coordina los módulos visibles. | `Publico/`: consulta que reúne el contenido publicado. |

## Coordinación y código compartido

```text
frontend/src/
├── main.jsx             # Monta React y carga los estilos
├── app/
│   ├── App.jsx          # Navegación, carga inicial y sesión
│   ├── PublicPage.jsx   # Compone las secciones públicas
│   ├── Editor.jsx       # Coordina formularios y cambios sin guardar
│   └── adminConfig.js   # Reúne los campos y valores de cada módulo
├── modules/             # Funcionalidades de la tabla anterior
├── shared/              # API, campos, imágenes, iconos y paginación reutilizable
└── style.css            # Estilos existentes

backend/
├── Program.cs           # Configuración, middleware y registro de módulos
├── Modules/             # Funcionalidades de la tabla anterior
├── Shared/
│   ├── ContentCrud.cs   # Operaciones CRUD reutilizadas por los módulos
│   ├── ContentRules.cs  # Predicados comunes: estado, orden y precio
│   ├── RecordValidation.cs # Dirige cada entidad a la validación de su módulo
│   ├── RelationsEndpoints.cs # Lectura de relaciones para el editor
│   ├── IRecord.cs
│   └── Security/        # Editor activo, permisos y contraseñas
└── Data/
    ├── BazarDb.cs       # Tablas, relaciones, índices y restricciones
    └── DatabaseInitialization.cs # Creación y datos de la primera ejecución
```

`Editor.jsx` conserva la coordinación entre módulos: navegación, borradores, vista previa, guardado y carga de imágenes que se asignan a un formulario abierto. Los campos y valores iniciales se declaran en el `config.js` de la funcionalidad correspondiente. Los paneles reciben datos y acciones; las acciones de biblioteca y cuentas pertenecen a sus módulos.

El CRUD genérico conserva las comprobaciones especiales de permisos de portada al crear o cambiar una sección. Cada módulo registra sus rutas; `Program.cs` las conecta a la aplicación y al grupo administrativo autorizado.

## Ejemplo: guardar un producto

```text
modules/productos/config.js        Campos y valores iniciales
             ↓
app/Editor.jsx                     Borrador, vista previa y confirmación
             ↓
shared/api.js                      Solicitud con la cookie de sesión
             ↓
Modules/Productos/ProductEndpoints.cs
             ↓
Modules/Productos/ProductValidation.cs
             ↓
Data/BazarDb.cs → SQL Server        Producto e imágenes en una transacción
```

Para cambiar cómo se ve el catálogo, se edita `modules/productos/ProductCatalog.jsx`. Para cambiar el mensaje de consulta, `modules/productos/ContactMessage.jsx`. Para cambiar una regla de publicación, `Modules/Productos/ProductValidation.cs`.

## Verificación

Desde la raíz del repositorio:

```powershell
npm --prefix frontend run build
dotnet run --project tests/CatalogChecks
```

Las comprobaciones de C# incluyen la ficha compartible, el modelo y traducción de consultas EF Core, las 43 rutas con sus requisitos de sesión y reglas de los módulos. Construyen el mapa HTTP sin iniciar la API ni ejecutar la inicialización de la base. Los guardados reales deben probarse en una base de prueba.
