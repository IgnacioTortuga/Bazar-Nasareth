using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static Passwords;

public static class SessionEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/api/login", async (Login input, HttpContext ctx, BazarDb db) =>
        {
            var user = await db.Editores.SingleOrDefaultAsync(x => x.Email == input.Email.Trim().ToLower());
            if (user is null || !user.Activo || !Verify(input.Password, user.PasswordHash))
                return Results.Unauthorized();
            await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())], CookieAuthenticationDefaults.AuthenticationScheme)));
            return Results.Ok(Account(user));
        });
        app.MapPost("/api/logout", async (HttpContext ctx) =>
        {
            await ctx.SignOutAsync();
            return Results.Ok();
        }).RequireAuthorization();
        app.MapGet("/api/session", async (HttpContext ctx, BazarDb db) =>
        {
            var user = await Actor(ctx, db);
            return user is null ? Results.Unauthorized() : Results.Ok(Account(user));
        });
    }
}
