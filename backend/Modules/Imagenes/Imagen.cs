public class Imagen : IRecord
{
    public int Id { get; set; }
    public string Ruta { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string TipoMime { get; set; } = "";
    public long TamanoBytes { get; set; }
    public string TextoAlternativo { get; set; } = "";
}
