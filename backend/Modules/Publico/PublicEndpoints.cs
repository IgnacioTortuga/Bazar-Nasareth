using Microsoft.EntityFrameworkCore;

public static class PublicEndpoints
{
    public static void Map(WebApplication app, IConfiguration configuration)
    {
        app.MapGet("/api/publico", async (BazarDb db) =>
        {
            var now = DateTimeOffset.UtcNow;
            var categorias = await db.Categorias.AsNoTracking().Where(x => x.Activa).OrderBy(x => x.Orden).ToListAsync();
            var categoryIds = categorias.Select(x => x.Id).ToArray();
            var productos = await db.Productos.AsNoTracking().Where(x => x.Estado == "Publicado" && categoryIds.Contains(x.CategoriaId) && !string.IsNullOrWhiteSpace(x.Nombre) && !string.IsNullOrWhiteSpace(x.Descripcion) && db.ProductoImagenes.Any(i => i.ProductoId == x.Id)).OrderBy(x => x.Orden).ToListAsync();
            var productIds = productos.Select(x => x.Id).ToArray();
            var productImages = await db.ProductoImagenes.AsNoTracking().Where(x => productIds.Contains(x.ProductoId)).OrderBy(x => x.Orden).ToListAsync();
            var servicios = await db.Servicios.AsNoTracking().Where(x => x.Estado == "Publicado" && !string.IsNullOrWhiteSpace(x.Nombre) && !string.IsNullOrWhiteSpace(x.Descripcion) && !string.IsNullOrWhiteSpace(x.Alcance)).OrderBy(x => x.Orden).ToListAsync();
            var promociones = await db.Promociones.AsNoTracking().Where(x => x.Estado == "Publicado" && !string.IsNullOrWhiteSpace(x.Titulo) && !string.IsNullOrWhiteSpace(x.Descripcion) && !string.IsNullOrWhiteSpace(x.Condiciones) && x.ImagenId.HasValue && x.Inicio.HasValue && x.Fin.HasValue && now < x.Fin).OrderBy(x => x.Orden).ToListAsync();
            var galeria = await db.Galeria.AsNoTracking().Where(x => x.Estado == "Publicado" && db.Imagenes.Any(i => i.Id == x.ImagenId)).OrderBy(x => x.Orden).ToListAsync();
            var secciones = await db.Secciones.AsNoTracking().Where(x => x.Estado == "Publicado" && !string.IsNullOrWhiteSpace(x.Titulo) && !string.IsNullOrWhiteSpace(x.Cuerpo)).OrderBy(x => x.Orden).ToListAsync();
            var imagenes = await db.Imagenes.AsNoTracking().Select(x => new { x.Id, x.TextoAlternativo }).ToListAsync();
            return Results.Ok(new { negocio = await db.Negocio.AsNoTracking().SingleAsync(x => x.Id == 1), medicionWhatsApp = configuration.GetValue<bool>("MedicionWhatsApp:Enabled"), categorias, productos = productos.Select(x => new { x.Id, x.CategoriaId, x.Nombre, x.Descripcion, x.PrecioInformativo, x.Moneda, x.Destacado, imagenes = productImages.Where(i => i.ProductoId == x.Id).Select(i => i.ImagenId).ToArray() }), servicios, promociones, galeria, secciones, imagenes, promocionProductos = await db.PromocionProductos.AsNoTracking().Where(x => productIds.Contains(x.ProductoId) && db.Promociones.Any(p => p.Id == x.PromocionId && p.Estado == "Publicado" && now < p.Fin)).ToListAsync(), promocionServicios = await db.PromocionServicios.AsNoTracking().Where(x => db.Promociones.Any(p => p.Id == x.PromocionId && p.Estado == "Publicado" && now < p.Fin)).ToListAsync() });
        });
    }
}
