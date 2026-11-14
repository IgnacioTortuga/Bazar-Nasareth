using static ContentCrud;

public static class GalleryEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapPublishableCrud<GaleriaImagen>(admin, "galeria", "galeria");
    }
}
