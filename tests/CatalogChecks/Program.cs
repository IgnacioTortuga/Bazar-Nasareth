using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

int checks = 0;
void Check(bool condition, string message)
{
    if (!condition) throw new Exception(message);
    checks++;
}

var sharedIdea = new GaleriaImagen { Id = 9, ImagenId = 41, Titulo = "Taza <script> & regalo" };
var ideaHtml = GallerySharing.Render(sharedIdea, "Foto con \"comillas\"", "https://bazar.example");
Check(ideaHtml.Contains("https://bazar.example/api/imagenes/41/archivo"), "La idea compartida incluye imagen absoluta.");
Check(ideaHtml.Contains("https://bazar.example/idea/9"), "La idea tiene enlace permanente.");
Check(!ideaHtml.Contains("Taza <script>"), "El título de galería se escapa.");
Check(ideaHtml.Contains("&quot;comillas&quot;"), "La descripción de la imagen no rompe atributos.");
Check(!GallerySharing.Render(sharedIdea, "Foto", "https://user:pass@otro.example").Contains("og:image\""), "La idea rechaza dominios con credenciales.");
Check(GallerySharing.Render(sharedIdea, "Foto", null, true).Contains("Back to gallery"), "La idea conserva navegación en inglés.");

var product = new Producto { Id = 17, Nombre = "Regalo <script>alert(1)</script>", Descripcion = "Una descripción con \"comillas\" & detalles", PrecioInformativo = 1500, Moneda = "CRC" };
var business = new InformacionNegocio();
ProductPhoto[] images = [new(3, "Foto \"especial\" <img>")];
var html = ProductSharing.RenderProduct(product, business, images, "https://bazar.example", true);
Check(!html.Contains("Regalo <script>"), "El título debe escapar HTML.");
Check(html.Contains("&lt;script&gt;"), "Se conserva el texto escapado del título.");
Check(html.Contains("&quot;comillas&quot; &amp; detalles"), "La descripción no debe romper los metadatos.");
Check(html.Contains("https://bazar.example/producto/17"), "El enlace canónico debe usar el dominio configurado.");
Check(html.Contains("https://bazar.example/api/imagenes/3/archivo"), "La vista compartida necesita imagen absoluta.");
Check(html.Contains("clic-whatsapp"), "La medición activada debe registrar clics.");
Check(html.Contains("origen=detalle"), "La ficha compartible debe identificar el origen del clic.");
Check(html.Contains("/images/simbolo-bazar.png"), "La ficha debe usar el logotipo original.");
Check(html.Contains(">Por encargo<"), "La página debe informar la modalidad del negocio.");
Check(html.Contains("<div class=\"price-row\"><strong class=\"price\">"), "Precio y modalidad comparten una fila adaptable.");
Check(html.IndexOf("class=\"availability\"") > html.IndexOf("class=\"price\""), "Por encargo aparece junto al precio y después de la descripción.");
Check(html.Contains("rel=\"icon\""), "La ficha usa el logo como icono de pestaña.");
Check(html.IndexOf("class=\"back-link\"") < html.IndexOf("<main>"), "El regreso al catálogo queda en el encabezado y no ocupa una banda sobre los paneles.");
var disabled = ProductSharing.RenderProduct(product, business, images, null, false);
Check(!disabled.Contains("clic-whatsapp"), "No se debe registrar si la medición está desactivada.");
Check(!disabled.Contains("og:image"), "No se debe inventar una fotografía.");
Check(!disabled.Contains("canonical"), "No se debe inventar el dominio público.");
var unsafeUrl = ProductSharing.RenderProduct(product, business, images, "javascript:alert(1)", false);
Check(!unsafeUrl.Contains("javascript:"), "No se permiten dominios con esquema inseguro.");
var returnUrl = "/?categoria=1&q=taza%20personalizada&promocion=7#productos";
Check(ProductSharing.CatalogReturnUrl(returnUrl) == returnUrl, "Se conserva el contexto local del catálogo.");
foreach (var invalidReturn in new[] { "https://otro.example/#productos", "//otro.example/#productos", "javascript:alert(1)", "/\\otro.example#productos", "/?q=taza\n#productos" })
    Check(ProductSharing.CatalogReturnUrl(invalidReturn) == "/#productos", "El regreso no admite destinos externos ni caracteres de control.");
