public class InformacionNegocio : IRecord
{
    public int Id { get; set; } = 1;
    public string Nombre { get; set; } = "Bazar Nazareth de Hojancha";
    public string Direccion { get; set; } = "Hojancha, Guanacaste";
    public string Horario { get; set; } = "Consultar horario";
    public string Telefono { get; set; } = "+506 6488 3862";
    public string? Email { get; set; }
    public string EnlaceContacto { get; set; } = "https://wa.me/50664883862";
    public string? Redes { get; set; } = "https://www.instagram.com/bazarnazarethojancha\nhttps://linktr.ee/bazarnazareth";
}
