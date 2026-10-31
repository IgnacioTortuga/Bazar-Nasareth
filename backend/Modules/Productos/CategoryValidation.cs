using Microsoft.EntityFrameworkCore;
using static ContentRules;

public static class CategoryValidation
{
    public static async Task<string?> Validate(Categoria x, BazarDb db)
    {
        if (string.IsNullOrWhiteSpace(x.Nombre) || !Order(x.Orden))
            return "Nombre y orden válido requeridos.";
        if (!x.Activa && await db.Productos.AnyAsync(p => p.CategoriaId == x.Id && p.Estado == "Publicado"))
            return "Archive los productos publicados antes de desactivar la categoría.";
        return null;
    }
}
