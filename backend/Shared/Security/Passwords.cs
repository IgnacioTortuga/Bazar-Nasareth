using System.Security.Cryptography;

public static class Passwords
{
    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 210_000, HashAlgorithmName.SHA256, 32);
        return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
    }

    public static bool Verify(string password, string stored)
    {
        try
        {
            var parts = stored.Split(':');
            return parts.Length == 2 && CryptographicOperations.FixedTimeEquals(Convert.FromBase64String(parts[1]), Rfc2898DeriveBytes.Pbkdf2(password, Convert.FromBase64String(parts[0]), 210_000, HashAlgorithmName.SHA256, 32));
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
