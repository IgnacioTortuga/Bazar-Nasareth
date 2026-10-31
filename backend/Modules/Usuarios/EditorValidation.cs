using System.Net.Mail;

public static class EditorValidation
{
    public static string? CheckEditor(string name, string email, string? password, bool full, string[] permissions, Editor actor, bool creating = true)
    {
        string[] valid = ["portada", "productos", "servicios", "imagenes", "promociones", "galeria", "textos", "contacto", "usuarios"];
        if (string.IsNullOrWhiteSpace(name) || !MailAddress.TryCreate(email, out var parsed) || parsed.Address != email.Trim() || (creating && (password?.Length ?? 0) < 12) || (!creating && password is { Length: > 0 and < 12 }))
            return "Nombre, correo y contraseña de al menos 12 caracteres.";
        if (permissions.Except(valid).Any())
            return "Permiso desconocido.";
        if (!actor.Completo && (full || permissions.Any(x => !actor.Permisos.Split(',').Contains(x))))
            return "No puede conceder permisos que no posee.";
        return null;
    }
}
