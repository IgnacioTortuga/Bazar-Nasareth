using System.Globalization;
using System.Net;
using Microsoft.EntityFrameworkCore;

public static class ProductSharing
{
    public static IQueryable<Producto> PublicProducts(BazarDb db) => db.Productos.AsNoTracking().Where(p => p.Estado == "Publicado" && p.Categoria.Activa && !string.IsNullOrWhiteSpace(p.Nombre) && !string.IsNullOrWhiteSpace(p.Descripcion) && db.ProductoImagenes.Any(i => i.ProductoId == p.Id));
    public static void Map(WebApplication app, IConfiguration configuration)
    {
        bool enabled = configuration.GetValue<bool>("MedicionWhatsApp:Enabled");
        app.MapGet("/producto/{id:int}", async (int id, BazarDb db, HttpContext ctx) =>
        {
            var language = ctx.Request.Query["lang"] == "en" ? "en" : "es";
            var product = await PublicProducts(db).SingleOrDefaultAsync(p => p.Id == id);
            ctx.Response.Headers.CacheControl = "no-store";
            if (product is null)
                return Results.Content(RenderUnavailable(language), "text/html; charset=utf-8", statusCode: 404);
            var business = await db.Negocio.AsNoTracking().SingleAsync(n => n.Id == 1);
            var images = await db.ProductoImagenes.AsNoTracking().Where(i => i.ProductoId == id).OrderBy(i => i.Orden).Join(db.Imagenes, i => i.ImagenId, image => image.Id, (i, image) => new ProductPhoto(image.Id, image.TextoAlternativo)).ToListAsync();
            // Se configura el dominio público explícitamente: no confiar en Host para metadatos compartidos.
            var publicUrl = configuration["PublicSiteUrl"];
            return Results.Content(RenderProduct(product, business, images, publicUrl, enabled, ctx.Request.Query["volver"].ToString(), language), "text/html; charset=utf-8");
        });
    }

    public static string RenderUnavailable(string language)
    {
        var english = language == "en";
        string T(string text) => WebUtility.HtmlEncode(PublicLocalization.Translate(text, english));
        return $"<!doctype html><html lang=\"{(english ? "en" : "es")}\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>{T("Producto no disponible")}</title><h1>{T("Este producto no está disponible")}</h1><a href=\"/?lang={(english ? "en" : "es")}#productos\">{T("Volver al catálogo")}</a></html>";
    }

    public static string CatalogReturnUrl(string? value) => value is { Length: <= 2048 } && (value == "/#productos" || (value.StartsWith("/?", StringComparison.Ordinal) && value.EndsWith("#productos", StringComparison.Ordinal))) && !value.Any(c => char.IsControl(c) || c == '\\') ? value : "/#productos";

