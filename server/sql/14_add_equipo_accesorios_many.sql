/*
  Migración: múltiples accesorios por equipo
  - Crea tabla dbo.EquipoAccesorioItem (idEquipo, idEquipoAccesorio)
  - Migra datos desde Equipo.idEquipoAccesorio si existen
*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

USE [CRT-informatica];
GO

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EquipoAccesorioItem]') AND type = N'U')
BEGIN
  CREATE TABLE dbo.EquipoAccesorioItem (
    idEquipoAccesorioItem INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idEquipo INT NOT NULL,
    idEquipoAccesorio INT NOT NULL
  );
  CREATE INDEX IX_EquipoAccesorioItem_idEquipo ON dbo.EquipoAccesorioItem(idEquipo);
  CREATE INDEX IX_EquipoAccesorioItem_idAcc ON dbo.EquipoAccesorioItem(idEquipoAccesorio);
  ALTER TABLE dbo.EquipoAccesorioItem ADD CONSTRAINT FK_EquipoAccesorioItem_Equipo FOREIGN KEY (idEquipo) REFERENCES dbo.Equipo(idEquipo);
  ALTER TABLE dbo.EquipoAccesorioItem ADD CONSTRAINT FK_EquipoAccesorioItem_Accesorio FOREIGN KEY (idEquipoAccesorio) REFERENCES dbo.EquipoAccesorio(idEquipoAccesorio);
END
GO

/* Migrar un accesorio existente a la tabla relación (si hay columna en Equipo) */
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Equipo') AND name = 'idEquipoAccesorio')
BEGIN
  INSERT INTO dbo.EquipoAccesorioItem (idEquipo, idEquipoAccesorio)
  SELECT e.idEquipo, e.idEquipoAccesorio
  FROM dbo.Equipo e
  LEFT JOIN dbo.EquipoAccesorioItem i
    ON i.idEquipo = e.idEquipo AND i.idEquipoAccesorio = e.idEquipoAccesorio
  WHERE e.idEquipoAccesorio IS NOT NULL AND i.idEquipoAccesorioItem IS NULL;
END
GO