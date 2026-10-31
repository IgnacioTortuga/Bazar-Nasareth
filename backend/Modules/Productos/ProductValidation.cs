using Microsoft.EntityFrameworkCore;
using static ContentRules;

public static class ProductValidation
{
    public static async Task<string?> Validate(Producto x, BazarDb db, bool? hasProductImages = null)
    {
        if (!Status(x.Estado) || !Order(x.Orden))
            return "Estado u orden inválido.";
        if (Price(x.PrecioInformativo, x.Moneda) is string p)
            return p;
        if (!await db.Categorias.AnyAsync(c => c.Id == x.CategoriaId && (x.Estado != "Publicado" || c.Activa)))
            return "Categoría inexistente o inactiva.";
        if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Nombre) || string.IsNullOrWhiteSpace(x.Descripcion) || !(hasProductImages ?? await db.ProductoImagenes.AnyAsync(i => i.ProductoId == x.Id))))
            return "Para publicar: nombre, descripción y al menos una foto.";
        return null;
    }
}
