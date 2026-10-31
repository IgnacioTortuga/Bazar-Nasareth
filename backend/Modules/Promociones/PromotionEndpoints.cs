using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static ContentCrud;

public static class PromotionEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapCrud<Promocion>(admin, "promociones", "promociones");
        admin.MapPut("/promociones/{id:int}/relaciones", async (int id, PromotionLinks input, HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "promociones"))
                return Results.Forbid();
            if (!await db.Promociones.AnyAsync(x => x.Id == id))
                return Results.NotFound();
            var p = input.Productos.Distinct().ToArray();
            var s = input.Servicios.Distinct().ToArray();
            if (p.Length != input.Productos.Length || s.Length != input.Servicios.Length || await db.Productos.CountAsync(x => p.Contains(x.Id)) != p.Length || await db.Servicios.CountAsync(x => s.Contains(x.Id)) != s.Length)
                return Results.BadRequest("Relaciones inválidas.");
            await using var transaction = await db.Database.BeginTransactionAsync();
            await db.PromocionProductos.Where(x => x.PromocionId == id).ExecuteDeleteAsync();
            await db.PromocionServicios.Where(x => x.PromocionId == id).ExecuteDeleteAsync();
            db.PromocionProductos.AddRange(p.Select(x => new PromocionProducto { PromocionId = id, ProductoId = x }));
            db.PromocionServicios.AddRange(s.Select(x => new PromocionServicio { PromocionId = id, ServicioId = x }));
            await db.SaveChangesAsync();
            await transaction.CommitAsync();
            return Results.Ok();
        });
        admin.MapPost("/promociones/guardar", (PromotionSave input, HttpContext ctx, BazarDb db) => Save(input.Promocion, 0, input.Productos, input.Servicios, ctx, db));
        admin.MapPut("/promociones/{id:int}/guardar", (int id, PromotionSave input, HttpContext ctx, BazarDb db) => Save(input.Promocion, id, input.Productos, input.Servicios, ctx, db));
    }

    static async Task<IResult> Save(Promocion? input, int id, int[]? ids, int[]? serviceIds, HttpContext ctx, BazarDb db)
    {
        if (!Allowed(ctx, await Actor(ctx, db), "promociones"))
            return Results.Forbid();
        if (input is null || ids is null || serviceIds is null)
            return Results.BadRequest("Faltan los datos o las relaciones del contenido.");
        if (ids.Distinct().Count() != ids.Length || serviceIds.Distinct().Count() != serviceIds.Length)
            return Results.BadRequest("Hay relaciones repetidas. Revise la selección.");
        await using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            var item = id == 0 ? null : await db.Promociones.FindAsync(id);
            if (id != 0 && item is null)
                return Results.NotFound("El contenido ya no existe. Actualice la lista antes de continuar.");
            input.Id = id;
            if (await db.Productos.CountAsync(x => ids.Contains(x.Id)) != ids.Length || await db.Servicios.CountAsync(x => serviceIds.Contains(x.Id)) != serviceIds.Length)
                return Results.BadRequest("Un producto o servicio relacionado ya no existe. Revise la selección.");
            var error = await PromotionValidation.Validate(input, db);
            if (error is not null)
                return Results.BadRequest(error);
            if (item is null)
                db.Promociones.Add(input);
            else
                db.Entry(item).CurrentValues.SetValues(input);
            await db.SaveChangesAsync();
            await db.PromocionProductos.Where(x => x.PromocionId == input.Id).ExecuteDeleteAsync();
            await db.PromocionServicios.Where(x => x.PromocionId == input.Id).ExecuteDeleteAsync();
            db.PromocionProductos.AddRange(ids.Select(productId => new PromocionProducto { PromocionId = input.Id, ProductoId = productId }));
            db.PromocionServicios.AddRange(serviceIds.Select(serviceId => new PromocionServicio { PromocionId = input.Id, ServicioId = serviceId }));
            await db.SaveChangesAsync();
            await transaction.CommitAsync();
            return Results.Ok(item ?? input);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            return Results.Conflict("No se guardó ningún cambio. Una referencia cambió o un valor supera los límites permitidos; revise los datos y actualice la lista.");
        }
    }
}
