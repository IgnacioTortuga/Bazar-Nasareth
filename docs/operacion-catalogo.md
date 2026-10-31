# Catálogo, medición y respaldos

## Productos por encargo y enlaces

El catálogo y cada página `/producto/ID` indican que los artículos son por encargo. El cliente confirma disponibilidad, precio y plazo por WhatsApp. No se llevan cantidades de inventario ni se registran pedidos o pagos.

Cada producto publicado, con categoría activa, nombre, descripción e imagen, tiene una página individual. Un borrador, producto archivado o categoría inactiva devuelve 404. La página incluye las fotografías existentes; no crea ni cambia fotos.

Configure `PublicSiteUrl` en el backend con el dominio HTTPS público, por ejemplo `https://bazar.example`. Es necesario para el enlace canónico y la imagen absoluta de las vistas previas en redes. Reinicie la API después de configurarlo. La plataforma que recibe el enlace decide cómo mostrarlo y puede mantener su propia caché.

En desarrollo Vite reenvía `/producto` al backend. En producción el alojamiento también debe reenviar `/producto/*` y `/api/*` a ASP.NET Core, antes de la regla general de la aplicación React. No publique rutas privadas del backend ni la carpeta de respaldos.

## Medición de WhatsApp

Está desactivada por defecto. En una base existente, `EnsureCreatedAsync` **no agrega** la tabla nueva. Antes de activar:

1. Confirmar servidor y nombre de la base objetivo y realizar el respaldo coordinado.
2. Revisar y autorizar `sql/catalog-metrics.sql`. Crea solamente `dbo.ClicWhatsApp`, con clave producto/día y referencia a Producto. No elimina tablas ni cambia los datos de productos. Si la tabla ya existe, comparar su definición con `ClicWhatsApp` en `Models.cs`: el script no corrige esquemas distintos.
3. Ejecutar el script en la base confirmada, primero en la copia de prueba.
4. Configurar `MedicionWhatsApp:Enabled=true` o la variable de entorno `MedicionWhatsApp__Enabled=true` y reiniciar el backend.
5. Comprobar un clic desde un producto publicado y consultar **Productos → Interés por WhatsApp** con permiso de productos. Verificar que una cuenta sin ese permiso no pueda consultar el reporte.

La base guarda únicamente producto, fecha de Costa Rica y cantidad de clics. No se guarda la nota, nombre, teléfono, dirección IP ni identificadores del visitante. La medición es aproximada: clics repetidos, automatismos o bloqueos pueden cambiar el conteo; no equivale a mensajes enviados, clientes únicos o ventas. Se limita globalmente a 120 registros por minuto y nunca retrasa la apertura de WhatsApp. El reporte muestra los últimos 30 días. Los agregados históricos se conservan; no hay borrado automático ni exportación a terceros.

Para desactivar basta retirar la variable o establecerla en `false` y reiniciar. Los datos históricos permanecen.

## Respaldo coordinado

Los scripts están preparados para Windows con SQL Server y archivos **en el mismo equipo**, autenticación integrada de Windows y conexión cifrada. No toman contraseñas por argumentos. De forma predeterminada exigen un certificado confiable; para una instancia local con certificado autofirmado se puede indicar explícitamente `-TrustServerCertificate`. Esa opción conserva el cifrado pero omite la validación de la cadena, y el script igualmente rechaza servidores de otro equipo antes de respaldar o restaurar. SQL Server Express necesita permitir operaciones de backup a la cuenta operadora. La cuenta de servicio de SQL Server necesita acceso a la carpeta de destino; los scripts no cambian permisos automáticamente.

1. Elegir una carpeta de respaldo protegida, fuera del repositorio y de `uploaded-images`. Confirmar el `ImageDirectory` efectivo; si no se configura, es `backend/uploaded-images`.
2. Detener todas las instancias que puedan escribir en esa base y en sus imágenes, incluidas las iniciadas mediante `dotnet`. No editar la base desde otra herramienta durante el respaldo. `-ApiStopped` confirma que el operador realizó este paso; la comprobación adicional de procesos detecta el ejecutable habitual, pero no todos los alojamientos posibles.
3. Ejecutar desde PowerShell, sustituyendo servidor, base y rutas por los destinos confirmados:

```powershell
./scripts/Backup-Bazar.ps1 -Server 'SERVIDOR\INSTANCIA' -Database 'BazarNazareth' -ImageDirectory 'C:\Bazar\uploaded-images' -DestinationRoot 'D:\RespaldosBazar' -ApiStopped
```

Si la instancia local usa un certificado autofirmado no reconocido por Windows, agregue `-TrustServerCertificate` al comando después de comprobar que `-Server` identifica realmente esa instancia local.

El script genera una carpeta nueva con `database.bak`, `images` y `manifest.json`. Usa `COPY_ONLY` para no cambiar la base del respaldo diferencial, `CHECKSUM`, `RESTORE VERIFYONLY` y hashes SHA-256 de los archivos. Un fallo deja el conjunto incompleto para diagnóstico: **solo un conjunto con manifiesto válido se considera terminado**. No se borran respaldos anteriores. Reinicie la API al finalizar la copia.

El manifiesto detecta corrupción accidental; no es una firma contra modificaciones maliciosas. Proteja el conjunto con acceso restringido y conserve una copia cifrada fuera del equipo. No incluya claves privadas o credenciales dentro del repositorio. La configuración del servidor y las claves de Data Protection se recuperan por separado desde el sistema de despliegue; sin las claves anteriores, las sesiones deberán iniciarse de nuevo.

## Restauración de prueba

`VERIFYONLY` no demuestra que la aplicación pueda recuperarse. Para comprobar la restauración, use una base **nueva** con prefijo `BazarRestore_` y una carpeta que aún no exista:

```powershell
./scripts/Test-BazarRestore.ps1 -Server 'SERVIDOR\INSTANCIA' -Bundle 'D:\RespaldosBazar\CONJUNTO' -TestDatabase 'BazarRestore_Prueba01' -DestinationRoot 'D:\PruebasBazar\Prueba01'
```

Use también `-TrustServerCertificate` en la restauración si la misma instancia local lo requiere.

El script valida hashes, restaura todos los archivos de datos y log con nombres nuevos, ejecuta `DBCC CHECKDB`, copia y verifica las imágenes, y comprueba que todas las rutas de Imagen tengan archivo. Se niega a sobrescribir una base o carpeta. Deja `restore-result.json` únicamente si todas estas comprobaciones terminan. No elimina la base de prueba ni toca la original; su limpieza posterior requiere una decisión explícita.

Antes de dar el respaldo por operativo, abra una instancia aislada de la aplicación con la base restaurada y su carpeta de imágenes, y pruebe catálogo, login y edición de un registro ficticio. No apuntar esa instancia a la base o imágenes de producción. No se ha ejecutado esta restauración sobre los datos reales durante la implementación.

Los scripts no programan tareas periódicas ni fijan retención. Una vez confirmados servidor, rutas y ventana de mantenimiento, se puede programar el mismo procedimiento con registro de resultados y alertas de fallo. No eliminar copias antiguas antes de definir la retención y comprobar una restauración.

Referencias: [COPY_ONLY](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/copy-only-backups-sql-server) y [restauración en otra ubicación](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/restore-a-database-to-a-new-location-sql-server).
