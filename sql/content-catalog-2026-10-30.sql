-- Contenido autorizado el 30 de octubre de 2026.
-- Requiere que los archivos indicados ya existan en ImageDirectory.
-- Es idempotente por Ruta, nombre de producto, nombre de servicio y título de galería.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Producto', N'U') IS NULL OR OBJECT_ID(N'dbo.Imagen', N'U') IS NULL
    THROW 50000, 'La base seleccionada no corresponde a Bazar Nazareth.', 1;

DECLARE @Images TABLE (
    Ruta nvarchar(450) NOT NULL,
    Nombre nvarchar(450) NOT NULL,
    TipoMime nvarchar(100) NOT NULL,
    TamanoBytes bigint NOT NULL,
    TextoAlternativo nvarchar(1000) NOT NULL
);

INSERT INTO @Images VALUES
(N'product-llaveros.jpg', N'Llaveros personalizados', N'image/jpeg', 116139, N'Opciones de llaveros acrílicos personalizables'),
(N'product-can-cooler.jpg', N'Can cooler personalizado', N'image/jpeg', 114142, N'Can cooler de neopreno para personalizar'),
(N'product-tazas.jpg', N'Tazas personalizadas', N'image/jpeg', 140287, N'Tazas de 11 y 16 onzas disponibles para personalizar'),
(N'product-taza-magica.jpg', N'Taza mágica personalizada', N'image/jpeg', 153418, N'Taza mágica negra que revela el diseño con el calor'),
(N'product-rompecabezas.jpg', N'Rompecabezas personalizados', N'image/jpeg', 134644, N'Rompecabezas rectangulares y de corazón para personalizar'),
(N'product-placas-aluminio.jpg', N'Placas de aluminio personalizadas', N'image/jpeg', 113084, N'Placas de aluminio cuadradas y rectangulares para personalizar'),
(N'product-camisetas.jpg', N'Camisetas personalizadas', N'image/jpeg', 179401, N'Camisetas para sublimación o vinilo termoadhesivo'),
(N'product-polo-waffit.jpg', N'Camisetas polo Waffit', N'image/jpeg', 139528, N'Camisetas polo Waffit blancas y de colores para personalizar'),
(N'product-block-notas.jpg', N'Block de notas personalizado', N'image/jpeg', 113871, N'Block de notas negro con notas adhesivas de colores'),
(N'product-posavasos.jpg', N'Posavasos personalizados', N'image/jpeg', 103785, N'Posavasos de neopreno para personalizar'),
(N'product-gorras.jpg', N'Gorras personalizadas', N'image/jpeg', 119234, N'Gorra de colores para personalizar'),
(N'product-viseras.jpg', N'Viseras personalizadas', N'image/jpeg', 95581, N'Visera blanca disponible para sublimación'),
(N'product-destapador.jpg', N'Destapador con funda de cuero', N'image/jpeg', 123661, N'Destapador con funda de cuero para personalizar'),
(N'product-porta-tarjetas.jpg', N'Porta tarjetas personalizado', N'image/jpeg', 113976, N'Porta tarjetas adhesivo para celular personalizable'),
(N'product-imanes.jpg', N'Imanes personalizados', N'image/jpeg', 73627, N'Variedad de formas de imanes para personalizar'),
(N'product-totebags.jpg', N'Totebags personalizadas', N'image/jpeg', 116129, N'Bolsas de manta sublimables por ambos lados'),
(N'product-mamelucos.jpg', N'Mamelucos personalizados', N'image/jpeg', 104652, N'Mamelucos de poliéster para bebés'),
(N'product-vasos-bambu.jpg', N'Vasos con tapa de bambú', N'image/jpeg', 142664, N'Vasos transparentes con tapa de bambú decorados con vinilo'),
(N'service-vinil.png', N'Trabajo con vinil', N'image/png', 594718, N'Ejemplos de cajas, vasos y botellas decorados con vinil'),
(N'service-stickers.png', N'Stickers personalizados', N'image/png', 509749, N'Ejemplos de stickers personalizados para objetos y negocios'),
(N'service-regalos.png', N'Detalles personalizados', N'image/png', 626684, N'Ejemplos de recuerdos y regalos personalizados para fiestas'),
(N'service-collares.jpeg', N'Placas para mascotas', N'image/jpeg', 135716, N'Placa personalizada en forma de hueso para el collar de una mascota'),
(N'gallery-001.jpeg', N'Recuerdo para mascota', N'image/jpeg', 200974, N'Recuerdo personalizado con fotografías y huellas de una mascota'),
(N'gallery-002.jpeg', N'Placa de mascota Coco', N'image/jpeg', 135716, N'Placa azul personalizada para el collar de una mascota'),
(N'gallery-005.jpeg', N'Totebag floral', N'image/jpeg', 179838, N'Bolsa de tela personalizada con un diseño floral'),
(N'gallery-007.jpeg', N'Regalo con taza', N'image/jpeg', 143444, N'Regalo personalizado con taza, camiseta y dulces'),
(N'gallery-008.jpeg', N'Botella personalizada', N'image/jpeg', 122573, N'Botella rosada personalizada con nombre y diseño floral'),
(N'gallery-009.jpeg', N'Vaso con tapa de bambú', N'image/jpeg', 211181, N'Vaso transparente personalizado con ilustración y tapa de bambú'),
(N'gallery-010.jpeg', N'Recipientes de corazón', N'image/jpeg', 142338, N'Recipientes en forma de corazón de colores'),
(N'gallery-011.jpeg', N'Esferas navideñas', N'image/jpeg', 183484, N'Esferas navideñas personalizadas con nombres'),
(N'gallery-012.jpeg', N'Tazas de colores', N'image/jpeg', 170559, N'Variedad de tazas con interior de colores'),
(N'gallery-013.jpeg', N'Placa anime', N'image/jpeg', 221504, N'Placa pequeña personalizada con una ilustración de anime'),
(N'gallery-015.jpeg', N'Can cooler anime', N'image/jpeg', 207280, N'Can cooler personalizado con una ilustración de anime'),
(N'gallery-016.jpeg', N'Totebag personalizado', N'image/jpeg', 241230, N'Bolsa de tela personalizada con una ilustración'),
(N'gallery-026.jpeg', N'Arreglo de cumpleaños', N'image/jpeg', 217873, N'Arreglo de regalo personalizado para cumpleaños'),
(N'gallery-028.jpeg', N'Caja de regalo verde', N'image/jpeg', 229339, N'Caja con taza, libreta y detalles personalizados'),
(N'gallery-029.jpeg', N'Taza ilustrada', N'image/jpeg', 148042, N'Taza blanca personalizada con ilustraciones de colores'),
(N'gallery-030.jpeg', N'Caja de regalo infantil', N'image/jpeg', 209095, N'Caja de regalo infantil con artículos personalizados');

