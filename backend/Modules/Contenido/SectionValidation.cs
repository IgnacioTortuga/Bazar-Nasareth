using Microsoft.EntityFrameworkCore;
using static ContentRules;

public static class SectionValidation
{
    public static async Task<string?> Validate(SeccionContenido x, BazarDb db)
    {
        if (!Status(x.Estado) || !Order(x.Orden) || string.IsNullOrWhiteSpace(x.Clave))
            return "Clave, orden o estado inválidos.";
        if (x.ImagenId.HasValue && !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId))
            return "Imagen no encontrada.";
        if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Titulo) || string.IsNullOrWhiteSpace(x.Cuerpo)))
            return "Para publicar: título y contenido.";
        return null;
    }
}
