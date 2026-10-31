public class GaleriaImagen : IRecord
{
    public int Id { get; set; }
    public int ImagenId { get; set; }
    public string? Titulo { get; set; }
    public int Orden { get; set; }
    public string Estado { get; set; } = "Borrador";
}