UPDATE target SET
    target.Nombre = source.Nombre,
    target.TipoMime = source.TipoMime,
    target.TamanoBytes = source.TamanoBytes,
    target.TextoAlternativo = source.TextoAlternativo
FROM dbo.Imagen target
JOIN @Images source ON source.Ruta = target.Ruta;

INSERT dbo.Imagen (Ruta, Nombre, TipoMime, TamanoBytes, TextoAlternativo)
SELECT source.Ruta, source.Nombre, source.TipoMime, source.TamanoBytes, source.TextoAlternativo
FROM @Images source
WHERE NOT EXISTS (SELECT 1 FROM dbo.Imagen target WHERE target.Ruta = source.Ruta);

DECLARE @Products TABLE (
    Categoria nvarchar(250) NOT NULL,
    Nombre nvarchar(450) NOT NULL,
    Descripcion nvarchar(max) NOT NULL,
    Precio decimal(12,2) NULL,
    Orden int NOT NULL,
    Ruta nvarchar(450) NOT NULL
);

INSERT INTO @Products VALUES
(N'Sublimación y personalizados', N'Llaveros personalizados', N'Llaveros de material acrílico, sublimables por ambos lados. Hay variedad de figuras; consulte disponibilidad.', 2500, 10, N'product-llaveros.jpg'),
(N'Sublimación y personalizados', N'Can cooler personalizado', N'Can cooler de neopreno sublimable por ambos lados y preparado con el diseño que elija.', 3500, 11, N'product-can-cooler.jpg'),
(N'Sublimación y personalizados', N'Tazas personalizadas', N'Taza de 11 oz desde ₡3.500, taza de 16 oz a ₡4.000 y taza de 11 oz con color interno a ₡3.800. Colores sujetos a disponibilidad.', 3500, 12, N'product-tazas.jpg'),
(N'Sublimación y personalizados', N'Taza mágica personalizada', N'Taza de 11 oz que cambia de color con la temperatura y revela el diseño personalizado.', 4500, 13, N'product-taza-magica.jpg'),
(N'Regalos', N'Rompecabezas personalizado', N'Rompecabezas rectangulares y en forma de corazón. Consulte los tamaños disponibles.', 3500, 14, N'product-rompecabezas.jpg'),
(N'Sublimación y personalizados', N'Placas de aluminio personalizadas', N'Placa de 10 × 10 cm a ₡2.500 o de 20 × 30 cm a ₡3.000, personalizada con su fotografía o diseño.', 2500, 15, N'product-placas-aluminio.jpg'),
(N'Sublimación y personalizados', N'Camisetas personalizadas', N'Camisetas blancas de poliéster para sublimación y camisetas de otros colores para vinilo termoadhesivo. Disponibles para personas adultas y niñas o niños. El precio depende de la talla y el diseño.', NULL, 16, N'product-camisetas.jpg'),
(N'Sublimación y personalizados', N'Camiseta polo Waffit personalizada', N'Polo blanco para sublimación o de otros colores para vinilo termoadhesivo de uno o dos colores. Por encargo; desde seis unidades se aplica precio de descuento.', NULL, 17, N'product-polo-waffit.jpg'),
(N'Papelería', N'Block de notas personalizado', N'Block compacto con notas adhesivas y separadores de colores, preparado como detalle personalizado.', 5500, 18, N'product-block-notas.jpg'),
(N'Sublimación y personalizados', N'Posavasos personalizados', N'Posavasos de neopreno personalizados con su fotografía, logo o diseño.', 2500, 19, N'product-posavasos.jpg'),
(N'Sublimación y personalizados', N'Gorras personalizadas', N'Gorras en variedad de colores; consulte disponibilidad antes de realizar el encargo.', 4000, 20, N'product-gorras.jpg'),
(N'Sublimación y personalizados', N'Viseras personalizadas', N'Viseras sublimables disponibles en color blanco.', 4000, 21, N'product-viseras.jpg'),
(N'Regalos', N'Destapador con funda de cuero personalizado', N'Destapador con funda de cuero personalizado, ideal como recuerdo o regalo.', 3500, 22, N'product-destapador.jpg'),
(N'Regalos', N'Porta tarjetas personalizado', N'Porta tarjetas adhesivo para celular, personalizado con nombre, frase o diseño.', 3500, 23, N'product-porta-tarjetas.jpg'),
(N'Regalos', N'Imanes personalizados', N'Imanes disponibles en varias formas para personalizar con fotografías, logos o diseños.', 2500, 24, N'product-imanes.jpg'),
(N'Sublimación y personalizados', N'Totebags personalizadas', N'Bolsas de manta sublimables por ambos lados, personalizadas con frases o ilustraciones.', 5000, 25, N'product-totebags.jpg'),
(N'Sublimación y personalizados', N'Mamelucos personalizados', N'Mamelucos de poliéster para bebés de 0 a 3, 3 a 6 y 6 a 12 meses.', 4500, 26, N'product-mamelucos.jpg'),
(N'Sublimación y personalizados', N'Vasos con tapa de bambú personalizados', N'Vasos con tapa de bambú decorados con vinilo adhesivo, con diseño completo o parcial.', 6000, 27, N'product-vasos-bambu.jpg');

