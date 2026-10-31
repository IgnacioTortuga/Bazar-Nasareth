using System.Globalization;
using System.Net;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

public static class CatalogFeatures
{
    public static IQueryable<Producto> PublicProducts(BazarDb db) => db.Productos.AsNoTracking().Where(p =>
        p.Estado == "Publicado" && p.Categoria.Activa &&
        !string.IsNullOrWhiteSpace(p.Nombre) && !string.IsNullOrWhiteSpace(p.Descripcion) &&
        db.ProductoImagenes.Any(i => i.ProductoId == p.Id));

    public static void Map(WebApplication app, IConfiguration configuration)
    {
        bool enabled = configuration.GetValue<bool>("MedicionWhatsApp:Enabled");
        app.MapPost("/api/productos/{id:int}/clic-whatsapp", async (int id, string? origen, BazarDb db, ILoggerFactory logs) =>
        {
            if (!enabled) return Results.NoContent();
            if (!await PublicProducts(db).AnyAsync(p => p.Id == id)) return Results.NotFound();
            var source = origen is "detalle" or "halloween" ? origen : "catalogo";
            var day = CostaRicaDay(DateTimeOffset.UtcNow);
            try
            {
                // HOLDLOCK serializa el alta de la clave producto/día; no hay incremento perdido.
                await using var transaction = await db.Database.BeginTransactionAsync();
                await db.Database.ExecuteSqlInterpolatedAsync($"""
                    UPDATE dbo.ClicWhatsApp WITH (UPDLOCK, HOLDLOCK)
                    SET Cantidad = Cantidad + 1 WHERE ProductoId = {id} AND Dia = {day} AND Origen = {source};
                    IF @@ROWCOUNT = 0
                        INSERT INTO dbo.ClicWhatsApp (ProductoId, Dia, Origen, Cantidad) VALUES ({id}, {day}, {source}, 1);
                    """);
                await transaction.CommitAsync();
                return Results.NoContent();
            }
            catch (Exception ex) when (ex is System.Data.Common.DbException or DbUpdateException)
            {
                logs.CreateLogger("MedicionWhatsApp").LogWarning("No se pudo registrar un clic de WhatsApp.");
                return Results.StatusCode(503);
            }
        }).RequireRateLimiting("clics");

        app.MapPost("/api/galeria/{id:int}/clic-whatsapp", async (int id, BazarDb db, ILoggerFactory logs) =>
        {
            if (!enabled) return Results.NoContent();
            if (!await db.Galeria.AsNoTracking().AnyAsync(g => g.Id == id && g.Estado == "Publicado")) return Results.NotFound();
            var day = CostaRicaDay(DateTimeOffset.UtcNow);
            try
            {
                await using var transaction = await db.Database.BeginTransactionAsync();
                await db.Database.ExecuteSqlInterpolatedAsync($"""
                    UPDATE dbo.ClicWhatsAppGaleria WITH (UPDLOCK, HOLDLOCK)
                    SET Cantidad = Cantidad + 1 WHERE GaleriaImagenId = {id} AND Dia = {day};
                    IF @@ROWCOUNT = 0
                        INSERT INTO dbo.ClicWhatsAppGaleria (GaleriaImagenId, Dia, Cantidad) VALUES ({id}, {day}, 1);
                    """);
                await transaction.CommitAsync();
                return Results.NoContent();
            }
            catch (Exception ex) when (ex is System.Data.Common.DbException or DbUpdateException)
            {
                logs.CreateLogger("MedicionWhatsApp").LogWarning("No se pudo registrar un clic de WhatsApp desde la galería.");
                return Results.StatusCode(503);
            }
        }).RequireRateLimiting("clics");

        app.MapGet("/api/admin/metricas/whatsapp", async (HttpContext ctx, BazarDb db) =>
        {
            if (!int.TryParse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Results.Forbid();
            var actor = await db.Editores.AsNoTracking().SingleOrDefaultAsync(e => e.Id == id && e.Activo);
            if (actor is null || (!actor.Completo && !actor.Permisos.Split(',').Contains("productos"))) return Results.Forbid();
            ctx.Response.Headers.CacheControl = "no-store";
            if (!enabled) return Results.Ok(new { habilitada = false, productos = Array.Empty<object>() });
            var start = CostaRicaDay(DateTimeOffset.UtcNow).AddDays(-29);
            var products = await db.ClicsWhatsApp.AsNoTracking().Where(c => c.Dia >= start)
                .Join(db.Productos, c => c.ProductoId, p => p.Id, (c, p) => new { c.ProductoId, c.Cantidad, c.Origen, p.Nombre })
                .GroupBy(c => new { c.ProductoId, c.Nombre, c.Origen })
                .Select(g => new { g.Key.ProductoId, g.Key.Nombre, g.Key.Origen, clics = g.Sum(x => x.Cantidad) })
                .OrderByDescending(c => c.clics).ToListAsync();
            var gallery = await db.ClicsWhatsAppGaleria.AsNoTracking().Where(c => c.Dia >= start)
                .Join(db.Galeria, c => c.GaleriaImagenId, g => g.Id, (c, g) => new { c.GaleriaImagenId, c.Cantidad, g.Titulo })
                .GroupBy(c => new { c.GaleriaImagenId, c.Titulo })
                .Select(g => new { g.Key.GaleriaImagenId, g.Key.Titulo, clics = g.Sum(x => x.Cantidad) })
                .OrderByDescending(c => c.clics).ToListAsync();
            var origins = products.GroupBy(p => p.Origen)
                .Select(g => new { origen = g.Key, clics = g.Sum(x => x.clics) }).ToList();
            if (gallery.Count > 0) origins.Add(new { origen = "galeria", clics = gallery.Sum(x => x.clics) });
            return Results.Ok(new { habilitada = true, desde = start, origenes = origins.OrderByDescending(x => x.clics), productos = products, galeria = gallery });
        }).RequireAuthorization();

        app.MapGet("/producto/{id:int}", async (int id, BazarDb db, HttpContext ctx) =>
        {
            var product = await PublicProducts(db).SingleOrDefaultAsync(p => p.Id == id);
            ctx.Response.Headers.CacheControl = "no-store";
            if (product is null) return Results.Content("<!doctype html><html lang=\"es\"><meta charset=\"utf-8\"><title>Producto no disponible</title><h1>Este producto no está disponible</h1><a href=\"/#productos\">Volver al catálogo</a></html>", "text/html; charset=utf-8", statusCode: 404);
            var business = await db.Negocio.AsNoTracking().SingleAsync(n => n.Id == 1);
            var images = await db.ProductoImagenes.AsNoTracking().Where(i => i.ProductoId == id)
                .OrderBy(i => i.Orden).Join(db.Imagenes, i => i.ImagenId, image => image.Id,
                    (i, image) => new ProductPhoto(image.Id, image.TextoAlternativo)).ToListAsync();
            // Se configura el dominio público explícitamente: no confiar en Host para metadatos compartidos.
            var publicUrl = configuration["PublicSiteUrl"];
            return Results.Content(RenderProduct(product, business, images, publicUrl, enabled), "text/html; charset=utf-8");
        });
    }

    public static DateOnly CostaRicaDay(DateTimeOffset now) => DateOnly.FromDateTime(now.ToOffset(TimeSpan.FromHours(-6)).DateTime);

    public static string RenderProduct(Producto p, InformacionNegocio business, IReadOnlyList<ProductPhoto> images, string? siteUrl, bool measure)
    {
        static string E(string? value) => WebUtility.HtmlEncode(value ?? "");
        var validUrl = Uri.TryCreate(siteUrl, UriKind.Absolute, out var site) &&
            site.Scheme == "https" && string.IsNullOrEmpty(site.UserInfo) && string.IsNullOrEmpty(site.Query) && string.IsNullOrEmpty(site.Fragment);
        var root = validUrl ? site!.GetLeftPart(UriPartial.Authority) : null;
        var pageUrl = root + $"/producto/{p.Id}";
        var metadata = root is null ? "" : $"<link rel=\"canonical\" href=\"{E(pageUrl)}\"><meta property=\"og:url\" content=\"{E(pageUrl)}\">";
        if (root is not null && images.Count > 0)
            metadata += $"<meta property=\"og:image\" content=\"{E(root)}/api/imagenes/{images[0].Id}/archivo\"><meta property=\"og:image:alt\" content=\"{E(images[0].Alt)}\">";
        var primaryPhoto = images[0];
        var thumbnails = images.Count > 1
            ? $"<div class=\"thumbnails\" aria-label=\"Fotografías del producto\">{string.Join("", images.Select((i, index) => $"<button type=\"button\" class=\"thumbnail{(index == 0 ? " active" : "")}\" aria-label=\"Mostrar fotografía {index + 1}\" aria-pressed=\"{(index == 0 ? "true" : "false")}\" data-src=\"/api/imagenes/{i.Id}/archivo\" data-alt=\"{E(i.Alt)}\"><img src=\"/api/imagenes/{i.Id}/archivo\" alt=\"\" loading=\"lazy\"></button>"))}</div>"
            : "";
        var phone = new string(business.Telefono.Where(char.IsAsciiDigit).ToArray());
        var message = Uri.EscapeDataString($"Hola, me interesa cotizar este producto:\n• Producto: {p.Nombre}\n• Modalidad: Por encargo\n\n¿Podrían confirmarme disponibilidad, plazo de entrega y precio final?");
        var price = p.PrecioInformativo.HasValue ? $"{p.Moneda} {p.PrecioInformativo.Value.ToString("N2", CultureInfo.GetCultureInfo("es-CR"))}" : "Consultar precio";
        var tracking = measure ? $"fetch('/api/productos/{p.Id}/clic-whatsapp?origen=detalle',{{method:'POST',credentials:'same-origin',keepalive:true}}).catch(()=>{{}});" : "";
        return $$$"""
            <!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
            <title>{{{E(p.Nombre)}}} · {{{E(business.Nombre)}}}</title><meta name="description" content="{{{E(p.Descripcion)}}}">
            <meta name="theme-color" content="#fffaf7">
            <meta property="og:type" content="product"><meta property="og:title" content="{{{E(p.Nombre)}}}">
            <meta property="og:description" content="{{{E(p.Descripcion)}}}">{{{metadata}}}
            <style>
            :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#493653;background:#fffaf7;line-height:1.6;font-synthesis:none}
            *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 8% 8%,#f9eaf3 0,transparent 25%),#fffaf7;color:#493653}img{display:block;max-width:100%}a{color:inherit}button{font:inherit}
            .detail-header{background:rgb(255 255 255 / 88%);border-bottom:1px solid #eee3ed;backdrop-filter:blur(14px);position:sticky;top:0;z-index:10}.header-inner,main,.footer-inner{margin:auto;max-width:1220px;width:calc(100% - 40px)}
            .header-inner{align-items:center;display:flex;justify-content:space-between;min-height:76px}.brand{align-items:center;color:#bd2767;display:flex;font-weight:800;gap:10px;text-decoration:none}.brand-mark{height:48px;object-fit:contain;width:48px}.header-note{color:#806e87;font-size:.82rem}
            main{padding:34px 0 64px}.back-link{align-items:center;color:#754682;display:inline-flex;font-size:.88rem;font-weight:750;gap:8px;margin-bottom:24px;min-height:44px;text-decoration:none}.back-link:hover{text-decoration:underline;text-underline-offset:5px}
            .product-layout{align-items:start;display:grid;gap:40px;grid-template-columns:minmax(0,1.18fr) minmax(340px,.82fr)}
            .media-card{min-width:0}.hero-stage{align-items:center;aspect-ratio:1/1;background:linear-gradient(145deg,#fff,#faf2f8);border:1px solid #eee2ed;border-radius:30px;box-shadow:0 24px 70px rgb(92 48 95 / 10%);display:flex;justify-content:center;overflow:hidden;padding:22px;position:relative}.hero-stage::after{border:1px solid rgb(190 77 132 / 10%);border-radius:22px;content:"";inset:12px;pointer-events:none;position:absolute}.hero-stage img{height:100%;object-fit:contain;width:100%}.hero-link{height:100%;width:100%}
            .thumbnails{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}.thumbnail{background:#fff;border:2px solid transparent;border-radius:15px;cursor:pointer;height:82px;overflow:hidden;padding:5px;width:82px}.thumbnail img{height:100%;object-fit:contain;width:100%}.thumbnail:hover,.thumbnail.active{border-color:#b62a68;box-shadow:0 7px 20px rgb(87 45 92 / 12%)}
            .info-card{background:rgb(255 255 255 / 82%);border:1px solid #eee3ed;border-radius:28px;box-shadow:0 24px 65px rgb(75 43 83 / 9%);padding:38px;position:sticky;top:110px}.eyebrow{color:#a52b65;font-size:.72rem;font-weight:850;letter-spacing:.14em;text-transform:uppercase}.availability{background:#eaf7f2;border:1px solid #cfe8df;border-radius:999px;color:#26705e;display:inline-flex;font-size:.69rem;font-weight:800;margin-bottom:20px;padding:7px 11px;text-transform:uppercase}
            h1{color:#3d2948;font-family:Georgia,"Times New Roman",serif;font-size:clamp(2.2rem,4vw,4rem);letter-spacing:-.045em;line-height:1.02;margin:10px 0 24px;overflow-wrap:anywhere}.description{color:#725f7c;font-size:1rem;margin-bottom:28px;max-width:62ch;overflow-wrap:anywhere;white-space:pre-wrap}.price-block{border-bottom:1px solid #eee3ed;border-top:1px solid #eee3ed;display:grid;gap:2px;margin:0 0 24px;padding:22px 0}.price-label{color:#8a758f;font-size:.75rem;font-weight:700;text-transform:uppercase}.price{color:#b32363;font-family:ui-rounded,"Arial Rounded MT Bold","Trebuchet MS",sans-serif;font-size:1.8rem;font-variant-numeric:tabular-nums;font-weight:900;letter-spacing:-.025em}.price-help{color:#8a788f;font-size:.76rem}
            .order-note{align-items:flex-start;background:#f6eef9;border-radius:16px;color:#6b5576;display:flex;font-size:.88rem;gap:10px;margin:0 0 24px;padding:15px}.order-note svg{color:#8250a8;flex:0 0 auto;height:21px;margin-top:2px;width:21px}
            .actions{display:grid;gap:12px}.button{align-items:center;border:1px solid #cdb9d8;border-radius:13px;cursor:pointer;display:inline-flex;font-size:.9rem;font-weight:800;justify-content:center;min-height:50px;padding:12px 18px;text-decoration:none}.button-primary{background:linear-gradient(135deg,#c92469,#a22871);border-color:#b92567;color:#fff;box-shadow:0 10px 25px rgb(183 37 102 / 20%)}.button-secondary{background:#fff;color:#694577}.button:hover{filter:brightness(.96)}
            #share-result{color:#346d60;font-size:.82rem;min-height:1.4em;text-align:center}.confidence{display:grid;gap:16px;grid-template-columns:repeat(3,1fr);margin-top:36px}.confidence article{background:#fff;border:1px solid #eee4ef;border-radius:18px;padding:18px}.confidence b{color:#51375f;display:block;font-size:.88rem}.confidence span{color:#89758f;font-size:.78rem}
            footer{background:#3d264a;color:#eadfec;padding:30px 0}.footer-inner{align-items:center;display:flex;font-size:.82rem;justify-content:space-between}.footer-inner b{color:#ffc3dc}.footer-inner a{color:#f3ddea}
            :focus-visible{outline:3px solid #ef9dc0;outline-offset:4px}
            @media(max-width:850px){.header-note{display:none}.product-layout{grid-template-columns:1fr;gap:24px}.info-card{padding:28px;position:static}.hero-stage{border-radius:24px}.confidence{grid-template-columns:1fr}.footer-inner{align-items:flex-start;flex-direction:column;gap:8px}}
            @media(max-width:520px){.header-inner,main,.footer-inner{width:calc(100% - 28px)}main{padding-top:20px}.product-layout{gap:18px}.hero-stage{padding:10px}.info-card{border-radius:22px;padding:24px 20px}h1{font-size:2.35rem}.thumbnail{height:70px;width:70px}.button{min-height:52px}.confidence{margin-top:24px}}
            @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
            </style></head>
            <body>
            <header class="detail-header"><div class="header-inner"><a class="brand" href="/"><img class="brand-mark" src="/images/simbolo-bazar.png" alt="" width="48" height="48"><span>{{{E(business.Nombre)}}}</span></a><span class="header-note">Detalles personalizados en Hojancha</span></div></header>
            <main><a class="back-link" href="/#productos" aria-label="Volver al catálogo de productos">← Volver al catálogo</a>
            <section class="product-layout">
            <div class="media-card"><div class="hero-stage"><a class="hero-link" id="photo-link" href="/api/imagenes/{{{primaryPhoto.Id}}}/archivo" target="_blank" aria-label="Ver fotografía a tamaño completo"><img id="product-photo" src="/api/imagenes/{{{primaryPhoto.Id}}}/archivo" alt="{{{E(primaryPhoto.Alt)}}}" loading="eager" fetchpriority="high"></a></div>{{{thumbnails}}}</div>
            <article class="info-card"><span class="eyebrow">Producto personalizado</span><h1>{{{E(p.Nombre)}}}</h1><span class="availability">Por encargo</span><p class="description">{{{E(p.Descripcion)}}}</p>
            <div class="price-block"><span class="price-label">Precio informativo</span><strong class="price">{{{E(price)}}}</strong><span class="price-help">Sujeto a confirmación según diseño y disponibilidad.</span></div>
            <p class="order-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v18M3 12h18"/></svg><span>Confirme por WhatsApp la disponibilidad, el diseño y el plazo de entrega antes de realizar el encargo.</span></p>
            <div class="actions"><a class="button button-primary" id="whatsapp" target="_blank" rel="noopener noreferrer" href="https://wa.me/{{{phone}}}?text={{{message}}}">Consultar por WhatsApp</a><button class="button button-secondary" type="button" id="share">Compartir producto</button></div>
            <p id="share-result" role="status" aria-live="polite"></p></article></section>
            <section class="confidence" aria-label="Información de compra"><article><b>Atención personalizada</b><span>Le ayudamos a confirmar su diseño.</span></article><article><b>Preparado por encargo</b><span>El plazo se acuerda antes de producir.</span></article><article><b>Precio transparente</b><span>Recibirá confirmación antes de continuar.</span></article></section></main>
            <footer><div class="footer-inner"><b>{{{E(business.Nombre)}}}</b><span>{{{E(business.Telefono)}}}</span><a href="/#contacto">Ubicación y horarios</a></div></footer>
            <script>document.getElementById('whatsapp').addEventListener('click',()=>{ {{{tracking}}} });
            document.querySelectorAll('.thumbnail').forEach(button=>button.addEventListener('click',()=>{const image=document.getElementById('product-photo');const link=document.getElementById('photo-link');image.src=button.dataset.src;image.alt=button.dataset.alt;link.href=button.dataset.src;document.querySelectorAll('.thumbnail').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',item===button?'true':'false');});}));
            document.getElementById('share').addEventListener('click',async()=>{const url=location.origin+location.pathname;try{if(navigator.share){await navigator.share({title:document.title,url});}else{await navigator.clipboard.writeText(url);document.getElementById('share-result').textContent='Enlace copiado.';}}catch(error){if(error.name!=='AbortError')document.getElementById('share-result').textContent='Copie el enlace desde la barra de direcciones.';}});</script></body></html>
            """;
    }
}

public record ProductPhoto(int Id, string Alt);