var withContext = ProductSharing.RenderProduct(product, business, images, "https://bazar.example", false, returnUrl);
Check(withContext.Contains("href=\"/?categoria=1&amp;q=taza%20personalizada&amp;promocion=7#productos\""), "El enlace de regreso conserva y escapa los filtros.");
Check(withContext.Contains("href=\"https://bazar.example/producto/17\""), "Los filtros no deben modificar el enlace canónico.");
var englishProduct = new Producto { Id = 99, Nombre = "Llaveros personalizados", Descripcion = "Texto <img> sin traducción" };
var englishProductHtml = ProductSharing.RenderProduct(englishProduct, business, images, "https://bazar.example", false, null, "en");
Check(englishProductHtml.Contains("lang=\"en\""), "La ficha debe declarar el idioma inglés.");
Check(englishProductHtml.Contains("Personalized keychains"), "El título de producto debe traducirse.");
Check(englishProductHtml.Contains("Ask via WhatsApp"), "El botón de consulta debe traducirse.");
Check(englishProductHtml.Contains("/?lang=en#productos"), "El regreso debe conservar inglés.");
Check(englishProductHtml.Contains("Texto &lt;img&gt; sin traducci"), "Los textos nuevos deben conservarse escapados.");
Check(Uri.UnescapeDataString(englishProductHtml).Contains("Hello, I would like a quote"), "La consulta de WhatsApp debe estar en inglés.");
Check(ProductSharing.RenderUnavailable("en").Contains("This product is unavailable"), "El error 404 debe traducirse.");

Check(MetricsEndpoints.CostaRicaDay(DateTimeOffset.Parse("2026-10-31T05:59:59Z")) == new DateOnly(2026, 10, 30), "El día de Costa Rica aún no ha terminado.");
Check(MetricsEndpoints.CostaRicaDay(DateTimeOffset.Parse("2026-10-31T06:00:00Z")) == new DateOnly(2026, 10, 31), "El conteo cambia a medianoche de Costa Rica.");

// Comprobar traducción SQL sin abrir conexión ni ejecutar el arranque de la API.
using var db = new BazarDb(new DbContextOptionsBuilder<BazarDb>().UseSqlServer("Server=unused;Database=unused;Integrated Security=True").Options);
var sql = ProductSharing.PublicProducts(db).Where(p => p.Id == 17).ToQueryString();
Check(sql.Contains("Publicado") && sql.Contains("Activa") && sql.Contains("ProductoImagen"), "El detalle y los clics deben respetar publicación, categoría e imagen.");
var start = new DateOnly(2026, 10, 1);
var metricsSql = db.ClicsWhatsApp.Where(c => c.Dia >= start)
    .Join(db.Productos, c => c.ProductoId, p => p.Id, (c, p) => new { c.ProductoId, c.Cantidad, c.Origen, p.Nombre })
    .GroupBy(c => new { c.ProductoId, c.Nombre, c.Origen })
    .Select(g => new { g.Key.ProductoId, g.Key.Origen, clics = g.Sum(x => x.Cantidad) }).ToQueryString();
Check(metricsSql.Contains("SUM(") && metricsSql.Contains("GROUP BY"), "La agregación debe traducirse en SQL.");
Check(db.Model.FindEntityType(typeof(ClicWhatsApp))!.FindPrimaryKey()!.Properties.Count == 3, "El conteo diario debe separar el origen.");
Check(db.Model.FindEntityType(typeof(ClicWhatsAppGaleria)) is not null, "La galería debe tener su propio conteo de consultas.");
// Construir el mapa HTTP no inicia el servidor ni ejecuta DatabaseInitialization.
var builder = WebApplication.CreateBuilder();
builder.Services.AddDbContext<BazarDb>(options => options.UseSqlServer("Server=unused;Database=unused;Integrated Security=True"));
builder.Services.AddAuthentication().AddCookie();
builder.Services.AddAuthorization();
await using var app = builder.Build();
SessionEndpoints.Map(app);
PublicEndpoints.Map(app, builder.Configuration);
var admin = app.MapGroup("/api/admin").RequireAuthorization();
BusinessEndpoints.Map(admin);
ImageEndpoints.Map(app, admin, Path.GetTempPath());
ProductEndpoints.Map(admin);
ServiceEndpoints.Map(admin);
PromotionEndpoints.Map(admin);
GalleryEndpoints.Map(admin);
ContentEndpoints.Map(admin);
RelationsEndpoints.Map(admin);
EditorEndpoints.Map(admin);
ProductSharing.Map(app, builder.Configuration);
MetricsEndpoints.Map(app, builder.Configuration);
var endpoints = ((IEndpointRouteBuilder)app).DataSources.SelectMany(source => source.Endpoints).OfType<RouteEndpoint>().ToArray();
var routes = endpoints.SelectMany(endpoint => endpoint.Metadata.GetMetadata<HttpMethodMetadata>()!.HttpMethods
    .Select(method => method + " " + endpoint.RoutePattern.RawText)).ToHashSet();
