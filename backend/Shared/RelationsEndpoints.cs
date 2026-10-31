using Microsoft.EntityFrameworkCore;
using static EditorAccess;

public static class RelationsEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        admin.MapGet("/relaciones", async (HttpContext ctx, BazarDb db) =>
        {
            if (await Actor(ctx, db) is null)
                return Results.Forbid();
            return Results.Ok(new { productoImagenes = await db.ProductoImagenes.ToListAsync(), promocionProductos = await db.PromocionProductos.ToListAsync(), promocionServicios = await db.PromocionServicios.ToListAsync() });
        });
    }
}
