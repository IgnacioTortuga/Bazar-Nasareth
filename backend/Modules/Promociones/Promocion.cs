public class Promocion : IPublishableRecord
{
    public int Id { get; set; }
    public string Titulo { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public string Condiciones { get; set; } = "";
    public int? ImagenId { get; set; }
    public DateTimeOffset? Inicio { get; set; }
    public DateTimeOffset? Fin { get; set; }
    public int Orden { get; set; }
    public string Estado { get; set; } = "Borrador";
}
