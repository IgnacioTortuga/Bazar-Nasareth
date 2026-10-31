using Microsoft.EntityFrameworkCore;
using static ContentRules;

public static class ServiceValidation
{
    public static async Task<string?> Validate(Servicio x, BazarDb db)
    {
        if (!Status(x.Estado) || !Order(x.Orden))
            return "Estado u orden inválido.";
        if (Price(x.PrecioDesde, x.Moneda) is string servicePriceError)
            return servicePriceError;
        if (x.ImagenId.HasValue && !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId))
            return "Imagen no encontrada.";
        if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Nombre) || string.IsNullOrWhiteSpace(x.Descripcion) || string.IsNullOrWhiteSpace(x.Alcance)))
            return "Para publicar: nombre, descripción y alcance.";
        return null;
    }
}
