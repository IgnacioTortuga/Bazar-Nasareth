using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static ContentCrud;

public static class GalleryEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapCrud<GaleriaImagen>(admin, "galeria", "galeria");
        admin.MapDelete("/galeria/{id:int}", async (int id, HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "galeria"))
                return Results.Forbid();
            await using var transaction = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            var item = await db.Galeria.FindAsync(id);
            if (item is null) return Results.NotFound();
            if (item.Estado != "Archivado")
                return Results.BadRequest("Archive esta entrada antes de eliminarla.");
            // Sus métricas dependen de la entrada; la fotografía puede tener otros usos.
            await db.ClicsWhatsAppGaleria.Where(x => x.GaleriaImagenId == id).ExecuteDeleteAsync();
            db.Galeria.Remove(item);
            await db.SaveChangesAsync();
            await transaction.CommitAsync();
            return Results.NoContent();
        });
    }
}
