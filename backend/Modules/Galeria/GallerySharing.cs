using System.Net;
using Microsoft.EntityFrameworkCore;

public static class GallerySharing
{
    public static void Map(WebApplication app, IConfiguration configuration)
    {
        app.MapGet("/idea/{id:int}", async (int id, BazarDb db, HttpContext ctx) =>
        {
            ctx.Response.Headers.CacheControl = "no-store";
            var idea = await db.Galeria.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.Estado == "Publicado");
            if (idea is null) return Results.Content("<!doctype html><html lang=\"es\"><meta charset=\"utf-8\"><title>Idea no disponible</title><h1>Esta idea ya no está disponible</h1><a href=\"/#galeria\">Volver a la galería</a></html>", "text/html; charset=utf-8", statusCode: 404);
            var image = await db.Imagenes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == idea.ImagenId);
            if (image is null) return Results.NotFound();
            return Results.Content(Render(idea, image.TextoAlternativo, configuration["PublicSiteUrl"], ctx.Request.Query["lang"] == "en"), "text/html; charset=utf-8");
        });
    }

    public static string Render(GaleriaImagen idea, string alt, string? siteUrl, bool english = false)
    {
        static string E(string? value) => WebUtility.HtmlEncode(value ?? "");
        var title = string.IsNullOrWhiteSpace(idea.Titulo) ? (english ? "Personalized idea" : "Idea personalizada") : idea.Titulo;
        title = PublicLocalization.Translate(title, english);
        alt = PublicLocalization.Translate(alt, english);
        var lang = english ? "en" : "es";
        var image = $"/api/imagenes/{idea.ImagenId}/archivo";
        var metadata = "";
        if (Uri.TryCreate(siteUrl, UriKind.Absolute, out var site) && site.Scheme == "https" && string.IsNullOrEmpty(site.UserInfo) && string.IsNullOrEmpty(site.Query) && string.IsNullOrEmpty(site.Fragment))
        {
            var root = site.GetLeftPart(UriPartial.Authority);
            metadata = $"<meta property=\"og:image\" content=\"{E(root + image)}\"><meta property=\"og:image:alt\" content=\"{E(alt)}\"><meta property=\"og:url\" content=\"{E(root)}/idea/{idea.Id}\"><link rel=\"canonical\" href=\"{E(root)}/idea/{idea.Id}\">";
        }
        return $$"""
        <!doctype html><html lang="{{lang}}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{{E(title)}} · Bazar Nazareth</title><meta name="description" content="{{E(alt)}}">
        <meta property="og:type" content="website"><meta property="og:title" content="{{E(title)}} · Bazar Nazareth"><meta property="og:description" content="{{E(alt)}}">{{metadata}}
        <link rel="icon" type="image/png" href="/images/simbolo-bazar.png"><link rel="stylesheet" href="/idea.css">
        <script>try{document.documentElement.dataset.theme=JSON.parse(localStorage.getItem('bazar.reading-preferences'))?.theme||'light';}catch{}</script></head>
        <body><main><a class="back" href="/?lang={{lang}}#galeria">← {{(english ? "Back to gallery" : "Volver a la galería")}}</a>
        <article><header><span>Bazar Nazareth · Idea #{{idea.Id}}</span><h1>{{E(title)}}</h1></header>
        <a href="{{image}}" target="_blank" rel="noopener noreferrer" aria-label="{{(english ? "Open original photo" : "Abrir fotografía original")}}"><img src="{{image}}" alt="{{E(alt)}}" fetchpriority="high"></a>
        <p>{{(english ? "Tap the photo to open it in full size." : "Toque la foto para abrirla en tamaño completo.")}}</p></article></main></body></html>
        """;
    }
}
