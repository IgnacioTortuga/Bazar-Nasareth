using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

public static class EditorAccess
{
    public static async Task<Editor?> Actor(HttpContext ctx, BazarDb db)
    {
        if (!int.TryParse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
            return null;
        return await db.Editores.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.Activo);
    }

    public static bool Allowed(HttpContext ctx, Editor? editor, string permission) => editor is not null && (editor.Completo || editor.Permisos.Split(',', StringSplitOptions.RemoveEmptyEntries).Contains(permission));
    public static object Account(Editor e) => new
    {
        e.Id,
        e.Nombre,
        e.Email,
        e.Activo,
        e.Completo,
        permisos = e.Permisos.Split(',', StringSplitOptions.RemoveEmptyEntries)
    };
}
