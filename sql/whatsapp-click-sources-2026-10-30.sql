SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.ClicWhatsApp', 'Origen') IS NULL
BEGIN
    ALTER TABLE dbo.ClicWhatsApp
        ADD Origen nvarchar(20) NOT NULL
            CONSTRAINT DF_ClicWhatsApp_Origen DEFAULT N'anterior';

    ALTER TABLE dbo.ClicWhatsApp DROP CONSTRAINT PK_ClicWhatsApp;
    ALTER TABLE dbo.ClicWhatsApp
        ADD CONSTRAINT PK_ClicWhatsApp PRIMARY KEY (ProductoId, Dia, Origen);
END;

IF OBJECT_ID('dbo.ClicWhatsAppGaleria', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ClicWhatsAppGaleria
    (
        GaleriaImagenId int NOT NULL,
        Dia date NOT NULL,
        Cantidad bigint NOT NULL,
        CONSTRAINT PK_ClicWhatsAppGaleria PRIMARY KEY (GaleriaImagenId, Dia),
        CONSTRAINT FK_ClicWhatsAppGaleria_GaleriaImagen
            FOREIGN KEY (GaleriaImagenId) REFERENCES dbo.GaleriaImagen(Id),
        CONSTRAINT CK_ClicWhatsAppGaleria_Cantidad CHECK (Cantidad > 0)
    );
END;

COMMIT TRANSACTION;