UPDATE target SET
    target.CategoriaId = category.Id,
    target.Descripcion = source.Descripcion,
    target.Precio_Informativo = source.Precio,
    target.Moneda = CASE WHEN source.Precio IS NULL THEN NULL ELSE N'CRC' END,
    target.Orden = source.Orden,
    target.Estado = N'Publicado'
FROM dbo.Producto target
JOIN @Products source ON source.Nombre = target.Nombre
JOIN dbo.Categoria category ON category.Nombre = source.Categoria;

INSERT dbo.Producto (CategoriaId, Nombre, Descripcion, Precio_Informativo, Moneda, Destacado, Orden, Estado)
SELECT category.Id, source.Nombre, source.Descripcion, source.Precio,
       CASE WHEN source.Precio IS NULL THEN NULL ELSE N'CRC' END, 0, source.Orden, N'Publicado'
FROM @Products source
JOIN dbo.Categoria category ON category.Nombre = source.Categoria AND category.Activa = 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.Producto target WHERE target.Nombre = source.Nombre);

INSERT dbo.ProductoImagen (ProductoId, ImagenId, Orden)
SELECT product.Id, image.Id, 0
FROM @Products source
JOIN dbo.Producto product ON product.Nombre = source.Nombre
JOIN dbo.Imagen image ON image.Ruta = source.Ruta
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.ProductoImagen link
    WHERE link.ProductoId = product.Id AND link.ImagenId = image.Id
);

DECLARE @Services TABLE (
    Nombre nvarchar(450) NOT NULL,
    Descripcion nvarchar(max) NOT NULL,
    Alcance nvarchar(max) NOT NULL,
    Orden int NOT NULL,
    Ruta nvarchar(450) NOT NULL
);

