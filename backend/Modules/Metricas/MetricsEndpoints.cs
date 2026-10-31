using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using static ProductSharing;

public static class MetricsEndpoints
{
    public static void Map(WebApplication app, IConfiguration configuration)
    {
        bool enabled = configuration.GetValue<bool>("MedicionWhatsApp:Enabled");
        app.MapPost("/api/productos/{id:int}/clic-whatsapp", async (int id, string? origen, BazarDb db, ILoggerFactory logs) =>
        {
            if (!enabled)
                return Results.NoContent();
            if (!await PublicProducts(db).AnyAsync(p => p.Id == id))
                return Results.NotFound();
            var source = origen is "detalle" or "halloween" ? origen : "catalogo";
            var day = CostaRicaDay(DateTimeOffset.UtcNow);
            try
            {
                // HOLDLOCK serializa el alta de la clave producto/día; no hay incremento perdido.
                await using var transaction = await db.Database.BeginTransactionAsync();
                await db.Database.ExecuteSqlInterpolatedAsync($"""
                    UPDATE dbo.ClicWhatsApp WITH (UPDLOCK, HOLDLOCK)
                    SET Cantidad = Cantidad + 1 WHERE ProductoId = {id} AND Dia = {day} AND Origen = {source};
                    IF @@ROWCOUNT = 0
                        INSERT INTO dbo.ClicWhatsApp (ProductoId, Dia, Origen, Cantidad) VALUES ({id}, {day}, {source}, 1);
                    """);
                await transaction.CommitAsync();
                return Results.NoContent();
            }
            catch (Exception ex) when (ex is System.Data.Common.DbException or DbUpdateException)
            {
                logs.CreateLogger("MedicionWhatsApp").LogWarning("No se pudo registrar un clic de WhatsApp.");
                return Results.StatusCode(503);
            }
        }).RequireRateLimiting("clics");
        app.MapPost("/api/galeria/{id:int}/clic-whatsapp", async (int id, BazarDb db, ILoggerFactory logs) =>
        {
            if (!enabled)
                return Results.NoContent();
            if (!await db.Galeria.AsNoTracking().AnyAsync(g => g.Id == id && g.Estado == "Publicado"))
                return Results.NotFound();
            var day = CostaRicaDay(DateTimeOffset.UtcNow);
            try
            {
                await using var transaction = await db.Database.BeginTransactionAsync();
                await db.Database.ExecuteSqlInterpolatedAsync($"""
                    UPDATE dbo.ClicWhatsAppGaleria WITH (UPDLOCK, HOLDLOCK)
                    SET Cantidad = Cantidad + 1 WHERE GaleriaImagenId = {id} AND Dia = {day};
                    IF @@ROWCOUNT = 0
                        INSERT INTO dbo.ClicWhatsAppGaleria (GaleriaImagenId, Dia, Cantidad) VALUES ({id}, {day}, 1);
                    """);
                await transaction.CommitAsync();
                return Results.NoContent();
            }
            catch (Exception ex) when (ex is System.Data.Common.DbException or DbUpdateException)
            {
                logs.CreateLogger("MedicionWhatsApp").LogWarning("No se pudo registrar un clic de WhatsApp desde la galería.");
                return Results.StatusCode(503);
            }
        }).RequireRateLimiting("clics");
        app.MapGet("/api/admin/metricas/whatsapp", async (HttpContext ctx, BazarDb db) =>
        {
            if (!int.TryParse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
                return Results.Forbid();
            var actor = await db.Editores.AsNoTracking().SingleOrDefaultAsync(e => e.Id == id && e.Activo);
            if (actor is null || (!actor.Completo && !actor.Permisos.Split(',').Contains("productos")))
                return Results.Forbid();
            ctx.Response.Headers.CacheControl = "no-store";
            if (!enabled)
                return Results.Ok(new { habilitada = false, productos = Array.Empty<object>() });
            var start = CostaRicaDay(DateTimeOffset.UtcNow).AddDays(-29);
            var products = await db.ClicsWhatsApp.AsNoTracking().Where(c => c.Dia >= start).Join(db.Productos, c => c.ProductoId, p => p.Id, (c, p) => new { c.ProductoId, c.Cantidad, c.Origen, p.Nombre }).GroupBy(c => new { c.ProductoId, c.Nombre, c.Origen }).Select(g => new { g.Key.ProductoId, g.Key.Nombre, g.Key.Origen, clics = g.Sum(x => x.Cantidad) }).OrderByDescending(c => c.clics).ToListAsync();
            var gallery = await db.ClicsWhatsAppGaleria.AsNoTracking().Where(c => c.Dia >= start).Join(db.Galeria, c => c.GaleriaImagenId, g => g.Id, (c, g) => new { c.GaleriaImagenId, c.Cantidad, g.Titulo }).GroupBy(c => new { c.GaleriaImagenId, c.Titulo }).Select(g => new { g.Key.GaleriaImagenId, g.Key.Titulo, clics = g.Sum(x => x.Cantidad) }).OrderByDescending(c => c.clics).ToListAsync();
            var origins = products.GroupBy(p => p.Origen).Select(g => new { origen = g.Key, clics = g.Sum(x => x.clics) }).ToList();
            if (gallery.Count > 0)
                origins.Add(new { origen = "galeria", clics = gallery.Sum(x => x.clics) });
            return Results.Ok(new { habilitada = true, desde = start, origenes = origins.OrderByDescending(x => x.clics), productos = products, galeria = gallery });
        }).RequireAuthorization();
    }

    public static DateOnly CostaRicaDay(DateTimeOffset now) => DateOnly.FromDateTime(now.ToOffset(TimeSpan.FromHours(-6)).DateTime);
}
