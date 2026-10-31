public static class ContentRules
{
    public static bool Status(string s) => s is "Borrador" or "Publicado" or "Archivado";
    public static string? Price(decimal? value, string? currency) => value < 0 || (value.HasValue && string.IsNullOrWhiteSpace(currency)) ? "Precio no negativo y moneda obligatoria si hay precio." : null;
    public static bool Order(int x) => x >= 0;
}
