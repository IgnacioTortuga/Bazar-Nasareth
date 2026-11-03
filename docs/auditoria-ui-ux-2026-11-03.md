# Auditoría IU/UX · Bazar Nazareth · 3 de noviembre de 2026

Se revisaron el sitio público publicado, su catálogo y sus 91 fotografías de galería mediante lecturas HTTP; los cambios se comprobaron en una vista local con una copia de esos datos. No se modificaron registros, archivos remotos ni permisos. No se enviaron mensajes de WhatsApp. Los cambios de esta entrega todavía requieren despliegue.

## Hallazgos y estado

| Prioridad | Hallazgo y evidencia | Estado |
| --- | --- | --- |
| Alta | `/producto/13` publicado contiene título y descripción Open Graph, pero carece de `og:image`. `PublicSiteUrl` tampoco figuraba en `backend/appsettings.json`. Sin dominio configurado, `ProductSharing` omite los metadatos de imagen. | Corregido en código/configuración. Verificar el despliegue y que Azure no sobrescriba la clave con un valor vacío. |
| Media | La consulta de galería enviaba directamente `/api/imagenes/41/archivo`, sin página identificable con título y metadatos. | Nueva ruta `/idea/{id}`, foto completa, enlace al original y metadatos Open Graph. El mensaje mantiene la referencia y agrega ese enlace. La miniatura depende de WhatsApp y no se ha verificado en un chat real. |
| Media | Menú móvil de una columna: aproximadamente 425 px de alto abierto a 375 px de ancho. | Menú de tres columnas, aproximadamente 241 px en la primera comprobación local, botón con texto, cierre con Escape y destino de sección calculado después de cerrar el menú. |
| Media | 91 ideas a tres por página: 31 páginas, sin búsqueda ni títulos visibles en las tarjetas. | Seis por página: 16 páginas antes de depurar contenido. Búsqueda por título/descripción y tarjetas con título, dos columnas en móvil. |
| Media | Las imágenes 68 y 69 (ideas 28 y 29) son dos tomas casi iguales del mismo artículo rojo. Se verificó visualmente tras detectar distancia perceptual de 4/64. No son archivos idénticos. | Pendiente de curación de contenido: conservar idea 28 y archivar idea 29 es una opción. No se borró ni archivó nada en producción. La interfaz evita repetir una misma referencia de imagen; no descarta automáticamente fotos parecidas con IDs diferentes. |
| Media | 28 títulos usan nombres repetidos y poco descriptivos como «Detalle personalizado para regalar» o «Caja de regalo personalizada». El mismo nombre no prueba que las fotos estén duplicadas. | Pendiente: nombrarlas por artículo, diseño u ocasión para mejorar búsqueda y reconocimiento. |
| Media | `HomeHero.jsx` usa fotografías estáticas y no consume `hero.imagenId`, aunque el editor conserva ese campo. | Pendiente: reconciliar el control del editor con las fotos reales de portada para que el cambio se refleje en la página. |
| Menor | `Img.jsx` no ofrece recuperación visual si una foto responde 404 o falla al cargar. | Pendiente: agregar estado de imagen no disponible con alternativa accesible. |

## Comprobaciones realizadas

- Frontend: compilación de producción correcta; 12 pruebas correctas, incluidas búsqueda de galería y eliminación visual de referencias repetidas sin modificar registros.
- Backend: compilación correcta y 99 comprobaciones de catálogo/renderizado correctas, sin conectar a SQL Server. Se restauró el recurso de traducciones embebido que faltaba y bloqueaba estas comprobaciones.
- Navegador local: revisión en 375 × 812, 320 × 740 y 812 × 375. Sin desbordamiento horizontal en las mediciones realizadas. Modo oscuro y texto grande comprobados en pantalla pequeña; navegación con Escape y búsqueda vacía comprobadas.
- Se detectó y corrigió durante la revisión una superposición del enlace de marca sobre el botón de tema. El modo oscuro volvió a funcionar. A 320 px se verificó que la galería queda 16 px por debajo del encabezado al navegar desde el menú.
- Se abrió la foto de totebag en el modal, se comprobó su carga y se inspeccionó el enlace de WhatsApp: conserva idea #9 y apunta a `/idea/9`.
- Las 91 fotografías publicadas respondieron a la lectura. Total aproximado: 14,22 MiB; la mayor, 249.841 bytes. No se detectaron duplicados binarios con SHA-256. El análisis perceptual solo identifica candidatas; no demuestra ausencia de otros duplicados o recortes.
- Se revisaron textos alternativos, estados de publicación, ayudas, acceso al editor, búsqueda y componentes de contacto en código. No se inició sesión ni se probaron escrituras administrativas con datos reales.

## Límites y siguientes pasos

1. Desplegar los cambios y comprobar `/idea/9` y el `og:image` de un producto en Azure.
2. Probar manualmente el enlace desde WhatsApp en Android/iPhone. `wa.me` prepara texto; no adjunta un archivo de imagen. La dueña puede abrir el enlace y tocar la foto para verla completa aunque no aparezca miniatura.
3. Depurar las tomas similares y renombrar los títulos genéricos desde el editor. Archivar conserva las fotos y referencias; eliminar archivos no es necesario para ocultar una idea.
4. Verificar el editor autenticado en un entorno de prueba y realizar mediciones de rendimiento con Lighthouse y lector de pantalla. Esta auditoría no equivale a certificación WCAG ni a una auditoría de seguridad.

Referencias: [WhatsApp: click to chat](https://faq.whatsapp.com/5913398998672934), [Open Graph: metadatos de imágenes](https://ogp.me/).
