using System.Text.Json.Serialization;

public class ProductoImagen
{
    public int ProductoId { get; set; }

    [JsonIgnore]
    public Producto Producto { get; set; } = null!;
    public int ImagenId { get; set; }
    public int Orden { get; set; }
}
