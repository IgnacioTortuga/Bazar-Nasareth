using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Net.Mail;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<BazarDb>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Bazar") ?? throw new Exception("Falta ConnectionStrings:Bazar")));
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o =>
{
    o.Cookie.Name = "bazar.editor"; o.Cookie.HttpOnly = true; o.Cookie.SameSite = SameSiteMode.Strict;
    o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    o.Events.OnRedirectToLogin = c => { c.Response.StatusCode = 401; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = c => { c.Response.StatusCode = 403; return Task.CompletedTask; };
});
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("clics", policy => {
        policy.PermitLimit = 120; policy.Window = TimeSpan.FromMinutes(1); policy.QueueLimit = 0;
    });
});
var app = builder.Build();
var origin = builder.Configuration["FrontendOrigin"] ?? "http://localhost:5173";
var storage = Path.GetFullPath(builder.Configuration["ImageDirectory"] ?? Path.Combine(app.Environment.ContentRootPath, "uploaded-images"));
Directory.CreateDirectory(storage);
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BazarDb>();
    await db.Database.EnsureCreatedAsync();
    if (!await db.Negocio.AnyAsync()) { db.Negocio.Add(new InformacionNegocio()); await db.SaveChangesAsync(); }
    if (!await db.Editores.AnyAsync())
    {
        var email = builder.Configuration["INITIAL_ADMIN_EMAIL"];
        var password = builder.Configuration["INITIAL_ADMIN_PASSWORD"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || password.Length < 12)
            throw new Exception("Defina INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD (mínimo 12 caracteres) para la primera ejecución.");
        db.Editores.Add(new Editor { Nombre = "Administrador inicial", Email = email.Trim().ToLowerInvariant(), PasswordHash = Hash(password), Completo = true });
        await db.SaveChangesAsync();
    }
}
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
        if (incoming != origin && incoming != own) { ctx.Response.StatusCode = 403; return; }
    }
    await next();
});
app.MapPost("/api/login", async (Login input, HttpContext ctx, BazarDb db) =>
{
    var user = await db.Editores.SingleOrDefaultAsync(x => x.Email == input.Email.Trim().ToLower());
    if (user is null || !user.Activo || !Verify(input.Password, user.PasswordHash)) return Results.Unauthorized();
    await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())], CookieAuthenticationDefaults.AuthenticationScheme)));
    return Results.Ok(Account(user));
});
app.MapPost("/api/logout", async (HttpContext ctx) => { await ctx.SignOutAsync(); return Results.Ok(); }).RequireAuthorization();
app.MapGet("/api/session", async (HttpContext ctx, BazarDb db) =>
{
    var user = await Actor(ctx, db); return user is null ? Results.Unauthorized() : Results.Ok(Account(user));
});

