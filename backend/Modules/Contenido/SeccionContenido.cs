public class SeccionContenido : IPublishableRecord
{
    public int Id { get; set; }
    public string Clave { get; set; } = "";
    public string Titulo { get; set; } = "";
    public string Cuerpo { get; set; } = "";
    public int? ImagenId { get; set; }
    public int Orden { get; set; }
    public string Estado { get; set; } = "Borrador";
}
