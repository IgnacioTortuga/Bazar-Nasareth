using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static ContentCrud;

public static class ServiceEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapCrud<Servicio>(admin, "servicios", "servicios");
    }
}
