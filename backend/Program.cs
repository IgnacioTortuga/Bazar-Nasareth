using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var keysDirectory = builder.Configuration["DataProtectionKeysDirectory"];
if (!string.IsNullOrWhiteSpace(keysDirectory))
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(Path.GetFullPath(keysDirectory)))
        .SetApplicationName("BazarNazareth");
builder.Services.AddDbContext<BazarDb>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Bazar") ?? throw new Exception("Falta ConnectionStrings:Bazar")));
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o =>
{
    o.Cookie.Name = "bazar.editor";
    o.Cookie.HttpOnly = true;
    o.Cookie.SameSite = SameSiteMode.Strict;
    // Production TLS may terminate at the host's proxy before reaching Kestrel.
    o.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    o.Events.OnRedirectToLogin = c =>
    {
        c.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    o.Events.OnRedirectToAccessDenied = c =>
    {
        c.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("clics", policy =>
    {
        policy.PermitLimit = 120;
        policy.Window = TimeSpan.FromMinutes(1);
        policy.QueueLimit = 0;
    });
});
var app = builder.Build();
var origin = builder.Configuration["FrontendOrigin"] ?? "http://localhost:5173";
var storage = Path.GetFullPath(builder.Configuration["ImageDirectory"] ?? Path.Combine(app.Environment.ContentRootPath, "uploaded-images"));
Directory.CreateDirectory(storage);
CopyMissingSeedImages(Path.Combine(app.Environment.ContentRootPath, "seed-images"), storage);
await DatabaseInitialization.InitializeAsync(app);
// El documento debe solicitar la versión actual; Vite ya versiona JS y CSS por contenido.
app.Use(async (ctx, next) =>
{
    ctx.Response.OnStarting(() =>
    {
        // API data and images can depend on the editor's session/publication state.
        if (ctx.Request.Path.StartsWithSegments("/api"))
            ctx.Response.Headers.CacheControl = "no-store";
        else if (ctx.Response.ContentType?.StartsWith("text/html", StringComparison.OrdinalIgnoreCase) == true)
            ctx.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
        return Task.CompletedTask;
    });
    await next();
});
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
// El proxy de Vite sirve frontend y API bajo el mismo origen. Se rechazan mutaciones de otros orígenes.
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path.StartsWithSegments("/api") && !HttpMethods.IsGet(ctx.Request.Method) && !HttpMethods.IsHead(ctx.Request.Method))
    {
        var incoming = ctx.Request.Headers.Origin.ToString();
        var own = $"{ctx.Request.Scheme}://{ctx.Request.Host}";
        if (incoming != origin && incoming != own)
        {
            ctx.Response.StatusCode = 403;
            return;
        }
    }

    await next();
});
SessionEndpoints.Map(app);
PublicEndpoints.Map(app, builder.Configuration);
var admin = app.MapGroup("/api/admin").RequireAuthorization();
BusinessEndpoints.Map(admin);
ImageEndpoints.Map(app, admin, storage);
ProductEndpoints.Map(admin);
ServiceEndpoints.Map(admin);
PromotionEndpoints.Map(admin);
GalleryEndpoints.Map(admin);
ContentEndpoints.Map(admin);
RelationsEndpoints.Map(admin);
EditorEndpoints.Map(admin);
ProductSharing.Map(app, builder.Configuration);
GallerySharing.Map(app, builder.Configuration);
MetricsEndpoints.Map(app, builder.Configuration);
app.MapFallbackToFile("index.html");
app.Run();

static void CopyMissingSeedImages(string source, string destination)
{
    if (!Directory.Exists(source)) return;

    foreach (var sourceFile in Directory.EnumerateFiles(source, "*", SearchOption.AllDirectories))
    {
        var relativePath = Path.GetRelativePath(source, sourceFile);
        var destinationFile = Path.Combine(destination, relativePath);
        var destinationDirectory = Path.GetDirectoryName(destinationFile);
        if (destinationDirectory is not null) Directory.CreateDirectory(destinationDirectory);
        if (!File.Exists(destinationFile)) File.Copy(sourceFile, destinationFile);
    }
}