app.MapGet("/api/publico", async (BazarDb db) =>
{
    var now = DateTimeOffset.UtcNow;
    var categorias = await db.Categorias.AsNoTracking().Where(x => x.Activa).OrderBy(x => x.Orden).ToListAsync();
    var categoryIds = categorias.Select(x => x.Id).ToArray();
    var productos = await db.Productos.AsNoTracking().Where(x => x.Estado == "Publicado" && categoryIds.Contains(x.CategoriaId) &&
        !string.IsNullOrWhiteSpace(x.Nombre) && !string.IsNullOrWhiteSpace(x.Descripcion) &&
        db.ProductoImagenes.Any(i => i.ProductoId == x.Id)).OrderBy(x => x.Orden).ToListAsync();
    var productIds = productos.Select(x => x.Id).ToArray();
    var productImages = await db.ProductoImagenes.AsNoTracking().Where(x => productIds.Contains(x.ProductoId)).OrderBy(x => x.Orden).ToListAsync();
    var servicios = await db.Servicios.AsNoTracking().Where(x => x.Estado == "Publicado" &&
        !string.IsNullOrWhiteSpace(x.Nombre) && !string.IsNullOrWhiteSpace(x.Descripcion) &&
        !string.IsNullOrWhiteSpace(x.Alcance)).OrderBy(x => x.Orden).ToListAsync();
    var promociones = await db.Promociones.AsNoTracking().Where(x => x.Estado == "Publicado" &&
        !string.IsNullOrWhiteSpace(x.Titulo) && !string.IsNullOrWhiteSpace(x.Descripcion) &&
        !string.IsNullOrWhiteSpace(x.Condiciones) && x.ImagenId.HasValue &&
        x.Inicio.HasValue && x.Fin.HasValue && now < x.Fin)
        .OrderBy(x => x.Orden).ToListAsync();
    var galeria = await db.Galeria.AsNoTracking().Where(x => x.Estado == "Publicado" &&
        db.Imagenes.Any(i => i.Id == x.ImagenId)).OrderBy(x => x.Orden).ToListAsync();
    var secciones = await db.Secciones.AsNoTracking().Where(x => x.Estado == "Publicado" &&
        !string.IsNullOrWhiteSpace(x.Titulo) && !string.IsNullOrWhiteSpace(x.Cuerpo)).OrderBy(x => x.Orden).ToListAsync();
    var imagenes = await db.Imagenes.AsNoTracking().Select(x => new { x.Id, x.TextoAlternativo }).ToListAsync();
    return Results.Ok(new
    {
        negocio = await db.Negocio.AsNoTracking().SingleAsync(x => x.Id == 1),
        medicionWhatsApp = builder.Configuration.GetValue<bool>("MedicionWhatsApp:Enabled"),
        categorias,
        productos = productos.Select(x => new
        {
            x.Id,
            x.CategoriaId,
            x.Nombre,
            x.Descripcion,
            x.PrecioInformativo,
            x.Moneda,
            x.Destacado,
            imagenes = productImages.Where(i => i.ProductoId == x.Id).Select(i => i.ImagenId).ToArray()
        }),
        servicios,
        promociones,
        galeria,
        secciones,
        imagenes,
        promocionProductos = await db.PromocionProductos.AsNoTracking().Where(x => productIds.Contains(x.ProductoId) && db.Promociones.Any(p => p.Id == x.PromocionId && p.Estado == "Publicado" && now < p.Fin)).ToListAsync(),
        promocionServicios = await db.PromocionServicios.AsNoTracking().Where(x => db.Promociones.Any(p => p.Id == x.PromocionId && p.Estado == "Publicado" && now < p.Fin)).ToListAsync()
    });
});
app.MapGet("/api/imagenes/{id:int}/archivo", async (int id, HttpContext ctx, BazarDb db) =>
{
    var img = await db.Imagenes.FindAsync(id);
    if (img is null) return Results.NotFound();
    var now = DateTimeOffset.UtcNow;
    var visible = await db.ProductoImagenes.AnyAsync(x => x.ImagenId == id && x.Producto.Estado == "Publicado" && x.Producto.Categoria.Activa) ||
        await db.Servicios.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado") ||
        await db.Promociones.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado" && now < x.Fin) ||
        await db.Galeria.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado") ||
        await db.Secciones.AnyAsync(x => x.ImagenId == id && x.Estado == "Publicado");
    if (!visible && await Actor(ctx, db) is null) return Results.NotFound();
    var file = Path.Combine(storage, Path.GetFileName(img.Ruta));
    return File.Exists(file) ? Results.File(file, img.TipoMime, enableRangeProcessing: true) : Results.NotFound();
});
var admin = app.MapGroup("/api/admin").RequireAuthorization();
admin.MapGet("/negocio", async (HttpContext ctx, BazarDb db) => await Actor(ctx, db) is not null ? Results.Ok(await db.Negocio.SingleAsync(x => x.Id == 1)) : Results.Forbid());
admin.MapPut("/negocio", async (InformacionNegocio input, HttpContext ctx, BazarDb db) =>
{
    if (!Allowed(ctx, await Actor(ctx, db), "contacto")) return Results.Forbid();
    if (string.IsNullOrWhiteSpace(input.Nombre) || string.IsNullOrWhiteSpace(input.Direccion) || string.IsNullOrWhiteSpace(input.Horario) ||
        Regex.Replace(input.Telefono ?? "", "[^0-9]", "").Length is < 8 or > 15 ||
        (!string.IsNullOrWhiteSpace(input.Email) && !MailAddress.TryCreate(input.Email, out _)) ||
        !Uri.TryCreate(input.EnlaceContacto, UriKind.Absolute, out var contactLink) || contactLink.Scheme != Uri.UriSchemeHttps)
        return Results.BadRequest("Complete nombre, dirección, horario, teléfono válido y enlace HTTPS; revise el correo opcional.");
    var item = await db.Negocio.SingleAsync(x => x.Id == 1); input.Id = 1;
    var previousWhatsApp = "https://wa.me/" + Regex.Replace(item.Telefono, "[^0-9]", "");
    if (input.EnlaceContacto == item.EnlaceContacto && item.EnlaceContacto == previousWhatsApp)
        input.EnlaceContacto = "https://wa.me/" + Regex.Replace(input.Telefono ?? "", "[^0-9]", "");
    db.Entry(item).CurrentValues.SetValues(input); await db.SaveChangesAsync(); return Results.Ok(item);
});
MapCrud<Categoria>(admin, "categorias", "productos"); MapCrud<Producto>(admin, "productos", "productos");
MapCrud<Servicio>(admin, "servicios", "servicios"); MapCrud<Promocion>(admin, "promociones", "promociones");
MapCrud<SeccionContenido>(admin, "secciones", "textos"); MapCrud<GaleriaImagen>(admin, "galeria", "galeria");
admin.MapGet("/imagenes", async (HttpContext ctx, BazarDb db) => await Actor(ctx, db) is not null ? Results.Ok(await db.Imagenes.OrderByDescending(x => x.Id).ToListAsync()) : Results.Forbid());
admin.MapPost("/imagenes", async (HttpContext ctx, BazarDb db) =>
{
    if (!Allowed(ctx, await Actor(ctx, db), "imagenes")) return Results.Forbid();
    var form = await ctx.Request.ReadFormAsync();
    var archivo = form.Files.GetFile("archivo");
    var textoAlternativo = form["textoAlternativo"].ToString();
    if (archivo is null) return Results.BadRequest("Seleccione un archivo.");
    if (string.IsNullOrWhiteSpace(textoAlternativo) || archivo.Length < 12 || archivo.Length > 5 * 1024 * 1024) return Results.BadRequest("Texto alternativo requerido; archivo válido de máximo 5 MB.");
    var ext = Path.GetExtension(archivo.FileName).ToLowerInvariant();
    var mime = ext switch { ".jpg" or ".jpeg" => "image/jpeg", ".png" => "image/png", ".webp" => "image/webp", _ => "" };
    if (mime == "" || archivo.ContentType != mime) return Results.BadRequest("Solo JPG, PNG o WebP.");
    var header = new byte[12];
    await using (var stream = archivo.OpenReadStream()) await stream.ReadExactlyAsync(header);
    var valid = mime switch
    {
        "image/jpeg" => header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff,
        "image/png" => header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
        _ => Encoding.ASCII.GetString(header, 0, 4) == "RIFF" && Encoding.ASCII.GetString(header, 8, 4) == "WEBP"
    };
    if (!valid) return Results.BadRequest("La firma del archivo no corresponde a su formato.");
    var name = Guid.NewGuid().ToString("N") + ext;
    await using (var file = File.Create(Path.Combine(storage, name))) await archivo.CopyToAsync(file);
    var img = new Imagen { Ruta = name, Nombre = Path.GetFileName(archivo.FileName), TipoMime = mime, TamanoBytes = archivo.Length, TextoAlternativo = textoAlternativo.Trim() };
    db.Imagenes.Add(img); await db.SaveChangesAsync(); return Results.Ok(img);
}).DisableAntiforgery();
admin.MapPut("/imagenes/{id:int}", async (int id, Alt input, HttpContext ctx, BazarDb db) =>
{
    if (!Allowed(ctx, await Actor(ctx, db), "imagenes")) return Results.Forbid();
    var img = await db.Imagenes.FindAsync(id); if (img is null) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(input.TextoAlternativo)) return Results.BadRequest("Falta texto alternativo.");
    img.TextoAlternativo = input.TextoAlternativo.Trim(); await db.SaveChangesAsync(); return Results.Ok(img);
});
admin.MapDelete("/imagenes/{id:int}", async (int id, HttpContext ctx, BazarDb db) =>
{
    if (!Allowed(ctx, await Actor(ctx, db), "imagenes")) return Results.Forbid();
    var img = await db.Imagenes.FindAsync(id); if (img is null) return Results.NotFound();
    if (await db.ProductoImagenes.AnyAsync(x => x.ImagenId == id) || await db.Servicios.AnyAsync(x => x.ImagenId == id) ||
        await db.Promociones.AnyAsync(x => x.ImagenId == id) || await db.Secciones.AnyAsync(x => x.ImagenId == id) ||
        await db.Galeria.AnyAsync(x => x.ImagenId == id)) return Results.Conflict("La imagen mantiene referencias activas.");
    db.Imagenes.Remove(img); await db.SaveChangesAsync(); File.Delete(Path.Combine(storage, Path.GetFileName(img.Ruta))); return Results.Ok();
});
admin.MapGet("/relaciones", async (HttpContext ctx, BazarDb db) =>
{
    if (await Actor(ctx, db) is null) return Results.Forbid();
    return Results.Ok(new { productoImagenes = await db.ProductoImagenes.ToListAsync(), promocionProductos = await db.PromocionProductos.ToListAsync(), promocionServicios = await db.PromocionServicios.ToListAsync() });
});
admin.MapPut("/productos/{id:int}/imagenes", async (int id, List<int> ids, HttpContext ctx, BazarDb db) =>
{
    if (!Allowed(ctx, await Actor(ctx, db), "productos")) return Results.Forbid();
    var item = await db.Productos.FindAsync(id); if (item is null) return Results.NotFound();
    if (ids.Count != ids.Distinct().Count() || (item.Estado == "Publicado" && ids.Count == 0) || await db.Imagenes.CountAsync(x => ids.Contains(x.Id)) != ids.Count) return Results.BadRequest("Seleccione imágenes válidas y sin repetir.");
    await using var transaction = await db.Database.BeginTransactionAsync();
    await db.ProductoImagenes.Where(x => x.ProductoId == id).ExecuteDeleteAsync();
    for (var i = 0; i < ids.Count; i++) db.ProductoImagenes.Add(new ProductoImagen { ProductoId = id, ImagenId = ids[i], Orden = i });
    await db.SaveChangesAsync(); await transaction.CommitAsync(); return Results.Ok();
});
admin.MapPut("/promociones/{id:int}/relaciones", async (int id, PromotionLinks input, HttpContext ctx, BazarDb db) =>
{
    if (!Allowed(ctx, await Actor(ctx, db), "promociones")) return Results.Forbid();
    if (!await db.Promociones.AnyAsync(x => x.Id == id)) return Results.NotFound();
    var p = input.Productos.Distinct().ToArray(); var s = input.Servicios.Distinct().ToArray();
    if (p.Length != input.Productos.Length || s.Length != input.Servicios.Length || await db.Productos.CountAsync(x => p.Contains(x.Id)) != p.Length || await db.Servicios.CountAsync(x => s.Contains(x.Id)) != s.Length) return Results.BadRequest("Relaciones inválidas.");
    await using var transaction = await db.Database.BeginTransactionAsync();
    await db.PromocionProductos.Where(x => x.PromocionId == id).ExecuteDeleteAsync();
    await db.PromocionServicios.Where(x => x.PromocionId == id).ExecuteDeleteAsync();
    db.PromocionProductos.AddRange(p.Select(x => new PromocionProducto { PromocionId = id, ProductoId = x }));
    db.PromocionServicios.AddRange(s.Select(x => new PromocionServicio { PromocionId = id, ServicioId = x }));
    await db.SaveChangesAsync(); await transaction.CommitAsync(); return Results.Ok();
});
admin.MapGet("/editores", async (HttpContext ctx, BazarDb db) =>
{
    if (!Allowed(ctx, await Actor(ctx, db), "usuarios")) return Results.Forbid();
    return Results.Ok(await db.Editores.Select(x => new { x.Id, x.Nombre, x.Email, x.Activo, x.Completo, x.Permisos }).ToListAsync());
});
admin.MapPost("/editores", async (NewEditor input, HttpContext ctx, BazarDb db) =>
{
    var actor = await Actor(ctx, db); if (!Allowed(ctx, actor, "usuarios")) return Results.Forbid();
    var error = CheckEditor(input.Nombre, input.Email, input.Password, input.Completo, input.Permisos, actor!);
    if (error is not null) return Results.BadRequest(error);
    var e = new Editor { Nombre = input.Nombre.Trim(), Email = input.Email.Trim().ToLowerInvariant(), PasswordHash = Hash(input.Password), Completo = input.Completo, Permisos = string.Join(',', input.Permisos.Distinct()), Activo = true };
    if (await db.Editores.AnyAsync(x => x.Email == e.Email)) return Results.Conflict("El correo ya existe.");
    db.Editores.Add(e); await db.SaveChangesAsync(); return Results.Ok(Account(e));
});
admin.MapPut("/editores/{id:int}", async (int id, EditEditor input, HttpContext ctx, BazarDb db) =>
{
    var actor = await Actor(ctx, db); if (!Allowed(ctx, actor, "usuarios")) return Results.Forbid();
    var e = await db.Editores.FindAsync(id); if (e is null) return Results.NotFound();
    if (e.Completo && !actor!.Completo) return Results.Forbid();
    if (id == actor!.Id && (!input.Activo || !input.Completo)) return Results.BadRequest("No puede retirar su propio acceso completo.");
    if (e.Completo && (!input.Activo || !input.Completo) && await db.Editores.CountAsync(x => x.Completo && x.Activo) <= 1) return Results.BadRequest("Debe permanecer al menos un administrador completo.");
    var error = CheckEditor(input.Nombre, input.Email, input.Password, input.Completo, input.Permisos, actor, false);
    if (error is not null) return Results.BadRequest(error);
    var email = input.Email.Trim().ToLowerInvariant();
    if (await db.Editores.AnyAsync(x => x.Id != id && x.Email == email)) return Results.Conflict("El correo ya existe.");
    e.Nombre = input.Nombre.Trim(); e.Email = email; e.Activo = input.Activo; e.Completo = input.Completo; e.Permisos = string.Join(',', input.Permisos.Distinct());
    if (!string.IsNullOrEmpty(input.Password)) e.PasswordHash = Hash(input.Password);
    await db.SaveChangesAsync(); return Results.Ok(Account(e));
});
// El formulario guarda contenido y relaciones en una única transacción.
admin.MapPost("/productos/guardar", (ProductSave input, HttpContext ctx, BazarDb db) =>
    SaveContent(input.Producto, 0, input.Imagenes, null, ctx, db));
