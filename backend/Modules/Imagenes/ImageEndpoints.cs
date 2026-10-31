using System.Text;
using Microsoft.EntityFrameworkCore;
using static EditorAccess;

public static class ImageEndpoints
{
    public static void Map(WebApplication app, RouteGroupBuilder admin, string storage)
    {
        app.MapGet("/api/imagenes/{id:int}/archivo", async (int id, HttpContext ctx, BazarDb db) =>
        {
            var img = await db.Imagenes.FindAsync(id);
            if (img is null)
                return Results.NotFound();
            var now = DateTimeOffset.UtcNow;
            var visible = await db.ProductoImagenes.AnyAsync(x => x.ImagenId == id && x.Producto.Estado == "Publicado" && x.Producto.Categoria.Activa) || await db.Servicios.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado") || await db.Promociones.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado" && now < x.Fin) || await db.Galeria.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado") || await db.Secciones.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado");
            if (!visible && await Actor(ctx, db) is null)
                return Results.NotFound();
            var file = Path.Combine(storage, Path.GetFileName(img.Ruta));
            return File.Exists(file) ? Results.File(file, img.TipoMime, enableRangeProcessing: true) : Results.NotFound();
        });
        admin.MapGet("/imagenes", async (HttpContext ctx, BazarDb db) => await Actor(ctx, db) is not null ? Results.Ok(await db.Imagenes.OrderByDescending(x => x.Id).ToListAsync()) : Results.Forbid());
        admin.MapPost("/imagenes", async (HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "imagenes"))
                return Results.Forbid();
            var form = await ctx.Request.ReadFormAsync();
            var archivo = form.Files.GetFile("archivo");
            var textoAlternativo = form["textoAlternativo"].ToString();
            if (archivo is null)
                return Results.BadRequest("Seleccione un archivo.");
            if (string.IsNullOrWhiteSpace(textoAlternativo) || archivo.Length < 12 || archivo.Length > 5 * 1024 * 1024)
                return Results.BadRequest("Texto alternativo requerido; archivo válido de máximo 5 MB.");
            var ext = Path.GetExtension(archivo.FileName).ToLowerInvariant();
            var mime = ext switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => ""
            };
            if (mime == "" || archivo.ContentType != mime)
                return Results.BadRequest("Solo JPG, PNG o WebP.");
            var header = new byte[12];
            await using (var stream = archivo.OpenReadStream())
                await stream.ReadExactlyAsync(header);
            var valid = mime switch
            {
                "image/jpeg" => header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff,
                "image/png" => header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
                _ => Encoding.ASCII.GetString(header, 0, 4) == "RIFF" && Encoding.ASCII.GetString(header, 8, 4) == "WEBP"
            };
            if (!valid)
                return Results.BadRequest("La firma del archivo no corresponde a su formato.");
            var name = Guid.NewGuid().ToString("N") + ext;
            await using (var file = File.Create(Path.Combine(storage, name)))
                await archivo.CopyToAsync(file);
            var img = new Imagen
            {
                Ruta = name,
                Nombre = Path.GetFileName(archivo.FileName),
                TipoMime = mime,
                TamanoBytes = archivo.Length,
                TextoAlternativo = textoAlternativo.Trim()
            };
            db.Imagenes.Add(img);
            await db.SaveChangesAsync();
            return Results.Ok(img);
        }).DisableAntiforgery();
        admin.MapPut("/imagenes/{id:int}", async (int id, Alt input, HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "imagenes"))
                return Results.Forbid();
            var img = await db.Imagenes.FindAsync(id);
            if (img is null)
                return Results.NotFound();
            if (string.IsNullOrWhiteSpace(input.TextoAlternativo))
                return Results.BadRequest("Falta texto alternativo.");
            img.TextoAlternativo = input.TextoAlternativo.Trim();
            await db.SaveChangesAsync();
            return Results.Ok(img);
        });
        admin.MapDelete("/imagenes/{id:int}", async (int id, HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "imagenes"))
                return Results.Forbid();
            var img = await db.Imagenes.FindAsync(id);
            if (img is null)
                return Results.NotFound();
            if (await db.ProductoImagenes.AnyAsync(x => x.ImagenId == id) || await db.Servicios.AnyAsync(x => x.ImagenId == id) || await db.Promociones.AnyAsync(x => x.ImagenId == id) || await db.Secciones.AnyAsync(x => x.ImagenId == id) || await db.Galeria.AnyAsync(x => x.ImagenId == id))
                return Results.Conflict("La imagen mantiene referencias activas.");
            db.Imagenes.Remove(img);
            await db.SaveChangesAsync();
            File.Delete(Path.Combine(storage, Path.GetFileName(img.Ruta)));
            return Results.Ok();
        });
    }
}