var expectedRoutes = new HashSet<string>
{
    "POST /api/login", "POST /api/logout", "GET /api/session", "GET /api/publico",
    "GET /api/imagenes/{id:int}/archivo", "GET /api/admin/negocio", "PUT /api/admin/negocio",
    "GET /api/admin/imagenes", "POST /api/admin/imagenes", "PUT /api/admin/imagenes/{id:int}", "DELETE /api/admin/imagenes/{id:int}",
    "GET /api/admin/relaciones", "PUT /api/admin/productos/{id:int}/imagenes", "PUT /api/admin/promociones/{id:int}/relaciones",
    "GET /api/admin/editores", "POST /api/admin/editores", "PUT /api/admin/editores/{id:int}",
    "POST /api/admin/productos/guardar", "PUT /api/admin/productos/{id:int}/guardar",
    "POST /api/admin/promociones/guardar", "PUT /api/admin/promociones/{id:int}/guardar",
    "POST /api/productos/{id:int}/clic-whatsapp", "POST /api/galeria/{id:int}/clic-whatsapp",
    "GET /api/admin/metricas/whatsapp", "GET /producto/{id:int}"
};
foreach (var collection in new[] { "categorias", "productos", "servicios", "promociones", "secciones", "galeria" })
{
    expectedRoutes.Add("GET /api/admin/" + collection);
    expectedRoutes.Add("POST /api/admin/" + collection);
    expectedRoutes.Add("PUT /api/admin/" + collection + "/{id:int}");
}
Check(routes.SetEquals(expectedRoutes) && endpoints.Length == expectedRoutes.Count, "Las 43 rutas y verbos HTTP deben conservarse sin duplicados.");
foreach (var endpoint in endpoints)
{
    var path = endpoint.RoutePattern.RawText!;
    var requiresSession = path.StartsWith("/api/admin/") || path == "/api/logout";
    Check((endpoint.Metadata.GetMetadata<IAuthorizeData>() is not null) == requiresSession,
        $"Se debe conservar el requisito de sesión de {path}.");
}

var context = new DefaultHttpContext();
var limited = new Editor { Permisos = "productos,imagenes" };
Check(EditorAccess.Allowed(context, limited, "productos"), "Un editor conserva sus permisos explícitos.");
Check(!EditorAccess.Allowed(context, limited, "usuarios"), "Un editor no obtiene permisos adicionales al separar los auxiliares.");
Check(!EditorAccess.Allowed(context, null, "productos"), "La ausencia de editor no concede permisos.");
Check(EditorValidation.CheckEditor("Editor", "editor@example.com", "contraseña-de-prueba", true, [], limited) is not null,
    "Un editor limitado no puede conceder acceso completo.");
var passwordHash = Passwords.Hash("contraseña-de-prueba");
Check(Passwords.Verify("contraseña-de-prueba", passwordHash), "La contraseña se verifica con el formato existente.");
Check(!Passwords.Verify("otra-contraseña", passwordHash), "Una contraseña incorrecta sigue siendo rechazada.");
Check(!Passwords.Verify("contraseña-de-prueba", "formato-inválido"), "Un hash mal formado sigue siendo rechazado.");

// Las reglas de cada módulo pueden validarse sin consultar una base real.
Check(await CategoryValidation.Validate(new Categoria { Nombre = "", Orden = 0 }, db) is not null, "Categorías exige nombre.");
Check(await ProductValidation.Validate(new Producto { Estado = "Inválido" }, db) is not null, "Productos rechaza estados desconocidos.");
Check(await ServiceValidation.Validate(new Servicio { Estado = "Borrador" }, db) is null, "Servicios admite un borrador incompleto.");
Check(await ServiceValidation.Validate(new Servicio { PrecioDesde = -1 }, db) is not null, "Servicios conserva la validación de precio.");
Check(await PromotionValidation.Validate(new Promocion { Estado = "Borrador" }, db) is null, "Promociones admite un borrador sin fechas.");
Check(await PromotionValidation.Validate(new Promocion { Inicio = DateTimeOffset.UtcNow, Fin = DateTimeOffset.UtcNow.AddDays(-1) }, db) is not null,
    "Promociones conserva la validación de vigencia.");
Check(await SectionValidation.Validate(new SeccionContenido { Clave = "preguntas", Estado = "Borrador" }, db) is null, "Contenido admite un borrador con clave.");
Check(await GalleryValidation.Validate(new GaleriaImagen { Orden = -1 }, db) is not null, "Galería rechaza un orden negativo.");

Console.WriteLine($"{checks} comprobaciones correctas. Sin conexión ni cambios en SQL Server.");
