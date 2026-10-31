SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DECLARE @Imagenes TABLE (
    Ruta nvarchar(260) NOT NULL PRIMARY KEY,
    Nombre nvarchar(260) NOT NULL,
    TipoMime nvarchar(100) NOT NULL,
    TamanoBytes bigint NOT NULL,
    TextoAlternativo nvarchar(500) NOT NULL
);

INSERT INTO @Imagenes (Ruta, Nombre, TipoMime, TamanoBytes, TextoAlternativo)
VALUES
(N'inspiration-001.jpeg', N'inspiration-001.jpeg', N'image/jpeg', 178368, N'Muestra de trabajo realizado por Bazar Nazareth: totebag personalizada'),
(N'inspiration-002.jpeg', N'inspiration-002.jpeg', N'image/jpeg', 185712, N'Muestra de trabajo realizado por Bazar Nazareth: totebag personalizada'),
(N'inspiration-004.jpeg', N'inspiration-004.jpeg', N'image/jpeg', 202302, N'Muestra de trabajo realizado por Bazar Nazareth: totebag personalizada'),
(N'inspiration-005.jpeg', N'inspiration-005.jpeg', N'image/jpeg', 171647, N'Muestra de trabajo realizado por Bazar Nazareth: totebag personalizada'),
(N'inspiration-006.jpeg', N'inspiration-006.jpeg', N'image/jpeg', 137018, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-008.jpeg', N'inspiration-008.jpeg', N'image/jpeg', 119810, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-009.jpeg', N'inspiration-009.jpeg', N'image/jpeg', 119878, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-010.jpeg', N'inspiration-010.jpeg', N'image/jpeg', 137982, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-011.jpeg', N'inspiration-011.jpeg', N'image/jpeg', 161029, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-012.jpeg', N'inspiration-012.jpeg', N'image/jpeg', 165376, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-014.jpeg', N'inspiration-014.jpeg', N'image/jpeg', 185432, N'Muestra de trabajo realizado por Bazar Nazareth: botella personalizada'),
(N'inspiration-017.jpeg', N'inspiration-017.jpeg', N'image/jpeg', 217311, N'Muestra de trabajo realizado por Bazar Nazareth: vaso personalizado'),
(N'inspiration-018.jpeg', N'inspiration-018.jpeg', N'image/jpeg', 163638, N'Muestra de trabajo realizado por Bazar Nazareth: vaso personalizado'),
(N'inspiration-019.jpeg', N'inspiration-019.jpeg', N'image/jpeg', 136823, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-020.jpeg', N'inspiration-020.jpeg', N'image/jpeg', 208697, N'Muestra de trabajo realizado por Bazar Nazareth: totebag con diseño personalizado'),
(N'inspiration-021.jpeg', N'inspiration-021.jpeg', N'image/jpeg', 206783, N'Muestra de trabajo realizado por Bazar Nazareth: totebag con diseño personalizado'),
(N'inspiration-022.jpeg', N'inspiration-022.jpeg', N'image/jpeg', 172952, N'Muestra de trabajo realizado por Bazar Nazareth: totebag con diseño personalizado'),
(N'inspiration-023.jpeg', N'inspiration-023.jpeg', N'image/jpeg', 179794, N'Muestra de trabajo realizado por Bazar Nazareth: totebag con diseño personalizado'),
(N'inspiration-024.jpeg', N'inspiration-024.jpeg', N'image/jpeg', 118286, N'Muestra de trabajo realizado por Bazar Nazareth: taza personalizada'),
(N'inspiration-025.jpeg', N'inspiration-025.jpeg', N'image/jpeg', 125813, N'Muestra de trabajo realizado por Bazar Nazareth: taza personalizada'),
(N'inspiration-027.jpeg', N'inspiration-027.jpeg', N'image/jpeg', 132322, N'Muestra de trabajo realizado por Bazar Nazareth: taza personalizada'),
(N'inspiration-028.jpeg', N'inspiration-028.jpeg', N'image/jpeg', 127215, N'Muestra de trabajo realizado por Bazar Nazareth: taza personalizada'),
(N'inspiration-030.jpeg', N'inspiration-030.jpeg', N'image/jpeg', 184270, N'Muestra de trabajo realizado por Bazar Nazareth: adorno navideño personalizado'),
(N'inspiration-031.jpeg', N'inspiration-031.jpeg', N'image/jpeg', 175867, N'Muestra de trabajo realizado por Bazar Nazareth: vaso personalizado'),
(N'inspiration-032.jpeg', N'inspiration-032.jpeg', N'image/jpeg', 178702, N'Muestra de trabajo realizado por Bazar Nazareth: vaso personalizado'),
(N'inspiration-033.jpeg', N'inspiration-033.jpeg', N'image/jpeg', 198097, N'Muestra de trabajo realizado por Bazar Nazareth: prenda personalizada'),
(N'inspiration-035.jpeg', N'inspiration-035.jpeg', N'image/jpeg', 170418, N'Muestra de trabajo realizado por Bazar Nazareth: prenda personalizada'),
(N'inspiration-036.jpeg', N'inspiration-036.jpeg', N'image/jpeg', 183236, N'Muestra de trabajo realizado por Bazar Nazareth: prenda personalizada'),
(N'inspiration-037.jpeg', N'inspiration-037.jpeg', N'image/jpeg', 161335, N'Muestra de trabajo realizado por Bazar Nazareth: prenda personalizada'),
(N'inspiration-039.jpeg', N'inspiration-039.jpeg', N'image/jpeg', 178906, N'Muestra de trabajo realizado por Bazar Nazareth: prenda personalizada'),
(N'inspiration-040.jpeg', N'inspiration-040.jpeg', N'image/jpeg', 211608, N'Muestra de trabajo realizado por Bazar Nazareth: detalle para una celebración'),
(N'inspiration-042.jpeg', N'inspiration-042.jpeg', N'image/jpeg', 168007, N'Muestra de trabajo realizado por Bazar Nazareth: regalo personalizado'),
(N'inspiration-043.jpeg', N'inspiration-043.jpeg', N'image/jpeg', 123410, N'Muestra de trabajo realizado por Bazar Nazareth: regalo personalizado'),
(N'inspiration-044.jpeg', N'inspiration-044.jpeg', N'image/jpeg', 207084, N'Muestra de trabajo realizado por Bazar Nazareth: regalo personalizado'),
(N'inspiration-045.jpeg', N'inspiration-045.jpeg', N'image/jpeg', 131575, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-046.jpeg', N'inspiration-046.jpeg', N'image/jpeg', 123015, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-047.jpeg', N'inspiration-047.jpeg', N'image/jpeg', 117873, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-048.jpeg', N'inspiration-048.jpeg', N'image/jpeg', 115562, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-049.jpeg', N'inspiration-049.jpeg', N'image/jpeg', 106283, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-050.jpeg', N'inspiration-050.jpeg', N'image/jpeg', 108017, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-051.jpeg', N'inspiration-051.jpeg', N'image/jpeg', 115185, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-052.jpeg', N'inspiration-052.jpeg', N'image/jpeg', 122118, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-053.jpeg', N'inspiration-053.jpeg', N'image/jpeg', 135911, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-054.jpeg', N'inspiration-054.jpeg', N'image/jpeg', 127129, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-055.jpeg', N'inspiration-055.jpeg', N'image/jpeg', 128329, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-056.jpeg', N'inspiration-056.jpeg', N'image/jpeg', 133234, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-057.jpeg', N'inspiration-057.jpeg', N'image/jpeg', 137989, N'Muestra de trabajo realizado por Bazar Nazareth: empaque personalizado para dulces'),
(N'inspiration-058.jpeg', N'inspiration-058.jpeg', N'image/jpeg', 236636, N'Muestra de trabajo realizado por Bazar Nazareth: bolsa de regalo personalizada'),
(N'inspiration-059.jpeg', N'inspiration-059.jpeg', N'image/jpeg', 249841, N'Muestra de trabajo realizado por Bazar Nazareth: bolsa de regalo personalizada'),
(N'inspiration-060.jpeg', N'inspiration-060.jpeg', N'image/jpeg', 207793, N'Muestra de trabajo realizado por Bazar Nazareth: detalle para cumpleaños'),
(N'inspiration-062.jpeg', N'inspiration-062.jpeg', N'image/jpeg', 108555, N'Muestra de trabajo realizado por Bazar Nazareth: detalle para cumpleaños'),
(N'inspiration-063.jpeg', N'inspiration-063.jpeg', N'image/jpeg', 200276, N'Muestra de trabajo realizado por Bazar Nazareth: regalo personalizado para papá'),
(N'inspiration-064.jpeg', N'inspiration-064.jpeg', N'image/jpeg', 205336, N'Muestra de trabajo realizado por Bazar Nazareth: regalo personalizado para papá'),
(N'inspiration-066.jpeg', N'inspiration-066.jpeg', N'image/jpeg', 215155, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-067.jpeg', N'inspiration-067.jpeg', N'image/jpeg', 217457, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-068.jpeg', N'inspiration-068.jpeg', N'image/jpeg', 229631, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-069.jpeg', N'inspiration-069.jpeg', N'image/jpeg', 215844, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-070.jpeg', N'inspiration-070.jpeg', N'image/jpeg', 212264, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-071.jpeg', N'inspiration-071.jpeg', N'image/jpeg', 225548, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-072.jpeg', N'inspiration-072.jpeg', N'image/jpeg', 212823, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-073.jpeg', N'inspiration-073.jpeg', N'image/jpeg', 229191, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-074.jpeg', N'inspiration-074.jpeg', N'image/jpeg', 227175, N'Muestra de trabajo realizado por Bazar Nazareth: caja de regalo personalizada'),
(N'inspiration-075.jpeg', N'inspiration-075.jpeg', N'image/jpeg', 241380, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-077.jpeg', N'inspiration-077.jpeg', N'image/jpeg', 226454, N'Muestra de trabajo realizado por Bazar Nazareth: detalle personalizado para regalar'),
(N'inspiration-078.jpeg', N'inspiration-078.jpeg', N'image/jpeg', 142681, N'Muestra de trabajo realizado por Bazar Nazareth: taza con diseño personalizado'),
(N'inspiration-079.jpeg', N'inspiration-079.jpeg', N'image/jpeg', 139133, N'Muestra de trabajo realizado por Bazar Nazareth: taza con diseño personalizado'),
(N'inspiration-080.jpeg', N'inspiration-080.jpeg', N'image/jpeg', 217362, N'Muestra de trabajo realizado por Bazar Nazareth: taza con diseño personalizado'),
(N'inspiration-082.jpeg', N'inspiration-082.jpeg', N'image/jpeg', 143335, N'Muestra de trabajo realizado por Bazar Nazareth: taza con diseño personalizado'),
(N'inspiration-083.jpeg', N'inspiration-083.jpeg', N'image/jpeg', 142629, N'Muestra de trabajo realizado por Bazar Nazareth: taza con diseño personalizado'),
(N'product-square-llaveros.jpg', N'product-square-llaveros.jpg', N'image/jpeg', 113966, N'Imagen informativa de llaveros personalizados'),
(N'product-square-can-cooler.jpg', N'product-square-can-cooler.jpg', N'image/jpeg', 100024, N'Imagen informativa de can cooler personalizado'),
(N'product-square-tazas.jpg', N'product-square-tazas.jpg', N'image/jpeg', 93517, N'Imagen informativa de tazas personalizadas'),
(N'product-square-rompecabezas.jpg', N'product-square-rompecabezas.jpg', N'image/jpeg', 109080, N'Imagen informativa de rompecabezas personalizado'),
(N'product-square-placas-aluminio.jpg', N'product-square-placas-aluminio.jpg', N'image/jpeg', 67193, N'Imagen informativa de placas de aluminio personalizadas'),
(N'product-square-camisetas.jpg', N'product-square-camisetas.jpg', N'image/jpeg', 143578, N'Imagen informativa de camisetas personalizadas'),
(N'product-square-block-notas.jpg', N'product-square-block-notas.jpg', N'image/jpeg', 99209, N'Imagen informativa de block de notas personalizado'),
(N'product-square-posavasos.jpg', N'product-square-posavasos.jpg', N'image/jpeg', 84624, N'Imagen informativa de posavasos personalizados'),
(N'product-square-gorras.jpg', N'product-square-gorras.jpg', N'image/jpeg', 120621, N'Imagen informativa de gorras personalizadas'),
(N'product-square-viseras.jpg', N'product-square-viseras.jpg', N'image/jpeg', 89321, N'Imagen informativa de viseras personalizadas'),
(N'product-square-destapador.jpg', N'product-square-destapador.jpg', N'image/jpeg', 80925, N'Imagen informativa de destapador personalizado'),
(N'product-square-porta-tarjetas.jpg', N'product-square-porta-tarjetas.jpg', N'image/jpeg', 78964, N'Imagen informativa de porta tarjetas personalizado'),
(N'product-square-imanes.jpg', N'product-square-imanes.jpg', N'image/jpeg', 60971, N'Imagen informativa de imanes personalizados');

UPDATE destino
SET
    Nombre = origen.Nombre,
    TipoMime = origen.TipoMime,
    TamanoBytes = origen.TamanoBytes,
    TextoAlternativo = origen.TextoAlternativo
FROM dbo.Imagen AS destino
JOIN @Imagenes AS origen ON origen.Ruta = destino.Ruta;

INSERT INTO dbo.Imagen (Ruta, Nombre, TipoMime, TamanoBytes, TextoAlternativo)
SELECT origen.Ruta, origen.Nombre, origen.TipoMime, origen.TamanoBytes, origen.TextoAlternativo
FROM @Imagenes AS origen
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Imagen AS existente WHERE existente.Ruta = origen.Ruta
);

DECLARE @Galeria TABLE (
    Ruta nvarchar(260) NOT NULL PRIMARY KEY,
    Titulo nvarchar(260) NOT NULL
);

INSERT INTO @Galeria (Ruta, Titulo)
VALUES
(N'inspiration-001.jpeg', N'Totebag personalizada'),
(N'inspiration-002.jpeg', N'Totebag personalizada'),
(N'inspiration-004.jpeg', N'Totebag personalizada'),
(N'inspiration-005.jpeg', N'Totebag personalizada'),
(N'inspiration-006.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-008.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-009.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-010.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-011.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-012.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-014.jpeg', N'Botella personalizada'),
(N'inspiration-017.jpeg', N'Vaso personalizado'),
(N'inspiration-018.jpeg', N'Vaso personalizado'),
(N'inspiration-019.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-020.jpeg', N'Totebag con diseño personalizado'),
(N'inspiration-021.jpeg', N'Totebag con diseño personalizado'),
(N'inspiration-022.jpeg', N'Totebag con diseño personalizado'),
(N'inspiration-023.jpeg', N'Totebag con diseño personalizado'),
(N'inspiration-024.jpeg', N'Taza personalizada'),
(N'inspiration-025.jpeg', N'Taza personalizada'),
(N'inspiration-027.jpeg', N'Taza personalizada'),
(N'inspiration-028.jpeg', N'Taza personalizada'),
(N'inspiration-030.jpeg', N'Adorno navideño personalizado'),
(N'inspiration-031.jpeg', N'Vaso personalizado'),
(N'inspiration-032.jpeg', N'Vaso personalizado'),
(N'inspiration-033.jpeg', N'Prenda personalizada'),
(N'inspiration-035.jpeg', N'Prenda personalizada'),
(N'inspiration-036.jpeg', N'Prenda personalizada'),
(N'inspiration-037.jpeg', N'Prenda personalizada'),
(N'inspiration-039.jpeg', N'Prenda personalizada'),
(N'inspiration-040.jpeg', N'Detalle para una celebración'),
(N'inspiration-042.jpeg', N'Regalo personalizado'),
(N'inspiration-043.jpeg', N'Regalo personalizado'),
(N'inspiration-044.jpeg', N'Regalo personalizado'),
(N'inspiration-045.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-046.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-047.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-048.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-049.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-050.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-051.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-052.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-053.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-054.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-055.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-056.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-057.jpeg', N'Empaque personalizado para dulces'),
(N'inspiration-058.jpeg', N'Bolsa de regalo personalizada'),
(N'inspiration-059.jpeg', N'Bolsa de regalo personalizada'),
(N'inspiration-060.jpeg', N'Detalle para cumpleaños'),
(N'inspiration-062.jpeg', N'Detalle para cumpleaños'),
(N'inspiration-063.jpeg', N'Regalo personalizado para papá'),
(N'inspiration-064.jpeg', N'Regalo personalizado para papá'),
(N'inspiration-066.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-067.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-068.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-069.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-070.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-071.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-072.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-073.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-074.jpeg', N'Caja de regalo personalizada'),
(N'inspiration-075.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-077.jpeg', N'Detalle personalizado para regalar'),
(N'inspiration-078.jpeg', N'Taza con diseño personalizado'),
(N'inspiration-079.jpeg', N'Taza con diseño personalizado'),
(N'inspiration-080.jpeg', N'Taza con diseño personalizado'),
(N'inspiration-082.jpeg', N'Taza con diseño personalizado'),
(N'inspiration-083.jpeg', N'Taza con diseño personalizado');

UPDATE destino
SET Titulo = origen.Titulo
FROM dbo.GaleriaImagen AS destino
JOIN dbo.Imagen AS imagen ON imagen.Id = destino.ImagenId
JOIN @Galeria AS origen ON origen.Ruta = imagen.Ruta;

DECLARE @SiguienteOrden int =
    ISNULL((SELECT MAX(Orden) FROM dbo.GaleriaImagen WITH (UPDLOCK, HOLDLOCK)), -1) + 1;

;WITH Nuevas AS (
    SELECT
        imagen.Id AS ImagenId,
        galeria.Titulo,
        ROW_NUMBER() OVER (ORDER BY galeria.Ruta) - 1 AS Desplazamiento
    FROM @Galeria AS galeria
    JOIN dbo.Imagen AS imagen ON imagen.Ruta = galeria.Ruta
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.GaleriaImagen AS existente WHERE existente.ImagenId = imagen.Id
    )
)
INSERT INTO dbo.GaleriaImagen (ImagenId, Titulo, Orden, Estado)
SELECT ImagenId, Titulo, @SiguienteOrden + Desplazamiento, N'Publicado'
FROM Nuevas;