admin.MapPut("/productos/{id:int}/guardar", (int id, ProductSave input, HttpContext ctx, BazarDb db) =>
    SaveContent(input.Producto, id, input.Imagenes, null, ctx, db));
admin.MapPost("/promociones/guardar", (PromotionSave input, HttpContext ctx, BazarDb db) =>
    SaveContent(input.Promocion, 0, input.Productos, input.Servicios, ctx, db));
admin.MapPut("/promociones/{id:int}/guardar", (int id, PromotionSave input, HttpContext ctx, BazarDb db) =>
    SaveContent(input.Promocion, id, input.Productos, input.Servicios, ctx, db));
CatalogFeatures.Map(app, builder.Configuration);
app.Run();

static async Task<IResult> SaveContent<T>(T? input, int id, int[]? ids, int[]? serviceIds, HttpContext ctx, BazarDb db) where T : class, IRecord
{
    var product = typeof(T) == typeof(Producto);
    if (!Allowed(ctx, await Actor(ctx, db), product ? "productos" : "promociones")) return Results.Forbid();
    if (input is null || ids is null || (!product && serviceIds is null)) return Results.BadRequest("Faltan los datos o las relaciones del contenido.");
    serviceIds ??= [];
    if (ids.Distinct().Count() != ids.Length || serviceIds.Distinct().Count() != serviceIds.Length)
        return Results.BadRequest("Hay relaciones repetidas. Revise la selección.");
    await using var transaction = await db.Database.BeginTransactionAsync();
    try
    {
        var item = id == 0 ? null : await db.Set<T>().FindAsync(id);
        if (id != 0 && item is null) return Results.NotFound("El contenido ya no existe. Actualice la lista antes de continuar.");
        input.Id = id;
        if (product)
        {
            if (await db.Imagenes.CountAsync(x => ids.Contains(x.Id)) != ids.Length)
                return Results.BadRequest("Una de las imágenes seleccionadas ya no existe. Revise la selección.");
        }
        else if (await db.Productos.CountAsync(x => ids.Contains(x.Id)) != ids.Length ||
                 await db.Servicios.CountAsync(x => serviceIds.Contains(x.Id)) != serviceIds.Length)
            return Results.BadRequest("Un producto o servicio relacionado ya no existe. Revise la selección.");
        var error = await Validate(input, db, product ? ids.Length > 0 : null);
        if (error is not null) return Results.BadRequest(error);
        if (item is null) db.Set<T>().Add(input);
        else db.Entry(item).CurrentValues.SetValues(input);
        await db.SaveChangesAsync();
        if (product)
        {
            await db.ProductoImagenes.Where(x => x.ProductoId == input.Id).ExecuteDeleteAsync();
            db.ProductoImagenes.AddRange(ids.Select((imageId, order) => new ProductoImagen { ProductoId = input.Id, ImagenId = imageId, Orden = order }));
        }
        else
        {
            await db.PromocionProductos.Where(x => x.PromocionId == input.Id).ExecuteDeleteAsync();
            await db.PromocionServicios.Where(x => x.PromocionId == input.Id).ExecuteDeleteAsync();
            db.PromocionProductos.AddRange(ids.Select(productId => new PromocionProducto { PromocionId = input.Id, ProductoId = productId }));
            db.PromocionServicios.AddRange(serviceIds.Select(serviceId => new PromocionServicio { PromocionId = input.Id, ServicioId = serviceId }));
        }
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Results.Ok(item ?? input);
    }
    catch (DbUpdateException)
    {
        await transaction.RollbackAsync();
        return Results.Conflict("No se guardó ningún cambio. Una referencia cambió o un valor supera los límites permitidos; revise los datos y actualice la lista.");
    }
}

