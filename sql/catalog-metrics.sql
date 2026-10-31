-- Ejecutar solo en la base de Bazar confirmada, después del respaldo.
-- Aditivo: no cambia ni elimina tablas existentes. No activa la función.
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.Producto', N'U') IS NULL
    THROW 50000, 'La base seleccionada no contiene Producto.', 1;
IF OBJECT_ID(N'dbo.ClicWhatsApp', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ClicWhatsApp (
        ProductoId int NOT NULL,
        Dia date NOT NULL,
        Cantidad bigint NOT NULL,
        CONSTRAINT PK_ClicWhatsApp PRIMARY KEY (ProductoId, Dia),
        CONSTRAINT FK_ClicWhatsApp_Producto_ProductoId FOREIGN KEY (ProductoId) REFERENCES dbo.Producto(Id)
    );
END;
COMMIT TRANSACTION;
