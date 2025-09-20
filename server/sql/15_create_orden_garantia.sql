/*
  Migración: crear tabla de garantía por orden
  - Crea dbo.OrdenGarantia (1:1 con Orden)
  - Clave primaria = idOrden (coincide con la orden)
  - Campos: tiempoOrdenGarantia (texto corto), trabajoOrdenGarantia (texto largo)
*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

USE [CRT-informatica];
GO

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OrdenGarantia]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[OrdenGarantia](
    [idOrden] INT NOT NULL PRIMARY KEY,
    [tiempoOrdenGarantia] NVARCHAR(100) NULL,
    [trabajoOrdenGarantia] NVARCHAR(MAX) NULL
  );
  ALTER TABLE [dbo].[OrdenGarantia]
    ADD CONSTRAINT [FK_OrdenGarantia_Orden]
    FOREIGN KEY ([idOrden]) REFERENCES [dbo].[Orden]([idOrden]) ON DELETE CASCADE;
END
GO

/* Índice opcional para consultas (PK ya indexa idOrden) */
-- CREATE UNIQUE INDEX UX_OrdenGarantia_idOrden ON dbo.OrdenGarantia(idOrden);
GO