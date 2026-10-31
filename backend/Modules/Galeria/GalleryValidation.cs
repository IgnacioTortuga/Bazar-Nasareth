using Microsoft.EntityFrameworkCore;
using static ContentRules;

public static class GalleryValidation
{
    public static async Task<string?> Validate(GaleriaImagen x, BazarDb db)
    {
        if (!Status(x.Estado) || !Order(x.Orden) || !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId))
            return "Orden, estado o imagen inválidos.";
        return null;
    }
}
