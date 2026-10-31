using Microsoft.EntityFrameworkCore;
using static Passwords;

public static class DatabaseInitialization
{
    public static async Task InitializeAsync(WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<BazarDb>();
            await db.Database.EnsureCreatedAsync();
            if (!await db.Negocio.AnyAsync())
            {
                db.Negocio.Add(new InformacionNegocio());
                await db.SaveChangesAsync();
            }

            if (!await db.Editores.AnyAsync())
            {
                var email = app.Configuration["INITIAL_ADMIN_EMAIL"];
                var password = app.Configuration["INITIAL_ADMIN_PASSWORD"];
                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || password.Length < 12)
                    throw new Exception("Defina INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD (mínimo 12 caracteres) para la primera ejecución.");
                db.Editores.Add(new Editor { Nombre = "Administrador inicial", Email = email.Trim().ToLowerInvariant(), PasswordHash = Hash(password), Completo = true });
                await db.SaveChangesAsync();
            }
        }
    }
}
