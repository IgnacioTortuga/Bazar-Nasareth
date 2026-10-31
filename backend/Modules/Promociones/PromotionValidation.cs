using Microsoft.EntityFrameworkCore;
using static ContentRules;

public static class PromotionValidation
{
    public static async Task<string?> Validate(Promocion x, BazarDb db)
    {
        if (!Status(x.Estado) || !Order(x.Orden) || (x.Inicio.HasValue && x.Fin.HasValue && x.Inicio >= x.Fin))
            return "Estado, orden o vigencia inválidos.";
        if (x.ImagenId.HasValue && !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId))
            return "Imagen no encontrada.";
        if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Titulo) || string.IsNullOrWhiteSpace(x.Descripcion) || string.IsNullOrWhiteSpace(x.Condiciones) || !x.ImagenId.HasValue || !x.Inicio.HasValue || !x.Fin.HasValue))
            return "Para publicar: título, descripción, condiciones, imagen e inicio y fin.";
        return null;
    }
}
