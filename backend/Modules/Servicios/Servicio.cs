public class Servicio : IRecord
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public string Alcance { get; set; } = "";
    public int? ImagenId { get; set; }
    public decimal? PrecioDesde { get; set; }
    public string? Moneda { get; set; }
    public int Orden { get; set; }
    public string Estado { get; set; } = "Borrador";
}
