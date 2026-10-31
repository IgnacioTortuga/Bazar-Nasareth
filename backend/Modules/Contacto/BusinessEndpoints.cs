using System.Net.Mail;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using static EditorAccess;

public static class BusinessEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        admin.MapGet("/negocio", async (HttpContext ctx, BazarDb db) => await Actor(ctx, db) is not null ? Results.Ok(await db.Negocio.SingleAsync(x => x.Id == 1)) : Results.Forbid());
        admin.MapPut("/negocio", async (InformacionNegocio input, HttpContext ctx, BazarDb db) =>
        {
            if (!Allowed(ctx, await Actor(ctx, db), "contacto"))
                return Results.Forbid();
            if (string.IsNullOrWhiteSpace(input.Nombre) || string.IsNullOrWhiteSpace(input.Direccion) || string.IsNullOrWhiteSpace(input.Horario) || Regex.Replace(input.Telefono ?? "", "[^0-9]", "").Length is < 8 or > 15 || (!string.IsNullOrWhiteSpace(input.Email) && !MailAddress.TryCreate(input.Email, out _)) || !Uri.TryCreate(input.EnlaceContacto, UriKind.Absolute, out var contactLink) || contactLink.Scheme != Uri.UriSchemeHttps)
                return Results.BadRequest("Complete nombre, dirección, horario, teléfono válido y enlace HTTPS; revise el correo opcional.");
            var item = await db.Negocio.SingleAsync(x => x.Id == 1);
            input.Id = 1;
            var previousWhatsApp = "https://wa.me/" + Regex.Replace(item.Telefono, "[^0-9]", "");
            if (input.EnlaceContacto == item.EnlaceContacto && item.EnlaceContacto == previousWhatsApp)
                input.EnlaceContacto = "https://wa.me/" + Regex.Replace(input.Telefono ?? "", "[^0-9]", "");
            db.Entry(item).CurrentValues.SetValues(input);
            await db.SaveChangesAsync();
            return Results.Ok(item);
        });
    }
}
