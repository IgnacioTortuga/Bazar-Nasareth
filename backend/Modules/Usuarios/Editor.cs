public class Editor : IRecord
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public bool Activo { get; set; } = true;
    public bool Completo { get; set; }
    public string Permisos { get; set; } = "";
}
