# Bazar Nazareth de Hojancha

Dos proyectos independientes: `backend` (ASP.NET Core + EF Core + SQL Server) y `frontend` (React + Vite). La web pública muestra solo contenido publicado. Los productos admiten una consulta por WhatsApp con cantidad, nombre y nota; se abre la aplicación de mensajería con texto precargado, **sin guardar pedidos, carrito, ventas ni pagos**.

## Requisitos

- SDK .NET 10 y SQL Server (LocalDB o una instancia accesible).
- Node.js 20.19+ y npm.
- Copia de seguridad si se conecta a una base con datos; esta instalación se diseñó para una base nueva.

## Instalar y ejecutar

1. Cree una base SQL Server vacía `BazarNazareth`, o ejecute `sql/schema.sql` en SSMS. El backend crea el esquema mediante `EnsureCreated()` si la base está vacía; si usó el script, no lo recrea.
2. Configure `ConnectionStrings:Bazar` en `backend/appsettings.json` para su instancia. Para SQL Server Express, por ejemplo: `Server=.\\SQLEXPRESS;Database=BazarNazareth;Trusted_Connection=True;TrustServerCertificate=True`. En Linux o con usuario SQL configure `Server=...;Database=...;User Id=...;Password=...;TrustServerCertificate=True`. No incluya contraseñas reales en Git.
3. Configure la primera cuenta en variables de entorno, **antes de iniciar la API por primera vez**:

   **PowerShell:**
   ```powershell
   $env:INITIAL_ADMIN_EMAIL="admin@ejemplo.com"
   $env:INITIAL_ADMIN_PASSWORD="una-contraseña-segura-de-12-o-más-caracteres"
   cd backend
   dotnet restore
   dotnet run --urls http://localhost:5080
   ```

   **Bash:**
   ```bash
   export INITIAL_ADMIN_EMAIL=admin@ejemplo.com
   export INITIAL_ADMIN_PASSWORD='una-contraseña-segura-de-12-o-más-caracteres'
   cd backend
   dotnet restore
   dotnet run --urls http://localhost:5080
   ```

4. En otra terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Abra `http://localhost:5173/`; abra `/login` para editar. Vite envía `/api` al backend (`frontend/vite.config.js`). La sesión utiliza una cookie HTTP only. No exponga la API en Internet sin HTTPS, copias de seguridad y configuración de despliegue.

## Uso del panel

- Primero cree categorías y cargue imágenes en `Imágenes` (JPG, PNG o WebP, máximo 5 MB, texto alternativo obligatorio).
- Guarde un producto como borrador, vuelva a abrirlo, seleccione su imagen, guárdelo y finalmente publique después de revisar la vista previa. Precio opcional; si hay precio se exige moneda.
- Las promociones exigen imagen, condiciones, inicio y fin. Fechas se envían como instantes UTC y se muestran en hora local de Costa Rica. La consulta pública verifica `inicio <= UTC actual < fin`.
- La imagen se sustituye seleccionando otra en el elemento editado. Si una imagen está asociada a cualquier contenido, el servidor impide borrarla. Las demás referencias no cambian.
- Contacto edita solo el registro `Id = 1`. El teléfono inicial es `+506 6488 3862`. Cambiarlo actualiza los enlaces de consulta desde los productos.
- En Administradores, una cuenta con acceso completo puede crear otras con acceso completo o permisos concretos. Una cuenta con permiso `usuarios` solo puede otorgar permisos que ya tenga.
- Las URL privadas `/contenido/portada`, `/contenido/productos`, `/contenido/servicios`, `/contenido/imagenes`, `/contenido/promociones`, `/contenido/galeria`, `/contenido/textos`, `/contenido/contacto` y `/contenido/usuarios` comparten el mismo panel.

## Modelo y alcance

`backend/Models.cs` contiene las 12 entidades, relaciones, restricciones y la configuración de EF Core. `sql/schema.sql` permite crear el mismo esquema manualmente en SSMS. No ejecute el script sobre una base que ya haya creado EF Core. El registro central y la primera cuenta se insertan al arrancar la API. Los campos `Completo` y `Permisos` amplían `Editor` para cumplir el requisito posterior de múltiples administradores.

Las imágenes se guardan en `backend/uploaded-images` fuera del directorio web, y se sirven únicamente si están publicadas o hay sesión activa. Haga copia de esta carpeta junto con la base de datos. La aplicación no contiene imágenes reales del negocio: el contenido inicial del sitio permanece vacío salvo el contacto y deberá cargarse desde el panel.

## Verificación sugerida

- Crear borrador, subir imagen, publicarlo y filtrar por categoría; archivar y comprobar que desaparece.
- Crear promoción con fechas futuras, vigentes y vencidas; solo la vigente debe aparecer en `/api/publico`.
- Reutilizar una imagen en dos lugares, cambiar solo una referencia y comprobar que la otra sigue igual; intentar eliminar la usada debe dar `409`.
- Cerrar sesión y comprobar que `POST /api/admin/productos` devuelve `401`. Probar cuentas con permisos parciales y el `CHECK (Id = 1)`.
- Desde un producto sin precio y otro con precio, abrir WhatsApp: el mensaje contiene cantidad y precio solo si procede y nunca contiene `null`.
