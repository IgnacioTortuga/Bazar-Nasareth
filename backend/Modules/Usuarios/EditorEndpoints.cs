using static EditorValidation;
using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static Passwords;

public static class EditorEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        admin.MapGet("/editores", async (HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "usuarios"))
                return Results.Forbid();
            return Results.Ok(await db.Editores.Select(x => new { x.Id, x.Nombre, x.Email, x.Activo, x.Completo, x.Permisos }).ToListAsync());
        });
        admin.MapPost("/editores", async (NewEditor input, HttpContext ctx, BazarDb db) =>
        {
            var actor = await Actor(ctx, db);
            if (!Allowed(ctx, actor, "usuarios"))
                return Results.Forbid();
            var error = CheckEditor(input.Nombre, input.Email, input.Password, input.Completo, input.Permisos, actor!);
            if (error is not null)
                return Results.BadRequest(error);
            var e = new Editor
            {
                Nombre = input.Nombre.Trim(),
                Email = input.Email.Trim().ToLowerInvariant(),
                PasswordHash = Hash(input.Password),
                Completo = input.Completo,
                Permisos = string.Join(',', input.Permisos.Distinct()),
                Activo = true
            };
            if (await db.Editores.AnyAsync(x => x.Email == e.Email))
                return Results.Conflict("El correo ya existe.");
            db.Editores.Add(e);
            await db.SaveChangesAsync();
            return Results.Ok(Account(e));
        });
        admin.MapPut("/editores/{id:int}", async (int id, EditEditor input, HttpContext ctx, BazarDb db) =>
        {
            var actor = await Actor(ctx, db);
            if (!Allowed(ctx, actor, "usuarios"))
                return Results.Forbid();
            var e = await db.Editores.FindAsync(id);
            if (e is null)
                return Results.NotFound();
            if (e.Completo && !actor!.Completo)
                return Results.Forbid();
            if (id == actor!.Id && (!input.Activo || !input.Completo))
                return Results.BadRequest("No puede retirar su propio acceso completo.");
            if (e.Completo && (!input.Activo || !input.Completo) && await db.Editores.CountAsync(x => x.Completo && x.Activo) <= 1)
                return Results.BadRequest("Debe permanecer al menos un administrador completo.");
            var error = CheckEditor(input.Nombre, input.Email, input.Password, input.Completo, input.Permisos, actor, false);
            if (error is not null)
                return Results.BadRequest(error);
            var email = input.Email.Trim().ToLowerInvariant();
            if (await db.Editores.AnyAsync(x => x.Id != id && x.Email == email))
                return Results.Conflict("El correo ya existe.");
            e.Nombre = input.Nombre.Trim();
            e.Email = email;
            e.Activo = input.Activo;
            e.Completo = input.Completo;
            e.Permisos = string.Join(',', input.Permisos.Distinct());
            if (!string.IsNullOrEmpty(input.Password))
                e.PasswordHash = Hash(input.Password);
            await db.SaveChangesAsync();
            return Results.Ok(Account(e));
        });
    }
}