static void MapCrud<T>(RouteGroupBuilder admin, string path, string permission) where T : class, IRecord, new()
{
    admin.MapGet("/" + path, async (HttpContext ctx, BazarDb db) => await Actor(ctx, db) is not null ? Results.Ok(await db.Set<T>().AsNoTracking().ToListAsync()) : Results.Forbid());
    admin.MapPost("/" + path, async (T input, HttpContext ctx, BazarDb db) =>
    {
        var required = input is SeccionContenido section && section.Clave == "portada" ? "portada" : permission;
        if (!Allowed(ctx, await Actor(ctx, db), required)) return Results.Forbid();
        input.Id = 0; var error = await Validate(input, db); if (error is not null) return Results.BadRequest(error);
        db.Set<T>().Add(input);
        try { await db.SaveChangesAsync(); return Results.Ok(input); } catch (DbUpdateException) { return Results.BadRequest("Referencia, nombre u orden duplicado o inválido."); }
    });
    admin.MapPut("/" + path + "/{id:int}", async (int id, T input, HttpContext ctx, BazarDb db) =>
    {
        var item = await db.Set<T>().FindAsync(id); if (item is null) return Results.NotFound();
        var required = input is SeccionContenido section && section.Clave == "portada" ? "portada" : permission;
        if (!Allowed(ctx, await Actor(ctx, db), required) || (item is SeccionContenido old && old.Clave == "portada" && !Allowed(ctx, await Actor(ctx, db), "portada"))) return Results.Forbid();
        input.Id = id; var error = await Validate(input, db); if (error is not null) return Results.BadRequest(error);
        db.Entry(item).CurrentValues.SetValues(input);
        try { await db.SaveChangesAsync(); return Results.Ok(item); } catch (DbUpdateException) { return Results.BadRequest("Referencia, nombre u orden duplicado o inválido."); }
    });
}
static async Task<string?> Validate<T>(T input, BazarDb db, bool? hasProductImages = null) where T : class, IRecord
{
    static bool Status(string s) => s is "Borrador" or "Publicado" or "Archivado";
    static string? Price(decimal? value, string? currency) => value < 0 || (value.HasValue && string.IsNullOrWhiteSpace(currency)) ? "Precio no negativo y moneda obligatoria si hay precio." : null;
    static bool Order(int x) => x >= 0;
    switch (input)
    {
        case Categoria x:
            if (string.IsNullOrWhiteSpace(x.Nombre) || !Order(x.Orden)) return "Nombre y orden válido requeridos.";
            if (!x.Activa && await db.Productos.AnyAsync(p => p.CategoriaId == x.Id && p.Estado == "Publicado")) return "Archive los productos publicados antes de desactivar la categoría.";
            return null;
        case Producto x:
            if (!Status(x.Estado) || !Order(x.Orden)) return "Estado u orden inválido.";
            if (Price(x.PrecioInformativo, x.Moneda) is string p) return p;
            if (!await db.Categorias.AnyAsync(c => c.Id == x.CategoriaId && (x.Estado != "Publicado" || c.Activa))) return "Categoría inexistente o inactiva.";
            if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Nombre) || string.IsNullOrWhiteSpace(x.Descripcion) || !(hasProductImages ?? await db.ProductoImagenes.AnyAsync(i => i.ProductoId == x.Id)))) return "Para publicar: nombre, descripción y al menos una foto.";
            return null;
        case Servicio x:
            if (!Status(x.Estado) || !Order(x.Orden)) return "Estado u orden inválido.";
            if (Price(x.PrecioDesde, x.Moneda) is string servicePriceError) return servicePriceError;
            if (x.ImagenId.HasValue && !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId)) return "Imagen no encontrada.";
            if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Nombre) || string.IsNullOrWhiteSpace(x.Descripcion) || string.IsNullOrWhiteSpace(x.Alcance))) return "Para publicar: nombre, descripción y alcance.";
            return null;
        case Promocion x:
            if (!Status(x.Estado) || !Order(x.Orden) || (x.Inicio.HasValue && x.Fin.HasValue && x.Inicio >= x.Fin)) return "Estado, orden o vigencia inválidos.";
            if (x.ImagenId.HasValue && !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId)) return "Imagen no encontrada.";
            if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Titulo) || string.IsNullOrWhiteSpace(x.Descripcion) || string.IsNullOrWhiteSpace(x.Condiciones) || !x.ImagenId.HasValue || !x.Inicio.HasValue || !x.Fin.HasValue)) return "Para publicar: título, descripción, condiciones, imagen e inicio y fin.";
            return null;
        case SeccionContenido x:
            if (!Status(x.Estado) || !Order(x.Orden) || string.IsNullOrWhiteSpace(x.Clave)) return "Clave, orden o estado inválidos.";
            if (x.ImagenId.HasValue && !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId)) return "Imagen no encontrada.";
            if (x.Estado == "Publicado" && (string.IsNullOrWhiteSpace(x.Titulo) || string.IsNullOrWhiteSpace(x.Cuerpo))) return "Para publicar: título y contenido.";
            return null;
        case GaleriaImagen x:
            if (!Status(x.Estado) || !Order(x.Orden) || !await db.Imagenes.AnyAsync(i => i.Id == x.ImagenId)) return "Orden, estado o imagen inválidos.";
            return null;
        default: return "Tipo inválido.";
    }
}
static async Task<Editor?> Actor(HttpContext ctx, BazarDb db)
{
    if (!int.TryParse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return null;
    return await db.Editores.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.Activo);
}
static bool Allowed(HttpContext ctx, Editor? editor, string permission) => editor is not null && (editor.Completo || editor.Permisos.Split(',', StringSplitOptions.RemoveEmptyEntries).Contains(permission));
static object Account(Editor e) => new { e.Id, e.Nombre, e.Email, e.Activo, e.Completo, permisos = e.Permisos.Split(',', StringSplitOptions.RemoveEmptyEntries) };
static string Hash(string password)
{
    var salt = RandomNumberGenerator.GetBytes(16);
    var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 210_000, HashAlgorithmName.SHA256, 32);
    return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
}
static bool Verify(string password, string stored)
{
    try { var parts = stored.Split(':'); return parts.Length == 2 && CryptographicOperations.FixedTimeEquals(Convert.FromBase64String(parts[1]), Rfc2898DeriveBytes.Pbkdf2(password, Convert.FromBase64String(parts[0]), 210_000, HashAlgorithmName.SHA256, 32)); }
    catch (FormatException) { return false; }
}
static string? CheckEditor(string name, string email, string? password, bool full, string[] permissions, Editor actor, bool creating = true)
{
    string[] valid = ["portada", "productos", "servicios", "imagenes", "promociones", "galeria", "textos", "contacto", "usuarios"];
    if (string.IsNullOrWhiteSpace(name) || !MailAddress.TryCreate(email, out var parsed) || parsed.Address != email.Trim() || (creating && (password?.Length ?? 0) < 12) || (!creating && password is { Length: > 0 and < 12 })) return "Nombre, correo y contraseña de al menos 12 caracteres.";
    if (permissions.Except(valid).Any()) return "Permiso desconocido.";
    if (!actor.Completo && (full || permissions.Any(x => !actor.Permisos.Split(',').Contains(x)))) return "No puede conceder permisos que no posee.";
    return null;
}
record Login(string Email, string Password);
record Alt(string TextoAlternativo);
record PromotionLinks(int[] Productos, int[] Servicios);
record NewEditor(string Nombre, string Email, string Password, bool Completo, string[] Permisos);
record EditEditor(string Nombre, string Email, string? Password, bool Activo, bool Completo, string[] Permisos);

record ProductSave(Producto? Producto, int[]? Imagenes);
record PromotionSave(Promocion? Promocion, int[]? Productos, int[]? Servicios);