    public static string RenderProduct(Producto p, InformacionNegocio business, IReadOnlyList<ProductPhoto> images, string? siteUrl, bool measure, string? returnUrl = null, string language = "es")
    {
        var english = language == "en";
        var lang = english ? "en" : "es";
        string T(string text) => PublicLocalization.Translate(text, english);
        static string E(string? value) => WebUtility.HtmlEncode(value ?? "");
        var validUrl = Uri.TryCreate(siteUrl, UriKind.Absolute, out var site) && site.Scheme == "https" && string.IsNullOrEmpty(site.UserInfo) && string.IsNullOrEmpty(site.Query) && string.IsNullOrEmpty(site.Fragment);
        var root = validUrl ? site!.GetLeftPart(UriPartial.Authority) : null;
        var pageUrl = root + $"/producto/{p.Id}" + (english ? "?lang=en" : "");
        var metadata = root is null ? "" : $"<link rel=\"canonical\" href=\"{E(pageUrl)}\"><meta property=\"og:url\" content=\"{E(pageUrl)}\">";
        if (root is not null && images.Count > 0)
            metadata += $"<meta property=\"og:image\" content=\"{E(root)}/api/imagenes/{images[0].Id}/archivo\"><meta property=\"og:image:alt\" content=\"{E(T(images[0].Alt))}\">";
        var primaryPhoto = images[0];
        var thumbnails = images.Count > 1 ? $"<div class=\"thumbnails\" aria-label=\"{E(T("Fotografías del producto"))}\">{string.Join("", images.Select((i, index) => $"<button type=\"button\" class=\"thumbnail{(index == 0 ? " active" : "")}\" aria-label=\"{E(T("Mostrar fotografía"))} {index + 1}\" aria-pressed=\"{(index == 0 ? "true" : "false")}\" data-src=\"/api/imagenes/{i.Id}/archivo\" data-alt=\"{E(T(i.Alt))}\"><img src=\"/api/imagenes/{i.Id}/archivo\" alt=\"\" loading=\"lazy\"></button>"))}</div>" : "";
        var phone = new string (business.Telefono.Where(char.IsAsciiDigit).ToArray());
        var message = Uri.EscapeDataString(english ? $"Hello, I would like a quote for this product:\n• Product: {T(p.Nombre)}\n• Availability: Made to order\n\nCould you confirm availability, lead time and the final price?" : $"Hola, me interesa cotizar este producto:\n• Producto: {p.Nombre}\n• Modalidad: Por encargo\n\n¿Podrían confirmarme disponibilidad, plazo de entrega y precio final?");
        var price = p.PrecioInformativo.HasValue ? $"{p.Moneda} {p.PrecioInformativo.Value.ToString("N2", CultureInfo.GetCultureInfo(english ? "en-US" : "es-CR"))}" : T("Consultar precio");
        var tracking = measure ? $"fetch('/api/productos/{p.Id}/clic-whatsapp?origen=detalle',{{method:'POST',credentials:'same-origin',keepalive:true}}).catch(()=>{{}});" : "";
        return $$$"""
            <!doctype html><html lang="{{{lang}}}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
            <title>{{{E(T(p.Nombre))}}} · {{{E(business.Nombre)}}}</title><meta name="description" content="{{{E(T(p.Descripcion))}}}">
            <meta name="theme-color" content="#fffaf7">
            <meta property="og:type" content="product"><meta property="og:title" content="{{{E(T(p.Nombre))}}}">
            <meta property="og:description" content="{{{E(T(p.Descripcion))}}}">{{{metadata}}}
            <script>
            try{const p=JSON.parse(localStorage.getItem('bazar.reading-preferences'));document.documentElement.dataset.bazarTheme=p?.theme==='dark'?'dark':'light';const sizes={normal:'100%',medium:'112.5%',large:'125%'};document.documentElement.style.fontSize=sizes[p?.fontSize]||'100%';}catch{}
            </script>
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
            body{min-height:100vh;background:linear-gradient(110deg,#fff9ee 12%,#ffeff6 65%,#edfafa)}
            .theme-toggle{min-width:44px;min-height:44px;border:1px solid #cdb9d8;border-radius:50%;background:#fff;color:#694577;cursor:pointer;margin-left:12px;display:grid;place-items:center}.theme-toggle svg{width:22px;height:22px}
            :root[data-bazar-theme='dark']{color-scheme:dark;background:#19141f;color:#f5ecfa}
            :root[data-bazar-theme='dark'] body{background:linear-gradient(110deg,#261c25,#2c1c30,#162c2d);color:#f5ecfa}
            :root[data-bazar-theme='dark'] :is(.detail-header,.info-card,.confidence article){background:rgb(33 26 41 / 94%);border-color:#65506f}
            :root[data-bazar-theme='dark'] .hero-stage{background:linear-gradient(145deg,#302538,#211a29);border-color:#65506f}
            :root[data-bazar-theme='dark'] :is(.thumbnail,.button-secondary,.theme-toggle){background:#302538;color:#f5ecfa;border-color:#80668d}
            :root[data-bazar-theme='dark'] :is(h1,.confidence b){color:#f5ecfa}
            :root[data-bazar-theme='dark'] :is(.brand,.back-link,.eyebrow,.price){color:#ffc0de}
            :root[data-bazar-theme='dark'] :is(.description,.header-note,.price-label,.price-help,.confidence span){color:#d4c4dc}
            :root[data-bazar-theme='dark'] .order-note{background:#392841;color:#e4d4ee}
            :root[data-bazar-theme='dark'] .order-note svg{color:#d5b1f2}
            :root[data-bazar-theme='dark'] .availability{background:#193f36;border-color:#4d8d79;color:#bef4df}
            :root[data-bazar-theme='dark'] .price-block{border-color:#65506f}
            :root[data-bazar-theme='dark'] #share-result{color:#bef4df}
            :root[data-bazar-theme='dark'] .thumbnail.active{border-color:#ffc0de}
            </style></head>
            <body>
            <header class="detail-header"><div class="header-inner"><a class="brand" href="/?lang={{{lang}}}"><img class="brand-mark" src="/images/simbolo-bazar.png" alt="" width="48" height="48"><span>{{{E(business.Nombre)}}}</span></a><span class="header-note">{{{E(T("Detalles personalizados en Hojancha"))}}}</span><button type="button" class="theme-toggle" id="theme-toggle" aria-label="{{{(english ? "Dark mode" : "Modo oscuro")}}}" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/></svg></button></div></header>
            <main><a class="back-link" href="{{{E(CatalogReturnUrl(returnUrl ?? (english ? "/?lang=en#productos" : "/#productos")))}}}" aria-label="{{{E(T("Volver al catálogo de productos"))}}}">← {{{E(T("Volver al catálogo"))}}}</a>
            <section class="product-layout">
            <div class="media-card"><div class="hero-stage"><a class="hero-link" id="photo-link" href="/api/imagenes/{{{primaryPhoto.Id}}}/archivo" target="_blank" aria-label="{{{E(T("Ver fotografía a tamaño completo"))}}}"><img id="product-photo" src="/api/imagenes/{{{primaryPhoto.Id}}}/archivo" alt="{{{E(T(primaryPhoto.Alt))}}}" loading="eager" fetchpriority="high"></a></div>{{{thumbnails}}}</div>
            <article class="info-card"><span class="eyebrow">{{{E(T("Producto personalizado"))}}}</span><h1>{{{E(T(p.Nombre))}}}</h1><span class="availability">{{{E(T("Por encargo"))}}}</span><p class="description">{{{E(T(p.Descripcion))}}}</p>
            <div class="price-block"><span class="price-label">{{{E(T("Precio informativo"))}}}</span><strong class="price">{{{E(price)}}}</strong><span class="price-help">{{{E(T("Sujeto a confirmación según diseño y disponibilidad."))}}}</span></div>
            <p class="order-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v18M3 12h18"/></svg><span>{{{E(T("Confirme por WhatsApp la disponibilidad, el diseño y el plazo de entrega antes de realizar el encargo."))}}}</span></p>
            <div class="actions"><a class="button button-primary" id="whatsapp" target="_blank" rel="noopener noreferrer" href="https://wa.me/{{{phone}}}?text={{{message}}}">{{{E(T("Consultar por WhatsApp"))}}}</a><button class="button button-secondary" type="button" id="share">{{{E(T("Compartir producto"))}}}</button></div>
            <p id="share-result" role="status" aria-live="polite"></p></article></section>
            <section class="confidence" aria-label="{{{E(T("Información de compra"))}}}"><article><b>{{{E(T("Atención personalizada"))}}}</b><span>{{{E(T("Le ayudamos a confirmar su diseño."))}}}</span></article><article><b>{{{E(T("Preparado por encargo"))}}}</b><span>{{{E(T("El plazo se acuerda antes de producir."))}}}</span></article><article><b>{{{E(T("Precio transparente"))}}}</b><span>{{{E(T("Recibirá confirmación antes de continuar."))}}}</span></article></section></main>
            <footer><div class="footer-inner"><b>{{{E(business.Nombre)}}}</b><span>{{{E(business.Telefono)}}}</span><a href="/?lang={{{lang}}}#contacto">{{{E(T("Ubicación y horarios"))}}}</a></div></footer>
            <script>
            const themeButton=document.getElementById('theme-toggle');
            const syncTheme=()=>themeButton.setAttribute('aria-pressed',document.documentElement.dataset.bazarTheme==='dark'?'true':'false');syncTheme();
            themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.bazarTheme==='dark'?'light':'dark';document.documentElement.dataset.bazarTheme=theme;syncTheme();try{const p=JSON.parse(localStorage.getItem('bazar.reading-preferences'))||{};localStorage.setItem('bazar.reading-preferences',JSON.stringify({...p,theme}));}catch{}});
            document.getElementById('whatsapp').addEventListener('click',()=>{ {{{tracking}}} });
            document.querySelectorAll('.thumbnail').forEach(button=>button.addEventListener('click',()=>{const image=document.getElementById('product-photo');const link=document.getElementById('photo-link');image.src=button.dataset.src;image.alt=button.dataset.alt;link.href=button.dataset.src;document.querySelectorAll('.thumbnail').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',item===button?'true':'false');});}));
            document.getElementById('share').addEventListener('click',async()=>{const url=location.origin+location.pathname+{{{System.Text.Json.JsonSerializer.Serialize(english ? "?lang=en" : "")}}};try{if(navigator.share){await navigator.share({title:document.title,url});}else{await navigator.clipboard.writeText(url);document.getElementById('share-result').textContent={{{System.Text.Json.JsonSerializer.Serialize(T("Enlace copiado."))}}};}}catch(error){if(error.name!=='AbortError')document.getElementById('share-result').textContent={{{System.Text.Json.JsonSerializer.Serialize(T("Copie el enlace desde la barra de direcciones."))}}};}});</script></body></html>
            """;
    }
}

public record ProductPhoto(int Id, string Alt);
