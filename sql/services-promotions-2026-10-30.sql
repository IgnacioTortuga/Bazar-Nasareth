-- Actualización autorizada de fotografías de servicios y promociones de temporada.
-- Los archivos deben existir previamente en backend/uploaded-images.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Imagen', N'U') IS NULL
   OR OBJECT_ID(N'dbo.Servicio', N'U') IS NULL
   OR OBJECT_ID(N'dbo.Promocion', N'U') IS NULL
    THROW 50000, 'La base seleccionada no corresponde a Bazar Nazareth.', 1;

DECLARE @Images TABLE (
    Ruta nvarchar(450) NOT NULL,
    Nombre nvarchar(450) NOT NULL,
    TipoMime nvarchar(100) NOT NULL,
    TamanoBytes bigint NOT NULL,
    TextoAlternativo nvarchar(1000) NOT NULL
);

INSERT INTO @Images VALUES
(N'service-llaveros-v2.png', N'Llavero personalizado', N'image/png', 132949, N'Llavero redondo personalizado sostenido con la mano'),
(N'service-medallas-v2.png', N'Medalla o placa redonda personalizada', N'image/png', 317622, N'Placa redonda personalizada para una boda'),
(N'service-vinil-v2.png', N'Vaso decorado con vinil', N'image/png', 409600, N'Vaso transparente con tapa de bambú y decoración de vinil'),
(N'service-stickers-v2.jpeg', N'Stickers para negocios', N'image/jpeg', 80767, N'Stickers circulares impresos para promocionar un negocio'),
(N'service-regalos-v2.jpeg', N'Detalles personalizados', N'image/jpeg', 242960, N'Ejemplos de bolsas, recuerdos y arreglos personalizados'),
(N'promo-halloween-2026.png', N'Promoción de Halloween 2026', N'image/png', 2311053, N'Taza, llavero, stickers y regalo con decoración de Halloween'),
(N'promo-navidad-2026.png', N'Temporada navideña 2026', N'image/png', 2484697, N'Regalos y productos personalizados con decoración navideña');

MERGE dbo.Imagen AS target
USING @Images AS source ON target.Ruta = source.Ruta
WHEN MATCHED THEN UPDATE SET
    Nombre = source.Nombre,
    TipoMime = source.TipoMime,
    TamanoBytes = source.TamanoBytes,
    TextoAlternativo = source.TextoAlternativo
WHEN NOT MATCHED THEN INSERT (Ruta, Nombre, TipoMime, TamanoBytes, TextoAlternativo)
    VALUES (source.Ruta, source.Nombre, source.TipoMime, source.TamanoBytes, source.TextoAlternativo);

UPDATE dbo.Servicio SET ImagenId = (SELECT Id FROM dbo.Imagen WHERE Ruta = N'service-llaveros-v2.png')
WHERE Nombre = N'Sublimación personalizada en llaveros acrílicos' AND Estado = N'Publicado';

UPDATE dbo.Servicio SET ImagenId = (SELECT Id FROM dbo.Imagen WHERE Ruta = N'service-medallas-v2.png')
WHERE Nombre = N'Personalización de medallas acrílicas' AND Estado = N'Publicado';

UPDATE dbo.Servicio SET ImagenId = (SELECT Id FROM dbo.Imagen WHERE Ruta = N'product-can-cooler.jpg')
WHERE Nombre = N'Sublimación personalizada en can cooler' AND Estado = N'Publicado';

UPDATE dbo.Servicio SET ImagenId = (SELECT Id FROM dbo.Imagen WHERE Ruta = N'service-vinil-v2.png')
WHERE Nombre = N'Trabajo con vinil' AND Estado = N'Publicado';

UPDATE dbo.Servicio SET ImagenId = (SELECT Id FROM dbo.Imagen WHERE Ruta = N'service-stickers-v2.jpeg')
WHERE Nombre = N'Stickers personalizados' AND Estado = N'Publicado';

UPDATE dbo.Servicio SET ImagenId = (SELECT Id FROM dbo.Imagen WHERE Ruta = N'service-regalos-v2.jpeg')
WHERE Nombre = N'Detalles y regalos personalizados' AND Estado = N'Publicado';

UPDATE dbo.Servicio SET ImagenId = (SELECT Id FROM dbo.Imagen WHERE Ruta = N'gallery-002.jpeg')
WHERE Nombre = N'Collares y placas personalizadas para mascotas' AND Estado = N'Publicado';

UPDATE dbo.Promocion
SET Estado = N'Borrador'
WHERE Titulo LIKE N'Demostración:%';

DECLARE @Promotions TABLE (
    Titulo nvarchar(450) NOT NULL,
    Descripcion nvarchar(max) NOT NULL,
    Condiciones nvarchar(max) NOT NULL,
    RutaImagen nvarchar(450) NOT NULL,
    Inicio datetimeoffset NOT NULL,
    Fin datetimeoffset NOT NULL,
    Orden int NOT NULL
);

INSERT INTO @Promotions VALUES
(N'Descuento espeluznante de Halloween',
 N'Compre artículos seleccionados con temática de Halloween y reciba una sorpresa de precio tan buena que da miedo.',
 N'Aplica a artículos seleccionados con temática de Halloween. El descuento, la disponibilidad y el precio final se confirman en tienda o por WhatsApp.',
 N'promo-halloween-2026.png', '2026-10-30T00:00:00-06:00', '2026-11-02T00:00:00-06:00', 0),
(N'La magia de Navidad está por llegar',
 N'Próximamente encontrará regalos, detalles y productos personalizados para compartir una Navidad muy especial.',
 N'Anuncio anticipado sujeto a disponibilidad. Los diseños, plazos y precios se confirmarán al abrir la temporada navideña.',
 N'promo-navidad-2026.png', '2026-11-15T00:00:00-06:00', '2027-01-07T00:00:00-06:00', 1);

MERGE dbo.Promocion AS target
USING (
    SELECT p.Titulo, p.Descripcion, p.Condiciones, i.Id AS ImagenId,
           p.Inicio, p.Fin, p.Orden
    FROM @Promotions p
    INNER JOIN dbo.Imagen i ON i.Ruta = p.RutaImagen
) AS source ON target.Titulo = source.Titulo
WHEN MATCHED THEN UPDATE SET
    Descripcion = source.Descripcion,
    Condiciones = source.Condiciones,
    ImagenId = source.ImagenId,
    Inicio = source.Inicio,
    Fin = source.Fin,
    Orden = source.Orden,
    Estado = N'Publicado'
WHEN NOT MATCHED THEN INSERT
    (Titulo, Descripcion, Condiciones, ImagenId, Inicio, Fin, Orden, Estado)
    VALUES
    (source.Titulo, source.Descripcion, source.Condiciones, source.ImagenId,
     source.Inicio, source.Fin, source.Orden, N'Publicado');

COMMIT TRANSACTION;
