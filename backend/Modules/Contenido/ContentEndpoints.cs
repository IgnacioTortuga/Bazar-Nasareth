using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static ContentCrud;

public static class ContentEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapPublishableCrud<SeccionContenido>(admin, "secciones", "textos");
    }
}