DECLARE @Productos TABLE (
    ProductoId int NOT NULL PRIMARY KEY,
    Ruta nvarchar(260) NOT NULL
);

INSERT INTO @Productos (ProductoId, Ruta)
VALUES
(13, N'product-square-llaveros.jpg'),
(14, N'product-square-can-cooler.jpg'),
(15, N'product-square-tazas.jpg'),
(5, N'product-square-rompecabezas.jpg'),
(17, N'product-square-placas-aluminio.jpg'),
(18, N'product-square-camisetas.jpg'),
(6, N'product-square-block-notas.jpg'),
(7, N'product-square-posavasos.jpg'),
(8, N'product-square-gorras.jpg'),
(9, N'product-square-viseras.jpg'),
(2, N'product-square-destapador.jpg'),
(3, N'product-square-porta-tarjetas.jpg'),
(4, N'product-square-imanes.jpg');

DECLARE @ProductosPendientes TABLE (
    ProductoId int NOT NULL PRIMARY KEY,
    ImagenId int NOT NULL
);

INSERT INTO @ProductosPendientes (ProductoId, ImagenId)
SELECT producto.ProductoId, imagen.Id
FROM @Productos AS producto
JOIN dbo.Imagen AS imagen ON imagen.Ruta = producto.Ruta
WHERE EXISTS (SELECT 1 FROM dbo.Producto AS existente WHERE existente.Id = producto.ProductoId)
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.ProductoImagen AS existente
      WHERE existente.ProductoId = producto.ProductoId
        AND existente.ImagenId = imagen.Id
  );

UPDATE relacion
SET Orden = -relacion.Orden - 1
FROM dbo.ProductoImagen AS relacion
JOIN @ProductosPendientes AS pendiente ON pendiente.ProductoId = relacion.ProductoId;

UPDATE relacion
SET Orden = -relacion.Orden
FROM dbo.ProductoImagen AS relacion
JOIN @ProductosPendientes AS pendiente ON pendiente.ProductoId = relacion.ProductoId;

INSERT INTO dbo.ProductoImagen (ProductoId, ImagenId, Orden)
SELECT ProductoId, ImagenId, 0
FROM @ProductosPendientes;

UPDATE dbo.SeccionContenido
SET Estado = N'Borrador'
WHERE Clave = N'texto-demostracion'
  AND Titulo = N'Demostración: información del bazar';

COMMIT TRANSACTION;

SELECT
    (SELECT COUNT(*) FROM @Galeria) AS ImagenesGaleriaPreparadas,
    (SELECT COUNT(*) FROM @Productos) AS ImagenesProductoPreparadas,
    (SELECT COUNT(*) FROM dbo.GaleriaImagen WHERE Estado = N'Publicado') AS ImagenesGaleriaPublicadas;

