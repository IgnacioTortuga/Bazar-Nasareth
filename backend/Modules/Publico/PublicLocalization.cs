using System.Text.Json;

public static class PublicLocalization
{
    private static readonly IReadOnlyDictionary<string, string> English = Load();
    private static IReadOnlyDictionary<string, string> Load()
    {
        using var stream = typeof(PublicLocalization).Assembly.GetManifestResourceStream("Bazar.English.json")
            ?? throw new InvalidOperationException("No se encontró el recurso de traducciones públicas.");
        return JsonSerializer.Deserialize<Dictionary<string, string>>(stream)!;
    }
    public static string Translate(string text, bool english) => english && English.TryGetValue(text, out var value) ? value : text;
}
