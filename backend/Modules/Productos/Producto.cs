using System.Text.Json.Serialization;

public class Producto : IPublishableRecord
{
    public int Id { get; set; }
    public int CategoriaId { get; set; }

    [JsonIgnore]
    public Categoria Categoria { get; set; } = null!;
    public string Nombre { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public decimal? PrecioInformativo { get; set; }
    public string? Moneda { get; set; }
    public bool Destacado { get; set; }
    public int Orden { get; set; }
    public string Estado { get; set; } = "Borrador";
}
