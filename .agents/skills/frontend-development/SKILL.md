---
name: frontend-development
description: Crear o ajustar interfaces React y estilos del frontend Vite de Bazar Nazareth, incluyendo editor, navegación, formularios y consumo de la API. Usar para cambios visibles o estado de interfaz; no sustituye la validación ni autorización del servidor.
---

# Interfaz React y Vite

## Propósito
Mantener los flujos del sitio público y editor privado según Agents.md. La interfaz actual está en frontend/src/main.jsx, los estilos en style.css y el proxy /api en vite.config.js. Respetar las rutas y componentes existentes sin añadir bibliotecas de UI sin autorización.

## Procedimiento
1. Identificar componente, estado, estilos y llamadas api() de la pantalla afectada. App resuelve acceso y navegación; Public muestra contenido y Editor gestiona formularios. No asumir React Router.
2. Distinguir texto fijo de contenido administrado. Los títulos y cuerpos de portada llegan de /api/publico: no reemplazar datos de la base mediante textos fijos o fallbacks para ocultar un fallo.
3. Mantener fetch con credentials: same-origin, JSON para contenido y FormData para archivos. En desarrollo Vite dirige /api al backend; preservar ese contrato y no incluir credenciales en URLs o código.
4. Aplicar cambios localizados en componentes y CSS. Conservar el carácter discreto de la paleta administrativa y comprobar escritorio, móvil, foco de teclado y cierre del menú con Escape cuando estén afectados.
5. Mantener borradores ante errores, aviso de cambios sin guardar, estado ocupado, mensajes de resultado y vista previa antes de publicar. Distinguir subir un archivo, asignarlo al formulario y persistir la referencia; comprobar el caso de Galería existente que puede guardar la referencia directamente.
6. Verificar estados vacío, carga, error y éxito del flujo afectado. Para operaciones con datos, usar entorno aislado o contenido de prueba autorizado; la compilación frontend puede ejecutarse sin iniciar el backend. Reportar qué se comprobó visualmente y qué solo se compiló.

## Ejemplo y límite
Si se cambia «Reemplazar en Galería», revisar replaceImage y su consumidor en la biblioteca: mostrar el uso elegido y conservar los demás. Los detalles de validación de archivos corresponden a aspnet-core-backend; la revisión de acceso corresponde a authentication-authorization.

No publicar, archivar o cargar contenido real como efecto implícito de una prueba visual. No confundir ocultar un botón con proteger un endpoint.
