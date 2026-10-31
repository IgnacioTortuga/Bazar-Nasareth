using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static RecordValidation;

public static class ContentCrud
{
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
