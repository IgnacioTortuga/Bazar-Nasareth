-- Prueba autorizada de llavero.png como imagen principal del producto.
-- Conserva las imágenes anteriores como fotografías secundarias.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Imagen', N'U') IS NULL
   OR OBJECT_ID(N'dbo.Producto', N'U') IS NULL
   OR OBJECT_ID(N'dbo.ProductoImagen', N'U') IS NULL
    THROW 50000, 'La base seleccionada no corresponde a Bazar Nazareth.', 1;

MERGE dbo.Imagen AS target
USING (VALUES (
    N'product-llaveros-v2.png',
    N'Llaveros personalizados - fotografía ampliada',
    N'image/png',
    CONVERT(bigint, 1701845),
    N'Tres llaveros acrílicos blancos en formas cuadrada, redonda y de corazón'
)) AS source (Ruta, Nombre, TipoMime, TamanoBytes, TextoAlternativo)
ON target.Ruta = source.Ruta
WHEN MATCHED THEN UPDATE SET
    Nombre = source.Nombre,
    TipoMime = source.TipoMime,
    TamanoBytes = source.TamanoBytes,
    TextoAlternativo = source.TextoAlternativo
WHEN NOT MATCHED THEN INSERT (Ruta, Nombre, TipoMime, TamanoBytes, TextoAlternativo)
    VALUES (source.Ruta, source.Nombre, source.TipoMime, source.TamanoBytes, source.TextoAlternativo);

DECLARE @ProductId int = (
    SELECT TOP (1) Id
    FROM dbo.Producto
    WHERE Nombre = N'Llaveros personalizados'
    ORDER BY Id
);
DECLARE @ImageId int = (
    SELECT Id FROM dbo.Imagen WHERE Ruta = N'product-llaveros-v2.png'
);

IF @ProductId IS NULL OR @ImageId IS NULL
    THROW 50001, 'No se encontró el producto o la imagen de llaveros.', 1;

-- Aparta temporalmente los órdenes existentes para evitar conflictos con el índice único.
UPDATE dbo.ProductoImagen
SET Orden = Orden + 100
WHERE ProductoId = @ProductId;

IF EXISTS (
    SELECT 1 FROM dbo.ProductoImagen
    WHERE ProductoId = @ProductId AND ImagenId = @ImageId
)
    UPDATE dbo.ProductoImagen
    SET Orden = 0
    WHERE ProductoId = @ProductId AND ImagenId = @ImageId;
ELSE
    INSERT INTO dbo.ProductoImagen (ProductoId, ImagenId, Orden)
    VALUES (@ProductId, @ImageId, 0);

;WITH OrderedPhotos AS (
    SELECT ImagenId,
           ROW_NUMBER() OVER (ORDER BY Orden, ImagenId) AS NewOrder
    FROM dbo.ProductoImagen
    WHERE ProductoId = @ProductId AND ImagenId <> @ImageId
)
UPDATE relation
SET Orden = photos.NewOrder
FROM dbo.ProductoImagen relation
INNER JOIN OrderedPhotos photos ON photos.ImagenId = relation.ImagenId
WHERE relation.ProductoId = @ProductId;

COMMIT TRANSACTION;
