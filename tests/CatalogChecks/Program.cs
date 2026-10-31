using Microsoft.EntityFrameworkCore;

int checks = 0;
void Check(bool condition, string message)
{
    if (!condition) throw new Exception(message);
    checks++;
}

var product = new Producto { Id = 17, Nombre = "Regalo <script>alert(1)</script>", Descripcion = "Una descripción con \"comillas\" & detalles", PrecioInformativo = 1500, Moneda = "CRC" };
var business = new InformacionNegocio();
ProductPhoto[] images = [new(3, "Foto \"especial\" <img>")];
var html = CatalogFeatures.RenderProduct(product, business, images, "https://bazar.example", true);
Check(!html.Contains("Regalo <script>"), "El título debe escapar HTML.");
Check(html.Contains("&lt;script&gt;"), "Se conserva el texto escapado del título.");
Check(html.Contains("&quot;comillas&quot; &amp; detalles"), "La descripción no debe romper los metadatos.");
Check(html.Contains("https://bazar.example/producto/17"), "El enlace canónico debe usar el dominio configurado.");
Check(html.Contains("https://bazar.example/api/imagenes/3/archivo"), "La vista compartida necesita imagen absoluta.");
Check(html.Contains("clic-whatsapp"), "La medición activada debe registrar clics.");
Check(html.Contains("origen=detalle"), "La ficha compartible debe identificar el origen del clic.");
Check(html.Contains("/images/simbolo-bazar.png"), "La ficha debe usar el logotipo original.");
Check(html.Contains(">Por encargo<"), "La página debe informar la modalidad del negocio.");
var disabled = CatalogFeatures.RenderProduct(product, business, images, null, false);
Check(!disabled.Contains("clic-whatsapp"), "No se debe registrar si la medición está desactivada.");
Check(!disabled.Contains("og:image"), "No se debe inventar una fotografía.");
Check(!disabled.Contains("canonical"), "No se debe inventar el dominio público.");
var unsafeUrl = CatalogFeatures.RenderProduct(product, business, images, "javascript:alert(1)", false);
Check(!unsafeUrl.Contains("javascript:"), "No se permiten dominios con esquema inseguro.");
Check(CatalogFeatures.CostaRicaDay(DateTimeOffset.Parse("2026-10-31T05:59:59Z")) == new DateOnly(2026, 10, 30), "El día de Costa Rica aún no ha terminado.");
Check(CatalogFeatures.CostaRicaDay(DateTimeOffset.Parse("2026-10-31T06:00:00Z")) == new DateOnly(2026, 10, 31), "El conteo cambia a medianoche de Costa Rica.");

// Comprobar traducción SQL sin abrir conexión ni ejecutar el arranque de la API.
using var db = new BazarDb(new DbContextOptionsBuilder<BazarDb>().UseSqlServer("Server=unused;Database=unused;Integrated Security=True").Options);
var sql = CatalogFeatures.PublicProducts(db).Where(p => p.Id == 17).ToQueryString();
Check(sql.Contains("Publicado") && sql.Contains("Activa") && sql.Contains("ProductoImagen"), "El detalle y los clics deben respetar publicación, categoría e imagen.");
var start = new DateOnly(2026, 10, 1);
var metricsSql = db.ClicsWhatsApp.Where(c => c.Dia >= start)
    .Join(db.Productos, c => c.ProductoId, p => p.Id, (c, p) => new { c.ProductoId, c.Cantidad, c.Origen, p.Nombre })
    .GroupBy(c => new { c.ProductoId, c.Nombre, c.Origen })
    .Select(g => new { g.Key.ProductoId, g.Key.Origen, clics = g.Sum(x => x.Cantidad) }).ToQueryString();
Check(metricsSql.Contains("SUM(") && metricsSql.Contains("GROUP BY"), "La agregación debe traducirse en SQL.");
Check(db.Model.FindEntityType(typeof(ClicWhatsApp))!.FindPrimaryKey()!.Properties.Count == 3, "El conteo diario debe separar el origen.");
Check(db.Model.FindEntityType(typeof(ClicWhatsAppGaleria)) is not null, "La galería debe tener su propio conteo de consultas.");
Console.WriteLine($"{checks} comprobaciones correctas. Sin conexión ni cambios en SQL Server.");
