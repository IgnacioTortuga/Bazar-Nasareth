using Microsoft.EntityFrameworkCore;
using static EditorAccess;
using static ContentCrud;

public static class ContentEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        MapCrud<SeccionContenido>(admin, "secciones", "textos");
    }
}
