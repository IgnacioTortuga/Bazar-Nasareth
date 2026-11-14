using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static ContentCrud;

public static class ProductEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapCrud<Categoria>(admin, "categorias", "productos");
        MapPublishableCrud<Producto>(admin, "productos", "productos");
        admin.MapPut("/productos/{id:int}/imagenes", async (int id, List<int> ids, HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "productos"))
                return Results.Forbid();
            var item = await db.Productos.FindAsync(id);
            if (item is null)
                return Results.NotFound();
            if (ids.Count != ids.Distinct().Count() || (item.Estado == "Publicado" && ids.Count == 0) || await db.Imagenes.CountAsync(x => ids.Contains(x.Id)) != ids.Count)
                return Results.BadRequest("Seleccione imágenes válidas y sin repetir.");
            await using var transaction = await db.Database.BeginTransactionAsync();
            await db.ProductoImagenes.Where(x => x.ProductoId == id).ExecuteDeleteAsync();
            for (var i = 0; i < ids.Count; i++)
                db.ProductoImagenes.Add(new ProductoImagen { ProductoId = id, ImagenId = ids[i], Orden = i });
            await db.SaveChangesAsync();
            await transaction.CommitAsync();
            return Results.Ok();
        });
        admin.MapPost("/productos/guardar", (ProductSave input, HttpContext ctx, BazarDb db) => Save(input.Producto, 0, input.Imagenes, ctx, db));
        admin.MapPut("/productos/{id:int}/guardar", (int id, ProductSave input, HttpContext ctx, BazarDb db) => Save(input.Producto, id, input.Imagenes, ctx, db));
    }

    static async Task<IResult> Save(Producto? input, int id, int[]? ids, HttpContext ctx, BazarDb db)
    {
        if (!Allowed(ctx, await Actor(ctx, db), "productos"))
            return Results.Forbid();
        if (input is null || ids is null)
            return Results.BadRequest("Faltan los datos o las relaciones del contenido.");
        if (ids.Distinct().Count() != ids.Length)
            return Results.BadRequest("Hay relaciones repetidas. Revise la selección.");
        await using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            var item = id == 0 ? null : await db.Productos.FindAsync(id);
            if (id != 0 && item is null)
                return Results.NotFound("El contenido ya no existe. Actualice la lista antes de continuar.");
            input.Id = id;
            if (await db.Imagenes.CountAsync(x => ids.Contains(x.Id)) != ids.Length)
                return Results.BadRequest("Una de las imágenes seleccionadas ya no existe. Revise la selección.");
            var error = await ProductValidation.Validate(input, db, ids.Length > 0);
            if (error is not null)
                return Results.BadRequest(error);
            if (item is null)
                db.Productos.Add(input);
            else
                db.Entry(item).CurrentValues.SetValues(input);
            await db.SaveChangesAsync();
            await db.ProductoImagenes.Where(x => x.ProductoId == input.Id).ExecuteDeleteAsync();
            db.ProductoImagenes.AddRange(ids.Select((imageId, order) => new ProductoImagen { ProductoId = input.Id, ImagenId = imageId, Orden = order }));
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
