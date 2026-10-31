---
name: debugging
description: Investigar fallos reproducibles del proyecto Bazar Nazareth entre React/Vite, API ASP.NET Core, imágenes en disco y SQL Server. Usar ante errores, resultados incorrectos o regresiones; localizar la causa antes de proponer o aplicar la corrección.
---

# Diagnóstico de fallos

## Propósito
Reducir un fallo a su causa comprobable siguiendo Agents.md, sin convertir la investigación en una reescritura o una limpieza de datos.

## Procedimiento
1. Recoger acción, resultado esperado, resultado observado y entorno. Revisar solo el código y registros relacionados; redactar secretos y datos personales antes de reportarlos.
2. Separar navegador, proxy /api de Vite, endpoint ASP.NET Core, persistencia y archivo físico. Un mensaje del frontend sobre API caída puede ocultar errores distintos; comprobar estado HTTP y error del servidor antes de concluir.
3. Formular una hipótesis y una comprobación pequeña. Para EADDRINUSE o ENOBUFS revisar proceso, puerto y destino del proxy; no matar procesos ni cambiar puertos al azar. No iniciar el backend sin evaluar su EnsureCreatedAsync y siembra inicial.
4. Para una imagen que no cambia, seguir archivo enviado, respuesta con id nuevo, PUT de referencia, respuesta pública y URL renderizada. Comprobar si quedó solo asignada al borrador, si falló el segundo request o si falta el archivo en disco antes de culpar a la caché.
5. Corregir únicamente si el encargo lo permite. Usar aspnet-core-backend, frontend-development, ef-core-sqlserver o authentication-authorization según la capa identificada; no repetir aquí sus procedimientos especializados.
6. Repetir la reproducción en entorno aislado, comprobar un caso cercano y detenerse cuando la evidencia resuelva el fallo. Si se repite un bloqueo sin nueva evidencia, informar la causa y lo que falta; no reintentar escrituras cuya respuesta se perdió sin comprobar si ya se aplicaron.

## Restricciones y entrega
No resetear bases, reemplazar credenciales, eliminar imágenes ni alterar contenido real para fabricar una reproducción. No instalar dependencias para resolver un error sin demostrar su necesidad. Si el alcance es diagnóstico, entregar causa confirmada o hipótesis pendientes, archivos implicados, evidencia y propuesta sin editar.

Ejemplo: si POST de imagen funciona y PUT de Galería falla, registrar ambas respuestas y la referencia persistida. El éxito de la carga por sí solo no confirma el reemplazo.
