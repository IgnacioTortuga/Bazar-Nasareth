using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static RecordValidation;

public static class ContentCrud
{
    public static void MapPublishableCrud<T>(RouteGroupBuilder admin, string path, string permission)
        where T : class, IPublishableRecord, new()
    {
        MapCrud<T>(admin, path, permission);
        admin.MapDelete("/" + path + "/{id:int}", async (int id, HttpContext ctx, BazarDb db) =>
        {
            var actor = await Actor(ctx, db);
            var isSection = typeof(T) == typeof(SeccionContenido);
            if (!Allowed(ctx, actor, permission) && (!isSection || !Allowed(ctx, actor, "portada")))
                return Results.Forbid();

            try
            {
                await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
                var item = await db.Set<T>().FindAsync(id);
                if (item is null)
                    return Results.NotFound();
                var required = item is SeccionContenido { Clave: "portada" } ? "portada" : permission;
                if (isSection && !Allowed(ctx, actor, required))
                    return Results.Forbid();
                if (item.Estado != "Archivado")
                    return Results.BadRequest("Archive este contenido antes de eliminarlo.");

                if ((item is Producto && await db.PromocionProductos.AnyAsync(x => x.ProductoId == id)) ||
                    (item is Servicio && await db.PromocionServicios.AnyAsync(x => x.ServicioId == id)))
                    return Results.Conflict("Quite este contenido de las promociones relacionadas antes de eliminarlo.");

                // Las instalaciones anteriores pueden no tener las tablas opcionales de métricas.
                if (item is Producto)
                    await db.Database.ExecuteSqlInterpolatedAsync($"""
                        IF OBJECT_ID(N'dbo.ClicWhatsApp', N'U') IS NOT NULL
                            EXEC sys.sp_executesql N'DELETE FROM dbo.ClicWhatsApp WHERE ProductoId = @id', N'@id int', @id = {id};
                        """);
                else if (item is GaleriaImagen)
                    await db.Database.ExecuteSqlInterpolatedAsync($"""
                        IF OBJECT_ID(N'dbo.ClicWhatsAppGaleria', N'U') IS NOT NULL
                            EXEC sys.sp_executesql N'DELETE FROM dbo.ClicWhatsAppGaleria WHERE GaleriaImagenId = @id', N'@id int', @id = {id};
                        """);

                db.Set<T>().Remove(item);
                await db.SaveChangesAsync();
                await transaction.CommitAsync();
                return Results.NoContent();
            }
            catch (Exception ex) when (ex is DbUpdateException or SqlException { Number: 1205 })
            {
                return Results.Conflict("No se pudo eliminar el contenido. Actualice la lista y revise si todavía está en uso.");
            }
        });
    }

    public static void MapCrud<T>(RouteGroupBuilder admin, string path, string permission)
        where T : class, IRecord, new()
    {
        admin.MapGet("/" + path, async (HttpContext ctx, BazarDb db) => await Actor(ctx, db) is not null ? Results.Ok(await db.Set<T>().AsNoTracking().ToListAsync()) : Results.Forbid());
        admin.MapPost("/" + path, async (T input, HttpContext ctx, BazarDb db) =>
        {
            var required = input is SeccionContenido section && section.Clave == "portada" ? "portada" : permission;
            if (!Allowed(ctx, await Actor(ctx, db), required))
                return Results.Forbid();
            input.Id = 0;
            var error = await Validate(input, db);
            if (error is not null)
                return Results.BadRequest(error);
            db.Set<T>().Add(input);
            try
            {
                await db.SaveChangesAsync();
                return Results.Ok(input);
            }
            catch (DbUpdateException)
            {
                return Results.BadRequest("Referencia, nombre u orden duplicado o inválido.");
            }
        });
        admin.MapPut("/" + path + "/{id:int}", async (int id, T input, HttpContext ctx, BazarDb db) =>
        {
            var item = await db.Set<T>().FindAsync(id);
            if (item is null)
                return Results.NotFound();
            var required = input is SeccionContenido section && section.Clave == "portada" ? "portada" : permission;
            if (!Allowed(ctx, await Actor(ctx, db), required) || (item is SeccionContenido old && old.Clave == "portada" && !Allowed(ctx, await Actor(ctx, db), "portada")))
                return Results.Forbid();
            input.Id = id;
            var error = await Validate(input, db);
            if (error is not null)
                return Results.BadRequest(error);
            db.Entry(item).CurrentValues.SetValues(input);
            try
            {
                await db.SaveChangesAsync();
                return Results.Ok(item);
            }
            catch (DbUpdateException)
            {
                return Results.BadRequest("Referencia, nombre u orden duplicado o inválido.");
            }
        });
    }
}