INSERT INTO @Services VALUES
(N'Trabajo con vinil', N'Decoramos y rotulamos superficies lisas con vinil adhesivo resistente y de alta calidad.', N'Cajas de cartón o madera, vasos, botellas, tazas y otros artículos. Diseño y precio según el encargo.', 10, N'service-vinil.png'),
(N'Stickers personalizados', N'Stickers de alta definición sobre base de plástico blanco para que los colores y diseños resalten.', N'Para decorar bolsas, botellas, cuadernos y otros objetos, o para promocionar su negocio.', 11, N'service-stickers.png'),
(N'Detalles y regalos personalizados', N'Creamos recuerdos, arreglos y regalos que dan un toque único a fiestas y ocasiones especiales.', N'Trabajamos cada arreglo según la petición del cliente. Diseño, plazo y precio se confirman antes de prepararlo.', 12, N'service-regalos.png'),
(N'Collares y placas personalizadas para mascotas', N'Personalizamos placas para el collar de su mascota con nombre, teléfono o diseño.', N'Formas y colores sujetos a disponibilidad. Se preparan por encargo y se confirma el diseño por WhatsApp.', 13, N'service-collares.jpeg');

UPDATE target SET
    target.Descripcion = source.Descripcion,
    target.Alcance = source.Alcance,
    target.ImagenId = image.Id,
    target.Orden = source.Orden,
    target.Estado = N'Publicado'
FROM dbo.Servicio target
JOIN @Services source ON source.Nombre = target.Nombre
JOIN dbo.Imagen image ON image.Ruta = source.Ruta;

INSERT dbo.Servicio (Nombre, Descripcion, Alcance, ImagenId, Precio_Desde, Moneda, Orden, Estado)
SELECT source.Nombre, source.Descripcion, source.Alcance, image.Id, NULL, NULL, source.Orden, N'Publicado'
FROM @Services source
JOIN dbo.Imagen image ON image.Ruta = source.Ruta
WHERE NOT EXISTS (SELECT 1 FROM dbo.Servicio target WHERE target.Nombre = source.Nombre);

DECLARE @Gallery TABLE (Ruta nvarchar(450) NOT NULL, Titulo nvarchar(450) NOT NULL, Orden int NOT NULL);
INSERT INTO @Gallery VALUES
(N'gallery-001.jpeg', N'Recuerdo para una mascota', 10),
(N'gallery-002.jpeg', N'Placa personalizada para mascota', 11),
(N'gallery-005.jpeg', N'Totebag floral personalizado', 12),
(N'gallery-007.jpeg', N'Regalo personalizado con taza', 13),
(N'gallery-008.jpeg', N'Botella personalizada', 14),
(N'gallery-009.jpeg', N'Vaso con tapa de bambú', 15),
(N'gallery-010.jpeg', N'Recipientes en forma de corazón', 16),
(N'gallery-011.jpeg', N'Esferas navideñas personalizadas', 17),
(N'gallery-012.jpeg', N'Tazas con interior de colores', 18),
(N'gallery-013.jpeg', N'Placa personalizada', 19),
(N'gallery-015.jpeg', N'Can cooler personalizado', 20),
(N'gallery-016.jpeg', N'Totebag ilustrado', 21),
(N'gallery-026.jpeg', N'Arreglo de cumpleaños', 22),
(N'gallery-028.jpeg', N'Caja de regalo personalizada', 23),
(N'gallery-029.jpeg', N'Taza ilustrada', 24),
(N'gallery-030.jpeg', N'Regalo infantil personalizado', 25);

UPDATE target SET
    target.Titulo = source.Titulo,
    target.Orden = source.Orden,
    target.Estado = N'Publicado'
FROM dbo.GaleriaImagen target
JOIN dbo.Imagen image ON image.Id = target.ImagenId
JOIN @Gallery source ON source.Ruta = image.Ruta;

INSERT dbo.GaleriaImagen (ImagenId, Titulo, Orden, Estado)
SELECT image.Id, source.Titulo, source.Orden, N'Publicado'
FROM @Gallery source
JOIN dbo.Imagen image ON image.Ruta = source.Ruta
WHERE NOT EXISTS (SELECT 1 FROM dbo.GaleriaImagen target WHERE target.ImagenId = image.Id);

UPDATE dbo.InformacionNegocio SET
    Direccion = N'Tienda principal | 25 m sur y 10 m oeste de Correos de Costa Rica, Hojancha, Guanacaste.' + CHAR(10) +
                N'Tienda de fiestas | 25 m sur de Correos de Costa Rica, Hojancha, Guanacaste.',
    Horario = N'Tienda principal | Lunes a sábado, de 8:00 a. m. a 6:00 p. m.' + CHAR(10) +
              N'Tienda de fiestas | Lunes a sábado, de 9:00 a. m. a 4:00 p. m.'
WHERE Id = 1;

COMMIT TRANSACTION;
