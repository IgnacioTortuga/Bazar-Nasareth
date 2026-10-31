public class ClicWhatsApp
{
    public int ProductoId { get; set; }
    public DateOnly Dia { get; set; }
    public string Origen { get; set; } = "catalogo";
    public long Cantidad { get; set; }
}

public class ClicWhatsAppGaleria
{
    public int GaleriaImagenId { get; set; }
    public DateOnly Dia { get; set; }
    public long Cantidad { get; set; }
}
