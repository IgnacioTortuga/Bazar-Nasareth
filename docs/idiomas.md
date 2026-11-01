# Idiomas del sitio público

El icono del globo junto a la búsqueda alterna español e inglés. La elección se conserva en `bazar.language` y en `?lang=es|en`; las fichas compartibles conservan el idioma y el regreso al catálogo. La navegación, destacados, formularios, mensajes de WhatsApp y contenido público actual cuentan con traducciones.

`localization/en.json` contiene las equivalencias de los textos originales en español. React lo importa mediante `frontend/src/shared/translations.js`; el backend lo incorpora como recurso para traducir la ficha de producto. Las traducciones se aplican al mostrar el contenido: no se cambian los registros de SQL Server ni se envían datos a servicios de traducción.

Al añadir o cambiar títulos, descripciones u otros textos desde el administrador, añadir también su equivalencia a este archivo. Si falta una traducción se muestra el texto original, sin ocultarlo ni reemplazarlo por contenido antiguo. Los nombres comerciales, teléfonos, URLs y textos escritos por el visitante se conservan. El texto que forma parte de una fotografía pertenece a la imagen y no cambia con el idioma.

Pruebas: `npm test` y `npm run build` en `frontend`; `dotnet run --project tests/CatalogChecks/CatalogChecks.csproj` desde la raíz. Tras cambiar el recurso de traducciones, recompilar y reiniciar el backend para que la ficha use la nueva versión.
