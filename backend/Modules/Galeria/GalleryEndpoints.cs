using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static ContentCrud;

public static class GalleryEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapCrud<GaleriaImagen>(admin, "galeria", "galeria");
    }
}
